import { describe, expect, it } from "vitest";
import { createDefaultAntiRaidModules } from "../src/presets/default.js";

describe("createDefaultAntiRaidModules", () => {
  it("creates the complete default module set", () => {
    expect(createDefaultAntiRaidModules().map((module) => module.id)).toEqual([
      "join-burst",
      "young-account-wave",
      "bot-join-wave",
      "rejoin-loop",
      "default-avatar-wave",
    ]);
  });

  it("supports boolean toggles and module overrides", () => {
    const modules = createDefaultAntiRaidModules({
      joinBurst: { threshold: 20 },
      youngAccountWave: false,
      botJoinWave: true,
      rejoinLoop: false,
      defaultAvatarWave: false,
    });

    expect(modules.map((module) => module.id)).toEqual(["join-burst", "bot-join-wave"]);
  });
});
