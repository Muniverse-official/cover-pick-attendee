-- Enforce the public FANS PICK attendee-registration window at the database layer.
-- KST window: 2026-09-01 17:00:00 <= registration < 2026-09-04 17:00:00.
-- This means 2026-09-04 16:59:59 KST is the final accepted second.

create or replace function public.enforce_cover_pick_registration_window()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if now() < timestamptz '2026-09-01 08:00:00+00' then
    raise exception using errcode = 'P0001', message = 'REGISTRATION_NOT_OPEN';
  end if;

  if now() >= timestamptz '2026-09-04 08:00:00+00' then
    raise exception using errcode = 'P0001', message = 'REGISTRATION_DEADLINE_EXPIRED';
  end if;

  return new;
end;
$$;

drop trigger if exists cover_pick_window_guard_sessions on public.cover_pick_verification_sessions;
create trigger cover_pick_window_guard_sessions
before insert on public.cover_pick_verification_sessions
for each row execute function public.enforce_cover_pick_registration_window();

drop trigger if exists cover_pick_window_guard_attendees on public.cover_pick_attendees;
create trigger cover_pick_window_guard_attendees
before insert on public.cover_pick_attendees
for each row execute function public.enforce_cover_pick_registration_window();

revoke all on function public.enforce_cover_pick_registration_window() from public, anon, authenticated;
