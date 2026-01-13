# Analysis History Setup

## Database Migration Required

To enable analysis history tracking, you need to create the `analysis_history` table in Supabase.

### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project SQL Editor:
   - Navigate to: https://supabase.com/dashboard/project/_/sql
   - Or find it in your project dashboard under "SQL Editor"

2. Copy and paste the contents of `supabase/migrations/004_analysis_history.sql`

3. Click "Run" to execute the migration

### Option 2: Manual SQL

If you prefer, copy and paste this SQL directly:

```sql
-- Analysis History Table
CREATE TABLE analysis_history (
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

-- Indexes
CREATE INDEX idx_analysis_history_created_at ON analysis_history (created_at DESC);
CREATE INDEX idx_analysis_history_brand ON analysis_history (brand);
CREATE INDEX idx_analysis_history_confidence ON analysis_history (confidence_level);
CREATE INDEX idx_analysis_history_session ON analysis_history (session_id);

-- Full text search
CREATE INDEX idx_analysis_history_search ON analysis_history USING gin (
  to_tsvector('english',
    coalesce(brand, '') || ' ' ||
    coalesce(model_name, '') || ' ' ||
    coalesce(reference_number, '')
  )
);

-- RLS Policies
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to analysis history"
ON analysis_history FOR ALL
USING (true)
WITH CHECK (true);
```

## Features

Once the table is created, the following features will be enabled:

### Automatic Saving
- Every watch analysis is automatically saved to the database
- Includes photos, analysis results, and metadata
- Non-blocking save (won't affect analysis performance)

### History Page
- View all previous analyses at `/history`
- Beautiful grid layout with watch photos
- Filter and pagination support
- Shows confidence level, condition grade, and date

### Navigation
- "View History" button on main page
- "History" link in admin navigation
- Easy access from anywhere in the app

## Verify Setup

After running the migration:

1. Go to http://localhost:3003
2. Analyze a watch (upload or capture photos)
3. After analysis completes, click "View History"
4. You should see your analysis in the grid

## Troubleshooting

If you don't see the history page working:

1. Check Supabase logs for any SQL errors
2. Verify the table was created: `SELECT * FROM analysis_history LIMIT 1;`
3. Check browser console for any API errors
4. Ensure RLS policies are enabled

## API Endpoints

- `GET /api/history` - Fetch analysis history with pagination
- `POST /api/history` - Get single analysis by ID

Query parameters for GET:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `brand` - Filter by brand
- `confidence` - Filter by confidence level
