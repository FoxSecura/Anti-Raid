import { describe, expect, it } from "vitest";
import { SlidingWindowStore } from "../src/core/SlidingWindowStore.js";

describe("SlidingWindowStore", () => {
  it("keeps values in the active window", () => {
    const store = new SlidingWindowStore<string>();

    expect(store.record("guild", "a", 1_000, 10_000)).toEqual(["a"]);
    expect(store.record("guild", "b", 5_000, 10_000)).toEqual(["a", "b"]);
  });

  it("drops expired values", () => {
    const store = new SlidingWindowStore<string>();

    store.record("guild", "a", 1_000, 10_000);
    expect(store.record("guild", "b", 12_000, 10_000)).toEqual(["b"]);
  });

  it("isolates scopes", () => {
    const store = new SlidingWindowStore<string>();

    store.record("a", "one", 1_000, 10_000);
    store.record("b", "two", 1_000, 10_000);

    expect(store.values("a", 2_000, 10_000)).toEqual(["one"]);
    expect(store.values("b", 2_000, 10_000)).toEqual(["two"]);
  });
});
