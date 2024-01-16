import { defineComponent, reactive, toRefs } from 'vue';
// config
import { treeTypeList } from '@/config/config';
import { AbnormalType } from '../../constant/index';
// utils
import { subHours } from 'date-fns';
// service
import energyAnomalyService from '@/views/pages/energy-anomaly/services/energy-anomaly.service';
import { formatDate } from '@/utils';

interface ProcessedAbnormalState {
  dialogVisible: boolean;
  loading: boolean;
  energyCodeList: EnergyAnomalyModule.EnergyCodeInfo[];
  pageForm: EnergyAnomalyModule.ProcessedAbnormalForm;
  dataSource: EnergyAnomalyModule.ProcessedAbnormalInfo[];
}
export default defineComponent({
  name: 'ProcessedAbnormalDialog',
  setup() {
    const processedAbnormalState = reactive<ProcessedAbnormalState>({
      dialogVisible: false,
      energyCodeList: [],
      loading: false,
      pageForm: {
        treeType: treeTypeList[0].value,
        energyCode: '',
        date: [],
      },
      dataSource: [],
    });
    // 展开
    const show = async () => {
      try {
        processedAbnormalState.dialogVisible = true;
        processedAbnormalState.pageForm.date = [];
        const startDate = subHours(new Date(), 1);
        processedAbnormalState.pageForm.date.push(startDate);
        processedAbnormalState.pageForm.date.push(new Date());
        const codeRes = await energyAnomalyService.getEnergyCodeList();
        processedAbnormalState.energyCodeList = codeRes.data;
        if (processedAbnormalState.energyCodeList?.length) {
          processedAbnormalState.pageForm.energyCode =
            processedAbnormalState.energyCodeList[0].code;
          getProcessedAbnormalList();
        }
      } catch (error) {
        processedAbnormalState.loading = false;
      }
    };
    // 选择树类型
    const onTreeTypeSelect = (value: number) => {
      processedAbnormalState.pageForm.treeType = value;
      getProcessedAbnormalList();
    };
    // 日期切换
    const onDateChange = () => {
      getProcessedAbnormalList();
    };
    // 查询数据
    const getProcessedAbnormalList = async () => {
      const { date, energyCode, treeType } = processedAbnormalState.pageForm;

      try {
        processedAbnormalState.loading = true;
        const res = await energyAnomalyService.getDealedAbnormalCardList({
          energyCode,
          treeType: String(treeType),
          startTime: `${formatDate(date[0], 'yyyy-MM-dd HH:mm')}:00`,
          endTime: `${formatDate(date[1], 'yyyy-MM-dd HH:mm:ss')}`,
        });
        if (res && res.code && res.data) {
          processedAbnormalState.dataSource = res.data;
          processedAbnormalState.loading = false;
        } else {
          processedAbnormalState.dataSource = [];
          processedAbnormalState.loading = false;
        }
      } catch (error) {
        processedAbnormalState.dataSource = [];
        processedAbnormalState.loading = false;
      }
    };
    return {
      ...toRefs(processedAbnormalState),
      treeTypeList,
      AbnormalType,
      show,
      onTreeTypeSelect,
      onDateChange,
      getProcessedAbnormalList,
    };
  },
});
