-- Create the contact_list table
CREATE TABLE IF NOT EXISTS public.contact_list (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    name text NOT NULL,
    email text NOT NULL,
    subject text,
    message text NOT NULL,
    ip_address text
);

-- Enable RLS
ALTER TABLE public.contact_list ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (assuming used by unauthenticated users via server action or client)
-- Note: Modify this policy if you only want server-side inserts via Service Role
CREATE POLICY "Allow public inserts" ON public.contact_list
    FOR INSERT
    WITH CHECK (true);

-- Allow service role full access (implicit, but good to be explicit if needed, though service role bypasses RLS)
-- Grant usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.contact_list TO service_role;
GRANT INSERT ON public.contact_list TO anon, authenticated;
