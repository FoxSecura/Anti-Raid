import type { AntiRaidModule } from "../core/types.js";
import { createWindowedJoinModule } from "./createWindowedJoinModule.js";
import type { BaseModuleOptions } from "./types.js";

export function createJoinBurstModule(options: BaseModuleOptions = {}): AntiRaidModule {
  return createWindowedJoinModule(
    {
      id: "join-burst",
      name: "Join Burst",
      title: "Join burst detected",
      describe: (count, windowMs) =>
        `${count} members joined within ${Math.round(windowMs / 1000)} seconds.`,
      predicate: () => true,
      defaults: {
        enabled: true,
        threshold: 8,
        windowMs: 10_000,
        cooldownMs: 30_000,
        severity: "high",
        recommendedActions: ["log", "review", "quarantine", "lockdown"],
      },
    },
    options,
  );
}
