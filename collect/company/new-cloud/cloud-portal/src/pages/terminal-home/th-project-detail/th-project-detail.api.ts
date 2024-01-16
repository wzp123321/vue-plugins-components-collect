import { TH_IModule } from '../terminal-home.api';

export interface TH_PD_IModule extends TH_IModule {
  period: string; // 托管周期
  manager: string; // 能源经理
  energy: string; // 托管能源
  state: string; // 项目状态
}
