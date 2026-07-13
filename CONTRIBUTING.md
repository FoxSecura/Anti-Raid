# Contributing to FoxSecura Anti-Raid

Thank you for helping improve FoxSecura Anti-Raid. Contributions that make the package safer, easier to integrate, more modular, or better tested are welcome.

## Before you start

- Read the [Code of Conduct](CODE_OF_CONDUCT.md).
- Use [GitHub Security Advisories](https://github.com/GhostPunishR/Anti-Raid/security/advisories/new) for vulnerabilities. Do not open public issues for security reports.
- Search existing issues and pull requests before starting duplicate work.
- Read the [architecture guide](docs/ARCHITECTURE.md) and the [FoxSecura package standard](docs/PACKAGE_STANDARD.md).
- Keep changes focused. Large features should begin with a feature request or discussion.

## Development setup

Requirements:

- Node.js 20 or newer
- npm 10 or newer

```bash
git clone https://github.com/GhostPunishR/Anti-Raid.git
cd Anti-Raid
npm install
npm run check
npm test
npm run build
npm pack --dry-run
```

## Branches

Create a branch from `main` using a clear prefix:

```text
feat/session-cluster-module
fix/rejoin-state-reset
security/window-memory-bound
docs/custom-adapter-example
```

## Module requirements

A new detector should:

- implement `AntiRaidModule`;
- use a stable and unique module ID;
- remain independent from discord.js where possible;
- avoid direct moderation actions and other external side effects;
- keep state scoped by guild;
- expose configurable thresholds and cooldowns;
- implement `reset` correctly;
- return structured incidents with bounded member lists;
- include unit tests and README documentation.

Project-specific integrations belong in adapters or examples, not in the core modules.

## Code standards

- Use strict TypeScript.
- Keep public APIs typed and documented.
- Prefer safe defaults and bounded actions.
- Never log tokens, secrets, private configuration, or unnecessary personal data.
- Avoid global mutable state.
- Add or update tests for behavior changes.
- Run the complete validation suite before opening a pull request.

```bash
npm run check
npm test
npm run build
npm pack --dry-run
```

## Commits

Use short, imperative commit messages. Conventional Commit prefixes are encouraged:

```text
feat: add session cluster module
fix: clear rejoin state by guild
security: bound incident member lists
docs: document custom adapters
```

## Pull requests

A pull request should:

- explain what changed and why;
- describe security and compatibility implications;
- include tests or explain why tests are not applicable;
- update documentation for public behavior changes;
- avoid unrelated formatting or refactoring;
- pass all required checks.

Submission of a contribution means you agree that it is licensed under the repository's [MIT License](LICENSE).
