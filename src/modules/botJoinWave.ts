import type { AntiRaidModule } from "../core/types.js";
import { createWindowedJoinModule } from "./createWindowedJoinModule.js";
import type { BaseModuleOptions } from "./types.js";

export function createBotJoinWaveModule(options: BaseModuleOptions = {}): AntiRaidModule {
  return createWindowedJoinModule(
    {
      id: "bot-join-wave",
      name: "Bot Join Wave",
      title: "Bot-join wave detected",
      describe: (count, windowMs) =>
        `${count} bot accounts joined within ${Math.round(windowMs / 1000)} seconds.`,
      predicate: (event) => event.isBot,
      defaults: {
        enabled: true,
        threshold: 3,
        windowMs: 60_000,
        cooldownMs: 120_000,
        severity: "critical",
        recommendedActions: ["log", "review", "lockdown"],
      },
    },
    options,
  );
}
