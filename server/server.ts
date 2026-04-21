import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import pg from "pg";

const { Pool } = pg;

// Lokalt: bruker docker-compose. På Render: DATABASE_URL settes automatisk.
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/beredskap",
});

const app = new Hono();
app.use("*", cors());

// ─── Vector Tile endpoint (for A-karakter krav) ───────────────────────────────
// Returnerer MVT-tiles for en stor dataset (f.eks. adresser/grunnkretser)
// URL-mønster: /api/tiles/kommuner/:z/:x/:y
app.get("/api/tiles/kommuner/:z/:x/:y", async (c) => {
  const z = parseInt(c.req.param("z"));
  const x = parseInt(c.req.param("x"));
  const y = parseInt(c.req.param("y"));

  const result = await pool.query(
    `
    SELECT ST_AsMVT(tile, 'kommuner', 4096, 'geom') AS mvt
    FROM (
      SELECT
        kommunenummer,
        navn,
        ST_AsMVTGeom(
          ST_Transform(geom, 3857),
          ST_TileEnvelope($1, $2, $3),
          4096, 64, true
        ) AS geom
      FROM kommuner
      WHERE geom && ST_Transform(ST_TileEnvelope($1, $2, $3), 25833)
    ) AS tile
    WHERE geom IS NOT NULL
    `,
    [z, x, y],
  );

  const mvt = result.rows[0]?.mvt;
  if (!mvt || mvt.length === 0) {
    return c.body(null, 204);
  }

  return c.body(mvt, 200, {
    "Content-Type": "application/x-protobuf",
    "Cache-Control": "public, max-age=3600",
  });
});

// ─── GeoJSON endpoints ────────────────────────────────────────────────────────
// Disse returnerer GeoJSON for mindre datasett

app.get("/api/tilfluktsrom", async (c) => {
  const result = await pool.query(`
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', json_agg(ST_AsGeoJSON(t.*)::json)
    )
    FROM tilfluktsrom t
  `);
  return c.json(result.rows[0].json_build_object);
});

// ─── Statiske filer (React-appen i produksjon) ────────────────────────────────
app.get("*", serveStatic({ root: "../dist" }));
app.get("*", serveStatic({ path: "../dist/index.html" }));

const port = parseInt(process.env.PORT ?? "3000");
console.log(`Server running on port ${port}`);

serve({ fetch: app.fetch, port });
