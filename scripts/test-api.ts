import http from 'http';

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
    console.log(`   ✅ Status 200 | Uptime: ${health.body.uptime.toFixed(2)}s`);

    // 2. Security Notes API
    console.log('\n2️⃣ Testing GET /api/security/notes');
    const secNotes = await request('/api/security/notes');
    assert(secNotes.status === 200, `GET /api/security/notes expected 200, got ${secNotes.status}`);
    assert(secNotes.body.success === true, 'Security notes should return success');
    assert(Array.isArray(secNotes.body.securityConsiderations), 'Security considerations should be an array');
    console.log(`   ✅ Status 200 | Found ${secNotes.body.securityConsiderations.length} security considerations`);

    // 3. Auth Endpoints
    console.log('\n3️⃣ Testing Auth API (/api/auth/login, /api/auth/me, /api/auth/logout)');
    const loginRes = await request('/api/auth/login', 'POST', {
      role: 'Manager',
      userName: 'Amara Vance',
      email: 'amara.vance@sahara.io',
    });
    assert(loginRes.status === 200, `POST /api/auth/login expected 200, got ${loginRes.status}`);
    assert(loginRes.body.user?.role === 'Manager', 'Role should be Manager');
    console.log(`   ✅ Login 200 | User: ${loginRes.body.user.userName} (${loginRes.body.user.role})`);

    const authHeader = loginRes.headers['set-cookie']?.[0];
    const cookieHeader = authHeader ? { Cookie: authHeader.split(';')[0] } : {};

    const meRes = await request('/api/auth/me', 'GET', undefined, cookieHeader);
    assert(meRes.status === 200, `GET /api/auth/me expected 200, got ${meRes.status}`);
    assert(meRes.body.user?.userName === 'Amara Vance', 'Me endpoint should return Amara Vance');
    console.log(`   ✅ Auth Me 200 | Verified session user: ${meRes.body.user.userName}`);

    const logoutRes = await request('/api/auth/logout', 'POST');
    assert(logoutRes.status === 200, `POST /api/auth/logout expected 200, got ${logoutRes.status}`);
    console.log('   ✅ Logout 200 | Session cookie revoked');

    // 4. Projects API
    console.log('\n4️⃣ Testing Projects API (/api/projects)');
    const projects = await request('/api/projects');
    assert(projects.status === 200, `GET /api/projects expected 200, got ${projects.status}`);
    assert(typeof projects.body.count === 'number', 'Count should be number');
    console.log(`   ✅ GET /api/projects 200 | Count: ${projects.body.count}`);

    const newProj = await request('/api/projects', 'POST', {
      name: 'Tibesti Renewable Relay Hub',
      region: 'Sector 9 - Highlands',
      lead: 'Zainab Nouri',
    });
    assert(newProj.status === 201, `POST /api/projects expected 201, got ${newProj.status}`);
    assert(newProj.body.data?.id.startsWith('LOC-'), 'Created project ID should start with LOC-');
    console.log(`   ✅ POST /api/projects 201 | Created Project ID: ${newProj.body.data?.id}`);

    // Invalid project payload test
    const badProj = await request('/api/projects', 'POST', { name: '' });
    assert(badProj.status === 400, `POST invalid /api/projects expected 400, got ${badProj.status}`);
    console.log('   ✅ POST invalid /api/projects 400 | Handled payload validation cleanly');

    // 5. User Stories API
    console.log('\n5️⃣ Testing User Stories API (/api/stories)');
    const stories = await request('/api/stories');
    assert(stories.status === 200, `GET /api/stories expected 200, got ${stories.status}`);
    console.log(`   ✅ GET /api/stories 200 | Count: ${stories.body.count}`);

    const newStory = await request('/api/stories', 'POST', {
      projectId: 'LOC-1',
      title: 'High-Frequency SatCom Telemetry Link',
      description: 'Stream continuous well head pressure telemetry to central operations.',
      points: 8,
      assigneeName: 'Amara Vance',
    });
    assert(newStory.status === 201, `POST /api/stories expected 201, got ${newStory.status}`);
    assert(newStory.body.data?.id.startsWith('US-'), 'Story ID should start with US-');
    console.log(`   ✅ POST /api/stories 201 | Created Story ID: ${newStory.body.data?.id}`);

    // 6. Tasks API
    console.log('\n6️⃣ Testing Tasks API (/api/tasks)');
    const tasks = await request('/api/tasks');
    assert(tasks.status === 200, `GET /api/tasks expected 200, got ${tasks.status}`);
    console.log(`   ✅ GET /api/tasks 200 | Count: ${tasks.body.count}`);

    const newTask = await request('/api/tasks', 'POST', {
      title: 'Calibrate optical opacity sensor B2',
      storyId: newStory.body.data?.id,
      priority: 'urgent',
    });
    assert(newTask.status === 201, `POST /api/tasks expected 201, got ${newTask.status}`);
    const taskId = newTask.body.data?.id;
    console.log(`   ✅ POST /api/tasks 201 | Created Task ID: ${taskId}`);

    const updatedTask = await request(`/api/tasks/${taskId}/status`, 'PATCH', { status: 'in_progress' });
    assert(updatedTask.status === 200, `PATCH /api/tasks/${taskId}/status expected 200, got ${updatedTask.status}`);
    assert(updatedTask.body.data?.status === 'in_progress', 'Task status should be in_progress');
    console.log(`   ✅ PATCH /api/tasks/${taskId}/status 200 | Updated status: ${updatedTask.body.data?.status}`);

    // 7. Attendance & Shift Log API
    console.log('\n7️⃣ Testing Attendance API (/api/attendance)');
    const clockIn = await request('/api/attendance/clock-in', 'POST', {
      userName: 'Amara Vance',
      userId: 'USR-01',
    });
    assert(clockIn.status === 201, `POST clock-in expected 201, got ${clockIn.status}`);
    const logId = clockIn.body.data?.id;
    console.log(`   ✅ Clock-in 201 | Log ID: ${logId}`);

    const clockOut = await request('/api/attendance/clock-out', 'POST', {
      id: logId,
      workNotes: 'Optical sensor calibration complete.',
    });
    assert(clockOut.status === 200, `POST clock-out expected 200, got ${clockOut.status}`);
    assert(clockOut.body.data?.status === 'clocked_out', 'Status should be clocked_out');
    console.log(`   ✅ Clock-out 200 | Total hours: ${clockOut.body.data?.totalHours}`);

    const approveRes = await request('/api/attendance/approve', 'POST', {
      logId,
      action: 'approve',
      managerNotes: 'Verified shift log.',
    });
    assert(approveRes.status === 200, `POST /api/attendance/approve expected 200, got ${approveRes.status}`);
    assert(approveRes.body.data?.approvalStatus === 'approved', 'Log should be approved');
    console.log(`   ✅ Shift Log Approve 200 | Status: ${approveRes.body.data?.approvalStatus}`);

    // 8. Async Job Queue API
    console.log('\n8️⃣ Testing Async Background Jobs API (/api/async-jobs)');
    const asyncJobsList = await request('/api/async-jobs');
    assert(asyncJobsList.status === 200, `GET /api/async-jobs expected 200, got ${asyncJobsList.status}`);
    console.log(`   ✅ GET /api/async-jobs 200 | Count: ${asyncJobsList.body.count}`);

    const newJob = await request('/api/async-jobs', 'POST', {
      title: 'Monthly Site Telemetry Audit',
      type: 'sprint_summary',
    });
    assert(newJob.status === 202, `POST /api/async-jobs expected 202, got ${newJob.status}`);
    const jobId = newJob.body.data?.id;
    console.log(`   ✅ POST /api/async-jobs 202 | Created Job ID: ${jobId}`);

    // 9. Redis Pattern Job Queue & DLQ REST API
    console.log('\n9️⃣ Testing Redis Background Queue & DLQ API (/api/queue/*)');
    const statsRes = await request('/api/queue/stats');
    assert(statsRes.status === 200, `GET /api/queue/stats expected 200, got ${statsRes.status}`);
    assert(typeof statsRes.body.data?.waiting === 'number', 'Queue stats should include waiting count');
    console.log(`   ✅ GET /api/queue/stats 200 | Total Jobs: ${statsRes.body.data?.totalJobs} | DLQ: ${statsRes.body.data?.dlq}`);

    const triggerRes = await request('/api/queue/trigger-midnight', 'POST', { shouldFailSimulated: false }, cookieHeader);
    assert(triggerRes.status === 202, `POST /api/queue/trigger-midnight expected 202, got ${triggerRes.status}`);
    assert(triggerRes.body.data?.name === 'midnight_productivity_report', 'Job name should match midnight report');
    console.log(`   ✅ POST /api/queue/trigger-midnight 202 | Enqueued Job ID: ${triggerRes.body.data?.id}`);

    const dlqRes = await request('/api/queue/dlq');
    assert(dlqRes.status === 200, `GET /api/queue/dlq expected 200, got ${dlqRes.status}`);
    assert(Array.isArray(dlqRes.body.data), 'DLQ should return an array');
    console.log(`   ✅ GET /api/queue/dlq 200 | Count in DLQ: ${dlqRes.body.count}`);

    const reportRes = await request('/api/queue/report/latest');
    assert(reportRes.status === 200, `GET /api/queue/report/latest expected 200, got ${reportRes.status}`);
    assert(reportRes.body.data?.recipientEmail === 'amara.vance@sahara.io', 'Report recipient should be Amara Vance');
    console.log(`   ✅ GET /api/queue/report/latest 200 | Recipient: ${reportRes.body.data?.recipientEmail}`);

    console.log('\n🎉 ALL REST API INTEGRATION TESTS PASSED CLEANLY!\n');
  } catch (error) {
    console.error('\n❌ API Integration Suite Failed:', error);
    process.exit(1);
  }
}

runTests();
