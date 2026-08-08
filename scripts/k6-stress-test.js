import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 20 },   // Warm-up to 20 Virtual Users
    { duration: '10s', target: 100 },  // Scale load to 100 VUs
    { duration: '10s', target: 250 },  // Peak stress test up to 250 VUs
    { duration: '5s', target: 0 },    // Ramp-down to 0 VUs
  ],
  thresholds: {
    http_req_duration: ['p(95)<350', 'p(99)<600'], // 95% of requests < 350ms under 250 VUs peak load
    http_req_failed: ['rate<0.01'],                 // Error rate < 1%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 1. Health Check Endpoint
  const healthRes = http.get(`${BASE_URL}/api/health`, params);
  check(healthRes, {
    'Health GET status 200': (r) => r.status === 200,
  });

  // 2. Fetch Projects Location List
  const projectsRes = http.get(`${BASE_URL}/api/projects`, params);
  check(projectsRes, {
    'Projects GET status 200': (r) => r.status === 200,
  });

  // 3. Create Project Location
  const newProjectPayload = JSON.stringify({
    name: `Load Site ${Math.floor(Math.random() * 10000)}`,
    region: 'Sector 7 - Oasis Outpost',
    lead: 'Amara Vance',
  });
  const createProjRes = http.post(`${BASE_URL}/api/projects`, newProjectPayload, params);
  check(createProjRes, {
    'Project POST status 201': (r) => r.status === 201,
  });

  // 4. Fetch User Stories
  const storiesRes = http.get(`${BASE_URL}/api/stories`, params);
  check(storiesRes, {
    'Stories GET status 200': (r) => r.status === 200,
  });

  // 5. Fetch Tasks List
  const tasksRes = http.get(`${BASE_URL}/api/tasks`, params);
  check(tasksRes, {
    'Tasks GET status 200': (r) => r.status === 200,
  });

  // 6. Clock-in Shift Attendance
  const clockInPayload = JSON.stringify({
    userName: 'Kofi Mensah',
    userId: 'USR-04',
    locationName: 'Sebha Complex',
  });
  const clockInRes = http.post(`${BASE_URL}/api/attendance/clock-in`, clockInPayload, params);
  check(clockInRes, {
    'Clock-in POST status 201': (r) => r.status === 201,
  });

  // 7. Redis Queue Stats Check
  const queueStatsRes = http.get(`${BASE_URL}/api/queue/stats`, params);
  check(queueStatsRes, {
    'Queue Stats GET status 200': (r) => r.status === 200,
  });

  // 8. Trigger Midnight Productivity Job
  const triggerJobPayload = JSON.stringify({ shouldFailSimulated: false });
  const triggerRes = http.post(`${BASE_URL}/api/queue/trigger-midnight`, triggerJobPayload, params);
  check(triggerRes, {
    'Trigger Midnight POST status 202': (r) => r.status === 202,
  });

  sleep(0.1);
}
