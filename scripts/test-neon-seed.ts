import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9OV6ndtMuxsj@ep-summer-frost-azhn3clc-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const testPool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    const client = await testPool.connect();
    const locs = await client.query('SELECT COUNT(*) FROM locations;');
    const tasks = await client.query('SELECT COUNT(*) FROM tasks;');
    const team = await client.query('SELECT COUNT(*) FROM team;');
    const timeline = await client.query('SELECT COUNT(*) FROM timeline;');

    console.log(`📍 Locations count: ${locs.rows[0].count}`);
    console.log(`📋 Tasks count: ${tasks.rows[0].count}`);
    console.log(`👥 Team Members count: ${team.rows[0].count}`);
    console.log(`📅 Timeline Milestones count: ${timeline.rows[0].count}`);

    client.release();
    await testPool.end();
    console.log('🎉 Neon PostgreSQL table check complete!');
  } catch (err) {
    console.error('❌ Check failed:', err);
    process.exit(1);
  }
}

checkTables();
