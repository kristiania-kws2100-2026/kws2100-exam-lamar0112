// Laster dyreobservasjoner fra GBIF (Artsdatabanken) inn i PostGIS
import pg from "pg";

const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/naturkart",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function opprettTabell() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS dyreobservasjoner (
      id SERIAL PRIMARY KEY,
      art VARCHAR(255),
      antall INTEGER,
      observert_dato DATE,
      geom GEOMETRY(Point, 4326)
    )
  `);
  await db.query(
    `CREATE INDEX IF NOT EXISTS idx_dyr_geom ON dyreobservasjoner USING GIST(geom)`,
  );
  console.log("Tabell klar");
}

async function lastData() {
  // Henter norske pattedyrobservasjoner fra GBIF
  const url =
    "https://api.gbif.org/v1/occurrence/search?" +
    new URLSearchParams({
      country: "NO",
      class: "Mammalia",
      hasCoordinate: "true",
      hasGeospatialIssue: "false",
      limit: "300",
    });

  console.log("Henter data fra GBIF...");
  const res = await fetch(url);
  const data = await res.json();

  const observasjoner = data.results as Array<{
    key: number;
    species?: string;
    individualCount?: number;
    eventDate?: string;
    decimalLatitude: number;
    decimalLongitude: number;
  }>;

  console.log(`Fant ${observasjoner.length} observasjoner`);

  // Slett gamle data og last inn på nytt
  await db.query("DELETE FROM dyreobservasjoner");

  for (const obs of observasjoner) {
    if (!obs.decimalLatitude || !obs.decimalLongitude) continue;

    await db.query(
      `INSERT INTO dyreobservasjoner (art, antall, observert_dato, geom)
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))`,
      [
        obs.species || "Ukjent art",
        obs.individualCount || 1,
        obs.eventDate ? obs.eventDate.substring(0, 10) : null,
        obs.decimalLongitude,
        obs.decimalLatitude,
      ],
    );
  }

  console.log("Data lastet inn!");
}

await opprettTabell();
await lastData();
await db.end();
