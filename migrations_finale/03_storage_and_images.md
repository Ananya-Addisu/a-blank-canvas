# Storage & Data Migration Guide

## Step 1: Run Schema (on new Supabase project SQL Editor)
Run `01_schema.sql` — creates all 28 tables, RLS policies, functions, triggers, views, storage buckets.

## Step 2: Seed Essential Data
Run `02_seed_data.sql` — inserts admin, settings, teachers, payment methods, tutorial videos.

## Step 3: Full Data Migration (pg_dump)

For **complete** data (all 36 students, 12 courses, 19 enrollments, etc.):

```bash
# Export from current project (password is your DB password from Supabase dashboard)
pg_dump --data-only --no-owner --no-privileges \
  -h db.rpfhatpademhbcbrqtch.supabase.co -U postgres -d postgres \
  --schema=public > full_data_dump.sql

# Import to new project
psql -h db.<NEW_PROJECT_REF>.supabase.co -U postgres -d postgres < full_data_dump.sql
```

## Step 4: Migrate Storage Files

```bash
# Download from old project
npx supabase storage cp -r sb://payment-proofs ./backup/payment-proofs --project-ref rpfhatpademhbcbrqtch
npx supabase storage cp -r sb://content-images ./backup/content-images --project-ref rpfhatpademhbcbrqtch
npx supabase storage cp -r sb://course-videos ./backup/course-videos --project-ref rpfhatpademhbcbrqtch

# Upload to new project
npx supabase storage cp -r ./backup/payment-proofs sb://payment-proofs --project-ref <NEW_PROJECT_REF>
npx supabase storage cp -r ./backup/content-images sb://content-images --project-ref <NEW_PROJECT_REF>
npx supabase storage cp -r ./backup/course-videos sb://course-videos --project-ref <NEW_PROJECT_REF>
```

## Step 5: Update Environment

1. Update `SUPABASE_URL` → new project URL
2. Update `SUPABASE_ANON_KEY` → new anon key  
3. Update `SB_SERVICE_ROLE_KEY` → new service role key
4. Re-deploy edge functions to the new project
5. Update `src/integrations/supabase/client.ts` with new URL and anon key

## Storage Buckets
- `payment-proofs` (public) — Student payment screenshots
- `content-images` (public) — Course thumbnails, profile pictures
- `course-videos` (private) — Uploaded video content

## Notes
- Screenshot URLs in `payment_submissions` contain the old project URL and will need updating
- Most course thumbnails use external Unsplash URLs (no migration needed)
- Most video content uses YouTube URLs (no migration needed)
