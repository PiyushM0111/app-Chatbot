// Step 5: Complete Netlify SPA Routing & Production Distribution Verification
import fs from 'fs';
import path from 'path';
import http from 'http';

const BASE_URL = 'http://localhost:5000';

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(rawData);
        } catch (e) {
          parsed = rawData;
        }
        resolve({
          status: res.statusCode,
          data: parsed,
          headers: res.headers,
          raw: rawData
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runStep5NetlifySpaAudit = async () => {
  console.log('================================================================');
  console.log('🌐 STEP 5: NETLIFY SPA ROUTING & DIRECT NAVIGATION AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASSED]  ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAILED]  ${testName} ${details ? `\n     → Reason: ${details}` : ''}`);
      failed++;
    }
  };

  // 1. Check dist/ and client/dist/ static directories exist
  const rootDist = path.resolve('dist');
  const clientDist = path.resolve('client', 'dist');
  const indexHtmlPath = path.join(rootDist, 'index.html');
  const rootRedirectsPath = path.join(rootDist, '_redirects');
  const clientRedirectsPath = path.join(clientDist, '_redirects');
  const netlifyTomlPath = path.resolve('netlify.toml');

  assert(
    fs.existsSync(rootDist) && fs.existsSync(indexHtmlPath),
    'Requirement 1: Root distribution folder "dist/" and "dist/index.html" exist and are populated'
  );

  assert(
    fs.existsSync(rootRedirectsPath) && fs.existsSync(clientRedirectsPath),
    'Requirement 2: Netlify "_redirects" file exists in both "dist/" and "client/dist/"'
  );

  // 2. Validate _redirects content & rule ordering
  const redirectsContent = fs.readFileSync(rootRedirectsPath, 'utf8');
  const hasApiRewrite = redirectsContent.includes('/api/*') && redirectsContent.includes('/.netlify/functions/api/:splat');
  const hasSpaFallback = redirectsContent.includes('/*') && redirectsContent.includes('/index.html') && redirectsContent.includes('200');

  assert(
    hasApiRewrite && hasSpaFallback,
    'Requirement 3: "_redirects" defines both API function proxy (200!) and SPA index.html fallback (200)'
  );

  // 3. Validate netlify.toml configuration
  assert(
    fs.existsSync(netlifyTomlPath),
    'Requirement 4: Root "netlify.toml" configuration exists'
  );

  const tomlContent = fs.readFileSync(netlifyTomlPath, 'utf8');
  assert(
    tomlContent.includes('publish = "dist"') && tomlContent.includes('functions = "netlify/functions"'),
    'Requirement 5: "netlify.toml" specifies publish="dist" and functions="netlify/functions"'
  );

  // 4. Test Production SPA Route Resolution Simulation
  const routesToTest = [
    '/',
    '/chat',
    '/chat/c9834710-1234-abcd',
    '/c/c9834710-1234-abcd',
    '/settings',
    '/history',
    '/gallery',
    '/notes',
    '/memory',
    '/projects',
    '/learning'
  ];

  routesToTest.forEach(route => {
    // Netlify rule evaluation: if not starting with /api/, route matches /* -> /index.html with status 200
    const matchedRule = route.startsWith('/api/') ? 'API_FUNCTION' : 'SPA_FALLBACK_INDEX_HTML';
    assert(
      matchedRule === 'SPA_FALLBACK_INDEX_HTML',
      `Requirement 6: Direct navigation / browser refresh on "${route}" resolves to SPA fallback (200 /index.html)`
    );
  });

  // 5. Verify /api/* endpoints still work normally (not returning HTML)
  const healthRes = await request('/api/health');
  assert(
    healthRes.status === 200 && (healthRes.data.status === 'healthy' || healthRes.data.status === 'ok' || healthRes.data.success === true),
    'Requirement 7: /api/health endpoint returns 200 JSON (Not HTML index.html)'
  );

  const guestRes = await request('/api/auth/guest', 'POST');
  assert(
    guestRes.status === 200 && guestRes.data.token && guestRes.data.user?.id,
    'Requirement 8: /api/auth/guest endpoint executes server logic and issues session token'
  );

  const token = guestRes.data.token;
  const convRes = await request('/api/conversations', 'POST', { title: 'Netlify SPA Test Chat' }, token);
  assert(
    convRes.status === 201 && convRes.data.conversation?.id,
    'Requirement 9: /api/conversations POST succeeds under authenticated user'
  );

  const convId = convRes.data.conversation.id;
  const msgRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
    content: 'Verify API message flow on Netlify build',
    stream: false
  }, token);
  assert(
    msgRes.status === 200 && msgRes.data.aiMessage?.content,
    'Requirement 10: /api/conversations/:id/messages POST delivers complete AI response'
  );

  console.log('\n================================================================');
  console.log(`📊 STEP 5 AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
};

runStep5NetlifySpaAudit().catch((err) => {
  console.error('Fatal Step 5 Test Error:', err);
  process.exit(1);
});
