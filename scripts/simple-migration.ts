/**
 * Simple migration - create analysis_history table
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTable() {
  console.log('🚀 Creating analysis_history table...\n');

  try {
    // First, try to query the table to see if it exists
    const { error: checkError } = await supabase
      .from('analysis_history')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Table already exists!\n');
      return;
    }

    console.log('📝 Table does not exist. Creating via REST API...\n');

    // Use Supabase REST API to execute raw SQL
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS analysis_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        analysis_data JSONB NOT NULL,
        photo_urls TEXT[] NOT NULL,
        primary_photo_url TEXT,
        brand TEXT,
        model_name TEXT,
        reference_number TEXT,
        confidence_level TEXT,
        overall_grade TEXT,
        match_results JSONB,
        best_match_score DECIMAL(5,2),
        session_id TEXT,
        user_id TEXT,
        photo_count INTEGER,
        analysis_duration_ms INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON analysis_history (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_analysis_history_brand ON analysis_history (brand);
      CREATE INDEX IF NOT EXISTS idx_analysis_history_confidence ON analysis_history (confidence_level);
      CREATE INDEX IF NOT EXISTS idx_analysis_history_session ON analysis_history (session_id);

      CREATE INDEX IF NOT EXISTS idx_analysis_history_search ON analysis_history USING gin (
        to_tsvector('english',
          coalesce(brand, '') || ' ' ||
          coalesce(model_name, '') || ' ' ||
          coalesce(reference_number, '')
        )
      );

      ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow all access to analysis history" ON analysis_history;
      CREATE POLICY "Allow all access to analysis history"
      ON analysis_history FOR ALL
      USING (true)
      WITH CHECK (true);
    `;

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: createTableSql })
    });

    console.log('Response status:', response.status);

    // Verify
    const { data, error: verifyError } = await supabase
      .from('analysis_history')
      .select('id')
      .limit(1);

    if (verifyError) {
      console.log('\n⚠️  Table creation could not be verified.');
      console.log('Please create the table manually:');
      console.log(`1. Go to: ${supabaseUrl}/project/_/sql`);
      console.log('2. Copy and paste the contents of: supabase/migrations/004_analysis_history.sql');
      console.log('3. Click Run\n');
    } else {
      console.log('✅ Table created and verified successfully!\n');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual setup required:');
    console.log(`1. Go to: ${supabaseUrl}/project/_/sql`);
    console.log('2. Copy SQL from: supabase/migrations/004_analysis_history.sql');
    console.log('3. Run the migration\n');
  }
}

createTable();
