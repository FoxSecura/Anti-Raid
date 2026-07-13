import type { AntiRaidModule } from "../core/types.js";
import { createWindowedJoinModule } from "./createWindowedJoinModule.js";
import type { YoungAccountWaveOptions } from "./types.js";
import { assertNonNegative } from "./validation.js";

const DAY = 24 * 60 * 60 * 1000;

export function createYoungAccountWaveModule(
  options: YoungAccountWaveOptions = {},
): AntiRaidModule {
  const maximumAccountAgeMs = options.maximumAccountAgeMs ?? 7 * DAY;
  assertNonNegative(maximumAccountAgeMs, "maximumAccountAgeMs");

  return createWindowedJoinModule(
    {
      id: "young-account-wave",
      name: "Young Account Wave",
      title: "Young-account wave detected",
      describe: (count, windowMs) =>
        `${count} recently created accounts joined within ${Math.round(windowMs / 1000)} seconds.`,
      predicate: (event) => event.occurredAt - event.accountCreatedAt < maximumAccountAgeMs,
      defaults: {
        enabled: true,
        threshold: 5,
        windowMs: 30_000,
        cooldownMs: 60_000,
        severity: "high",
        recommendedActions: ["log", "review", "quarantine"],
      },
    },
    options,
  );
}
