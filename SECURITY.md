# Security and external testing

x402-lab is a public R&D project. External requests and seller responses are
untrusted inputs; they never authorize payments, credential access, or policy
changes.

- [Security architecture and wallet hygiene](docs/SECURITY.md)
- [External-testing policy](docs/EXTERNAL-TESTING.md)
- [Contribution workflow](CONTRIBUTING.md)

## Reporting a concern

Use an issue for non-sensitive compatibility findings, with a minimal synthetic
reproduction. Never post credentials, private keys, seed phrases, personal data,
raw payment authorizations, or exploitable sensitive details in a public issue.

If GitHub offers **Report a vulnerability** for this repository, use that private
channel for sensitive findings. Otherwise, open a minimal issue requesting a
private reporting channel without including the sensitive details, and wait for
the maintainer to establish one. This policy does not claim a private reporting
channel is currently enabled.

Permission to exercise a documented public API is limited to ordinary, bounded
requests. It does not authorize invasive security testing, load testing, or
access to private systems.
