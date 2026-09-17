const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function seed() {
  const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  console.log('Applying seed.sql ...');
  await db.query(seedSql);
  console.log('Seed data inserted successfully.');
  console.log('Demo login: any seeded email above, password "Demo@1234"');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
