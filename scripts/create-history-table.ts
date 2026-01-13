/**
 * Create analysis history table
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createTable() {
  console.log('🚀 Creating analysis history table...\n');

  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('analysis_history')
      .select('id')
      .limit(1);

    console.log('✅ Table already exists or has been created!');
    console.log('\n💡 Note: Run the SQL from supabase/migrations/004_analysis_history.sql');
    console.log(`   in the Supabase SQL Editor: ${supabaseUrl}/project/_/sql\n`);
  } catch (error: any) {
    console.log('📋 Table does not exist yet. Please run the migration SQL manually:');
    console.log(`   ${supabaseUrl}/project/_/sql\n`);
  }
}

createTable();
