import { createIncident } from "../core/incident.js";
import { SlidingWindowStore } from "../core/SlidingWindowStore.js";
import type { AntiRaidModule } from "../core/types.js";
import type { RejoinLoopOptions } from "./types.js";
import { assertPositiveInteger, resolveBaseOptions } from "./validation.js";

export function createRejoinLoopModule(options: RejoinLoopOptions = {}): AntiRaidModule {
  const resolved = resolveBaseOptions(options, {
    enabled: true,
    threshold: 1,
    windowMs: 5 * 60_000,
    cooldownMs: 10 * 60_000,
  });
  const joinsPerMember = options.joinsPerMember ?? 3;
  assertPositiveInteger(joinsPerMember, "joinsPerMember");

  const severity = options.severity ?? "medium";
  const recommendedActions = options.recommendedActions ?? ["log", "review", "quarantine"];
  const joins = new SlidingWindowStore<number>();
  const cooldowns = new Map<string, number>();

  return {
    id: "rejoin-loop",
    name: "Rejoin Loop",
    enabled: resolved.enabled,
    inspect(event) {
      const scopeId = `${event.guildId}:${event.memberId}`;
      const occurrences = joins.record(
        scopeId,
        event.occurredAt,
        event.occurredAt,
        resolved.windowMs,
      );
      if (occurrences.length < joinsPerMember) return null;

      const cooldownUntil = cooldowns.get(scopeId) ?? 0;
      if (cooldownUntil > event.occurredAt) return null;

      cooldowns.set(scopeId, event.occurredAt + resolved.cooldownMs);

      return createIncident({
        moduleId: "rejoin-loop",
        guildId: event.guildId,
        detectedAt: event.occurredAt,
        severity,
        title: "Repeated rejoin activity detected",
        description: `${event.memberId} joined ${occurrences.length} times within ${Math.round(resolved.windowMs / 60_000)} minutes.`,
        memberIds: [event.memberId],
        recommendedActions,
        metadata: {
          memberId: event.memberId,
          joins: occurrences.length,
          joinsPerMember,
          windowMs: resolved.windowMs,
        },
      });
    },
    reset(guildId) {
      if (guildId === undefined) {
        joins.clear();
        cooldowns.clear();
        return;
      }

      for (const key of cooldowns.keys()) {
        if (key.startsWith(`${guildId}:`)) cooldowns.delete(key);
      }

      joins.clearMatching((scopeId) => scopeId.startsWith(`${guildId}:`));
    },
  };
}
