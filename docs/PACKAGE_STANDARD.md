# FoxSecura security package standard

This document defines the repository shape to reuse for Anti-Raid, Anti-Spam, Anti-Nuke, and future FoxSecura security sets.

## Required layers

Every repository should contain:

```text
src/
├── core/
├── modules/
├── presets/
├── adapters/
└── index.ts
```

- `core`: normalized domain events, incidents, engine, and public contracts;
- `modules`: independent detectors with no destructive side effects;
- `presets`: recommended module collections;
- `adapters`: integration with discord.js or another library;
- `index.ts`: stable public exports.

## Required lifecycle

Framework adapters should expose:

```ts
start(): void;
stop(): void;
```

Manual event handlers should remain public for tests and custom runtimes.

## Required extension points

Every package should support:

- a custom module list;
- per-module options;
- project-level ignore lists;
- incident callbacks;
- module error callbacks;
- framework-agnostic event processing;
- no mandatory database or environment loader.

## Package exports

Each package should expose stable subpaths:

```text
.
./core
./modules
./presets
./adapters/discord.js
```

## Safety requirements

- Detection and response must remain separate.
- Destructive actions must never run by default.
- Modules must have bounded memory and cooldowns where applicable.
- Module failures must not crash the host bot.
- Secrets and private configuration must never be logged.
- Public behavior changes require tests and documentation.

## Repository files

Every repository should include:

- MIT `LICENSE`;
- `README.md` with plastic badges and official logos;
- `CONTRIBUTING.md`;
- `CODE_OF_CONDUCT.md`;
- `SECURITY.md`;
- `SUPPORT.md`;
- issue and pull request templates;
- `CODEOWNERS`;
- CI, CodeQL, dependency review, and Dependabot configuration.
