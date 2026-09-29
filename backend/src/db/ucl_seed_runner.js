/**
 * VajraBhoomi UCL Module — Database Schema & Seed Runner
 * Applies ucl_schema.sql and ucl_seed.sql
 */
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function run() {
  console.log('--- Applying UCL PostGIS Schema ---');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'ucl_schema.sql'), 'utf8');
  await db.query(schemaSql);
  console.log('✓ city_survey_plots table ready with spatial GIST indexes.');

  console.log('--- Seeding Urban Cadastral Plots ---');
  const seedSql = fs.readFileSync(path.join(__dirname, 'ucl_seed.sql'), 'utf8');
  await db.query(seedSql);
  console.log('✓ Urban cadastral mock parcels seeded.');

  const res = await db.query(
    'SELECT ulpin, owner_name, cts_number, litigation_flag, area_sqm, ST_AsGeoJSON(geometry)::json AS geom FROM city_survey_plots'
  );
  console.log(`✓ Total cadastral plots in database: ${res.rows.length}`);
  console.table(
    res.rows.map(r => ({
      ULPIN: r.ulpin,
      CTS: r.cts_number,
      Owner: r.owner_name.substring(0, 25),
      Litigation: r.litigation_flag,
      'Area (sqm)': r.area_sqm
    }))
  );

  process.exit(0);
}

run().catch((err) => {
  console.error('Failed to run UCL schema & seed:', err);
  process.exit(1);
});
