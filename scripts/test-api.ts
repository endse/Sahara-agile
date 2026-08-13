import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.VITE_FIREBASE_API_KEY || process.env.VITE_API_KEY;

const BASE_URL = 'http://localhost:3000';

interface ResponseData {
  status: number;
  body: any;
  headers: http.IncomingHttpHeaders;
}

async function request(path: string, method = 'GET', body?: any, customHeaders: Record<string, string> = {}): Promise<ResponseData> {
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

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
}

async function runTests() {
  console.log('🧪 Starting Sahara Agile Works Full REST API Integration Test Suite...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing GET /api/health');
    const health = await request('/api/health');
    assert(health.status === 200, `GET /api/health expected 200, got ${health.status}`);
    assert(health.body.status === 'ok', 'Health status should be ok');
    console.log(`   ✅ Status 200 | Database: ${health.body.database}`);

    // 2. Auth Endpoints
    console.log('\n2️⃣ Testing Auth API (/api/auth/sync-profile, /api/auth/login, /api/auth/me, /api/auth/logout)');
    
    const testUid = 'test-manager-ci';
    const testEmail = 'test_manager_ci@sahara.io';

    const syncRes = await request('/api/auth/sync-profile', 'POST', {
      uid: testUid,
      email: testEmail,
      displayName: 'Test Manager CI',
      isCreatingTeam: true,
      teamName: 'CI Integration Team'
    });
    
    if (syncRes.status !== 200) {
      console.error('Sync Profile Failed:', syncRes.body);
    }
    assert(syncRes.status === 200, `POST /api/auth/sync-profile expected 200, got ${syncRes.status}`);
    assert(syncRes.body.profile?.role === 'Manager', 'Synced profile should have Manager role');
    console.log(`   ✅ Sync Profile 200 | Synced user: ${syncRes.body.profile.email}`);

    const loginRes = await request('/api/auth/login', 'POST', {
      uid: testUid,
      email: testEmail,
    });
    if (loginRes.status !== 200) {
      console.error('Login Failed:', loginRes.body);
    }
    assert(loginRes.status === 200, `POST /api/auth/login expected 200, got ${loginRes.status}`);
    assert(!!loginRes.body.user, 'Should return decoded user info');
    console.log(`   ✅ Login 200 | Session created for: ${loginRes.body.user.email}`);

    const authHeader = loginRes.headers['set-cookie']?.[0];
    const cookieHeader = authHeader ? { Cookie: authHeader.split(';')[0] } : {};

    const meRes = await request('/api/auth/me', 'GET', undefined, cookieHeader);
    assert(meRes.status === 200, `GET /api/auth/me expected 200, got ${meRes.status}`);
    assert(meRes.body.user?.email === 'test_manager_ci@sahara.io', 'Me endpoint should return test manager email');
    console.log(`   ✅ Auth Me 200 | Verified session user: ${meRes.body.user.email}`);

    // 4. Projects API
    console.log('\n4️⃣ Testing Projects API (/api/projects)');
    const projects = await request('/api/projects', 'GET', undefined, cookieHeader);
    assert(projects.status === 200, `GET /api/projects expected 200, got ${projects.status}`);
    assert(typeof projects.body.count === 'number', 'Count should be number');
    console.log(`   ✅ GET /api/projects 200 | Count: ${projects.body.count}`);

    const newProj = await request('/api/projects', 'POST', {
      name: 'Cloud Edge Relay Cluster',
      region: 'Sector 3 - Kubernetes Cluster',
      lead: 'Zainab Nouri',
    }, cookieHeader);
    assert(newProj.status === 201, `POST /api/projects expected 201, got ${newProj.status}`);
    assert(typeof newProj.body.data?.id === 'string', 'Created project ID should be a string');
    const projectId = newProj.body.data?.id;
    console.log(`   ✅ POST /api/projects 201 | Created Project ID: ${projectId}`);

    // Invalid project payload test
    const badProj = await request('/api/projects', 'POST', { name: '' }, cookieHeader);
    assert(badProj.status === 400, `POST invalid /api/projects expected 400, got ${badProj.status}`);
    console.log('   ✅ POST invalid /api/projects 400 | Handled payload validation cleanly');

    // 5. User Stories API
    console.log('\n5️⃣ Testing User Stories API (/api/stories)');
    const stories = await request('/api/stories', 'GET', undefined, cookieHeader);
    assert(stories.status === 200, `GET /api/stories expected 200, got ${stories.status}`);
    console.log(`   ✅ GET /api/stories 200 | Count: ${stories.body.count}`);

    const newStory = await request('/api/stories', 'POST', {
      projectId,
      title: 'High-Frequency SatCom Telemetry Link',
      description: 'Stream continuous well head pressure telemetry to central operations.',
      points: 8,
      assigneeName: 'Amara Vance',
    }, cookieHeader);
    assert(newStory.status === 201, `POST /api/stories expected 201, got ${newStory.status}`);
    assert(typeof newStory.body.data?.id === 'string', 'Story ID should be a string');
    console.log(`   ✅ POST /api/stories 201 | Created Story ID: ${newStory.body.data?.id}`);

    // 6. Tasks API
    console.log('\n6️⃣ Testing Tasks API (/api/tasks)');
    const tasks = await request('/api/tasks', 'GET', undefined, cookieHeader);
    assert(tasks.status === 200, `GET /api/tasks expected 200, got ${tasks.status}`);
    console.log(`   ✅ GET /api/tasks 200 | Count: ${tasks.body.count}`);

    const newTask = await request('/api/tasks', 'POST', {
      title: 'Calibrate optical opacity sensor B2',
      storyId: newStory.body.data?.id,
      priority: 'urgent',
    }, cookieHeader);
    assert(newTask.status === 201, `POST /api/tasks expected 201, got ${newTask.status}`);
    const taskId = newTask.body.data?.id;
    console.log(`   ✅ POST /api/tasks 201 | Created Task ID: ${taskId}`);

    const updatedTask = await request(`/api/tasks/${taskId}/status`, 'PATCH', { status: 'in_progress' }, cookieHeader);
    assert(updatedTask.status === 200, `PATCH /api/tasks/${taskId}/status expected 200, got ${updatedTask.status}`);
    assert(updatedTask.body.data?.status === 'in_progress', 'Task status should be in_progress');
    console.log(`   ✅ PATCH /api/tasks/${taskId}/status 200 | Updated status: ${updatedTask.body.data?.status}`);

    // 7. Attendance & Shift Log API
    console.log('\n7️⃣ Testing Attendance API (/api/attendance)');
    const clockIn = await request('/api/attendance', 'POST', {
      userName: 'Amara Vance',
      userId: 'USR-01',
      status: 'clocked_in',
    }, cookieHeader);
    assert(clockIn.status === 201, `POST /api/attendance expected 201, got ${clockIn.status}`);
    const logId = clockIn.body.data?.id;
    console.log(`   ✅ POST /api/attendance 201 | Log ID: ${logId}`);

    const getAtt = await request('/api/attendance', 'GET', undefined, cookieHeader);
    assert(getAtt.status === 200, `GET /api/attendance expected 200, got ${getAtt.status}`);
    console.log(`   ✅ GET /api/attendance 200 | Count: ${getAtt.body.count}`);

    // 8. Async Job Queue API
    console.log('\n8️⃣ Testing Async Background Jobs API (/api/async-jobs)');
    const asyncJobsList = await request('/api/async-jobs', 'GET', undefined, cookieHeader);
    assert(asyncJobsList.status === 200, `GET /api/async-jobs expected 200, got ${asyncJobsList.status}`);
    console.log(`   ✅ GET /api/async-jobs 200 | Count: ${asyncJobsList.body.count}`);

    const newJob = await request('/api/async-jobs', 'POST', {
      title: 'Monthly Site Telemetry Audit',
      type: 'sprint_summary',
    }, cookieHeader);
    assert(newJob.status === 201, `POST /api/async-jobs expected 201, got ${newJob.status}`);
    const jobId = newJob.body.data?.id;
    console.log(`   ✅ POST /api/async-jobs 201 | Created Job ID: ${jobId}`);

    // 9. Redis Pattern Job Queue & DLQ REST API
    console.log('\n9️⃣ Testing Redis Background Queue & DLQ API (/api/queue/*)');
    const statsRes = await request('/api/queue/stats', 'GET', undefined, cookieHeader);
    assert(statsRes.status === 200, `GET /api/queue/stats expected 200, got ${statsRes.status}`);
    assert(typeof statsRes.body.data?.waiting === 'number', 'Queue stats should include waiting count');
    console.log(`   ✅ GET /api/queue/stats 200 | Total Jobs: ${statsRes.body.data?.totalJobs} | DLQ: ${statsRes.body.data?.dlq}`);

    const triggerRes = await request('/api/queue/trigger-midnight', 'POST', { shouldFailSimulated: false }, cookieHeader);
    assert(triggerRes.status === 202, `POST /api/queue/trigger-midnight expected 202, got ${triggerRes.status}`);
    assert(triggerRes.body.data?.name === 'midnight_productivity_report', 'Job name should match midnight report');
    console.log(`   ✅ POST /api/queue/trigger-midnight 202 | Enqueued Job ID: ${triggerRes.body.data?.id}`);

    const dlqRes = await request('/api/queue/dlq', 'GET', undefined, cookieHeader);
    assert(dlqRes.status === 200, `GET /api/queue/dlq expected 200, got ${dlqRes.status}`);
    assert(Array.isArray(dlqRes.body.data), 'DLQ should return an array');
    console.log(`   ✅ GET /api/queue/dlq 200 | Count in DLQ: ${dlqRes.body.count}`);

    const logoutRes = await request('/api/auth/logout', 'POST', undefined, cookieHeader);
    assert(logoutRes.status === 200, `POST /api/auth/logout expected 200, got ${logoutRes.status}`);
    console.log('\n   ✅ Logout 200 | Session cookie revoked');

    console.log('\n🎉 ALL REST API INTEGRATION TESTS PASSED CLEANLY!\n');
  } catch (error) {
    console.error('\n❌ API Integration Suite Failed:', error);
    process.exit(1);
  }
}

runTests();
