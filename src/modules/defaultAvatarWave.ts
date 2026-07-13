import type { AntiRaidModule } from "../core/types.js";
import { createWindowedJoinModule } from "./createWindowedJoinModule.js";
import type { BaseModuleOptions } from "./types.js";

export function createDefaultAvatarWaveModule(options: BaseModuleOptions = {}): AntiRaidModule {
  return createWindowedJoinModule(
    {
      id: "default-avatar-wave",
      name: "Default Avatar Wave",
      title: "Default-avatar wave detected",
      describe: (count, windowMs) =>
        `${count} accounts without a custom avatar joined within ${Math.round(windowMs / 1000)} seconds.`,
      predicate: (event) => event.hasDefaultAvatar,
      defaults: {
        enabled: true,
        threshold: 6,
        windowMs: 30_000,
        cooldownMs: 60_000,
        severity: "medium",
        recommendedActions: ["log", "review"],
      },
    },
    options,
  );
}
