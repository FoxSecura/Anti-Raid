import { createIncident } from "../core/incident.js";
import { SlidingWindowStore } from "../core/SlidingWindowStore.js";
import type {
  AntiRaidModule,
  MemberJoinEvent,
  RaidSeverity,
  RecommendedAction,
} from "../core/types.js";
import type { BaseModuleOptions } from "./types.js";
import { resolveBaseOptions } from "./validation.js";

interface WindowedJoinDefinition {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly describe: (count: number, windowMs: number) => string;
  readonly predicate: (event: MemberJoinEvent) => boolean;
  readonly defaults: {
    readonly enabled: boolean;
    readonly threshold: number;
    readonly windowMs: number;
    readonly cooldownMs: number;
    readonly severity: RaidSeverity;
    readonly recommendedActions: readonly RecommendedAction[];
  };
}

export function createWindowedJoinModule(
  definition: WindowedJoinDefinition,
  options: BaseModuleOptions = {},
): AntiRaidModule {
  const resolved = resolveBaseOptions(options, definition.defaults);
  const severity = options.severity ?? definition.defaults.severity;
  const recommendedActions = options.recommendedActions ?? definition.defaults.recommendedActions;
  const store = new SlidingWindowStore<string>();
  const cooldowns = new Map<string, number>();

  return {
    id: definition.id,
    name: definition.name,
    enabled: resolved.enabled,
    inspect(event) {
      if (!definition.predicate(event)) return null;

      const members = store.record(
        event.guildId,
        event.memberId,
        event.occurredAt,
        resolved.windowMs,
      );

      if (members.length < resolved.threshold) return null;

      const cooldownUntil = cooldowns.get(event.guildId) ?? 0;
      if (cooldownUntil > event.occurredAt) return null;

      cooldowns.set(event.guildId, event.occurredAt + resolved.cooldownMs);

      return createIncident({
        moduleId: definition.id,
        guildId: event.guildId,
        detectedAt: event.occurredAt,
        severity,
        title: definition.title,
        description: definition.describe(members.length, resolved.windowMs),
        memberIds: members,
        recommendedActions,
        metadata: {
          count: members.length,
          threshold: resolved.threshold,
          windowMs: resolved.windowMs,
        },
      });
    },
    reset(guildId) {
      store.clear(guildId);
      if (guildId === undefined) {
        cooldowns.clear();
      } else {
        cooldowns.delete(guildId);
      }
    },
  };
}
