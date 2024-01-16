import { defineComponent, onMounted, ref, reactive } from 'vue';
import ChSaveEnergyService from './service/ch-save-energy.service';
import { FResHandler, IRes } from '@/core/communication';
import { TResSaveEnergyObj } from './service/ch-save-energy.service.api';
import { interval, Subject, takeUntil } from 'rxjs';

export default defineComponent({
  name: 'SaveEnergy',
  setup() {
    const treeObjDefault = {
      name: '',
      value: '',
      unit: '',
    };
    //#region 生命周期
    const _destroy$ = new Subject<void>();
    //左侧节能概览数据显示
    const saveEnergyList = ref<TResSaveEnergyObj[]>([]);
    //左侧节能概览数据显示
    let treeObj = reactive<TResSaveEnergyObj>(treeObjDefault);
    const getSaveEnergyList = async () => {
      const res: IRes<TResSaveEnergyObj[]> = await ChSaveEnergyService.queryEnergySavingOverview();
      if (res && res.data && res.data !== null) {
        saveEnergyList.value = FResHandler(res).slice(0, FResHandler(res).length - 1);
        Object.assign(treeObj, FResHandler(res)[FResHandler(res).length - 1]);
      } else {
        saveEnergyList.value = [];
        Object.assign(treeObj, treeObjDefault);
      }
    };
    onMounted(() => {
      getSaveEnergyList();
      interval(60 * 60_000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => {
          getSaveEnergyList();
        });
    });
    return {
      saveEnergyList,
      treeObj,
    };
  },
});
