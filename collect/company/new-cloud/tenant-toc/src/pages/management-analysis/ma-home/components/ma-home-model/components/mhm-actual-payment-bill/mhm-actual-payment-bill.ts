//#region
/**
 * MhmActualPayment 实际缴费票据详情 2022-6-7
 */
//#endregion
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { defineComponent, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import {
  MHM_AllActualPaymentDataType,
  MHM_FileVOListType,
  MHM_OneActualPaymentDataType,
} from '../mhm-actual-payment/mhm-actual-payment.api';

import mhmActualPaymentService from '../mhm-actual-payment/mhm-actual-payment.service';

import mhmActualPaymentBillService from './mhm-actual-payment-bill.service';
import MaHomeModeService from '../../services/ma-home-model.service';

export default defineComponent({
  name: 'MhmActualPaymentBill',
  emits: ['changeComponents'],
  props: {},
  setup(props, fun) {
    //#region 生命周期
    const _destroy$ = new Subject<void>();
    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
    });
    //#endregion

    onMounted(() => {
      //#region 组件传值

      mhmAPayment.getBillDataList.pipe(takeUntil(_destroy$)).subscribe((v) => {
        billList.value = v;
        pictureList.value = v.list.pictureVOList;
        fileist.value = v.list.fileVOList;

        loading.value = false;
      });
      //#endregion

      nextTick(() => {});
    });

    const mhmAPayment = reactive(mhmActualPaymentService);

    const mhmBillService = reactive(mhmActualPaymentBillService);

    const billList = ref<{ index: number; name: string; list: MHM_OneActualPaymentDataType }>();
    const pictureList = ref<MHM_FileVOListType[]>([]);
    const fileist = ref<MHM_FileVOListType[]>([]);
    const loading = ref<boolean>(true);
    const tableData = ref<MHM_AllActualPaymentDataType[]>([]);

    /**
     * 返回
     */
    const back = () => {
      MaHomeModeService.getIsChange('right');
      fun.emit('changeComponents', '实际缴费', '3');
      setTimeout(() => {
        if (billList.value?.name) {
          mhmAPayment.getBillInfoEnergy(billList.value?.name);
          MaHomeModeService.getIsChange('left');
        }
        // mhmAPayment.getActualPaymentTbaleList(tableData.value);
      });
    };
    /**
     * 单个文件下载
     * @param item 文件id
     */
    const download = (item: MHM_FileVOListType) => {
      mhmBillService.seeFileDownload(item.fileId);
    };
    /**
     * 获得文件的高
     * @returns
     */
    const maxHeight = () => {
      let maxHeightNum;
      if (pictureList.value.length === 0) {
        maxHeightNum = 332;
      } else {
        maxHeightNum = 120;
      }
      return {
        maxHeight: maxHeightNum + 'px',
      };
    };
    /**
     * 图片的最大高度
     */
    const pictureMaxHeight = () => {
      let maxHeightNum;
      if (fileist.value.length === 0) {
        maxHeightNum = 320;
      } else {
        maxHeightNum = 176;
      }
      return {
        maxHeight: maxHeightNum + 'px',
      };
    };
    return {
      mhmAPayment,
      billList,
      pictureList,
      fileist,
      loading,
      tableData,
      back,
      download,
      maxHeight,
      pictureMaxHeight,
    };
  },
});
