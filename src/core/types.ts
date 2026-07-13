export type GuildId = string;
export type MemberId = string;

export type RaidSeverity = "low" | "medium" | "high" | "critical";

export type RecommendedAction = "log" | "review" | "quarantine" | "lockdown";

export interface MemberJoinEvent {
  readonly kind: "member.join";
  readonly guildId: GuildId;
  readonly memberId: MemberId;
  readonly occurredAt: number;
  readonly accountCreatedAt: number;
  readonly isBot: boolean;
  readonly hasDefaultAvatar: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface RaidIncident {
  readonly id: string;
  readonly moduleId: string;
  readonly guildId: GuildId;
  readonly detectedAt: number;
  readonly severity: RaidSeverity;
  readonly title: string;
  readonly description: string;
  readonly memberIds: readonly MemberId[];
  readonly recommendedActions: readonly RecommendedAction[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface AntiRaidModule {
  readonly id: string;
  readonly name: string;
  readonly enabled: boolean;
  inspect(event: MemberJoinEvent): RaidIncident | null | Promise<RaidIncident | null>;
  reset(guildId?: GuildId): void;
}

export interface ModuleErrorContext {
  readonly moduleId: string;
  readonly event: MemberJoinEvent;
  readonly error: unknown;
}

export interface AntiRaidEngineOptions {
  readonly modules: readonly AntiRaidModule[];
  readonly enabled?: boolean | undefined;
  readonly ignoredGuildIds?: ReadonlySet<GuildId> | undefined;
  readonly ignoredMemberIds?: ReadonlySet<MemberId> | undefined;
  readonly onIncident?:
    | ((incident: RaidIncident, event: MemberJoinEvent) => void | Promise<void>)
    | undefined;
  readonly onModuleError?: ((context: ModuleErrorContext) => void | Promise<void>) | undefined;
}
