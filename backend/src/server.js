const app = require('./app');
const db = require('./config/db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

async function bootstrapDatabase() {
  try {
    const res = await db.query("SELECT to_regclass('public.users') as tbl;");
    if (!res.rows[0].tbl) {
      console.log('--- Empty database detected. Auto-bootstrapping schemas & seed data ---');

      const schemaSql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
      await db.query(schemaSql);
      console.log('✓ Core PostGIS schema and tables created.');

      const seedSql = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf8');
      await db.query(seedSql);
      console.log('✓ Core seed data loaded.');

      const uclSchemaSql = fs.readFileSync(path.join(__dirname, 'db', 'ucl_schema.sql'), 'utf8');
      await db.query(uclSchemaSql);
      console.log('✓ UCL Cadastral schema created.');

      const uclSeedSql = fs.readFileSync(path.join(__dirname, 'db', 'ucl_seed.sql'), 'utf8');
      await db.query(uclSeedSql);
      console.log('✓ UCL Cadastral plot seed data loaded.');

      console.log('--- Database auto-bootstrap completed successfully! ---');
    } else {
      console.log('✓ Database tables detected. Skipping auto-bootstrap.');
    }
  } catch (err) {
    console.error('Database auto-bootstrap warning:', err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`NLAMS backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  await bootstrapDatabase();
});

