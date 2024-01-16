import { Subject, takeUntil } from 'rxjs';
import { defineComponent, onUnmounted, reactive } from 'vue';
import { CH_EProjectState } from '../cloud-home.api';

import sProject from '../service/ch-project.service';

export default defineComponent({
  name: 'ProjectInfoComponent',
  setup() {
    //#region 生命周期
    const _destroy$ = new Subject<void>();

    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
    });
    //#endregion

    //#region 项目服务
    const oProject = reactive({
      selected: null as CH_EProjectState | null,
      total: {
        state: CH_EProjectState.全部,
        name: CH_EProjectState[CH_EProjectState.全部],
        count: undefined as number | undefined,
      },
      beforeEnter: {
        state: CH_EProjectState.已签约未进场,
        name: CH_EProjectState[CH_EProjectState.已签约未进场],
        count: undefined as number | undefined,
      },
      onBuilding: {
        state: CH_EProjectState.建设期,
        name: CH_EProjectState[CH_EProjectState.建设期],
        count: undefined as number | undefined,
      },
      onOperation: {
        state: CH_EProjectState.运营期,
        name: CH_EProjectState[CH_EProjectState.运营期],
        count: undefined as number | undefined,
      },

      selectProject(state: CH_EProjectState): void {
        sProject.selectProjectsByState(state);
      },

      mapFocusType(state: CH_EProjectState): 'active' | 'inactive' | undefined {
        if (this.selected === null) {
          return;
        }

        if (state === this.selected) {
          return 'active';
        } else {
          return 'inactive';
        }
      },
    });

    sProject.refSelectedState$.pipe(takeUntil(_destroy$)).subscribe((v) => (oProject.selected = v));
    sProject.refStatistics$.pipe(takeUntil(_destroy$)).subscribe((v) => {
      oProject.total.count = v.get(CH_EProjectState.全部);
      oProject.beforeEnter.count = v.get(CH_EProjectState.已签约未进场);
      oProject.onBuilding.count = v.get(CH_EProjectState.建设期);
      oProject.onOperation.count = v.get(CH_EProjectState.运营期);
    });
    //#endregion

    return { oProject };
  },
});
