create table if not exists public.cover_pick_runtime_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.cover_pick_runtime_config enable row level security;
revoke all on public.cover_pick_runtime_config from anon, authenticated;

create index if not exists cover_pick_sessions_winner_idx
  on public.cover_pick_verification_sessions(winner_id);
create index if not exists cover_pick_sessions_expiry_idx
  on public.cover_pick_verification_sessions(expires_at);
create index if not exists cover_pick_rate_created_idx
  on public.cover_pick_rate_limits(created_at);
create index if not exists cover_pick_audit_created_idx
  on public.cover_pick_audit_log(created_at);

drop index if exists public.cover_pick_attendees_one_per_winner_idx;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cover_pick_winner_hash_format_ck') THEN
    ALTER TABLE public.cover_pick_winners
      ADD CONSTRAINT cover_pick_winner_hash_format_ck
      CHECK (identity_hash ~ '^[0-9a-f]{64}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cover_pick_session_token_hash_format_ck') THEN
    ALTER TABLE public.cover_pick_verification_sessions
      ADD CONSTRAINT cover_pick_session_token_hash_format_ck
      CHECK (token_hash ~ '^[0-9a-f]{64}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cover_pick_session_stage_ck') THEN
    ALTER TABLE public.cover_pick_verification_sessions
      ADD CONSTRAINT cover_pick_session_stage_ck
      CHECK (stage IN ('identity_verified'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cover_pick_attendee_lengths_ck') THEN
    ALTER TABLE public.cover_pick_attendees
      ADD CONSTRAINT cover_pick_attendee_lengths_ck
      CHECK (
        char_length(name) BETWEEN 1 AND 100
        AND char_length(nationality)=2
        AND char_length(phone) BETWEEN 8 AND 40
        AND char_length(contact_email) BETWEEN 3 AND 254
        AND char_length(account_email) BETWEEN 3 AND 254
        AND char_length(muniverse_nickname) BETWEEN 1 AND 80
      );
  END IF;
END $$;

create or replace function public.cleanup_cover_pick_operational_data()
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  delete from public.cover_pick_verification_sessions
   where expires_at < now() - interval '1 day'
      or (used = true and created_at < now() - interval '1 day');

  delete from public.cover_pick_rate_limits
   where created_at < now() - interval '24 hours';

  delete from public.cover_pick_audit_log
   where created_at < now() - interval '30 days';
end;
$$;

revoke all on function public.cleanup_cover_pick_operational_data() from public, anon, authenticated;

DO $$
DECLARE existing_job bigint;
BEGIN
  FOR existing_job IN
    SELECT jobid FROM cron.job WHERE jobname='cover-pick-operational-cleanup'
  LOOP
    PERFORM cron.unschedule(existing_job);
  END LOOP;
  PERFORM cron.schedule(
    'cover-pick-operational-cleanup',
    '17 * * * *',
    'select public.cleanup_cover_pick_operational_data();'
  );
END $$;

-- Runtime values such as webhook tokens are provisioned directly in the
-- protected runtime_config table and must never be committed to source.
