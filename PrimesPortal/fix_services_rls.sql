-- ================================================================
-- FIX: Services table public read access
-- Run this in Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. Enable RLS on services table (if not already)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 2. Drop old policy if exists
DROP POLICY IF EXISTS "services_public_read" ON public.services;

-- 3. Allow anyone (including logged-in users) to read service definitions
CREATE POLICY "services_public_read" ON public.services
    FOR SELECT USING (true);

-- 4. Re-seed services in case the table is empty
INSERT INTO public.services (slug, name, icon, color) VALUES
    ('address', 'US Residential Address', '🏠', '#dbeafe'),
    ('llc',     'LLC Formation',          '🏢', '#d1fae5'),
    ('itin',    'ITIN Application',       '📋', '#fef3c7'),
    ('bank',    'Bank Assistance',        '🏦', '#ede9fe'),
    ('phone',   'US Phone (eSIM)',        '📱', '#fce7f3')
ON CONFLICT (slug) DO NOTHING;

-- 5. Verify — should return 5 rows
SELECT id, slug, name, icon FROM public.services ORDER BY id;
