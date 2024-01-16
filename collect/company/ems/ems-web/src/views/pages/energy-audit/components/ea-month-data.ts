import { defineComponent, ref, computed, onMounted, reactive } from 'vue';
import { cloneDeep } from 'lodash';
import { useStore } from 'vuex';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { thousandSeparation, formatDate } from '@/utils/index';
// service
import CommonService from '@/services/common/common.service';
import energyAudit from '../services/energy-audit';

export default defineComponent({
  name: 'eaMonthData',
  setup() {
    const { proxy } = useCurrentInstance();
    const store = useStore();
    const tableDataLoading = ref<boolean>(true);
    const formInline = reactive<any>({
      yearDate: '',
    });
    const yearObj = ref<any>({}); //存放接口返回的数据对象
    let formInline_copy: any;
    const abnormal = ref<boolean>(true);
    const lightOrDark = computed(() => {
      //通过获取仓库的白天黑夜来兼容黑夜样式
      return store.getters.theme === 'light' ? true : false;
    });
    // 禁止选择日期
    const onDisableDateCb = (date: Date) => {
      return date.getTime() > new Date().getTime();
    };
    const exportData = () => {
      console.log('daochu');
    };
    const onSubmit = async () => {
      try {
        tableDataLoading.value = true;
        const obj = {
          timeUnit: '1M',
          year: formatDate(formInline.yearDate, 'yyyy'),
        };
        const res = await energyAudit.queryData(obj);
        if (res.code === 200 && res.success) {
          console.log(res.data);
          yearObj.value = res.data;
          tableDataLoading.value = false;
          console.log(yearObj);
        } else {
          tableDataLoading.value = false;
          abnormal.value = false;
          return proxy.$message.error(res.messsage);
        }
      } catch (err) {
        abnormal.value = false;
        tableDataLoading.value = false;
      }
    };
    const onReset = async () => {
      Object.assign(formInline, formInline_copy);
      await onSubmit();
    };
    const getDate = async () => {
      const serverDate = await CommonService.getServerDate();
      formInline.yearDate = serverDate;
    };
    onMounted(async () => {
      await getDate();
      await onSubmit();
      formInline_copy = cloneDeep(formInline);
    });
    return {
      formInline,
      abnormal,
      tableDataLoading,
      lightOrDark,
      yearObj,
      onDisableDateCb,
      onSubmit,
      onReset,
      exportData,
      thousandSeparation,
    };
  },
});
