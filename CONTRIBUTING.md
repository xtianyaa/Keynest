# Contributing

Thanks for helping improve Keynest.

## Development Setup

1. Install Node.js and Rust.
2. Install dependencies:

```powershell
npm install
```

3. Run the web UI:

```powershell
npm run dev
```

4. Run the desktop app:

```powershell
npm run tauri:dev
```

## Checks

Run these before submitting changes:

```powershell
npm test
npm run build
cargo test --manifest-path src-tauri\Cargo.toml
npm run tauri -- build --debug --no-bundle
```

## Contribution Guidelines

- Keep the app local-first by default.
- Do not add telemetry, account systems, or cloud sync without an explicit design discussion.
- Avoid logging secrets, master passwords, clipboard contents, or raw vault data.
- Keep UI changes dense and desktop-tool oriented rather than marketing-page oriented.
- Add focused tests for changes that affect vault data, entry editing, password generation, or security behavior.

## Security Changes

For vulnerability fixes, do not include exploit details in a public issue before maintainers have had time to review. See [SECURITY.md](SECURITY.md).
