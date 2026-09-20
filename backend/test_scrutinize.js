async function test() {
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cala.pune@demo.gov.in', password: 'Demo@1234' })
  });
  
  if (!loginRes.ok) {
    console.log('Login failed:', await loginRes.text());
    return;
  }
  
  const { token } = await loginRes.json();
  
  const res = await fetch('http://localhost:4000/api/proposals/a1111111-1111-1111-1111-111111111111/scrutinize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}

test();
