#!/bin/bash

# Direct SQL execution via Supabase Management API
# This creates the analysis_history table

source "$(dirname "$0")/../.env.local"

PROJECT_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')

echo "🚀 Creating analysis_history table..."
echo "Project: $PROJECT_REF"
echo ""

# Read the SQL file
SQL=$(cat "$(dirname "$0")/../supabase/migrations/004_analysis_history.sql")

# Execute via Supabase SQL API
curl -X POST \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | jq -Rs .)}"

echo ""
echo "✅ Migration sent to Supabase"
echo ""
echo "To verify, visit: ${NEXT_PUBLIC_SUPABASE_URL}/project/_/editor"
