import { spawn, execSync, ChildProcess } from 'child_process';
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

async function runCiPipeline() {
  console.log('🧪 [CI/CD Harness] Step 1/3: Running Unit & Business Logic Tests...');
  try {
    execSync('npx vitest run', { stdio: 'inherit' });
    console.log('✅ [CI/CD Harness] Unit test suite passed cleanly.\n');
  } catch (err) {
    console.error('❌ [CI/CD Harness] Unit test suite failed.');
    process.exit(1);
  }

  console.log('🚀 [CI/CD Harness] Step 2/3: Starting server process for API integration testing...');
  const serverEnv = { ...process.env, NODE_ENV: 'production', PORT: '3000' };

  const serverProcess: ChildProcess = spawn('node', ['dist/server.cjs'], {
    env: serverEnv,
    stdio: 'ignore',
    shell: true,
  });

  serverProcess.on('error', (err) => {
    console.error('❌ [CI/CD Harness] Failed to spawn server process:', err);
    process.exit(1);
  });

  console.log('⏳ [CI/CD Harness] Waiting for server to become healthy on port 3000...');
  const isHealthy = await waitForServer();

  if (!isHealthy) {
    console.error('❌ [CI/CD Harness] Server failed to start within timeout.');
    serverProcess.kill('SIGTERM');
    process.exit(1);
  }

  console.log('✅ [CI/CD Harness] Step 3/3: Running REST API Integration Test Suite...\n');

  const testProcess = spawn('npx', ['tsx', 'scripts/test-api.ts'], {
    stdio: 'inherit',
    shell: true,
  });

  testProcess.on('close', (code) => {
    console.log(`\n🧹 [CI/CD Harness] Cleaning up server process (exit code: ${code})...`);
    serverProcess.kill('SIGTERM');
    process.exit(code ?? 0);
  });
}

runCiPipeline();
