import type { Client } from "discord.js";
import { describe, expect, it, vi } from "vitest";
import { enforceAntiRaidIncident } from "../src/adapters/discordjs/enforcement.js";
import type { RaidIncident } from "../src/core/types.js";

const incident: RaidIncident = {
  id: "incident-1",
  moduleId: "join-burst",
  guildId: "guild-1",
  detectedAt: 1,
  severity: "high",
  title: "Join burst detected",
  description: "Ten members joined quickly.",
  memberIds: ["member-1", "member-2"],
  recommendedActions: ["log", "review", "quarantine", "lockdown"],
  metadata: {},
};

const client = {} as Client;

describe("enforceAntiRaidIncident", () => {
  it("does nothing until enforcement is explicitly enabled", async () => {
    await expect(enforceAntiRaidIncident(client, incident)).resolves.toEqual([]);
  });

  it("plans a timeout and alert without mutating Discord in dry-run mode", async () => {
    const onAction = vi.fn();
    const results = await enforceAntiRaidIncident(client, incident, {
      enabled: true,
      dryRun: true,
      alertChannelId: "alerts",
      onAction,
    });

    expect(results).toEqual([
      {
        action: "timeout-members",
        status: "planned",
        incidentId: "incident-1",
        affectedMemberIds: ["member-1", "member-2"],
      },
      {
        action: "send-alert",
        status: "planned",
        incidentId: "incident-1",
        affectedMemberIds: ["member-1", "member-2"],
      },
    ]);
    expect(onAction).toHaveBeenCalledTimes(2);
  });
});
