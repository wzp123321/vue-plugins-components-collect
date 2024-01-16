//#region
/**
 * MhmActualPayment 实际缴费table详情 2022-6-5
 */
//#endregion
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { defineComponent, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { sDatabase } from '../../../../services/index';
import mhmActualPaymentService from '../mhm-actual-payment/mhm-actual-payment.service';
import {
  MHM_ActualPaymentListType,
  MHM_AllActualPaymentDataType,
  MHM_OneActualPaymentDataType,
} from '../mhm-actual-payment/mhm-actual-payment.api';

export default defineComponent({
  name: 'MhmActualPaymentTable',
  emits: ['changeComponents'],
  props: {},
  setup(props, fun) {
    //#region 生命周期
    const _destroy$ = new Subject<void>();
    const _destroyTime$ = new Subject<void>();
    onUnmounted(() => {
      // 销毁订阅
      // _destroy$.next();
      // _destroy$.complete();
      _destroyTime$.next();
      _destroyTime$.complete();
    });
    //#endregion

    onMounted(() => {
      //#region 组件传值 总节点的信息
      sDatabase.refStart$.pipe(takeUntil(_destroyTime$)).subscribe((v) => {
        if (v) {
        } else {
          startTime.value = new Date();
        }
        startTime.value = v;
      });
      sDatabase.refEnd$.pipe(takeUntil(_destroyTime$)).subscribe((v) => {
        if (v) {
          endTime.value = v;
        } else {
          endTime.value = new Date();
        }
      });
      //#endregion

      mhmAPayment.getBillEnergy.pipe(takeUntil(_destroy$)).subscribe((v) => {
        // name
        loading.value = true;
        selecName.value = v;
        energyName.value = selecName.value;
      });

      mhmAPayment.getActualPaymentData.pipe(takeUntil(_destroy$)).subscribe((v) => {
        if (v) {
          actualData.value = v;
          tableData.value = cloneDeep(v.allEnergyActualPaymentList);
          if (v.allEnergyActualPaymentList && v.allEnergyActualPaymentList.length > 0) {
            energyName.value = v.allEnergyActualPaymentList[0].energyName;
          }
          if (selecName.value) {
            energyName.value = selecName.value;
          }

          //  console.log(' energyName.value', energyName.value, selecName.value, actualData.value);
        }
        setTimeout(() => {
          loading.value = false;
        }, 300);
      });

      nextTick(() => {
        tanleDataList();
        // loading.value = false;
      });
    });

    const mhmAPayment = reactive(mhmActualPaymentService);

    const startEndDate = ref<string>();
    // 开始时间、结束时间
    const startTime = ref<Date>();
    const endTime = ref<Date>();
    //#region 得到数据
    const actualData = ref<MHM_ActualPaymentListType>();
    const tableData = ref<MHM_AllActualPaymentDataType[]>([]);
    const energyName = ref<string>();
    const selecName = ref<string>();
    const loading = ref<boolean>(true);

    //#endregion

    //#region 接口获得数据
    const tanleDataList = () => {
      const strStart = dayjs(startTime.value?.getTime()).format('YYYY年MM月');
      const strEnd = dayjs(endTime.value?.getTime()).format('YYYY年MM月');
      startEndDate.value = strStart + '~' + strEnd;
      // const param = {
      //   startEndDate: startEndDate.value,
      //   year: 2022,
      // };
      loading.value = true;
      // mhmAPayment.queryActualPayment(param);
    };
    //#endregion
    // 监听
    watch(
      () => tableData.value,
      (val) => {
        if (val && val.length > 0) {
        } else {
          loading.value = false;
        }
      },
      {
        deep: true,
      }
    );
    /**
     * 跳转票据页面
     * @param item
     */
    const linkBill = (item: MHM_OneActualPaymentDataType, energyName: string, listIndex: number) => {
      loading.value = true;
      fun.emit('changeComponents', '实际缴费', '6');
      setTimeout(() => {
        const data = {
          index: listIndex,
          name: energyName,
          list: item,
        };
        mhmAPayment.getBillList(data);
        //  mhmAPayment.getActualPaymentTbaleList(tableData.value);
      }, 600);
    };

    return { mhmAPayment, actualData, startEndDate, tableData, energyName, loading, linkBill };
  },
});
