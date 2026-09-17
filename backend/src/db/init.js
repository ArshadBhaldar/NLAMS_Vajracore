const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  console.log('Applying schema.sql ...');
  await db.query(schema);
  console.log('Schema applied successfully.');
  process.exit(0);
}

init().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
