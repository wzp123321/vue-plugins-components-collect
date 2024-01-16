//#region
/**
 * MhmMasterNodeModel 主节点图表样式
 */
//#endregion
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { defineComponent, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import mhmMasterService from './mhm-master-node-model.service';
import { sDatabase } from '../../../../services/index';
import { MHM_MasterInfoType } from './mhm-master-node-model.api';
import { MA_HOME_EQueryType } from '../../../../services/api';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'MhmMasterNodeModel',
  props: {},
  setup() {
    //#region 生命周期
    const _destroy$ = new Subject<void>();
    const _destroyTime$ = new Subject<void>();
    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
      _destroyTime$.next();
      _destroyTime$.complete();
    });
    //#endregion

    onMounted(() => {
      //#region 组件传值 总节点的信息
      sDatabase.refStart$.pipe(takeUntil(_destroyTime$)).subscribe((v) => {
        startTime.value = v;
        queryStart.value = startTime.value?.getTime();
      });
      sDatabase.refEnd$.pipe(takeUntil(_destroyTime$)).subscribe((v) => {
        //  console.log('v结束', v);
        if (v) {
          endTime.value = v;
        } else {
          endTime.value = new Date();
        }
        queryEnd.value = endTime.value.getTime();
      });
      sDatabase.refDimension$.pipe(takeUntil(_destroyTime$)).subscribe((v) => {
        queryType.value = v as MA_HOME_EQueryType;
      });
      //#endregion
      calendarOpertaion();
    });

    const mhmMaster = reactive(mhmMasterService);

    const store = useStore();

    // 开始时间、结束时间
    const startTime = ref<Date>();
    const endTime = ref<Date>();
    const queryType = ref<MA_HOME_EQueryType>(MA_HOME_EQueryType.运营期);
    const queryStart = ref<number>();
    const queryEnd = ref<number>();
    const nodeId = ref<number | null>();

    nodeId.value = store.state.dialogData.id;

    // eslint-disable-next-line prefer-const
    const yearTime = ref<number>();

    // 获得12月份数据
    const nodeMonthData = ref<MHM_MasterInfoType[]>([]);
    mhmMaster.masterNodeInfoData.pipe(takeUntil(_destroy$)).subscribe((v) => {
      if (v) {
        nodeMonthData.value = v;
        // console.log('===', mhmMaster.isLoading);
      }
    });

    watch(
      () => store.state.dialogData,
      (val) => {
        //  console.log(val, '-------');
        nodeId.value = val.id;
      },
      {
        deep: true,
      },
    );

    // console.log('mhmMaster', mhmMaster);
    //#region 初始化按钮是否可以点击
    const isLeftClick = ref<boolean>(false);
    const isRightClick = ref<boolean>(false);
    const calendarOpertaion = async () => {
      yearTime.value = endTime.value?.getFullYear();
      // 系统时间，否则new Date()
      // const current = mhmMaster.time ? mhmMaster.time : new Date();
      const current = new Date();
      //  console.log('current==', current);
      const currentYear = current.getFullYear();
      //  console.log(currentYear, startTime.value?.getFullYear(), endTime.value?.getFullYear());
      if (
        startTime.value?.getFullYear() &&
        endTime.value?.getFullYear() &&
        startTime.value?.getFullYear() != endTime.value?.getFullYear()
      ) {
        if (currentYear < startTime.value?.getFullYear()) {
          yearTime.value = endTime.value?.getFullYear();
        }
        if (currentYear > startTime.value?.getFullYear() && currentYear < endTime.value?.getFullYear()) {
          yearTime.value = currentYear;
        }
        if (currentYear > endTime.value?.getFullYear()) {
          yearTime.value = endTime.value?.getFullYear();
        }
        if (currentYear < endTime.value?.getFullYear()) {
          isRightClick.value = true;
        }
      }
      if (startTime.value?.getFullYear() === endTime.value?.getFullYear()) {
        isLeftClick.value = false;
      } else {
        isLeftClick.value = true;
        if (!startTime.value && endTime.value) {
          isLeftClick.value = false;
        }
      }

      // 初始化加载
      if (nodeId.value && nodeId.value.toString() && yearTime.value && queryStart.value && queryEnd.value) {
        //  console.log(nodeId, yearTime.value, startTime.value, endTime.value);
        await mhmMaster.queryMasterNode({
          queryType: queryType.value,
          nodeId: nodeId.value,
          year: yearTime.value,
          queryStart: queryStart.value,
          queryEnd: queryEnd.value,
        });
      }
    };
    /**
     * left click
     */
    const leftChange = () => {
      if (!isLeftClick.value) {
        return;
      }
      const minTime = startTime.value?.getFullYear();
      // console.log(minTime, yearTime.value);
      if (yearTime.value && minTime) {
        isRightClick.value = true;
        yearTime.value--;
        if (yearTime.value <= minTime) {
          isLeftClick.value = false;
          isRightClick.value = true;
        }
      }

      if (nodeId.value && nodeId.value.toString() && yearTime.value && queryStart.value && queryEnd.value) {
        mhmMaster.queryMasterNode({
          queryType: queryType.value,
          nodeId: nodeId.value,
          year: yearTime.value,
          queryStart: queryStart.value,
          queryEnd: queryEnd.value,
        });
      }
    };
    /**
     * right click
     * @returns
     */
    const rightChange = () => {
      if (!isRightClick.value) {
        return;
      }
      const maxTime = endTime.value?.getFullYear();
      if (yearTime.value && maxTime) {
        isLeftClick.value = true;
        yearTime.value++;
        if (yearTime.value >= maxTime) {
          isLeftClick.value = true;
          isRightClick.value = false;
        }
      }

      if (nodeId.value && nodeId.value.toString() && yearTime.value && queryStart.value && queryEnd.value) {
        mhmMaster.queryMasterNode({
          queryType: queryType.value,
          nodeId: nodeId.value,
          year: yearTime.value,
          queryStart: queryStart.value,
          queryEnd: queryEnd.value,
        });
      }
    };
    //#endregion

    const maxMinValueClass = (value: string) => {
      if (nodeMonthData.value && nodeMonthData.value.length > 0) {
        const valueList = nodeMonthData.value.map((item) => Number(item.value));
        // console.log(valueList, value);
        // const maxVaule = Math.max(valueList);
      }
    };

    return { mhmMaster, yearTime, isLeftClick, isRightClick, nodeMonthData, leftChange, rightChange, maxMinValueClass };
  },
});
