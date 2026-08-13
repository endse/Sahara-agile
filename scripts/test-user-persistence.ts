import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9OV6ndtMuxsj@ep-summer-frost-azhn3clc-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function testUserPersistence() {
  const client = await pool.connect();
  const testUserId = `usr-test-${Date.now()}`;
  const testProjectId = `LOC-${Date.now()}`;
  const testTaskId = `TASK-${Date.now()}`;

  try {
    console.log(`🧪 Testing data persistence for User ID: ${testUserId}`);

    // 1. User Profile Sync
    await client.query(
      `INSERT INTO users (uid, email, display_name, role, team_id)
       VALUES ($1, $2, $3, $4, $5);`,
      [testUserId, `${testUserId}@example.com`, 'Test User Persistence', 'Manager', testUserId]
    );
    console.log('   ✅ User profile saved to Neon PostgreSQL');

    // 2. User Creates a Project
    await client.query(
      `INSERT INTO locations (id, name, region, status, team_id, lead)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [testProjectId, 'Persisted Production Facility', 'Sector Alpha', 'active', testUserId, 'Test User Persistence']
    );
    console.log(`   ✅ Project '${testProjectId}' created in Neon PostgreSQL`);

    // 3. User Creates a Task
    await client.query(
      `INSERT INTO tasks (id, title, code, status, priority, team_id, project_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [testTaskId, 'Verify Neon Persistence', 'SAH-999', 'todo', 'high', testUserId, testProjectId]
    );
    console.log(`   ✅ Task '${testTaskId}' created in Neon PostgreSQL`);

    // 4. Simulate App Reload (Fetch projects and tasks for this user's teamId)
    console.log('\n🔄 Simulating App Reload / Page Refresh...');
    const locResult = await client.query('SELECT * FROM locations WHERE team_id = $1;', [testUserId]);
    const taskResult = await client.query('SELECT * FROM tasks WHERE team_id = $1;', [testUserId]);

    console.log(`   📍 Retrived projects count after reload: ${locResult.rows.length}`);
    console.log(`   📋 Retrived tasks count after reload: ${taskResult.rows.length}`);

    if (locResult.rows.length === 1 && locResult.rows[0].id === testProjectId &&
        taskResult.rows.length === 1 && taskResult.rows[0].id === testTaskId) {
      console.log('\n🎉 PERSISTENCE TEST PASSED: User data is 100% persistent in Neon PostgreSQL across reloads!');
    } else {
      console.error('\n❌ PERSISTENCE TEST FAILED: Retrived data did not match saved user data.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

testUserPersistence();
