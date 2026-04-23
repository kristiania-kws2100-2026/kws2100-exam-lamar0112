import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import pg from "pg";

const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/naturkart",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

const app = new Hono();

app.use("/*", cors());

// Vector Tile endpoint for dyreobservasjoner
app.get("/api/tiles/dyr/:z/:x/:y", async (c) => {
  const z = parseInt(c.req.param("z"));
  const x = parseInt(c.req.param("x"));
  const y = parseInt(c.req.param("y"));

  // geom er EPSG:4326 — transformér til 3857 sammen med ST_TileEnvelope for korrekt MVT-klipp
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

// GeoJSON-endepunkt for clustering i OpenLayers
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
