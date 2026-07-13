import type {
  AntiRaidEngineOptions,
  AntiRaidModule,
  GuildId,
  MemberJoinEvent,
  RaidIncident,
} from "./types.js";

export class AntiRaidEngine {
  readonly #modules: readonly AntiRaidModule[];
  readonly #enabled: boolean;
  readonly #ignoredGuildIds: ReadonlySet<GuildId>;
  readonly #ignoredMemberIds: ReadonlySet<string>;
  readonly #onIncident: AntiRaidEngineOptions["onIncident"];
  readonly #onModuleError: AntiRaidEngineOptions["onModuleError"];

  constructor(options: AntiRaidEngineOptions) {
    assertUniqueModuleIds(options.modules);

    this.#modules = [...options.modules];
    this.#enabled = options.enabled ?? true;
    this.#ignoredGuildIds = options.ignoredGuildIds ?? new Set();
    this.#ignoredMemberIds = options.ignoredMemberIds ?? new Set();
    this.#onIncident = options.onIncident;
    this.#onModuleError = options.onModuleError;
  }

  get modules(): readonly AntiRaidModule[] {
    return this.#modules;
  }

  async handleMemberJoin(event: MemberJoinEvent): Promise<readonly RaidIncident[]> {
    if (!this.#enabled) return [];
    if (this.#ignoredGuildIds.has(event.guildId)) return [];
    if (this.#ignoredMemberIds.has(event.memberId)) return [];

    const incidents: RaidIncident[] = [];

    for (const module of this.#modules) {
      if (!module.enabled) continue;

      try {
        const incident = await module.inspect(event);
        if (!incident) continue;

        incidents.push(incident);
        await this.#onIncident?.(incident, event);
      } catch (error) {
        await this.#onModuleError?.({ moduleId: module.id, event, error });
      }
    }

    return incidents;
  }

  reset(guildId?: GuildId): void {
    for (const module of this.#modules) {
      module.reset(guildId);
    }
  }
}

function assertUniqueModuleIds(modules: readonly AntiRaidModule[]): void {
  const seen = new Set<string>();

  for (const module of modules) {
    if (!module.id.trim()) {
      throw new TypeError("Anti-raid module IDs cannot be empty.");
    }

    if (seen.has(module.id)) {
      throw new Error(`Duplicate anti-raid module ID: ${module.id}`);
    }

    seen.add(module.id);
  }
}
