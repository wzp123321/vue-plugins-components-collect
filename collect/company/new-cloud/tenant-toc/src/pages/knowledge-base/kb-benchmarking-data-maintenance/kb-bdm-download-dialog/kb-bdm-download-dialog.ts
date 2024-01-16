import { defineComponent, reactive, ref, onMounted, watch } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import { formatDateStamp } from '@/utils/index';
import CommonService from '@/service/pkg/index';
import { quotaTypeList } from '@/pages/knowledge-base/kb-benchmarking-data-maintenance/constant/index';

interface formType {
  benchmarkingType: string;
  endTime: any;
  startTime: any;
}
export default defineComponent({
  name: 'benchmarkingDataDownloadDialog',
  props: ['num'],
  setup(props) {
    const { proxy } = useCurrentInstance();
    const ruleForm = ref(ElForm);
    const dialogFormVisible = ref<boolean>(false);
    const downLoading = ref<boolean>(false); // 下载状态
    const url = '/tenant/benchmarking/data/download/template';
    watch(
      () => props.num,
      () => {
        dialogFormVisible.value = true;
        form.benchmarkingType = '2';
        form.endTime = new Date(
          `${formatDateStamp(
            new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime(),
            'YYYY-MM'
          )}-01 00:00:00`
        );
        form.startTime = new Date(
          `${formatDateStamp(
            new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime(),
            'YYYY-MM'
          )}-01 00:00:00`
        );
      }
    );

    const form = reactive<formType>({
      benchmarkingType: '2',
      endTime: '',
      startTime: '',
    });
    form.endTime = new Date(
      `${formatDateStamp(new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime(), 'YYYY-MM')}-01 00:00:00`
    );
    form.startTime = new Date(
      `${formatDateStamp(new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime(), 'YYYY-MM')}-01 00:00:00`
    );
    // 表单提交
    const onSubmit = async () => {
      if (form.startTime === null || form.endTime === null) {
        return proxy.$message.error('数据时间不能为空');
      }
      const obj = {
        benchmarkingType: form.benchmarkingType,
        endTime: formatDateStamp(form.endTime, form.benchmarkingType === '2' ? 'YYYY-MM' : 'YYYY'),
        startTime: formatDateStamp(form.startTime, form.benchmarkingType === '2' ? 'YYYY-MM' : 'YYYY'),
      };
      // 导出
      try {
        if (downLoading.value) {
          return;
        }
        downLoading.value = true;
        await CommonService.getFileStreamDownload(
          obj,
          url,
          '下载',
          () => {
            downLoading.value = false;
            dialogFormVisible.value = false;
          },
          () => {
            downLoading.value = false;
            dialogFormVisible.value = false;
          }
        );
      } catch (error) {
        downLoading.value = false;
        dialogFormVisible.value = false;
        return proxy.$message.error('下载失败');
      }
    };

    // 取消
    const onClose = () => {
      dialogFormVisible.value = false;
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
        time.getTime() > new Date().setFullYear(new Date().getFullYear()) ||
        time.getFullYear() > formatDateStamp(form.endTime, 'YYYY')
      );
    };
    const endYear = (time: any) => {
      const date = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      return time.getFullYear() < formatDateStamp(form.startTime, 'YYYY') || time.getFullYear() > date.getFullYear();
    };
    /* 年、月不可时间限制 end*/
    watch(
      () => form.benchmarkingType,
      (newValue) => {
        form.startTime =
          newValue == '2'
            ? new Date(new Date().setMonth(new Date().getMonth() - 1))
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        form.endTime =
          newValue == '2'
            ? new Date(new Date().setMonth(new Date().getMonth() - 1))
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      }
    );

    onMounted(async () => {});
    return {
      dialogFormVisible,
      downLoading,
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
