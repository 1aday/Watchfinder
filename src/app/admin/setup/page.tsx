"use client";

/**
 * Setup Page - Run database migrations
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const checkTable = async () => {
    setStatus("checking");
    setMessage("Checking database...");

    try {
      const response = await fetch("/api/history?page=1&limit=1");
      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage("✅ Analysis history table exists and is working!");
      } else {
        setStatus("error");
        setMessage("❌ Table check failed. Please run the migration manually.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("❌ Could not connect to database. Please run the migration manually.");
    }
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Database Setup
        </h1>
        <p className="text-muted-foreground">
          Run required database migrations in your Supabase database
        </p>
      </div>

      <div className="space-y-6">
        {/* Status Check */}
        <Card>
          <CardHeader>
            <CardTitle>1. Check Database Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              First, let's check if the analysis_history table exists
            </p>
            <Button onClick={checkTable} disabled={status === "checking"}>
              {status === "checking" ? "Checking..." : "Check Status"}
            </Button>
            {message && (
              <Alert>
                <p>{message}</p>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Manual Migration Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>2. Run Migration (If Needed)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If the check fails, you need to create the table manually:
            </p>

            <div className="space-y-2">
              <p className="text-sm font-medium">Step 1: Open Supabase SQL Editor</p>
              <a
                href={`https://supabase.com/dashboard/project/_/sql`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full">
                  Open Supabase SQL Editor →
                </Button>
              </a>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Step 2: Copy this SQL</p>
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-96">
{`-- Analysis History Table
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Analysis results
  analysis_data JSONB NOT NULL,

  -- Photo URLs
  photo_urls TEXT[] NOT NULL,
  primary_photo_url TEXT,

  -- Quick access fields
  brand TEXT,
  model_name TEXT,
  reference_number TEXT,
  confidence_level TEXT,
  overall_grade TEXT,

  -- Match results
  match_results JSONB,
  best_match_score DECIMAL(5,2),

  -- Tracking
  session_id TEXT,
  user_id TEXT,
  photo_count INTEGER,
  analysis_duration_ms INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at
  ON analysis_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_history_brand
  ON analysis_history (brand);
CREATE INDEX IF NOT EXISTS idx_analysis_history_confidence
  ON analysis_history (confidence_level);
CREATE INDEX IF NOT EXISTS idx_analysis_history_session
  ON analysis_history (session_id);

-- Full text search
CREATE INDEX IF NOT EXISTS idx_analysis_history_search
  ON analysis_history USING gin (
    to_tsvector('english',
      coalesce(brand, '') || ' ' ||
      coalesce(model_name, '') || ' ' ||
      coalesce(reference_number, '')
    )
  );

-- RLS Policies
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to analysis history"
  ON analysis_history;
CREATE POLICY "Allow all access to analysis history"
  ON analysis_history FOR ALL
  USING (true)
  WITH CHECK (true);`}
              </pre>
              <Button
                variant="outline"
                onClick={() => {
                  const sql = document.querySelector('pre')?.textContent;
                  if (sql) {
                    navigator.clipboard.writeText(sql);
                    setMessage("✅ SQL copied to clipboard!");
                    setStatus("success");
                  }
                }}
              >
                Copy SQL
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Step 3: Paste and Run</p>
              <p className="text-xs text-muted-foreground">
                Paste the SQL into the Supabase SQL Editor and click "Run"
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Step 4: Verify</p>
              <Button onClick={checkTable}>
                Check Status Again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Brand Similarity Fix */}
        <Card>
          <CardHeader>
            <CardTitle>3. Fix Reference Matching (Required)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you're seeing database errors when analyzing watches, run this fix:
            </p>

            <div className="space-y-2">
              <p className="text-sm font-medium">Copy and run this SQL:</p>
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-96">
{`-- Fix brand similarity type mismatch
DROP FUNCTION IF EXISTS search_references_by_brand(TEXT, DECIMAL, INTEGER);

CREATE OR REPLACE FUNCTION search_references_by_brand(
  search_brand TEXT,
  similarity_threshold REAL DEFAULT 0.85,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  brand TEXT,
  model_name TEXT,
  reference_number TEXT,
  watch_identity JSONB,
  physical_observations JSONB,
  authenticity_indicators JSONB,
  brand_similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rw.id,
    rw.brand,
    rw.model_name,
    rw.reference_number,
    rw.watch_identity,
    rw.physical_observations,
    rw.authenticity_indicators,
    similarity(rw.brand, search_brand) as brand_similarity
  FROM reference_watches rw
  WHERE
    rw.verification_status = 'verified'
    AND similarity(rw.brand, search_brand) >= similarity_threshold
  ORDER BY similarity(rw.brand, search_brand) DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;`}
              </pre>
              <Button
                variant="outline"
                onClick={() => {
                  const sql = document.querySelectorAll('pre')[1]?.textContent;
                  if (sql) {
                    navigator.clipboard.writeText(sql);
                    setMessage("✅ SQL copied to clipboard!");
                    setStatus("success");
                  }
                }}
              >
                Copy SQL
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Success State */}
        {status === "success" && (
          <Alert className="bg-emerald-50 border-emerald-200">
            <div className="space-y-2">
              <p className="font-medium">🎉 Setup Complete!</p>
              <p className="text-sm">
                Database migrations are ready. Every watch analysis will be automatically saved.
              </p>
              <div className="flex gap-2 mt-4">
                <Button asChild>
                  <a href="/">Start Analyzing</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/history">View History</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/admin/references">Manage References</a>
                </Button>
              </div>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
}
