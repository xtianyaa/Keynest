# Security Policy

Keynest is an early local-first desktop password and API key manager. Treat it as an MVP until it has gone through dedicated security review.

## Supported Versions

The current `main` branch is the only supported development line before the first stable release.

## Reporting a Vulnerability

Please report suspected security issues privately instead of opening a public issue with exploit details. Use GitHub private vulnerability reporting if it is enabled for the repository, or contact the maintainer through GitHub.

Include:

- affected version or commit
- operating system and runtime details
- reproduction steps
- expected impact
- whether the issue exposes stored secrets, master passwords, clipboard contents, or vault files

## Security Model

See [docs/security-model.md](docs/security-model.md) for the current trust boundaries, runtime behavior, and explicit non-goals.

## Current Limitations

- Existing KeePass/KeePassXC databases are not guaranteed to round-trip safely.
- Clipboard clearing is best-effort and depends on runtime permissions.
- Windows Hello unlock is not implemented yet.
- Installer signing and production release hardening are not included in the MVP.
