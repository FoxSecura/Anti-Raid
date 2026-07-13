import type { GuildMember } from "discord.js";
import type { MemberJoinEvent } from "../../core/types.js";

export function toMemberJoinEvent(member: GuildMember, occurredAt = Date.now()): MemberJoinEvent {
  return {
    kind: "member.join",
    guildId: member.guild.id,
    memberId: member.id,
    occurredAt,
    accountCreatedAt: member.user.createdTimestamp,
    isBot: member.user.bot,
    hasDefaultAvatar: member.user.avatar === null,
    metadata: {
      username: member.user.username,
      displayName: member.displayName,
    },
  };
}
