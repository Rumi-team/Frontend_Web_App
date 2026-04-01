-- Delete all user data in a single transaction before auth deletion.
-- Called from /api/user/delete route via supabase.rpc().
CREATE OR REPLACE FUNCTION public.delete_user_cascade(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email TEXT;
BEGIN
  -- Resolve email for waitlist cleanup
  SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;

  -- Delete from all user-scoped tables (order doesn't matter inside a transaction)
  DELETE FROM user_feedback WHERE user_id = target_user_id;
  DELETE FROM user_onboarding WHERE user_id = target_user_id;
  DELETE FROM user_settings WHERE user_id = target_user_id;
  DELETE FROM user_state WHERE user_id = target_user_id;
  DELETE FROM coach_insights WHERE user_id = target_user_id;
  DELETE FROM channel_preferences WHERE user_id = target_user_id;
  DELETE FROM scheduled_reminders WHERE user_id = target_user_id;

  -- Tables that use provider_user_id (text cast of UUID)
  DELETE FROM session_summaries WHERE provider_user_id = target_user_id::text;
  DELETE FROM session_evaluations WHERE provider_user_id = target_user_id::text;
  DELETE FROM growth_snapshots WHERE provider_user_id = target_user_id::text;

  -- Waitlist uses email
  IF target_email IS NOT NULL THEN
    DELETE FROM website_waitlist WHERE email = target_email;
  END IF;

  -- Any failure above rolls back the entire transaction
END;
$$;
