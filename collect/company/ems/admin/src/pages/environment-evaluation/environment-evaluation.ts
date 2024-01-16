import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
import { ElDialog, ElForm } from 'element-plus';
import pageCommon from '../../components/page-common/page-common.vue';
// utils
import useCurrentInstance from '../../utils/use-current-instance';
// config
import { pageSizes } from '../../config/index';
// components
import EditDialog from './environment-evaluation-dailog/environment-evaluation-dailog.vue';
import environmentEvaluationService from './service/environment-evaluation.service';
import { cloneDeep } from 'lodash';

interface EnvirommentState {
  queryParams: EnvironmentEvaluationModule.QueryParams;
  total: number;
  loading: boolean;
  dataSource: EnvironmentEvaluationModule.EnvironmentEvaluationInfo[];
  environmentEvaluationDetail: EnvironmentEvaluationModule.EnvironmentEvaluationInfo;
  nums: number;
  // fasle有数据--展示列表，true为无数据
  abnormal: boolean;
  dialogShow: boolean;
  // energylList:any[]
}
export default defineComponent({
  name: 'environmentEvaluation',
  components: { pageCommon, EditDialog },
  // components: { pageCommon },
  setup() {
    const { proxy } = useCurrentInstance();
    const environmentState = reactive<EnvirommentState>({
      queryParams: {
        description: '',
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        pageNum: 1,
        pageSize: pageSizes[0],
        searchCount: true,
      },
      total: 0,
      loading: true,
      dataSource: [],
      environmentEvaluationDetail: {
        description: '',
        energyCode: '',
        energyCodeName: '',
        id: 0,
        lower: 0,
        upper: 0,
      },
      nums: 1,
      abnormal: false,
      dialogShow: false,
      // energylList:[]
    });
    // dialog
    const environmentRef = ref(ElDialog);
    // 多选？
    const multipleTable = ref(ElForm);
    // 搜索
    const onSearch = () => {
      getEnvironmentEvaluationDataList();
    };
    // 重置
    const onReset = () => {
      environmentState.queryParams.description = '';
      environmentState.queryParams.pageNum = 1;
      environmentState.queryParams.pageSize = pageSizes[0];
      onSearch();
    };
    // 修改
    const onEnergyCodeUpdate = (item: EnvironmentEvaluationModule.EnvironmentEvaluationInfo) => {
      environmentState.nums++;
      environmentState.environmentEvaluationDetail = item;
      // 显示弹框
      environmentState.dialogShow = true;
      environmentRef.value.show();
    };
    // 获取列表
    const getEnvironmentEvaluationDataList = async () => {
      try {
        environmentState.loading = true;
        const res = await environmentEvaluationService.getEnvironmentEvaluationList(environmentState.queryParams);
        console.log(res);
        if (res.code == 200 && res.success) {
          environmentState.abnormal = false;
          environmentState.loading = false;
          const list: any[] = cloneDeep(res.data.list);
          for (let i = 0; i < list.length; i++) {
            if (list[i].energyCodeName === null) {
              list[i].energyCodeName = '--';
              // console.log(list[i].energyCodeName);
            }
          }
          environmentState.dataSource = list || [];
          environmentState.total = res.data.total;
        } else {
          environmentState.abnormal = true;
          environmentState.loading = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '查询数据失败');
          }
        }
      } catch (error) {
        environmentState.abnormal = true;
        environmentState.loading = false;
        console.log(error);
        proxy.$message.error(error);
      }
    };
    const onPageSizeChange = (value: number) => {
      environmentState.queryParams.pageSize = value;
      environmentState.queryParams.pageNum = 1;
      getEnvironmentEvaluationDataList();
    };
    const onCurrentChange = (value: number) => {
      environmentState.queryParams.pageNum = Math.floor(value);
      getEnvironmentEvaluationDataList();
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      await onSearch();
    });
    return {
      ...toRefs(environmentState),
      environmentRef,
      multipleTable,
      environmentState,
      getEnvironmentEvaluationDataList,
      onSearch,
      onReset,
      onPageSizeChange,
      onCurrentChange,
      onEnergyCodeUpdate,
      pageSizes,
    };
  },
});
