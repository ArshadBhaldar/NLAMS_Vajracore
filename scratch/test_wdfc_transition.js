require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
const http = require('http');

async function test() {
  // Step 1: Login as CALA
  const loginData = JSON.stringify({ email: 'cala.pune@demo.gov.in', password: 'Demo@1234' });
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginData
  });
  const { token, user } = await loginRes.json();
  console.log('Logged in as CALA:', user.email, 'Role:', user.role, 'District:', user.district);

  // Step 2: Transition WDFC proposal to NOTIFIED_3A
  const wdfcId = '5a74a514-4e4f-4e91-af2c-dfa90dd00232';
  const transRes = await fetch(`http://localhost:4000/api/proposals/${wdfcId}/transition`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ to_stage: 'NOTIFIED_3A' })
  });

  const status = transRes.status;
  const data = await transRes.json();
  console.log(`Transition response status: ${status}`);
  console.log('Transition response data:', JSON.stringify(data, null, 2));

  if (status === 200 && data.stage === 'NOTIFIED_3A') {
    console.log('SUCCESS! WDFC proposal successfully transitioned to NOTIFIED_3A by CALA!');
    process.exit(0);
  } else {
    console.error('FAILED! Transition did not succeed.');
    process.exit(1);
  }
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
