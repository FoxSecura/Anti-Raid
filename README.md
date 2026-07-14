<div align="center">

# FoxSecura Anti-Raid

**Discord Security Modules · Raid Protection**

[![CI](https://img.shields.io/github/actions/workflow/status/FoxSecura/Anti-Raid/ci.yml?branch=main&style=flat-square&logo=githubactions&logoColor=white&label=CI)](https://github.com/FoxSecura/Anti-Raid/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/FoxSecura/Anti-Raid/codeql.yml?branch=main&style=flat-square&logo=github&logoColor=white&label=CodeQL)](https://github.com/FoxSecura/Anti-Raid/actions/workflows/codeql.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

</div>

`@foxsecura/anti-raid` is the **raid-protection category** of the FoxSecura Security Modules suite. It is an installable TypeScript package for existing Discord bots, not a standalone bot.

It detects coordinated or abnormal member joins and can quarantine suspicious members through first-party Discord.js enforcement. Enforcement remains opt-in, while the core stays detection-only.

## FoxSecura security suite

| Package | Security category | Responsibility |
| --- | --- | --- |
| [`@foxsecura/anti-raid`](https://github.com/FoxSecura/Anti-Raid) | Raid protection | Detect coordinated or abnormal member joins. |
| [`@foxsecura/anti-spam`](https://github.com/FoxSecura/Anti-Spam) | Message protection | Detect abusive message patterns and repeated content. |
| [`@foxsecura/anti-nuke`](https://github.com/FoxSecura/Anti-Nuke) | Guild integrity | Detect destructive administrative actions from audit-log events. |
| [`@foxsecura/automod`](https://github.com/FoxSecura/Automod) | Native AutoMod | Configure and synchronize Discord server-side moderation rules. |

Each repository owns one security category while following the same package structure and integration contract.

## Category scope

Anti-Raid processes normalized member-join events and correlates suspicious join patterns over configurable time windows.

It does not inspect messages, manage Discord native AutoMod rules, or enforce destructive moderation actions.

## Included modules

| Module | Detects |
| --- | --- |
| `join-burst` | An abnormal number of joins in a sliding time window. |
| `young-account-wave` | Several recently created accounts joining together. |
| `bot-join-wave` | Multiple bot accounts joining quickly. |
| `rejoin-loop` | The same account repeatedly leaving and rejoining. |
| `default-avatar-wave` | Waves of accounts without a custom avatar. |

Every module can be enabled, disabled, configured, replaced, or combined with project-specific modules.

## Shared package contract

- framework-independent core contracts;
- independent and composable modules;
- configurable default presets;
- Discord.js v14 adapter;
- explicit `start()` and `stop()` lifecycle;
- structured, serializable incidents;
- project-level ignore lists;
- no required database, command framework, logger, environment loader, or external quarantine service;
- optional first-party Discord.js enforcement;
- sanctions disabled until `enforcement.enabled` is explicitly set.

## Architecture

```text
src/
├── core/                 # Framework-independent contracts and orchestration
├── modules/              # Independent modules for this security category
├── presets/              # Ready-to-use module collections
├── adapters/
│   └── discordjs/        # Discord.js v14 integration and enforcement
└── index.ts              # Public package exports
```

## Installation

```bash
npm install @foxsecura/anti-raid discord.js
```

Before npm publication:

```bash
npm install github:FoxSecura/Anti-Raid
```

## Quick start

Enable the **Server Members Intent**. Grant **Moderate Members** for timeout-based quarantine, or **Manage Roles** when using a quarantine role.

```ts
import { Client, GatewayIntentBits } from "discord.js";
import {
  DiscordJsAntiRaid,
  createDefaultAntiRaidModules,
} from "@foxsecura/anti-raid";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

const antiRaid = new DiscordJsAntiRaid(client, {
  modules: createDefaultAntiRaidModules(),
  enforcement: {
    enabled: true,
    quarantineRoleId: process.env.QUARANTINE_ROLE_ID,
    timeout: {
      enabled: true,
      durationMs: 30 * 60 * 1000,
      minimumSeverity: "high",
    },
    kick: {
      enabled: false,
    },
    ban: {
      enabled: false,
    },
    onAction: (result) => {
      console.info("[FoxSecura Anti-Raid]", result);
    },
  },
  onIncident: ({ incident, enforcementResults }) => {
    console.warn(incident.description, enforcementResults);
  },
});

antiRaid.start();
await client.login(process.env.DISCORD_TOKEN);
```

Call `antiRaid.stop()` during shutdown, hot reload, or plugin unload.

## Native enforcement

When `enforcement.enabled` is `true`, the Discord.js adapter can:

- add a configured quarantine role to suspicious members;
- fall back to a timeout when no quarantine role is configured;
- optionally kick or ban critical incidents;
- send an alert to a configured moderation channel.

Kick and ban remain disabled unless explicitly enabled. The adapter protects the guild owner, the bot itself, ignored roles, and members that Discord's role hierarchy prevents the bot from managing. Use `dryRun: true` before enabling sanctions.

## Framework-independent usage

```ts
import { AntiRaidEngine } from "@foxsecura/anti-raid/core";
import { createDefaultAntiRaidModules } from "@foxsecura/anti-raid/presets";

const engine = new AntiRaidEngine({
  modules: createDefaultAntiRaidModules(),
  onIncident: (incident) => console.warn(incident),
});

await engine.handleMemberJoin(normalizedMemberJoinEvent);
```

Projects using another Discord library only need to map their member events to the public core contracts.

## Public entry points

| Entry point | Purpose |
| --- | --- |
| `@foxsecura/anti-raid` | Main exports and Discord.js integration. |
| `@foxsecura/anti-raid/core` | Engine, events, incidents, and public contracts. |
| `@foxsecura/anti-raid/modules` | Individual raid-detection modules. |
| `@foxsecura/anti-raid/presets` | Ready-to-use module collections. |
| `@foxsecura/anti-raid/adapters/discord.js` | Discord.js event mapping and lifecycle. |

## Consuming bot responsibilities

The consuming bot still decides how to:

- configure thresholds, quarantine roles, timeout duration, and alert channels;
- explicitly enable or disable kick and ban escalation;
- store incidents and per-guild configuration;
- coordinate Anti-Raid with Anti-Spam, Anti-Nuke, and Automod;
- grant the Discord permissions required by the enabled actions;
- maintain allowlists, operational logs, and recovery procedures.

## Safety model

The framework-independent core never mutates Discord. The Discord.js adapter sanctions only when `enforcement.enabled` is explicitly enabled.

Timeout quarantine is the safe default. Kick and ban require separate opt-in flags and severity thresholds. The adapter checks ownership, ignored roles, manageability, moderatability, kickability, and bannability before every response.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm pack --dry-run
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [FoxSecura package standard](docs/PACKAGE_STANDARD.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)

## License

Released under the [MIT License](LICENSE).
