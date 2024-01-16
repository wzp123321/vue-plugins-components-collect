import { defineComponent, onMounted, reactive, ref, toRefs, provide } from 'vue';
// service
import groupRankedService from '@/pages/group-ranked/service/group-ranked.service';
// components
import AddUpdateDialog from './components/gr-add-update-dialog/gr-add-update-dialog.vue';
import { ElDialog } from 'element-plus';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
// config
import { pageSizes } from '@/config/index';

interface GroupRankedState {
  loading: boolean;
  dataSource: GroupRankedModule.GroupRankedInfo[];
  queryParams: GroupRankedModule.GroupRankedQueryParams;
  total: number;
  isAddFlag: boolean;
  abnormal: boolean;
  nums: number;
  dialogOpen: boolean;
}

export default defineComponent({
  name: 'GroupRanked',
  components: {
    AddUpdateDialog,
  },
  setup() {
    const groupRankState = reactive<GroupRankedState>({
      loading: true,
      dataSource: [],
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
      isAddFlag: true,
      abnormal: false,
      nums: 1,
      dialogOpen: false,
    });

    const { proxy } = useCurrentInstance();
    // 弹框
    const addUpdateRef = ref(ElDialog);
    // 详情
    const groupDetail = ref<GroupRankedModule.GroupRankedInfo>();
    // provide
    provide('success', () => {
      getAbnormalGroupList();
    });
    // 获取分组排名列表数据
    const getAbnormalGroupList = async () => {
      try {
        groupRankState.loading = true;
        const res = await groupRankedService.queryAbnormalGroup(groupRankState.queryParams);
        if (res.code == 200 && res.success) {
          if (res.data && res.data.list) {
            groupRankState.dataSource = res?.data?.list || [];
            groupRankState.total = res?.data?.total ?? 0;
            groupRankState.loading = false;
            groupRankState.abnormal = false;
          } else {
            groupRankState.dataSource = [];
            groupRankState.total = res?.data?.total ?? 0;
            groupRankState.loading = false;
          }
        } else {
          groupRankState.dataSource = [];
          groupRankState.total = 0;
          groupRankState.loading = false;
          groupRankState.abnormal = true;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '查询数据失败');
          }
        }
      } catch (error) {
        groupRankState.dataSource = [];
        groupRankState.total = 0;
        groupRankState.loading = false;
        groupRankState.abnormal = true;
        proxy.$message.error('查询数据失败');
      }
    };
    // 重置
    const onReset = () => {
      groupRankState.queryParams.pageNum = 1;
      groupRankState.queryParams.pageSize = pageSizes[0];
      groupRankState.queryParams.name = '';
      getAbnormalGroupList();
    };
    // 新增按钮事件
    const onAddDialogShow = () => {
      groupRankState.isAddFlag = true;
      groupRankState.dialogOpen = true;
      groupRankState.nums++;

      // addUpdateRef.value.show();
    };
    // 修改按钮事件
    const onEnergyCodeUpdate = (value: GroupRankedModule.GroupRankedInfo) => {
      groupRankState.isAddFlag = false;
      groupRankState.dialogOpen = true;
      // addUpdateRef.value.show();
      groupDetail.value = value;
      groupRankState.nums++;
    };
    // 删除按钮事件
    const onEnergyCodeDelete = async (id: number) => {
      proxy
        .$confirm('确认删除该条分组信息?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(async () => {
          try {
            const res = await groupRankedService.getAbnormalGroupDelete(id);
            if (res.code == 200 && res.success) {
              proxy.$message.success(res.message);
              getAbnormalGroupList();
            } else {
              proxy.$message.error(res.message || '删除失败');
            }
          } catch (error) {
            proxy.$message.error('删除失败');
          }
        })
        .catch(() => {});
    };
    // pagesize
    const onPageSizeChange = (value: number) => {
      groupRankState.queryParams.pageSize = value;
      groupRankState.queryParams.pageNum = 1;
      getAbnormalGroupList();
    };
    // 分页
    const onCurrentChange = (value: number) => {
      groupRankState.queryParams.pageNum = Math.floor(value);
      getAbnormalGroupList();
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      getAbnormalGroupList();
    });

    return {
      ...toRefs(groupRankState),
      pageSizes,
      groupDetail,
      addUpdateRef,
      onAddDialogShow,
      onEnergyCodeUpdate,
      getAbnormalGroupList,
      onReset,
      onPageSizeChange,
      onCurrentChange,
      onEnergyCodeDelete,
    };
  },
});
