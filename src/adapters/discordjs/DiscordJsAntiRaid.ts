import { type Client, Events, type GuildMember } from "discord.js";
import { AntiRaidEngine } from "../../core/AntiRaidEngine.js";
import type { RaidIncident } from "../../core/types.js";
import { createDefaultAntiRaidModules } from "../../presets/default.js";
import { toMemberJoinEvent } from "./toMemberJoinEvent.js";
import type { DiscordJsAntiRaidOptions } from "./types.js";

export class DiscordJsAntiRaid {
  readonly #client: Client;
  readonly #engine: AntiRaidEngine;
  readonly #onIncident: DiscordJsAntiRaidOptions["onIncident"];
  readonly #memberJoinHandler: (member: GuildMember) => void;
  #started = false;

  constructor(client: Client, options: DiscordJsAntiRaidOptions = {}) {
    this.#client = client;
    this.#onIncident = options.onIncident;
    this.#engine = new AntiRaidEngine({
      modules: options.modules ?? createDefaultAntiRaidModules(options.preset),
      enabled: options.enabled,
      ignoredGuildIds: options.ignoredGuildIds,
      ignoredMemberIds: options.ignoredMemberIds,
      onModuleError: options.onModuleError,
    });
    this.#memberJoinHandler = (member) => {
      void this.handleMemberJoin(member);
    };
  }

  get engine(): AntiRaidEngine {
    return this.#engine;
  }

  start(): void {
    if (this.#started) return;
    this.#client.on(Events.GuildMemberAdd, this.#memberJoinHandler);
    this.#started = true;
  }

  stop(): void {
    if (!this.#started) return;
    this.#client.off(Events.GuildMemberAdd, this.#memberJoinHandler);
    this.#engine.reset();
    this.#started = false;
  }

  async handleMemberJoin(
    member: GuildMember,
    occurredAt = Date.now(),
  ): Promise<readonly RaidIncident[]> {
    const event = toMemberJoinEvent(member, occurredAt);
    const incidents = await this.#engine.handleMemberJoin(event);

    for (const incident of incidents) {
      await this.#onIncident?.({ incident, event, member, client: this.#client });
    }

    return incidents;
  }
}
