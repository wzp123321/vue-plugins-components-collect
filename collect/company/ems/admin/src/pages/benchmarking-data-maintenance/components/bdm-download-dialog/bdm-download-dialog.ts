import { defineComponent, reactive, ref, onMounted, watch } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import { formatDate } from '@/utils/index';
import CommonService from '@/services/common/common';

interface formType {
  benchmarkingType: string;
  endTime: any;
  startTime: any;
}
export default defineComponent({
  name: 'benchmarkingDataDownloadDialog',
  props: ['dialogAdd', 'downloadLoading'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    let ruleForm = ref(ElForm);
    let dialogFormVisible = ref<boolean>();
    let loading = ref<boolean>(false); // 下载状态
    dialogFormVisible.value = props.dialogAdd;
    const url = '/admin/benchmarking/data/download/template';
    watch(
      () => props.dialogAdd,
      (newVal, oldVal) => {
        dialogFormVisible.value = newVal;
      },
    );

    const quotaTypeList = [
      {
        label: '月',
        value: '1',
      },
      {
        label: '年',
        value: '2',
      },
    ];
    let form = reactive<formType>({
      benchmarkingType: '1',
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
        benchmarkingType: form.benchmarkingType,
        endTime: formatDate(form.endTime, form.benchmarkingType === '1' ? 'yyyy-MM' : 'yyyy'),
        startTime: formatDate(form.startTime, form.benchmarkingType === '1' ? 'yyyy-MM' : 'yyyy'),
      };
      // 导出
      // benchMarkingSystem;
      try {
        if (props.downloadLoading) {
          return;
        }
        context.emit('update:downloadLoading', true);
        console.log('obj', obj);
        dialogFormVisible.value = false;
        await CommonService.getFileStreamDownload(
          obj,
          url,
          '下载',
          () => {
            context.emit('update:downloadLoading', false);
          },
          () => {
            context.emit('update:downloadLoading', false);
          },
        );
        context.emit('downloaddOK');
      } catch (error) {
        return proxy.$message.error('下载失败');
      }
    };

    // 取消
    const onClose = () => {
      dialogFormVisible.value = false;
      context.emit('downloaddOK');
      form.benchmarkingType = '1';
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
    const startYear = (time: any) => {
      return (
        time.getTime() > new Date().setFullYear(new Date().getFullYear() - 1) ||
        time.getFullYear() > formatDate(form.endTime, 'yyyy')
      );
    };
    const endYear = (time: any) => {
      let date = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      return time.getFullYear() < formatDate(form.startTime, 'yyyy') || time.getFullYear() > date.getFullYear();
    };
    /* 年、月不可时间限制 end*/
    watch(
      () => form.benchmarkingType,
      (newValue) => {
        form.startTime =
          newValue == '1'
            ? new Date(new Date().setMonth(new Date().getMonth() - 1))
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        form.endTime =
          newValue == '1'
            ? new Date(new Date().setMonth(new Date().getMonth() - 1))
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      },
    );

    onMounted(async () => {});
    return {
      dialogFormVisible,
      loading,
      form,
      ruleForm,
      quotaTypeList,
      onSubmit,
      onClose,
      startMonth,
      endMonth,
      startYear,
      endYear,
    };
  },
});
