import type { AntiRaidModule } from "../core/types.js";
import {
  createBotJoinWaveModule,
  createDefaultAvatarWaveModule,
  createJoinBurstModule,
  createRejoinLoopModule,
  createYoungAccountWaveModule,
} from "../modules/index.js";
import type { AntiRaidModulePresetOptions } from "../modules/types.js";

export function createDefaultAntiRaidModules(
  options: AntiRaidModulePresetOptions = {},
): readonly AntiRaidModule[] {
  const modules: AntiRaidModule[] = [];

  if (options.joinBurst !== false) {
    modules.push(createJoinBurstModule(options.joinBurst === true ? {} : options.joinBurst));
  }
  if (options.youngAccountWave !== false) {
    modules.push(
      createYoungAccountWaveModule(
        options.youngAccountWave === true ? {} : options.youngAccountWave,
      ),
    );
  }
  if (options.botJoinWave !== false) {
    modules.push(createBotJoinWaveModule(options.botJoinWave === true ? {} : options.botJoinWave));
  }
  if (options.rejoinLoop !== false) {
    modules.push(createRejoinLoopModule(options.rejoinLoop === true ? {} : options.rejoinLoop));
  }
  if (options.defaultAvatarWave !== false) {
    modules.push(
      createDefaultAvatarWaveModule(
        options.defaultAvatarWave === true ? {} : options.defaultAvatarWave,
      ),
    );
  }

  return modules;
}
