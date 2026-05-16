# Keynest 钥巢

Keynest, 中文名“钥巢”, is a local-first, free desktop vault for passwords, API keys, secure notes, and identity records. It is intentionally lightweight: no account, no cloud dependency, and no mandatory onboarding flow.

## Why

Keynest is designed for people who want a KeePass-like local vault without a steep learning curve. It covers common account passwords and modern developer secrets such as API keys, environment variable names, project labels, expiry dates, and one-click `.env` copy.

## Current MVP

- Create, open, save, and lock app-created `.kdbx` vault files with a master password.
- Store and edit four entry types: account password, API key, secure note, and identity record.
- Generate strong account passwords with configurable length and a strength indicator.
- API key records support provider, project, expiry date, environment variable name, secret value, and one-click `.env` line copy.
- Search by title, subtitle, tags, notes, provider, environment variable, website, username, note body, and identity fields.
- Mark entries as favorites.
- Move entries to Trash, restore them, or permanently delete them.
- Configure clipboard clear timeout and auto-lock timeout in Settings.
- Remember recently opened vault paths on the lock screen for desktop use.
- Build a centered Tauri desktop window with production-oriented app identifier and version metadata.
- Browser fallback keeps UI tests usable without a Tauri runtime.

## Boundaries

- The app currently supports `.kdbx` files created by this app. Editing arbitrary KeePass/KeePassXC databases is not guaranteed because KDBX4 writing support in the Rust dependency is still marked experimental.
- Import/migration is intentionally out of scope for this MVP.
- Cloud sync, mobile apps, browser autofill/extensions, team sharing, and installer signing are not included.
- Windows Hello is shown as a future security option, but is not implemented in this build.
- Clipboard clearing is best-effort and depends on operating system and browser/runtime permissions.

## Development

Install dependencies:

```powershell
npm install
```

Run frontend dev server:

```powershell
npm run dev
```

Run Tauri app:

```powershell
npm run tauri:dev
```

Run frontend tests:

```powershell
npm test
```

Run Rust vault tests:

```powershell
cargo test --manifest-path src-tauri\Cargo.toml
```

Build frontend:

```powershell
npm run build
```

Build the desktop app without bundling:

```powershell
npm run tauri -- build --debug --no-bundle
```

## Product Design

See [docs/product-design.md](docs/product-design.md) and [docs/security-model.md](docs/security-model.md).

## Security

Read [SECURITY.md](SECURITY.md) and [docs/security-model.md](docs/security-model.md) before relying on Keynest for sensitive production secrets. This is still an MVP and has not had a dedicated external security audit.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep contributions aligned with the local-first, no-account, no-cloud-default product direction.

## License

Keynest is released under the [MIT License](LICENSE).
