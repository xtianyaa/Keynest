# Security Model

Keynest is a local-first password and secret manager. The primary security boundary is the user-owned `.kdbx` file plus the master password used to unlock it.

## Trust Boundaries

- The vault file stays on the local machine unless the user manually moves it.
- There is no account system, backend service, telemetry pipeline, or cloud sync in this MVP.
- The master password is required to create or open a vault.
- The application stores entries through the KDBX database format using app-managed metadata for entry type, favorite state, trash state, and timestamps.

## Entry Data

The MVP stores:

- Account passwords: website, username, password, tags, and notes.
- API keys: provider, secret, environment variable name, project, expiry date, tags, and notes.
- Secure notes: freeform body, tags, and notes.
- Identity records: name, email, phone, address, tags, and notes.

API key `.env` copy builds a single line from the stored environment variable name and secret value.

## Runtime Behavior

- Locking clears the in-memory vault snapshot from the UI state.
- Auto-lock is a UI timer that calls the same lock path after the configured idle period.
- Clipboard clearing is best-effort. It only clears content copied by this app while the runtime still has clipboard permission and the page/app session remains active.
- Password and API key values are masked by default in the detail view and can be revealed by the user.

## Explicit Non-Goals For This MVP

- Importing existing password manager exports.
- Editing arbitrary third-party KeePass/KeePassXC databases with full compatibility guarantees.
- Browser autofill or extension integration.
- Mobile clients.
- Cloud sync or multi-device conflict resolution.
- Team sharing, access control, or audit logs.
- Windows Hello unlock. The UI may mention it as future work, but it is not active.
- Installer signing or production release hardening.

## Practical Guidance

- Use a strong master password that is not reused elsewhere.
- Keep backups of vault files in a location you control.
- Treat clipboard contents as temporarily exposed to other local software.
- Avoid storing secrets in screenshots, logs, issue trackers, or chat transcripts.
