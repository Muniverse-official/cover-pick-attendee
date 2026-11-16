# Security

The public site is static and served by GitHub Pages. Registration requests are handled only by Supabase Edge Functions.

Implemented controls:

- strict origin and custom-header checks
- 16 KB request-body limit and JSON validation
- per-IP rolling rate limits plus one-minute burst limits
- hidden honeypot field for automated submissions
- one-time 15-minute verification tokens bound to IP and user agent
- SHA-256 winner identity matching; winner emails and nicknames are not exposed by the API
- duplicate submission prevention at both API and database levels
- RLS enabled and direct `anon`/`authenticated` table access revoked
- no service-role key or webhook secret in browser code or the repository
- audit records contain request identifiers and hashed network fingerprints, not raw IP addresses

Provider-level volumetric DDoS mitigation is supplied by GitHub Pages and Supabase. Application-level throttling limits brute-force and abusive requests. For a future custom domain, an additional WAF/CAPTCHA layer can be placed in front without changing the winner database.

Report security issues privately to support@muniverse.io.

## Shared backend encryption (2026-11-16)

FANS PICK now uses the encrypted shared attendee backend maintained in
[music-core-attendee](https://github.com/Muniverse-official/music-core-attendee/blob/main/SECURITY.md).
Existing/new winner identities, registration personal fields, session identities
and delivery queue payloads are encrypted by Supabase database triggers. Old
plaintext fields are NULL. Authorized Edge handlers decrypt for existing admin
and delivery workflows, preserving the frontend and API contracts.

The private keyset is encrypted with a wrapping key derived from two existing
Edge runtime credentials; the wrapping credentials are not stored in the database
or repository. Both credentials must be coordinated with keyset rewrapping when
rotated. This is not independent KMS protection, and does not retroactively protect
historical backups or already downloaded CSV exports. Follow the linked shared
backend security document for deployment, restoration and rotation requirements.
