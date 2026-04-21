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

// ─── Vector Tile endpoint for dyreobservasjoner ───────────────────────────────
// Returnerer MVT-tiles fra PostGIS-tabellen "dyreobservasjoner"
// Brukes av VectorTileLayer i frontend med clustered style
// URL-mønster: /api/tiles/dyr/:z/:x/:y
app.get("/api/tiles/dyr/:z/:x/:y", async (c) => {
  const z = parseInt(c.req.param("z"));
  const x = parseInt(c.req.param("x"));
  const y = parseInt(c.req.param("y"));

  const result = await pool.query(
    `
    SELECT ST_AsMVT(tile, 'dyreobservasjoner', 4096, 'geom') AS mvt
    FROM (
      SELECT
        id,
        art,
        norsk_navn,
        aar,
        antall,
        ST_AsMVTGeom(
          ST_Transform(geom, 3857),
          ST_TileEnvelope($1, $2, $3),
          4096, 64, true
        ) AS geom
      FROM dyreobservasjoner
      WHERE geom && ST_Transform(ST_TileEnvelope($1, $2, $3), 4326)
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
    "Cache-Control": "public, max-age=60",
  });
});

// ─── Statiske filer (React-appen i produksjon) ────────────────────────────────
app.get("*", serveStatic({ root: "../dist" }));
app.get("*", serveStatic({ path: "../dist/index.html" }));

const port = parseInt(process.env.PORT ?? "3000");
console.log(`Server running on port ${port}`);

serve({ fetch: app.fetch, port });
