import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import pg from "pg";
// Backend kobler til Render sin PostgreSQL/PostGIS-database i produksjon,
// og til lokal Docker-database under utvikling.
const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/naturkart",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

const app = new Hono();
// Enkel startside for backend, slik at Render-lenken ikke viser 404.
// Selve kartdataene hentes fra API-endepunktene under.
app.get("/", (c) =>
  c.json({
    navn: "Norsk Natur- og Friluftskart API",
    status: "ok",
    beskrivelse: "Backend for dyreobservasjoner, GeoJSON og vector tiles.",
    endpoints: [
      "/api/dyr/geojson",
      "/api/tiles/dyr/{z}/{x}/{y}"
    ]
  })
);

app.use("/*", cors());

// Vector tile-endepunkt for dyreobservasjoner.
// Dette lar frontend hente bare den kartflisen brukeren ser på, i stedet for hele datasettet.
app.get("/api/tiles/dyr/:z/:x/:y", async (c) => {
  const z = parseInt(c.req.param("z"));
  const x = parseInt(c.req.param("x"));
  const y = parseInt(c.req.param("y"));

  // Geometrien er lagret i EPSG:4326, mens webkartfliser bruker EPSG:3857.
// Derfor transformerer vi geometrien før ST_AsMVTGeom lager Mapbox Vector Tiles.
  const result = await db.query(
    `
    SELECT ST_AsMVT(tile, 'dyr', 4096, 'geom') AS mvt
    FROM (
      SELECT
        id,
        art,
        antall,
        observert_dato,
        ST_AsMVTGeom(
          ST_Transform(geom, 3857),
          ST_TileEnvelope($1, $2, $3),
          4096, 64, true
        ) AS geom
      FROM dyreobservasjoner
      WHERE ST_Transform(geom, 3857) && ST_TileEnvelope($1, $2, $3)
    ) AS tile
  `,
    [z, x, y],
  );

  const mvt = result.rows[0].mvt;
// Hvis en flis ikke inneholder observasjoner, svarer vi 204 i stedet for å sende en tom fil.
  if (!mvt || mvt.length === 0) {
    return new Response(null, { status: 204 });
  }

  return new Response(mvt, {
    headers: {
      "Content-Type": "application/x-protobuf",
      "Cache-Control": "public, max-age=3600",
    },
  });
});

// GeoJSON-endepunktet brukes til cluster-laget ved lavere zoom.
// Dette gir et mer oversiktlig kart når mange observasjoner vises samtidig.
app.get("/api/dyr/geojson", async (c) => {
  const result = await db.query(`
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', json_agg(
        json_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(geom)::json,
          'properties', json_build_object(
            'id', id,
            'art', art,
            'antall', antall
          )
        )
      )
    ) AS geojson
    FROM dyreobservasjoner
  `);
  return c.json(result.rows[0].geojson);
});

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("Server kjører på http://localhost:3000");
});
