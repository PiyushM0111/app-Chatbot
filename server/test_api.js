import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING COMPLETE 10X CHATBOT API VERIFICATION ---');

  // 1. Health check
  console.log('\n1. Testing Health Check...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('Health check response:', healthData);
  assert.strictEqual(healthRes.status, 200);
  assert.strictEqual(healthData.status, 'healthy');

  // 2. Signup
  console.log('\n2. Testing User Signup...');
  const testEmail = `pro_user_${Date.now()}@example.com`;
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Piyush Sharma',
      email: testEmail,
      password: 'propassword123'
    })
  });
  const signupData = await signupRes.json();
  console.log('Signup status:', signupRes.status, 'User:', signupData.user?.email);
  assert.strictEqual(signupRes.status, 201);
  const token = signupData.token;

  // 3. Create Conversation
  console.log('\n3. Testing Create Conversation...');
  const convRes = await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: '10X AI Pro Session',
      language: 'hinglish',
      mode: 'code'
    })
  });
  const convData = await convRes.json();
  const convId = convData.conversation.id;
  console.log('Created conversation ID:', convId);
  assert.strictEqual(convRes.status, 201);

  // 4. Send Message with Streaming (SSE)
  console.log('\n4. Testing Real-time SSE Token Streaming...');
  const streamRes = await fetch(`${BASE_URL}/conversations/${convId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      content: 'Explain binary search algorithm in simple terms.',
      stream: true
    })
  });
  assert.strictEqual(streamRes.status, 200);
  assert.ok(streamRes.headers.get('content-type')?.includes('text/event-stream'));
  const streamText = await streamRes.text();
  console.log('Received SSE stream chunks length:', streamText.length, 'bytes');
  assert.ok(streamText.includes('data: '));

  // 5. Pin Conversation
  console.log('\n5. Testing Pin Conversation...');
  const pinRes = await fetch(`${BASE_URL}/conversations/${convId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ is_pinned: true })
  });
  const pinData = await pinRes.json();
  console.log('Pinned state:', pinData.conversation?.is_pinned);
  assert.strictEqual(pinData.conversation?.is_pinned, 1);

  // 6. Export Conversation as Markdown
  console.log('\n6. Testing Export Conversation as Markdown...');
  const exportRes = await fetch(`${BASE_URL}/conversations/${convId}/export?format=markdown`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const exportText = await exportRes.text();
  console.log('Exported Markdown Preview (first 150 chars):\n', exportText.slice(0, 150));
  assert.strictEqual(exportRes.status, 200);
  assert.ok(exportText.toLowerCase().includes('binary search'));

  // 7. Clean up
  console.log('\n7. Testing Delete Conversation...');
  const delRes = await fetch(`${BASE_URL}/conversations/${convId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.strictEqual(delRes.status, 200);

  console.log('\n🎉 ALL 10X CHATBOT ENHANCEMENTS VERIFIED SUCCESSFULLY! 🎉\n');
}

runTests().catch((err) => {
  console.error('10X Verification Error:', err);
  process.exit(1);
});
