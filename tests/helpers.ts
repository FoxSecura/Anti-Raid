import type { MemberJoinEvent } from "../src/core/types.js";

export function memberJoin(
  memberId: string,
  occurredAt: number,
  overrides: Partial<MemberJoinEvent> = {},
): MemberJoinEvent {
  return {
    kind: "member.join",
    guildId: "guild-1",
    memberId,
    occurredAt,
    accountCreatedAt: occurredAt - 30 * 24 * 60 * 60 * 1000,
    isBot: false,
    hasDefaultAvatar: false,
    ...overrides,
  };
}
