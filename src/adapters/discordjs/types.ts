import type { Client, GuildMember } from "discord.js";
import type {
  AntiRaidEngineOptions,
  AntiRaidModule,
  MemberJoinEvent,
  RaidIncident,
  RaidSeverity,
} from "../../core/types.js";
import type { AntiRaidModulePresetOptions } from "../../modules/types.js";

export type DiscordJsAntiRaidEnforcementAction =
  | "add-quarantine-role"
  | "timeout-members"
  | "kick-members"
  | "ban-members"
  | "send-alert";

export type DiscordJsAntiRaidEnforcementStatus = "planned" | "applied" | "skipped" | "failed";

export interface DiscordJsAntiRaidEnforcementResult {
  readonly action: DiscordJsAntiRaidEnforcementAction;
  readonly status: DiscordJsAntiRaidEnforcementStatus;
  readonly incidentId: string;
  readonly affectedMemberIds: readonly string[];
  readonly detail?: string | undefined;
}

export interface DiscordJsAntiRaidEnforcementErrorContext {
  readonly action: DiscordJsAntiRaidEnforcementAction;
  readonly incident: RaidIncident;
  readonly memberId?: string | undefined;
}

export interface DiscordJsAntiRaidEnforcementOptions {
  readonly enabled?: boolean | undefined;
  readonly dryRun?: boolean | undefined;
  readonly quarantineRoleId?: string | undefined;
  readonly timeout?:
    | {
        readonly enabled?: boolean | undefined;
        readonly durationMs?: number | undefined;
        readonly minimumSeverity?: RaidSeverity | undefined;
      }
    | undefined;
  readonly kick?:
    | {
        readonly enabled?: boolean | undefined;
        readonly minimumSeverity?: RaidSeverity | undefined;
      }
    | undefined;
  readonly ban?:
    | {
        readonly enabled?: boolean | undefined;
        readonly minimumSeverity?: RaidSeverity | undefined;
      }
    | undefined;
  readonly alertChannelId?: string | undefined;
  readonly ignoredRoleIds?: readonly string[] | undefined;
  readonly reasonPrefix?: string | undefined;
  readonly onAction?:
    | ((result: DiscordJsAntiRaidEnforcementResult) => void | Promise<void>)
    | undefined;
  readonly onError?:
    | ((error: unknown, context: DiscordJsAntiRaidEnforcementErrorContext) => void | Promise<void>)
    | undefined;
}

export interface DiscordJsIncidentContext {
  readonly incident: RaidIncident;
  readonly event: MemberJoinEvent;
  readonly member: GuildMember;
  readonly client: Client;
  readonly enforcementResults: readonly DiscordJsAntiRaidEnforcementResult[];
}

export interface DiscordJsAntiRaidOptions {
  readonly modules?: readonly AntiRaidModule[] | undefined;
  readonly preset?: AntiRaidModulePresetOptions | undefined;
  readonly enabled?: boolean | undefined;
  readonly enforcement?: DiscordJsAntiRaidEnforcementOptions | undefined;
  readonly ignoredGuildIds?: AntiRaidEngineOptions["ignoredGuildIds"] | undefined;
  readonly ignoredMemberIds?: AntiRaidEngineOptions["ignoredMemberIds"] | undefined;
  readonly onIncident?: ((context: DiscordJsIncidentContext) => void | Promise<void>) | undefined;
  readonly onModuleError?: AntiRaidEngineOptions["onModuleError"] | undefined;
}
