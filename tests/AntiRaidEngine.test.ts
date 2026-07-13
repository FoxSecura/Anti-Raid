import { describe, expect, it, vi } from "vitest";
import { AntiRaidEngine } from "../src/core/AntiRaidEngine.js";
import type { AntiRaidModule } from "../src/core/types.js";
import { createJoinBurstModule } from "../src/modules/joinBurst.js";
import { memberJoin } from "./helpers.js";

describe("AntiRaidEngine", () => {
  it("runs several modules in the same package", async () => {
    const engine = new AntiRaidEngine({
      modules: [
        createJoinBurstModule({ threshold: 1 }),
        {
          id: "custom-module",
          name: "Custom Module",
          enabled: true,
          inspect: (event) => ({
            id: `custom:${event.memberId}`,
            moduleId: "custom-module",
            guildId: event.guildId,
            detectedAt: event.occurredAt,
            severity: "low",
            title: "Custom",
            description: "Project-defined detector",
            memberIds: [event.memberId],
            recommendedActions: ["log"],
            metadata: {},
          }),
          reset: () => undefined,
        },
      ],
    });

    const incidents = await engine.handleMemberJoin(memberJoin("member", 1_000));
    expect(incidents.map((incident) => incident.moduleId)).toEqual(["join-burst", "custom-module"]);
  });

  it("supports project-level ignore lists", async () => {
    const engine = new AntiRaidEngine({
      modules: [createJoinBurstModule({ threshold: 1 })],
      ignoredGuildIds: new Set(["guild-1"]),
    });

    await expect(engine.handleMemberJoin(memberJoin("member", 1_000))).resolves.toEqual([]);
  });

  it("isolates module failures from the host project", async () => {
    const onModuleError = vi.fn();
    const brokenModule: AntiRaidModule = {
      id: "broken",
      name: "Broken",
      enabled: true,
      inspect: () => {
        throw new Error("failure");
      },
      reset: () => undefined,
    };
    const engine = new AntiRaidEngine({ modules: [brokenModule], onModuleError });

    await expect(engine.handleMemberJoin(memberJoin("member", 1_000))).resolves.toEqual([]);
    expect(onModuleError).toHaveBeenCalledOnce();
  });

  it("rejects duplicate module IDs", () => {
    const module = createJoinBurstModule();
    expect(() => new AntiRaidEngine({ modules: [module, module] })).toThrow(/Duplicate/);
  });
});
