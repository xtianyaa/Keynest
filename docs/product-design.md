# Product Design

Keynest is a local-first desktop vault for everyday secrets. It is intentionally closer to a lightweight desktop utility than a cloud account product.

## Product Principles

- Local-first: vault data stays in a user-owned `.kdbx` file.
- No account required: there is no backend, telemetry pipeline, or cloud dependency.
- Low-friction usage: a normal user should understand create, open, add, copy, edit, save, and lock without onboarding.
- Developer-secret friendly: API keys, environment variable names, projects, expiry dates, and `.env` copying are first-class needs.
- Desktop-tool UI: dense, predictable, and built for repeated use.

## Current Scope

The MVP supports:

- account passwords
- API keys
- secure notes
- identity records
- favorites
- trash, restore, and permanent delete
- search
- password generation
- clipboard clear timeout
- auto-lock timeout
- recent local vault paths

## Storage Model

Keynest writes app-created KDBX files. The app stores a small set of metadata fields for entry type, favorite state, trash state, timestamps, and API-key-specific details.

Editing arbitrary third-party KeePass/KeePassXC databases is not a compatibility guarantee in the MVP because KDBX4 writing support in the current Rust dependency remains experimental.

## Near-Term Roadmap

- Improve desktop packaging and installer metadata.
- Add stronger release hardening and signing.
- Add Windows Hello or platform credential unlock as an optional convenience layer.
- Improve interoperability testing with KeePass-family tools.
- Add export-safe documentation and backup guidance.

## Explicit Non-Goals For MVP

- cloud sync
- mobile apps
- browser autofill extension
- team sharing
- account system
- telemetry
- importing password-manager exports
