import { defineComponent, reactive, ref, onMounted, watch } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import { formatDate } from '@/utils/index';
import CommonService from '@/services/common/common';
import benchmarkingDataMaintenance from '@/pages/benchmarking-data-maintenance/service/benchmarking-data-maintenance.service';

interface formType {
  endTime: any;
  startTime: any;
}
export default defineComponent({
  name: 'benchmarkingDataUpdateDialog',
  props: ['dialogUpdate', 'updateLoading'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    let ruleForm = ref(ElForm);
    let dialogFormVisible = ref<boolean>();
    let loading = ref<boolean>(false); // 下载状态
    dialogFormVisible.value = props.dialogUpdate;
    const url = '/admin/benchmarking/data/download/template';
    watch(
      () => props.dialogUpdate,
      (newVal, oldVal) => {
        dialogFormVisible.value = newVal;
      },
    );

    let form = reactive<formType>({
      endTime: '',
      startTime: '',
    });
    form.endTime = new Date(
      `${formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM')}-01 00:00:00`,
    );
    form.startTime = new Date(
      `${formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM')}-01 00:00:00`,
    );
    // 表单提交
    const onSubmit = async () => {
      if (form.startTime === null || form.endTime === null) {
        return proxy.$message.error('数据时间不能为空');
      }
      let obj = {
        endTime: formatDate(form.endTime, 'yyyy-MM'),
        startTime: formatDate(form.startTime, 'yyyy-MM'),
      };
      try {
        if (props.updateLoading) {
          return;
        }
        context.emit('update:updateLoading', true);
        dialogFormVisible.value = false;
        const res = await benchmarkingDataMaintenance.updateDataBenchmarkingData(obj);
        if (res.code === 200 && res.data) {
          proxy.$message.success('正在更新数据,请稍后刷新...');
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error('更新失败');
          }
        }
        context.emit('update:updateLoading', false);
        context.emit('onUpdateOk');
      } catch (error) {
        return proxy.$message.error('更新失败');
      }
    };

    // 取消
    const onClose = () => {
      dialogFormVisible.value = false;
      context.emit('onUpdateOk');
      form.endTime = new Date(
        `${formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM')}-01 00:00:00`,
      );
      form.startTime = new Date(
        `${formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM')}-01 00:00:00`,
      );
    };

    /* 处理日期禁用回调
    年、月不可选时间限制 start
    */
    const startMonth = (time: Date) => {
      return time.getTime() > new Date().getTime() || time.getTime() > new Date(form.endTime + '-' + '01').getTime();
    };
    const endMonth = (time: Date) => {
      return (
        time.getTime() > new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime() ||
        time.getTime() < new Date(form.startTime + '-' + '01').getTime()
      );
    };

    onMounted(async () => {});
    return {
      dialogFormVisible,
      loading,
      form,
      ruleForm,
      onSubmit,
      onClose,
      startMonth,
      endMonth,
    };
  },
});
