# it’s Live FANS PICK attendee registration

Official Muniverse winner verification and attendee registration page for it’s Live FANS PICK.

## Components

- Static site: repository root, published by GitHub Pages
- Edge Function: `supabase/functions/cover-pick/`
- Winner import: `tools/import_winners.py`
- Post-event deletion: `tools/purge_attendee_data.py` and the Apps Script purge functions
- Database hardening: `supabase/migrations/20260825093000_attendee_security_hardening.sql`

The technical repository name, database table prefix, and Edge Function slug retain `cover-pick` for backward compatibility. All user-facing names are **FANS PICK**.

Winner imports match the exact Muniverse email and nickname after the same server-side normalization. Submitted winners cannot reopen or modify the form; they see only a completed-registration notice.
