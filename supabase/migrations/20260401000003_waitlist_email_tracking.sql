-- Add email delivery tracking to website_waitlist
ALTER TABLE website_waitlist
  ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
