import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9OV6ndtMuxsj@ep-summer-frost-azhn3clc-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function testAddTask() {
  const client = await pool.connect();
  const teamId = `usr-task-test-${Date.now()}`;
  const taskId = `TASK-${Date.now()}`;

  try {
    console.log('🧪 Testing Add Task creation & persistence in Neon PostgreSQL...');

    // 1. Insert a standalone task directly into tasks table
    await client.query(
      `INSERT INTO tasks (id, title, code, status, priority, assignee, due_date, progress, tags, description, region, team_id, location, updated_at, time_spent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        taskId,
        'Deploy Microgrid Telemetry System',
        'SAH-888',
        'todo',
        'high',
        JSON.stringify({ name: 'Amara Vance', avatar: '', role: 'Lead Engineer' }),
        '2026-11-15',
        0,
        JSON.stringify(['FullStack', 'Telemetry']),
        'Full setup of remote sensors and telemetry data ingest.',
        'Sector Alpha',
        teamId,
        JSON.stringify({ lat: 23.5, lng: 12.5, label: 'Sahara Field Operations' }),
        new Date().toISOString(),
        '0h'
      ]
    );

    console.log(`   ✅ Task '${taskId}' inserted into Neon PostgreSQL`);

    // 2. Query back the task
    const res = await client.query('SELECT * FROM tasks WHERE team_id = $1;', [teamId]);
    console.log(`   📋 Retrieved tasks count: ${res.rows.length}`);

    if (res.rows.length === 1 && res.rows[0].id === taskId && res.rows[0].title === 'Deploy Microgrid Telemetry System') {
      console.log('\n🎉 ADD TASK TEST PASSED: Task was created and verified cleanly in Neon PostgreSQL!');
    } else {
      console.error('\n❌ ADD TASK TEST FAILED: Task was not retrieved as expected.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error during Add Task test:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

testAddTask();
