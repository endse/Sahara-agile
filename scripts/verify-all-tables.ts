import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9OV6ndtMuxsj@ep-summer-frost-azhn3clc-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function verifyAllTables() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to Neon PostgreSQL to verify all tables...');

    // 1. Create any missing tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        email TEXT,
        display_name TEXT,
        photo_url TEXT,
        role TEXT,
        specialty TEXT,
        assigned_station TEXT,
        phone TEXT,
        bio TEXT,
        updated_at TEXT,
        permission_status TEXT,
        team_id TEXT,
        team_name TEXT,
        is_team_manager BOOLEAN,
        password_hash TEXT
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT,
        code TEXT,
        status TEXT,
        priority TEXT,
        assignee JSONB,
        due_date TEXT,
        progress INT,
        tags JSONB,
        description TEXT,
        region TEXT,
        team_id TEXT,
        location JSONB,
        updated_at TEXT,
        time_spent TEXT,
        story_id TEXT,
        project_id TEXT,
        approval_status TEXT,
        pending_status TEXT,
        status_requested_by TEXT,
        status_requested_at TEXT,
        attachments JSONB
      );

      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT,
        region TEXT,
        coordinates JSONB,
        status TEXT,
        task_count INT,
        crew_count INT,
        lead TEXT,
        temperature TEXT,
        weather_condition TEXT,
        humidity TEXT,
        wind_speed TEXT,
        uv_index TEXT,
        assigned_member_ids JSONB,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        user_name TEXT,
        avatar TEXT,
        action TEXT,
        target TEXT,
        time TEXT,
        type TEXT,
        detail TEXT,
        task_id TEXT,
        requires_manager_approval BOOLEAN,
        approval_status TEXT,
        pending_status TEXT,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS team (
        id TEXT PRIMARY KEY,
        name TEXT,
        role TEXT,
        avatar TEXT,
        email TEXT,
        status TEXT,
        current_task TEXT,
        location TEXT,
        local_time TEXT,
        tasks_count INT,
        performance INT,
        team_id TEXT,
        team_name TEXT,
        permission_status TEXT,
        requested_role TEXT,
        requested_permissions JSONB,
        reviewed_by TEXT,
        reviewed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS timeline (
        id TEXT PRIMARY KEY,
        phase TEXT,
        title TEXT,
        start_date TEXT,
        end_date TEXT,
        status TEXT,
        progress INT,
        lead TEXT,
        region TEXT,
        assigned_member_ids JSONB,
        description TEXT,
        budget TEXT,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS stories (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        project_name TEXT,
        title TEXT,
        description TEXT,
        acceptance_criteria JSONB,
        points INT,
        status TEXT,
        assignee_name TEXT,
        created_at TEXT,
        updated_at TEXT,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        user_avatar TEXT,
        clock_in_time TEXT,
        clock_out_time TEXT,
        total_hours NUMERIC,
        status TEXT,
        work_notes TEXT,
        date TEXT,
        location_name TEXT,
        break_minutes INT,
        overtime_hours NUMERIC,
        approval_status TEXT,
        approved_by TEXT,
        manager_notes TEXT,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS async_jobs (
        id TEXT PRIMARY KEY,
        title TEXT,
        type TEXT,
        status TEXT,
        progress INT,
        result_summary TEXT,
        retry_count INT,
        error_reason TEXT,
        created_at TEXT,
        completed_at TEXT,
        team_id TEXT
      );

      CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY,
        email TEXT,
        full_name TEXT,
        role TEXT,
        is_manager_invite BOOLEAN,
        team_name TEXT,
        team_id TEXT,
        invited_by TEXT,
        invited_by_email TEXT,
        created_at TEXT,
        status TEXT,
        invite_code TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT,
        message TEXT,
        timestamp TEXT,
        read BOOLEAN DEFAULT false,
        type TEXT,
        target_screen TEXT,
        target_id TEXT,
        team_id TEXT,
        user_id TEXT
      );

      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT,
        created_by TEXT,
        created_at TEXT,
        manager_uid TEXT
      );
    `);

    // 2. Query list of public tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name ASC;
    `);

    const tables = tableRes.rows.map(r => r.table_name);
    console.log(`\n📋 Found ${tables.length} tables in Neon PostgreSQL database:`);
    tables.forEach(t => console.log(`   - 🗄️  ${t}`));

    const expected = [
      'activities',
      'async_jobs',
      'attendance',
      'invitations',
      'locations',
      'notifications',
      'stories',
      'tasks',
      'team',
      'teams',
      'timeline',
      'users'
    ];

    const missing = expected.filter(t => !tables.includes(t));
    if (missing.length === 0) {
      console.log('\n🎉 ALL REQUIRED TABLES ARE PRESENT AND VERIFIED IN NEON POSTGRESQL!');
    } else {
      console.error(`\n❌ Missing tables: ${missing.join(', ')}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Table verification failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyAllTables();
