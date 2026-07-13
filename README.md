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

It detects coordinated or abnormal member joins and returns structured incidents. The consuming bot remains responsible for quarantine, lockdowns, logging, persistence, permissions, and deployment.

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
- no required database, command framework, logger, or environment loader;
- no automatic sanctions.

## Architecture

```text
src/
├── core/                 # Framework-independent contracts and orchestration
├── modules/              # Independent modules for this security category
├── presets/              # Ready-to-use module collections
├── adapters/
│   └── discordjs/        # Discord.js v14 integration
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

Enable the **Server Members Intent** in the Discord Developer Portal and in the client.

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
  onIncident: async (incident) => {
    await securityBus.publish(incident);
  },
});

antiRaid.start();
await client.login(process.env.DISCORD_TOKEN);
```

Call `antiRaid.stop()` during shutdown, hot reload, or plugin unload.

## Framework-independent usage

```ts
import { AntiRaidEngine } from "@foxsecura/anti-raid/core";
import { createDefaultAntiRaidModules } from "@foxsecura/anti-raid/presets";

const engine = new AntiRaidEngine({
  modules: createDefaultAntiRaidModules(),
  onIncident: (incident) => securityBus.publish(incident),
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

The consuming bot decides how to:

- quarantine or review suspicious members;
- trigger a temporary lockdown;
- store incidents and guild configuration;
- exempt trusted members, roles, or guilds;
- coordinate Anti-Raid with Anti-Spam, Anti-Nuke, and Automod;
- apply permissions, approval rules, and operational safeguards.

## Safety model

Anti-Raid only detects and reports. It does not automatically ban members, alter roles, delete channels, or lock a guild.

Recommended actions are advisory. The consuming bot must validate context and apply its own hierarchy, allowlists, cooldowns, and audit logging.

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
