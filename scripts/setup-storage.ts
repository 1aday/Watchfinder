/**
 * Setup Supabase Storage for Watch Images
 *
 * Run this script to create the storage bucket and policies:
 * npx tsx scripts/setup-storage.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage for watch images...\n');

  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'watch-images');

    if (bucketExists) {
      console.log('✅ Storage bucket "watch-images" already exists');
    } else {
      // Create bucket
      const { data, error } = await supabase.storage.createBucket('watch-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      });

      if (error) {
        console.error('❌ Failed to create storage bucket:', error);
        process.exit(1);
      }

      console.log('✅ Created storage bucket "watch-images"');
    }

    console.log('\n✨ Storage setup complete!');
    console.log('\nNote: Storage policies are managed automatically by Supabase RLS.');
    console.log('If you need to configure policies manually, go to:');
    console.log(`${supabaseUrl}/project/_/storage/buckets`);

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupStorage();
