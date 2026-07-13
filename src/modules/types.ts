import type { RaidSeverity, RecommendedAction } from "../core/types.js";

export interface BaseModuleOptions {
  readonly enabled?: boolean | undefined;
  readonly threshold?: number | undefined;
  readonly windowMs?: number | undefined;
  readonly cooldownMs?: number | undefined;
  readonly severity?: RaidSeverity | undefined;
  readonly recommendedActions?: readonly RecommendedAction[] | undefined;
}

export interface YoungAccountWaveOptions extends BaseModuleOptions {
  readonly maximumAccountAgeMs?: number | undefined;
}

export interface RejoinLoopOptions extends BaseModuleOptions {
  readonly joinsPerMember?: number | undefined;
}

export type ModulePresetValue<T> = T | boolean;

export interface AntiRaidModulePresetOptions {
  readonly joinBurst?: ModulePresetValue<BaseModuleOptions>;
  readonly youngAccountWave?: ModulePresetValue<YoungAccountWaveOptions>;
  readonly botJoinWave?: ModulePresetValue<BaseModuleOptions>;
  readonly rejoinLoop?: ModulePresetValue<RejoinLoopOptions>;
  readonly defaultAvatarWave?: ModulePresetValue<BaseModuleOptions>;
}
