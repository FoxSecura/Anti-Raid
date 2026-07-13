import type { Client, GuildMember } from "discord.js";
import type {
  AntiRaidEngineOptions,
  AntiRaidModule,
  MemberJoinEvent,
  RaidIncident,
} from "../../core/types.js";
import type { AntiRaidModulePresetOptions } from "../../modules/types.js";

export interface DiscordJsIncidentContext {
  readonly incident: RaidIncident;
  readonly event: MemberJoinEvent;
  readonly member: GuildMember;
  readonly client: Client;
}

export interface DiscordJsAntiRaidOptions {
  readonly modules?: readonly AntiRaidModule[] | undefined;
  readonly preset?: AntiRaidModulePresetOptions | undefined;
  readonly enabled?: boolean | undefined;
  readonly ignoredGuildIds?: AntiRaidEngineOptions["ignoredGuildIds"] | undefined;
  readonly ignoredMemberIds?: AntiRaidEngineOptions["ignoredMemberIds"] | undefined;
  readonly onIncident?: ((context: DiscordJsIncidentContext) => void | Promise<void>) | undefined;
  readonly onModuleError?: AntiRaidEngineOptions["onModuleError"] | undefined;
}
