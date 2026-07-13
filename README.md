<div align="center">

# FoxSecura Anti-Raid 🦊

**Composable anti-raid protection modules for Discord bots.**

[![CI](https://img.shields.io/github/actions/workflow/status/GhostPunishR/Anti-Raid/ci.yml?branch=main&style=plastic&logo=githubactions&logoColor=white&label=CI)](https://github.com/GhostPunishR/Anti-Raid/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=plastic&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=plastic&logo=discord&logoColor=white)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-5FA04E?style=plastic&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-tested-6E9F18?style=plastic&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Biome](https://img.shields.io/badge/Biome-checked-60A5FA?style=plastic&logo=biome&logoColor=white)](https://biomejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=plastic&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Contributions](https://img.shields.io/badge/Contributions-welcome-2EA44F?style=plastic&logo=github&logoColor=white)](CONTRIBUTING.md)
[![Security Policy](https://img.shields.io/badge/Security-policy-7D3C98?style=plastic&logo=githubsecuritylab&logoColor=white)](SECURITY.md)

</div>

---

FoxSecura Anti-Raid is an installable TypeScript package, not a complete bot. It provides independent detection modules, a framework-agnostic engine, presets, and a discord.js adapter. Your project keeps control of logging, quarantine, lockdowns, persistence, configuration, and deployment.

The same package shape is intended for future FoxSecura repositories such as Anti-Spam and Anti-Nuke, so several security packs can coexist inside one bot without imposing a global architecture.

## Protection modules

| Module | Purpose |
| --- | --- |
| `join-burst` | Detects an abnormal number of joins in a sliding window. |
| `young-account-wave` | Detects waves of recently created accounts. |
| `bot-join-wave` | Detects several bot accounts joining quickly. |
| `rejoin-loop` | Detects the same account repeatedly leaving and rejoining. |
| `default-avatar-wave` | Detects waves of accounts without a custom avatar. |

Every module can be enabled, disabled, configured, replaced, or combined with project-specific modules.

## Package design

```text
src/
├── core/                 # Framework-agnostic engine and public contracts
├── modules/              # Independent anti-raid detectors
├── presets/              # Ready-to-use module collections
├── adapters/
│   └── discordjs/        # discord.js event mapping and lifecycle
└── index.ts              # Public package exports
```

The package has no database, environment loader, command handler, logger, role ID, or channel ID built into its core. Those concerns belong to the consuming project.

## Installation

```bash
npm install @foxsecura/anti-raid discord.js
```

Until the package is published:

```bash
npm install github:GhostPunishR/Anti-Raid
```

## Quick start with discord.js

Enable the Server Members intent in the Discord Developer Portal and in your client.

```ts
import { Client, GatewayIntentBits } from "discord.js";
import {
  DiscordJsAntiRaid,
  createBotJoinWaveModule,
  createJoinBurstModule,
  createRejoinLoopModule,
  createYoungAccountWaveModule,
} from "@foxsecura/anti-raid";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const antiRaid = new DiscordJsAntiRaid(client, {
  modules: [
    createJoinBurstModule({ threshold: 10, windowMs: 15_000 }),
    createYoungAccountWaveModule({
      threshold: 5,
      maximumAccountAgeMs: 7 * 24 * 60 * 60 * 1000,
    }),
    createBotJoinWaveModule(),
    createRejoinLoopModule({ joinsPerMember: 3 }),
  ],
  onIncident: async ({ incident, member }) => {
    await securityLogger.write(incident);

    if (incident.recommendedActions.includes("quarantine")) {
      await quarantineService.apply(member.guild, incident.memberIds);
    }
  },
});

antiRaid.start();
await client.login(process.env.DISCORD_TOKEN);
```

`start()` and `stop()` make the package easy to mount inside an existing application lifecycle, dependency-injection container, plugin loader, shard process, or test harness.

## Use the default preset

```ts
import { DiscordJsAntiRaid } from "@foxsecura/anti-raid";

const antiRaid = new DiscordJsAntiRaid(client, {
  preset: {
    joinBurst: { threshold: 12 },
    youngAccountWave: { maximumAccountAgeMs: 3 * 24 * 60 * 60 * 1000 },
    botJoinWave: true,
    rejoinLoop: false,
    defaultAvatarWave: { threshold: 8 },
  },
  onIncident: ({ incident }) => securityBus.publish(incident),
});
```

Use `false` to remove a preset module. Pass `modules` instead of `preset` when complete control is required.

## Framework-agnostic usage

The core does not depend on discord.js types. Projects using another Discord library can map their events to `MemberJoinEvent` and use the engine directly.

```ts
import { AntiRaidEngine, type MemberJoinEvent } from "@foxsecura/anti-raid/core";
import { createDefaultAntiRaidModules } from "@foxsecura/anti-raid/presets";

const engine = new AntiRaidEngine({
  modules: createDefaultAntiRaidModules(),
  onIncident: (incident) => securityBus.publish(incident),
});

const event: MemberJoinEvent = {
  kind: "member.join",
  guildId: "123",
  memberId: "456",
  occurredAt: Date.now(),
  accountCreatedAt: accountCreatedAt,
  isBot: false,
  hasDefaultAvatar: true,
};

await engine.handleMemberJoin(event);
```

## Add a project-specific module

```ts
import type { AntiRaidModule } from "@foxsecura/anti-raid/core";

const trustedDomainModule: AntiRaidModule = {
  id: "project.trusted-domain-check",
  name: "Trusted Domain Check",
  enabled: true,
  inspect(event) {
    // Return a RaidIncident when your own condition is met.
    return null;
  },
  reset() {},
};
```

Custom module IDs should be namespaced to avoid collisions.

## Public entry points

```ts
import { DiscordJsAntiRaid } from "@foxsecura/anti-raid";
import { AntiRaidEngine } from "@foxsecura/anti-raid/core";
import { createJoinBurstModule } from "@foxsecura/anti-raid/modules";
import { createDefaultAntiRaidModules } from "@foxsecura/anti-raid/presets";
import { toMemberJoinEvent } from "@foxsecura/anti-raid/adapters/discord.js";
```

## Safety model

Detection modules only produce structured incidents and recommended actions. They do not automatically ban users, delete channels, alter permissions, or lock a server. The consuming project decides which actions are permitted and applies its own role hierarchy, rate limits, audit logging, and approval rules.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm pack --dry-run
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for the integration model and [PACKAGE_STANDARD.md](docs/PACKAGE_STANDARD.md) for the structure future FoxSecura security repositories should follow.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and use the provided issue and pull request templates.

Report vulnerabilities privately according to [SECURITY.md](SECURITY.md). General help belongs in the channels listed in [SUPPORT.md](SUPPORT.md).

## License

Released under the [MIT License](LICENSE).
