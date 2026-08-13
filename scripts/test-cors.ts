import http from 'http';

const BASE_URL = 'http://localhost:3000';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
}

async function testCorsPreflight(origin: string) {
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders }>((resolve, reject) => {
    const url = new URL('/api/tasks', BASE_URL);
    const req = http.request(
      url,
      {
        method: 'OPTIONS',
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization',
        },
      },
      (res) => {
        resolve({ status: res.statusCode || 500, headers: res.headers });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runCorsTest() {
  console.log('🧪 Testing CORS headers & Preflight handling...');

  const originsToTest = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://sahara-agile.vercel.app',
    'https://sahara-agile-backend.onrender.com'
  ];

  for (const origin of originsToTest) {
    const res = await testCorsPreflight(origin);
    assert(res.status === 204 || res.status === 200, `OPTIONS /api/tasks expected 200 or 204 for origin ${origin}, got ${res.status}`);
    assert(res.headers['access-control-allow-origin'] === origin, `Access-Control-Allow-Origin should match requested origin ${origin}`);
    assert(res.headers['access-control-allow-credentials'] === 'true', 'Access-Control-Allow-Credentials should be true');
    console.log(`   ✅ Preflight CORS 204/200 for ${origin} | Credentials: true | Allowed-Origin: ${res.headers['access-control-allow-origin']}`);
  }

  console.log('\n🎉 CORS PREFLIGHT TEST PASSED CLEANLY!');
}

runCorsTest().catch((err) => {
  console.error('❌ CORS test failed:', err);
  process.exit(1);
});
