import type { GuildId, MemberId, RaidIncident, RaidSeverity, RecommendedAction } from "./types.js";

export interface CreateIncidentInput {
  readonly moduleId: string;
  readonly guildId: GuildId;
  readonly detectedAt: number;
  readonly severity: RaidSeverity;
  readonly title: string;
  readonly description: string;
  readonly memberIds: readonly MemberId[];
  readonly recommendedActions: readonly RecommendedAction[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export function createIncident(input: CreateIncidentInput): RaidIncident {
  const uniqueMembers = [...new Set(input.memberIds)];

  return {
    id: `${input.moduleId}:${input.guildId}:${input.detectedAt}`,
    moduleId: input.moduleId,
    guildId: input.guildId,
    detectedAt: input.detectedAt,
    severity: input.severity,
    title: input.title,
    description: input.description,
    memberIds: uniqueMembers,
    recommendedActions: [...input.recommendedActions],
    metadata: input.metadata ?? {},
  };
}
