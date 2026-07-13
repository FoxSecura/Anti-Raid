import { describe, expect, it } from "vitest";
import {
  createBotJoinWaveModule,
  createDefaultAvatarWaveModule,
  createJoinBurstModule,
  createRejoinLoopModule,
  createYoungAccountWaveModule,
} from "../src/modules/index.js";
import { memberJoin } from "./helpers.js";

describe("anti-raid modules", () => {
  it("detects a join burst", async () => {
    const module = createJoinBurstModule({ threshold: 3, windowMs: 10_000 });

    await module.inspect(memberJoin("a", 1_000));
    await module.inspect(memberJoin("b", 2_000));
    const incident = await module.inspect(memberJoin("c", 3_000));

    expect(incident?.moduleId).toBe("join-burst");
    expect(incident?.memberIds).toEqual(["a", "b", "c"]);
  });

  it("detects a wave of young accounts only", async () => {
    const module = createYoungAccountWaveModule({
      threshold: 2,
      windowMs: 10_000,
      maximumAccountAgeMs: 86_400_000,
    });

    await module.inspect(memberJoin("old", 1_000));
    await module.inspect(memberJoin("young-1", 2_000, { accountCreatedAt: 1_500 }));
    const incident = await module.inspect(
      memberJoin("young-2", 3_000, { accountCreatedAt: 2_500 }),
    );

    expect(incident?.moduleId).toBe("young-account-wave");
    expect(incident?.memberIds).toEqual(["young-1", "young-2"]);
  });

  it("detects a bot-join wave", async () => {
    const module = createBotJoinWaveModule({ threshold: 2 });

    await module.inspect(memberJoin("human", 1_000));
    await module.inspect(memberJoin("bot-1", 2_000, { isBot: true }));
    const incident = await module.inspect(memberJoin("bot-2", 3_000, { isBot: true }));

    expect(incident?.moduleId).toBe("bot-join-wave");
    expect(incident?.severity).toBe("critical");
  });

  it("detects repeated rejoins by the same member", async () => {
    const module = createRejoinLoopModule({ joinsPerMember: 3, windowMs: 60_000 });

    await module.inspect(memberJoin("repeat", 1_000));
    await module.inspect(memberJoin("repeat", 2_000));
    const incident = await module.inspect(memberJoin("repeat", 3_000));

    expect(incident?.moduleId).toBe("rejoin-loop");
    expect(incident?.memberIds).toEqual(["repeat"]);
  });

  it("detects a default-avatar wave", async () => {
    const module = createDefaultAvatarWaveModule({ threshold: 2 });

    await module.inspect(memberJoin("custom", 1_000));
    await module.inspect(memberJoin("default-1", 2_000, { hasDefaultAvatar: true }));
    const incident = await module.inspect(
      memberJoin("default-2", 3_000, { hasDefaultAvatar: true }),
    );

    expect(incident?.moduleId).toBe("default-avatar-wave");
  });

  it("respects cooldowns", async () => {
    const module = createJoinBurstModule({
      threshold: 2,
      windowMs: 10_000,
      cooldownMs: 30_000,
    });

    await module.inspect(memberJoin("a", 1_000));
    expect(await module.inspect(memberJoin("b", 2_000))).not.toBeNull();
    expect(await module.inspect(memberJoin("c", 3_000))).toBeNull();
  });
});
