import { defineComponent, reactive, toRefs, onMounted, ref } from 'vue';
// utils
import { useCommonController } from '@/utils/use-common-controller';
import useCurrentInstance from '@/utils/use-current-instance';
// config
import { pageSizes } from '@/config/index';
// services
import {
  getStandardLibraryList,
  getStandardLibraryUpdate,
} from '@/pages/standard-library-maintenance/service/standard-library-maintenance.service';
import { cloneDeep } from 'lodash';
import { ElForm } from 'element-plus';

interface PageFormState {
  queryParams: StandardLibraryMaintenanceModule.FormParams;
  onReset: () => void;
  treeList: TreeManageModule.TreeList[];
  total: number;
}

interface PageTableState {
  loading: boolean;
  updateLoading: boolean;
  rules: GlobalModule.CommonObject;
  dialogVisible: boolean;
  dataSource: StandardLibraryMaintenanceModule.StandardLibraryInfo[];
  standardLibraryDetail: StandardLibraryMaintenanceModule.StandardLibraryInfo;
  onEditDialogShow: (row: StandardLibraryMaintenanceModule.StandardLibraryInfo) => void;
  onPageChange: (value: number) => void;
  onQueryList: () => void;
  onUpdateSubmit: () => void;
}

export default defineComponent({
  setup() {
    const { proxy } = useCurrentInstance();
    const { getTreeWidthoutLocationList } = useCommonController();
    const form = ref(ElForm);
    // 头部模块
    const queryFormModule = () => {
      // 重置
      const onReset = () => {
        queryFormState.queryParams.name = '';
        if (queryFormState.treeList && queryFormState.treeList.length) {
          queryFormState.queryParams.treeId = [queryFormState.treeList[0].id];
        }
        tableState.onQueryList();
      };
      const queryFormState = reactive<PageFormState>({
        queryParams: {
          pageNum: 1,
          pageSize: pageSizes[0],
          name: '',
          treeId: [],
          orders: [{ asc: true, column: '' }],
          searchCount: true,
        },
        total: 0,
        treeList: [],
        onReset,
      });
      return { queryFormState };
    };
    // 表格模块
    const dataModule = () => {
      const rules = {
        maxValue: [
          {
            pattern: new RegExp(/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/),
            message: '约束值必须为数字',
            trigger: 'blur',
          },
        ],
        minValue: [
          {
            pattern: new RegExp(/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/),
            message: '引导值必须为数字',
            trigger: 'blur',
          },
        ],
      };
      const onQueryList = async () => {
        tableState.loading = true;
        const { pageSize, pageNum, name, orders, searchCount, treeId } = queryFormState.queryParams;
        try {
          const res = await getStandardLibraryList({
            pageSize,
            pageNum,
            name,
            orders,
            searchCount,
            treeId: treeId[0],
          });
          if (res && res.code === 200 && res.data && res.data.list) {
            if (res.data.list.length) {
              tableState.dataSource = res.data?.list;
              queryFormState.total = res.data?.total;
              tableState.loading = false;
            } else {
              tableState.dataSource = [];
              queryFormState.total = res.data?.total;
              tableState.loading = false;
            }
          } else {
            tableState.dataSource = [];
            queryFormState.total = 0;
            tableState.loading = false;
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              proxy.$message.error(res.message || '数据查询失败');
            }
          }
        } catch (error) {
          tableState.dataSource = [];
          queryFormState.total = 0;
          tableState.loading = false;
          proxy.$message.error('数据查询失败');
        }
      };
      // 打开编辑弹框
      const onEditDialogShow = (row: StandardLibraryMaintenanceModule.StandardLibraryInfo) => {
        tableState.standardLibraryDetail = cloneDeep(row);
        tableState.dialogVisible = true;
      };
      // 分页
      const onPageChange = (value: number) => {
        queryFormState.queryParams.pageNum = Math.floor(value);
        onQueryList();
      };
      // 编辑
      const onUpdateSubmit = async () => {
        if (!form.value) {
          return;
        }

        await form.value.validate();
        const { maxValue, minValue, targetTypeId, targetConfigId } = tableState.standardLibraryDetail;
        const { treeId } = queryFormState.queryParams;
        console.log(typeof minValue);
        if (Number(minValue) > Number(maxValue)) {
          proxy.$message.warning('引导值不可大于约束值');
          return false;
        }
        const params = {
          maxValue: !maxValue ? null : Number(maxValue),
          minValue: !minValue ? null : Number(minValue),
          targetConfigId,
          targetTypeId,
          treeId: treeId[0],
        };
        if (
          Object.prototype.toString.call(maxValue) === '[object Null]' &&
          Object.prototype.toString.call(minValue) === '[object Null]'
        ) {
          console.log(21212);
          proxy
            .$confirm('约束值引导值不能同时为空，确定提交吗？', '删除提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            })
            .then((res: any) => {
              if (res === 'confirm') {
                onUpdateRequest(params);
              }
            })
            .catch(() => {});
        } else {
          onUpdateRequest(params);
        }
      };
      // 调用接口
      const onUpdateRequest = async (params: StandardLibraryMaintenanceModule.UpdateParams) => {
        try {
          tableState.updateLoading = true;
          const res = await getStandardLibraryUpdate(params);
          if (res && res.code === 200 && res.success) {
            proxy.$message.success('编辑成功');
            tableState.updateLoading = false;
            tableState.dialogVisible = false;
            onQueryList();
          } else {
            tableState.updateLoading = false;
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              proxy.$message.error(res.message || '编辑失败');
            }
          }
        } catch (error) {
          tableState.updateLoading = false;
          proxy.$message.error('编辑失败');
        }
      };
      const tableState = reactive<PageTableState>({
        dialogVisible: false,
        loading: false,
        dataSource: [],
        updateLoading: false,
        rules,
        standardLibraryDetail: {
          name: '',
          unit: '',
          maxValue: 0,
          minValue: 0,
          energyCode: '',
          energyName: '',
          targetConfigId: '',
          targetTypeId: '',
        },
        onEditDialogShow,
        onQueryList,
        onPageChange,
        onUpdateSubmit,
      });
      return { tableState };
    };

    const { queryFormState } = queryFormModule();
    const { tableState } = dataModule();
    // 初始化
    onMounted(async () => {
      queryFormState.treeList = await getTreeWidthoutLocationList();
      if (queryFormState.treeList && queryFormState.treeList.length) {
        queryFormState.queryParams.treeId = [queryFormState.treeList[0].id];
      }
      tableState.onQueryList();
    });

    return {
      ...toRefs(queryFormState),
      ...toRefs(tableState),
      form,
    };
  },
});
