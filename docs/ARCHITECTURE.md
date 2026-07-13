# Architecture

FoxSecura Anti-Raid is split into four layers so it can be embedded in an existing bot without forcing project-specific infrastructure.

## 1. Core

The core contains normalized events, incidents, the module contract, the sliding-window store, and `AntiRaidEngine`. It does not import discord.js.

Responsibilities:

- run enabled modules;
- isolate module failures;
- apply project-level ignore lists;
- return structured incidents;
- reset module state per guild or globally.

It does not perform moderation actions.

## 2. Modules

Each module is an independent implementation of `AntiRaidModule`.

A module must:

- have a stable, unique ID;
- expose whether it is enabled;
- inspect normalized events;
- return `null` or a structured incident;
- clear its internal state through `reset`;
- avoid external side effects.

This rule keeps modules testable and allows projects to compose only the protections they need.

## 3. Presets

Presets create a recommended set of modules with safe defaults. They are convenience factories, not global configuration.

A project can:

- use the complete preset;
- override individual thresholds;
- disable selected modules;
- provide a fully custom module list.

## 4. Adapters

Adapters connect the framework-agnostic core to a Discord library. The discord.js adapter:

- subscribes to `GuildMemberAdd`;
- maps a `GuildMember` to `MemberJoinEvent`;
- forwards incidents to the project callback;
- provides explicit `start` and `stop` lifecycle methods.

Additional adapters can be added without changing the modules.

## Integration boundary

The consuming bot owns:

- persistence;
- guild-specific configuration;
- logging and observability;
- quarantine and lockdown services;
- commands and dashboards;
- permission and role-hierarchy checks;
- distributed state across shards or processes.

The package owns only normalized detection logic.

## Combining FoxSecura packages

Future packages should expose the same lifecycle and layer names:

```ts
const antiRaid = new DiscordJsAntiRaid(client, antiRaidOptions);
const antiSpam = new DiscordJsAntiSpam(client, antiSpamOptions);
const antiNuke = new DiscordJsAntiNuke(client, antiNukeOptions);

antiRaid.start();
antiSpam.start();
antiNuke.start();
```

Each package must avoid global mutable state so several security packs can run in the same process.
