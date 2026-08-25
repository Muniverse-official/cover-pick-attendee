-- Application-layer security indexes and access hardening for FANS PICK.
create unique index if not exists cover_pick_winners_identity_uq on public.cover_pick_winners(identity_hash);
create unique index if not exists cover_pick_sessions_token_uq on public.cover_pick_verification_sessions(token_hash);
create unique index if not exists cover_pick_attendees_winner_uq on public.cover_pick_attendees(winner_id);
create index if not exists cover_pick_rate_lookup_idx on public.cover_pick_rate_limits(ip_hash, action, created_at desc);
create index if not exists cover_pick_rate_burst_idx on public.cover_pick_rate_limits(ip_hash, created_at desc);

alter table public.cover_pick_winners enable row level security;
alter table public.cover_pick_attendees enable row level security;
alter table public.cover_pick_verification_sessions enable row level security;
alter table public.cover_pick_rate_limits enable row level security;
alter table public.cover_pick_audit_log enable row level security;

revoke all on public.cover_pick_winners from anon, authenticated;
revoke all on public.cover_pick_attendees from anon, authenticated;
revoke all on public.cover_pick_verification_sessions from anon, authenticated;
revoke all on public.cover_pick_rate_limits from anon, authenticated;
revoke all on public.cover_pick_audit_log from anon, authenticated;
