import { Client, GatewayIntentBits } from "discord.js";
import {
  createBotJoinWaveModule,
  createJoinBurstModule,
  createRejoinLoopModule,
  createYoungAccountWaveModule,
  DiscordJsAntiRaid,
} from "../src/index.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const antiRaid = new DiscordJsAntiRaid(client, {
  modules: [
    createJoinBurstModule({ threshold: 10, windowMs: 15_000 }),
    createYoungAccountWaveModule({
      threshold: 5,
      maximumAccountAgeMs: 7 * 24 * 60 * 60 * 1000,
    }),
    createBotJoinWaveModule(),
    createRejoinLoopModule({ joinsPerMember: 3 }),
  ],
  onIncident: async ({ incident, member }) => {
    console.warn(`[${incident.severity}] ${incident.moduleId}`, incident);

    // Integrate your own project services here:
    // await securityLogger.write(incident);
    // await quarantineService.apply(member.guild, incident.memberIds);
    // await lockdownService.enable(member.guild.id);
    void member;
  },
});

antiRaid.start();
await client.login(process.env.DISCORD_TOKEN);
