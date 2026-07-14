import type { Client, GuildMember, GuildTextBasedChannel } from "discord.js";
import type { RaidIncident, RaidSeverity } from "../../core/types.js";
import type {
  DiscordJsAntiRaidEnforcementAction,
  DiscordJsAntiRaidEnforcementErrorContext,
  DiscordJsAntiRaidEnforcementOptions,
  DiscordJsAntiRaidEnforcementResult,
} from "./types.js";

const severityOrder: Readonly<Record<RaidSeverity, number>> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

function hasMinimumSeverity(current: RaidSeverity, minimum: RaidSeverity): boolean {
  return severityOrder[current] >= severityOrder[minimum];
}

function reasonFor(incident: RaidIncident, options: DiscordJsAntiRaidEnforcementOptions): string {
  const prefix = options.reasonPrefix ?? "FoxSecura Anti-Raid";
  return `${prefix}: ${incident.moduleId} (${incident.id})`.slice(0, 512);
}

function plannedActions(
  incident: RaidIncident,
  options: DiscordJsAntiRaidEnforcementOptions,
): readonly DiscordJsAntiRaidEnforcementAction[] {
  const recommended = new Set(incident.recommendedActions);
  const actions: DiscordJsAntiRaidEnforcementAction[] = [];

  if (recommended.has("quarantine")) {
    if (
      (options.ban?.enabled ?? false) &&
      hasMinimumSeverity(incident.severity, options.ban?.minimumSeverity ?? "critical")
    ) {
      actions.push("ban-members");
    } else if (
      (options.kick?.enabled ?? false) &&
      hasMinimumSeverity(incident.severity, options.kick?.minimumSeverity ?? "critical")
    ) {
      actions.push("kick-members");
    } else if (options.quarantineRoleId) {
      actions.push("add-quarantine-role");
    } else if (
      (options.timeout?.enabled ?? true) &&
      hasMinimumSeverity(incident.severity, options.timeout?.minimumSeverity ?? "high")
    ) {
      actions.push("timeout-members");
    }
  }

  if (options.alertChannelId) actions.push("send-alert");
  return actions;
}

function isProtectedMember(
  client: Client,
  member: GuildMember,
  options: DiscordJsAntiRaidEnforcementOptions,
): boolean {
  if (member.id === member.guild.ownerId) return true;
  if (member.id === client.user?.id) return true;
  return (options.ignoredRoleIds ?? []).some((roleId) => member.roles.cache.has(roleId));
}

async function report(
  result: DiscordJsAntiRaidEnforcementResult,
  options: DiscordJsAntiRaidEnforcementOptions,
  results: DiscordJsAntiRaidEnforcementResult[],
): Promise<void> {
  results.push(result);
  await options.onAction?.(result);
}

async function reportError(
  error: unknown,
  context: DiscordJsAntiRaidEnforcementErrorContext,
  options: DiscordJsAntiRaidEnforcementOptions,
): Promise<void> {
  await options.onError?.(error, context);
}

export async function enforceAntiRaidIncident(
  client: Client,
  incident: RaidIncident,
  options: DiscordJsAntiRaidEnforcementOptions = {},
  knownMember?: GuildMember,
): Promise<readonly DiscordJsAntiRaidEnforcementResult[]> {
  if (options.enabled !== true) return [];

  const actions = plannedActions(incident, options);
  if (actions.length === 0) return [];

  if (options.dryRun === true) {
    const results = actions.map<DiscordJsAntiRaidEnforcementResult>((action) => ({
      action,
      status: "planned",
      incidentId: incident.id,
      affectedMemberIds: incident.memberIds,
    }));
    for (const result of results) await options.onAction?.(result);
    return results;
  }

  const results: DiscordJsAntiRaidEnforcementResult[] = [];
  const guild = client.guilds.cache.get(incident.guildId) ?? (await client.guilds.fetch(incident.guildId));
  const reason = reasonFor(incident, options);

  for (const action of actions) {
    if (action === "send-alert") {
      try {
        const channel = await guild.channels.fetch(options.alertChannelId ?? "");
        if (!channel?.isTextBased()) {
          await report(
            {
              action,
              status: "skipped",
              incidentId: incident.id,
              affectedMemberIds: [],
              detail: "Alert channel is unavailable or is not text based.",
            },
            options,
            results,
          );
          continue;
        }

        await (channel as GuildTextBasedChannel).send({
          content: [
            `**FoxSecura Anti-Raid** — ${incident.severity.toUpperCase()}`,
            incident.description,
            `Members: ${incident.memberIds.map((id) => `<@${id}>`).join(", ")}`,
            `Module: \`${incident.moduleId}\``,
            `Incident: \`${incident.id}\``,
          ].join("\n"),
          allowedMentions: { users: [] },
        });
        await report(
          { action, status: "applied", incidentId: incident.id, affectedMemberIds: [] },
          options,
          results,
        );
      } catch (error) {
        await reportError(error, { action, incident }, options);
        await report(
          {
            action,
            status: "failed",
            incidentId: incident.id,
            affectedMemberIds: [],
            detail: error instanceof Error ? error.message : String(error),
          },
          options,
          results,
        );
      }
      continue;
    }

    const affectedMemberIds: string[] = [];
    for (const memberId of incident.memberIds) {
      try {
        const member =
          knownMember?.id === memberId
            ? knownMember
            : guild.members.cache.get(memberId) ??
              (await guild.members.fetch(memberId).catch(() => null));
        if (!member || isProtectedMember(client, member, options)) continue;

        if (action === "add-quarantine-role") {
          if (!member.manageable) continue;
          await member.roles.add(options.quarantineRoleId ?? "", reason);
        } else if (action === "timeout-members") {
          if (!member.moderatable) continue;
          const durationMs = Math.min(
            Math.max(options.timeout?.durationMs ?? 30 * 60 * 1000, 1_000),
            MAX_TIMEOUT_MS,
          );
          await member.timeout(durationMs, reason);
        } else if (action === "kick-members") {
          if (!member.kickable) continue;
          await member.kick(reason);
        } else {
          if (!member.bannable) continue;
          await member.ban({ reason, deleteMessageSeconds: 0 });
        }

        affectedMemberIds.push(memberId);
      } catch (error) {
        await reportError(error, { action, incident, memberId }, options);
      }
    }

    await report(
      {
        action,
        status: affectedMemberIds.length > 0 ? "applied" : "skipped",
        incidentId: incident.id,
        affectedMemberIds,
        detail: `${affectedMemberIds.length} member(s) affected.`,
      },
      options,
      results,
    );
  }

  return results;
}
