import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:3000';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
}

async function request(path: string, method = 'GET', body?: any, customHeaders: Record<string, string> = {}): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options: http.RequestOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 500, body: JSON.parse(data), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode || 500, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testSignIn() {
  console.log('🧪 Testing Sign In & Authentication Flow...');

  const testUid = `usr-test-${Date.now()}`;
  const testEmail = `operator_${Date.now()}@sahara.io`;

  // 1. Sync Profile (Create Account / Update Profile)
  const syncRes = await request('/api/auth/sync-profile', 'POST', {
    uid: testUid,
    email: testEmail,
    displayName: 'Amara Operator',
    role: 'Operations Specialist',
    isCreatingTeam: true,
    teamName: 'Al-Kufra Expedition Team',
  });

  assert(syncRes.status === 200, `POST /api/auth/sync-profile expected 200, got ${syncRes.status}`);
  assert(syncRes.body.profile?.email === testEmail, 'Email should match');
  console.log(`   ✅ Profile Synced | User: ${syncRes.body.profile.email} | Role: ${syncRes.body.profile.role}`);

  // 2. Sign In (Create Cookie Session)
  const loginRes = await request('/api/auth/login', 'POST', {
    uid: testUid,
    email: testEmail,
  });

  assert(loginRes.status === 200, `POST /api/auth/login expected 200, got ${loginRes.status}`);
  assert(!!loginRes.body.token, 'Should return session token');
  console.log(`   ✅ Sign In Successful | Session Token Issued`);

  const setCookie = loginRes.headers['set-cookie']?.[0];
  const cookieHeader = setCookie ? { Cookie: setCookie.split(';')[0] } : {};

  // 3. Verify Session via /api/auth/me
  const meRes = await request('/api/auth/me', 'GET', undefined, cookieHeader);
  assert(meRes.status === 200, `GET /api/auth/me expected 200, got ${meRes.status}`);
  assert(meRes.body.user?.email === testEmail, 'Verified session user email');
  console.log(`   ✅ Session Verified (/api/auth/me) | Logged-in user: ${meRes.body.user.email}`);

  // 4. Logout
  const logoutRes = await request('/api/auth/logout', 'POST', undefined, cookieHeader);
  assert(logoutRes.status === 200, `POST /api/auth/logout expected 200, got ${logoutRes.status}`);
  console.log(`   ✅ Logged Out | Session cookie revoked`);

  console.log('\n🎉 SIGN IN TEST PASSED CLEANLY!');
}

testSignIn().catch((err) => {
  console.error('❌ Sign In Test Failed:', err);
  process.exit(1);
});
