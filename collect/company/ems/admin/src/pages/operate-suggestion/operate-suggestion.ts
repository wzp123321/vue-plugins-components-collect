import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
// components
import AddAndEditDialog from './os-operate-dialog/os-operate-dialog.vue';
import { ElDialog } from 'element-plus';
import { ElForm } from 'element-plus';
// config
import { pageSizes } from '../../config/index';
// utils
import useCurrentInstance from '../../utils/use-current-instance';
// service
import operateSuggestionService from './service/operate-suggestion.service';

interface OperateState {
  queryParams: OperateSuggestionModule.QueryParams;
  total: number;
  loading: boolean;
  isAddFlag: boolean;
  dataSource: OperateSuggestionModule.OperateSuggestionInfo[];
  operateSuggestionDetail: OperateSuggestionModule.OperateSuggestionInfo;
  selectedList: OperateSuggestionModule.OperateSuggestionInfo[];
  nums: number;
  dialogShow: boolean;
  abnormalList: any[];
}

export default defineComponent({
  components: {
    AddAndEditDialog,
  },
  setup() {
    const { proxy } = useCurrentInstance();
    const operateState = reactive<OperateState>({
      queryParams: {
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        pageNum: 1,
        pageSize: pageSizes[0],
        searchCount: true,
        name: '',
      },
      total: 0,
      loading: true,
      isAddFlag: false,
      dataSource: [],
      operateSuggestionDetail: {
        causeId: -1,
        name: '',
        id: 0,
        causeName: '',
      },
      selectedList: [],
      nums: 1,
      dialogShow: false,
      abnormalList: [],
    });
    // dialog
    const operateRef = ref(ElDialog);
    const multipleTable = ref(ElForm);
    // 列表中多选
    const handleSelectionChange = (value: OperateSuggestionModule.OperateSuggestionInfo[]) => {
      operateState.selectedList = value;
    };
    // 搜索
    const onSearch = () => {
      getOperateSuggestionDataList();
    };
    // 重置
    const onReset = () => {
      operateState.queryParams.name = '';
      operateState.queryParams.pageNum = 1;
      operateState.queryParams.pageSize = pageSizes[0];
      onSearch();
    };
    // 获取列表
    const getOperateSuggestionDataList = async () => {
      try {
        operateState.loading = true;
        const res = await operateSuggestionService.getOperateSuggestionList(operateState.queryParams);
        if (res.code == 200 && res.success) {
          operateState.dataSource = res.data.list || [];
          operateState.total = res.data.total;
        } else {
          operateState.dataSource = [];
          operateState.total = 0;
        }
      } catch (error) {
        operateState.dataSource = [];
        operateState.total = 0;
      } finally {
        setTimeout(() => {
          operateState.loading = false;
        }, 100);
      }
    };
    // 新增
    const onAddDialogShow = () => {
      operateState.nums++;
      operateState.dialogShow = true;
      operateState.isAddFlag = true;
    };
    // 修改
    const onEnergyCodeUpdate = (item: OperateSuggestionModule.OperateSuggestionInfo) => {
      operateState.nums++;
      operateState.operateSuggestionDetail = item;
      operateState.isAddFlag = false;
      operateState.dialogShow = true;
      // operateRef.value.show();
    };
    const onPageSizeChange = (value: number) => {
      operateState.queryParams.pageSize = value;
      operateState.queryParams.pageNum = 1;
      getOperateSuggestionDataList();
    };
    const onCurrentChange = (value: number) => {
      operateState.queryParams.pageNum = Math.floor(value);
      getOperateSuggestionDataList();
    };
    // 删除
    const onEnergyCodeDelete = async (id: number) => {
      try {
        const params = {
          id,
        };
        const res = await operateSuggestionService.getOperateSuggestionDelete(params);
        if (res.code == 200 && res.success) {
          onSearch();
          return proxy.$message.success(res.message || '删除成功');
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error('删除失败');
          }
        }
      } catch (error) {
        return proxy.$message.error('删除失败');
      }
    };
    // 请求异常原因列表
    const getAbnormalList = async () => {
      try {
        const res = await operateSuggestionService.getSolutionRelationList();
        if (res && res.code === 200 && res.data) {
          operateState.abnormalList = res.data;
        } else {
          operateState.abnormalList = [];
        }
      } catch (error) {
        operateState.abnormalList = [];
      }
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      await onSearch();
      await getAbnormalList();
    });
    return {
      ...toRefs(operateState),
      operateState,
      multipleTable,
      pageSizes,
      onSearch,
      onReset,
      onAddDialogShow,
      onEnergyCodeUpdate,
      onEnergyCodeDelete,
      handleSelectionChange,
      getOperateSuggestionDataList,
      onPageSizeChange,
      onCurrentChange,
      operateRef,
    };
  },
});
