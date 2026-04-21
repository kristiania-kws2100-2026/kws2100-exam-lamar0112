import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import pg from "pg";

const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/naturkart",
});

const app = new Hono();

app.use("/*", cors());

// Vector Tile endpoint for dyreobservasjoner
app.get("/api/tiles/dyr/:z/:x/:y", async (c) => {
  const z = parseInt(c.req.param("z"));
  const x = parseInt(c.req.param("x"));
  const y = parseInt(c.req.param("y"));

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
          geom,
          ST_TileEnvelope($1, $2, $3),
          4096, 64, true
        ) AS geom
      FROM dyreobservasjoner
      WHERE geom && ST_TileEnvelope($1, $2, $3)
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

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("Server kjører på http://localhost:3000");
});
