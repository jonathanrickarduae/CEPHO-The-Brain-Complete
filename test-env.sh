#!/bin/bash
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:kRprwWw1POruGx4J@db.uwyeubfgymgiabcuwikw.supabase.co:5432/postgres"
export AUTH_BYPASS=true
export VITE_AUTH_BYPASS=true
timeout 3 node dist/index.js 2>&1 || true
