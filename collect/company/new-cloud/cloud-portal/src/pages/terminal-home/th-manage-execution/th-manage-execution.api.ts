import { TH_IModule } from '../terminal-home.api';

export interface TH_ME_IModule extends TH_IModule {
  readonly scores: Map<number, number>; // 每日执行得分
  readonly min: number; // 最低分
  readonly max: number; // 最高分
}
