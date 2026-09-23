require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });

async function test() {
  // Step 1: Login as CALA
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cala.pune@demo.gov.in', password: 'Demo@1234' })
  });
  const { token, user } = await loginRes.json();
  console.log('Logged in as:', user.email, 'Role:', user.role);

  // Step 2: Call DELETE /api/proposals/5cd0d7f0-cc8d-46d6-87b6-ba0ea24506ff
  const dummyId = '5cd0d7f0-cc8d-46d6-87b6-ba0ea24506ff';
  const delRes = await fetch(`http://localhost:4000/api/proposals/${dummyId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const status = delRes.status;
  const data = await delRes.json();
  console.log(`Delete response status: ${status}`);
  console.log('Delete response body:', JSON.stringify(data, null, 2));

  if (status === 200 && data.id === dummyId) {
    console.log('SUCCESS! Proposal successfully deleted.');
    process.exit(0);
  } else {
    console.error('FAILED to delete proposal.');
    process.exit(1);
  }
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
