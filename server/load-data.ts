/**
 * load-data.ts
 * Kjøres én gang for å importere GeoJSON-data til PostGIS.
 * Lokalt: npx tsx load-data.ts
 * På Render: legg til som build-steg midlertidig
 */
import pg from "pg";
import fs from "fs";
import path from "path";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/beredskap",
});

async function loadGeoJSON(
  tableName: string,
  filePath: string,
  srid = 4326,
) {
  console.log(`Loading ${tableName} from ${filePath}...`);

  const geojson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const features = geojson.features;

  await pool.query(`DROP TABLE IF EXISTS ${tableName}`);
  await pool.query(`
    CREATE TABLE ${tableName} (
      id SERIAL PRIMARY KEY,
      properties JSONB,
      geom GEOMETRY(GEOMETRY, ${srid})
    )
  `);
  await pool.query(
    `SELECT AddGeometryColumn('${tableName}', 'geom', ${srid}, 'GEOMETRY', 2)`,
  ).catch(() => {});

  for (const feature of features) {
    await pool.query(
      `INSERT INTO ${tableName} (properties, geom)
       VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), ${srid}))`,
      [JSON.stringify(feature.properties), JSON.stringify(feature.geometry)],
    );
  }

  console.log(`✓ Loaded ${features.length} features into ${tableName}`);
}

async function main() {
  const dataDir = path.join(process.cwd(), "../public/data");

  // Legg til datasett her etter hvert som dere laster ned GeoJSON-filene
  const datasets = [
    { table: "tilfluktsrom", file: "tilfluktsrom.geojson" },
    { table: "kommuner", file: "kommuner.geojson" },
  ];

  for (const { table, file } of datasets) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      await loadGeoJSON(table, filePath);
    } else {
      console.warn(`Skipping ${file} — file not found`);
    }
  }

  await pool.end();
}

main().catch(console.error);
