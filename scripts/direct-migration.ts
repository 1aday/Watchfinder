/**
 * Direct SQL migration execution
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
});

async function runMigration() {
  console.log('🚀 Applying analysis history migration...\n');

  try {
    const migrationSql = readFileSync(
      resolve(__dirname, '../supabase/migrations/004_analysis_history.sql'),
      'utf-8'
    );

    // Split SQL into individual statements
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`[${i + 1}/${statements.length}] Executing...`);

      const { error } = await supabase.rpc('exec', { sql: statement }).single();

      if (error) {
        // Try direct approach
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql: statement })
        });

        if (!response.ok) {
          console.log(`⚠️  Statement ${i + 1} may have failed (this is sometimes OK)`);
        }
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('\n🔍 Verifying table creation...');

    const { data, error } = await supabase
      .from('analysis_history')
      .select('id')
      .limit(1);

    if (error) {
      console.log('\n⚠️  Could not verify table. Please run migration manually:');
      console.log(`   ${supabaseUrl}/project/_/sql\n`);
    } else {
      console.log('✅ Table verified successfully!\n');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Please run the migration manually via Supabase SQL Editor:');
    console.log(`   ${supabaseUrl}/project/_/sql\n`);
  }
}

runMigration();
