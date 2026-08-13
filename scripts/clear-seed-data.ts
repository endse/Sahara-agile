import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9OV6ndtMuxsj@ep-summer-frost-azhn3clc-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function clearSeeded() {
  const client = await pool.connect();
  try {
    console.log('🧹 Clearing seeded demo data (team_id = \'\')...');
    await client.query("DELETE FROM locations WHERE team_id = '';");
    await client.query("DELETE FROM tasks WHERE team_id = '';");
    await client.query("DELETE FROM team WHERE team_id = '';");
    await client.query("DELETE FROM activities WHERE team_id = '';");
    await client.query("DELETE FROM timeline WHERE team_id = '';");
    await client.query("DELETE FROM stories WHERE team_id = '';");
    await client.query("DELETE FROM attendance WHERE team_id = '';");
    await client.query("DELETE FROM async_jobs WHERE team_id = '';");
    console.log('✅ Demo seed data cleared!');
  } catch (err) {
    console.error('Error clearing demo data:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

clearSeeded();
