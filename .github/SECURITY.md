# Security Policy

## Supported versions

strata-app-builder is a template distributed as a monorepo. Security fixes are applied to the latest released
version on the default branch. Please make sure you are on the most recent release before reporting.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report privately via one of:

- GitHub's private vulnerability reporting ("Report a vulnerability" under the repository's **Security**
  tab), or
- email **info@tabaqat.net** with the details.

Include, where possible:

- a description of the issue and its impact,
- steps to reproduce or a proof of concept,
- affected package(s) and version(s).

We aim to acknowledge reports within a few business days and will keep you updated as we investigate and
prepare a fix.

## Handling secrets

strata-app-builder apps read credentials from local config that must **never** be committed:

- Do not commit or print secrets such as `llm_keys.json`, API tokens, or server credentials.
- Never include secrets in issues, PRs, logs, or test fixtures.

If you discover a leaked secret in the repository history, treat it as a vulnerability and report it
privately using the process above.
