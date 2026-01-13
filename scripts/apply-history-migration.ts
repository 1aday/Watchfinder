/**
 * Apply analysis history migration
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import postgres from 'postgres';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Extract connection details
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const connectionString = `postgresql://postgres:${supabaseServiceKey}@db.${projectRef}.supabase.co:5432/postgres`;

const sql = postgres(connectionString);

async function applyMigration() {
  console.log('🚀 Applying analysis history migration...\n');

  try {
    const migrationSql = readFileSync(
      resolve(__dirname, '../supabase/migrations/004_analysis_history.sql'),
      'utf-8'
    );

    await sql.unsafe(migrationSql);

    console.log('✅ Migration applied successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Tip: You can apply this migration manually via Supabase SQL Editor:');
    console.log(`   ${supabaseUrl}/project/_/sql\n`);
    process.exit(1);
  }
}

applyMigration();
