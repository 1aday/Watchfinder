/**
 * Run a SQL migration file
 * Usage: npx tsx scripts/run-migration.ts <migration-file>
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('❌ Usage: npx tsx scripts/run-migration.ts <migration-file>');
  process.exit(1);
}

const migrationPath = resolve(__dirname, '../supabase/migrations', migrationFile);
const sql = readFileSync(migrationPath, 'utf-8');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runMigration() {
  console.log(`🚀 Running migration: ${migrationFile}\n`);

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Note: You may need to run this migration manually via Supabase SQL Editor');
    console.log(`   ${supabaseUrl}/project/_/sql`);
  }
}

runMigration();
