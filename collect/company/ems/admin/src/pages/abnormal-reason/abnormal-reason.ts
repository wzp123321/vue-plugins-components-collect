import { cloneDeep } from 'lodash';
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
// config
import { pageSizes } from '@/config/index';
// components
import { ElDialog, ElForm } from 'element-plus';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
// services
import abnormalReasonService from '@/pages/abnormal-reason/service/abnormal-reason.service';
// components
import AddAndEditDialog from './ar-add-update-dialog/ar-add-update-dialog.vue';

interface AbonrmalReasonState {
  pageForm: {
    name: string;
    typeIdList: number[];
  };
  queryParams: AbnormalReasonModule.QueryParams;
  total: number;
  loading: boolean;
  isAddFlag: boolean;
  abnormalReasonDetail: AbnormalReasonModule.AbnormalReasonInfo;
  dataSource: AbnormalReasonModule.AbnormalReasonInfo[];
  selectedList: AbnormalReasonModule.AbnormalReasonInfo[];
  abnormalList: OperateSuggestionModule.AbnormalInfo[];
  nums: number;
  dialogOpen: boolean;
}

export default defineComponent({
  name: 'AbnormalReason',
  components: {
    AddAndEditDialog,
  },
  setup() {
    const { proxy } = useCurrentInstance();
    const dialogRef = ref(ElDialog);
    const multipleTable = ref(ElForm);
    const abnormalState = reactive<AbonrmalReasonState>({
      dataSource: [],
      total: 0,
      loading: true,
      isAddFlag: false,
      queryParams: {
        name: '',
        typeId: undefined,
        pageNum: 1,
        pageSize: pageSizes[0],
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        searchCount: true,
      },
      pageForm: {
        name: '',
        typeIdList: [],
      },
      selectedList: [],
      abnormalList: [],
      abnormalReasonDetail: {
        id: -1,
        name: '',
        typeId: '',
        typeName: '',
      },
      nums: 1,
      dialogOpen: false,
    });
    // 列表中多选
    const handleSelectionChange = (value: AbnormalReasonModule.AbnormalReasonInfo[]) => {
      abnormalState.selectedList = value;
    };
    // 重置
    const onReset = () => {
      abnormalState.queryParams.pageNum = 1;
      abnormalState.queryParams.pageSize = pageSizes[0];
      abnormalState.queryParams.name = '';
      abnormalState.queryParams.typeId = 0;
      getAbnormalReasonList();
    };
    // 获取列表
    const getAbnormalReasonList = async () => {
      try {
        abnormalState.loading = true;
        const params = cloneDeep(abnormalState.queryParams);
        if (params.typeId === 0) {
          params.typeId = '';
        }
        const res = await abnormalReasonService.getAbnormalReasonList(params);
        if (res.code == 200 && res.success) {
          abnormalState.loading = false;
          abnormalState.dataSource = res.data.list || [];
          abnormalState.total = res.data.total;
        } else {
          abnormalState.loading = false;
          abnormalState.dataSource = [];
          abnormalState.total = 0;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message);
          }
        }
      } catch (error: any) {
        abnormalState.loading = false;
        abnormalState.dataSource = [];
        abnormalState.total = 0;

        return proxy.$message.error((error && error.message) || '获取列表失败');
      } finally {
        abnormalState.loading = false;
      }
    };
    // 查询操作建议异常列表
    const getAbnormalList = async () => {
      const res = await abnormalReasonService.getAbnormalList();
      if (res.code == 200 && res.success) {
        if (res.data && res.data.length) {
          abnormalState.abnormalList = res.data;
          abnormalState.abnormalList.unshift({ id: 0, name: '全部' });
          abnormalState.queryParams.typeId = abnormalState.abnormalList[0].id;
        }
      } else {
        abnormalState.abnormalList = [];
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          proxy.$message.error(res.message);
        }
      }
    };
    // 新增
    const onAddDialogShow = () => {
      abnormalState.isAddFlag = true;
      abnormalState.dialogOpen = true;
      abnormalState.nums++;
    };
    // 修改
    const onEnergyCodeUpdate = (item: AbnormalReasonModule.AbnormalReasonInfo) => {
      abnormalState.abnormalReasonDetail = item;
      abnormalState.isAddFlag = false;
      abnormalState.dialogOpen = true;
      abnormalState.nums++;
    };
    // 页码改变
    const onPageSizeChange = (value: number) => {
      abnormalState.queryParams.pageSize = value;
      abnormalState.queryParams.pageNum = 1;
      getAbnormalReasonList();
    };
    // 分页
    const onCurrentChange = (value: number) => {
      abnormalState.queryParams.pageNum = Math.floor(value);
      getAbnormalReasonList();
    };
    // 删除
    const onEnergyCodeDelete = async (item: number) => {
      const params = {
        id: item,
      };
      try {
        const res = await abnormalReasonService.getAbnormalReasonDelete(params);
        if (res.code == 200 && res.success) {
          getAbnormalReasonList();
          proxy.$message.success('删除成功');
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '删除失败');
          }
        }
      } catch (error) {
        proxy.$message.error('删除失败');
      }
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      await getAbnormalList();
      await getAbnormalReasonList();
    });
    return {
      ...toRefs(abnormalState),
      multipleTable,
      pageSizes,
      dialogRef,
      onReset,
      onAddDialogShow,
      onEnergyCodeUpdate,
      onEnergyCodeDelete,
      handleSelectionChange,
      getAbnormalReasonList,
      onPageSizeChange,
      onCurrentChange,
    };
  },
});
