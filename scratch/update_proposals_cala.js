require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
const db = require('../backend/src/config/db');

async function main() {
  const result = await db.query(
    `UPDATE proposals
     SET assigned_cala_id = '22222222-2222-2222-2222-222222222222'
     WHERE assigned_cala_id IS NULL
     RETURNING id, project_name, district, stage, assigned_cala_id`
  );
  console.log(`Updated ${result.rows.length} proposals with default CALA ID:`);
  console.log(JSON.stringify(result.rows, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
