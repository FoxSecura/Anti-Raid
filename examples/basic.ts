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
  enforcement: {
    enabled: true,
    timeout: {
      enabled: true,
      durationMs: 30 * 60 * 1000,
      minimumSeverity: "high",
    },
    kick: {
      enabled: false,
    },
    ban: {
      enabled: false,
    },
  },
  onIncident: ({ incident, enforcementResults }) => {
    console.warn(`[${incident.severity}] ${incident.moduleId}`, enforcementResults);
  },
});

antiRaid.start();
await client.login(process.env.DISCORD_TOKEN);
