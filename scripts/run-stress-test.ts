import { spawn, ChildProcess } from 'child_process';
import http from 'http';

const BASE_URL = 'http://localhost:3000';

function waitForServer(maxAttempts = 30, delayMs = 500): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const req = http.get(`${BASE_URL}/api/health`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve(true);
        }
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          resolve(false);
        }
      });
      req.end();
    }, delayMs);
  });
}

async function runStressHarness() {
  console.log('🚀 [Stress Harness] Building production bundle...');
  const serverEnv = { ...process.env, NODE_ENV: 'production', PORT: '3000' };

  console.log('🚀 [Stress Harness] Starting production server on port 3000...');
  const serverProcess: ChildProcess = spawn('node', ['dist/server.cjs'], {
    env: serverEnv,
    stdio: 'ignore',
    shell: true,
  });

  serverProcess.on('error', (err) => {
    console.error('❌ [Stress Harness] Failed to spawn server:', err);
    process.exit(1);
  });

  console.log('⏳ [Stress Harness] Waiting for server health check...');
  const isHealthy = await waitForServer();

  if (!isHealthy) {
    console.error('❌ [Stress Harness] Server failed to become healthy.');
    serverProcess.kill('SIGTERM');
    process.exit(1);
  }

  console.log('✅ [Stress Harness] Server is online! Launching k6 Load & Stress Test...\n');

  const k6Process = spawn('k6', ['run', 'scripts/k6-stress-test.js'], {
    stdio: 'inherit',
    shell: true,
  });

  k6Process.on('close', (code) => {
    console.log(`\n🧹 [Stress Harness] k6 finished with exit code ${code}. Cleaning up server process...`);
    serverProcess.kill('SIGTERM');
    process.exit(code ?? 0);
  });
}

runStressHarness();
