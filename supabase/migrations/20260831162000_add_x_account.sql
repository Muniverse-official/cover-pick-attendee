-- Add the required X account collected during FANS PICK attendee registration.
-- Existing registrations remain valid with NULL; all new registrations are
-- required and normalized by the registration Edge Function.

alter table public.cover_pick_attendees
  add column if not exists x_account text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'cover_pick_attendee_x_account_ck'
       AND conrelid = 'public.cover_pick_attendees'::regclass
  ) THEN
    ALTER TABLE public.cover_pick_attendees
      ADD CONSTRAINT cover_pick_attendee_x_account_ck
      CHECK (x_account IS NULL OR x_account ~ '^@[A-Za-z0-9_]{1,15}$');
  END IF;
END $$;

comment on column public.cover_pick_attendees.x_account is
  'Normalized X handle collected from new FANS PICK attendee registrations, e.g. @username.';
