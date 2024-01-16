import { defineComponent, ref, toRefs, onMounted, reactive } from 'vue';
import { useCommonController } from '@/utils/use-common-controller';
import addAndEditDialog from './add-update-dialog/add-update-dialog.vue';
import { ElDialog } from 'element-plus';
// services
import energyComparisonGroupService from '@/pages/energy-comparison-group/service/energy-comparison-group.service';
// config
import { pageSizes } from '@/config/index';
interface ComparisonCodeState {
  queryParams: GlobalModule.CommonSearchParams;
  total: number;
  loading: boolean;
  isAddFlag: boolean;
  dataSource: EnergyComparisonGroupModule.EnergyCompareGroupInfo[];
  compareGroupDetail: EnergyComparisonGroupModule.EnergyCompareGroupInfo;
  abnormal: boolean;
  nums: number;
  dialogOpen: boolean;
  energyTopLevelList: any[];
}
export default defineComponent({
  name: 'energyComparisonGroup',
  components: {
    addAndEditDialog,
  },
  setup() {
    const { proxy, getEnergyCodeListNoParent } = useCommonController();
    const configState = reactive<ComparisonCodeState>({
      queryParams: {
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
      isAddFlag: false,
      total: 0,
      loading: true,
      dataSource: [],
      compareGroupDetail: {
        contrastTreeId: -1,
        contrastTreeName: '',
        energyCode: '',
        energyName: '',
        id: -1,
        name: '',
        treeId: -1,
        treeName: '',
        treeType: 1,
      },
      abnormal: false,
      nums: 1,
      dialogOpen: false,
      energyTopLevelList: [], //存放分类分项列表
    });
    const addAndEditForm = ref(ElDialog);
    /**
     * 请求列表
     */
    const getCompareGroupList = async () => {
      configState.loading = true;
      try {
        const res = await energyComparisonGroupService.getComparisonList(configState.queryParams);
        if (res && res.code == 200 && res.success) {
          configState.loading = false;
          configState.dataSource = res.data.list;
          configState.total = res.data.total;
          configState.abnormal = false;
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '查询数据失败');
          }
          configState.dataSource = [];
          configState.loading = false;
          configState.abnormal = false;
        }
      } catch (error) {
        proxy.$message.error('查询数据失败');
        configState.dataSource = [];
        configState.loading = false;
        configState.abnormal = true;
      }
    };
    /**
     * 页面pageSize改变
     */
    const onPageSizeChange = (value: number) => {
      configState.queryParams.pageSize = value;
      configState.queryParams.pageNum = 1;
      getCompareGroupList();
    };
    /**
     * 分页
     */
    const onCurrentChange = (value: number) => {
      configState.queryParams.pageNum = Math.floor(value);
      getCompareGroupList();
    };
    /**
     * 新增
     */
    const onAddDialogShow = async () => {
      configState.isAddFlag = true;
      configState.nums++;
      configState.dialogOpen = true;
      // addAndEditForm.value.show();
    };
    // 编辑
    const editComparison = (item: EnergyComparisonGroupModule.EnergyCompareGroupInfo) => {
      configState.compareGroupDetail = item;
      configState.isAddFlag = false;
      configState.nums++;
      configState.dialogOpen = true;
      // addAndEditForm.value.show();
    };
    // 操作成功
    const onSuccess = () => {
      configState.queryParams.pageNum = 1;
      getCompareGroupList();
    };
    // 删除
    const deleteComparison = async (id: number) => {
      proxy
        .$confirm('确认删除该条数据吗?', '删除数据', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(async () => {
          try {
            const res = await energyComparisonGroupService.deleteComparison({
              id,
            });
            if (res && res.code === 200 && res.success) {
              proxy.$message.success('删除成功');
              getCompareGroupList();
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                proxy.$message.error(res.message || '删除失败');
              }
            }
          } catch (error) {
            proxy.$message.error('删除失败');
          }
        });
    };
    /**
     * 获取分类分项列表
     */
    const getEnergyCodeList = async () => {
      configState.energyTopLevelList = await getEnergyCodeListNoParent();
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      await getCompareGroupList();
      await getEnergyCodeList();
    });

    return {
      ...toRefs(configState),
      pageSizes,
      addAndEditForm,
      onSuccess,
      onPageSizeChange,
      onCurrentChange,
      onAddDialogShow,
      deleteComparison,
      editComparison,
    };
  },
});
