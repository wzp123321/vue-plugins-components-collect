import { cloneDeep } from 'lodash';
import { ElForm } from 'element-plus';
import { defineComponent, ref, toRefs, onMounted, reactive } from 'vue';
import TargetCostService from '@/pages/target-cost/service/target-cost.service';
// components
import { useCommonController } from '@/utils/use-common-controller';
import { pageSizes } from '@/config/index';
// utils
import { getTreeExpandKeys } from '@/utils/index';

interface TargetCostState {
  queryParams: GlobalModule.CommonSearchParams;
  total: number;
  loading: boolean;
  dialogVisible: boolean;
  isAddFlag: boolean;
  reqLoading: boolean;
  targetCostForm: TargetCostModule.TargetCostForm;
  targetCostDetail: TargetCostModule.TargetCostInfo;
  energyCodeList: EnergyCodeManageModule.EnergyInfo[];
  treeList: TreeManageModule.TreeDetail[];
  expandKeys: number[];
  dataSource: TargetCostModule.TargetCostInfo[];
  abnormal: boolean;
}
export default defineComponent({
  name: 'targetCost',
  setup() {
    let { proxy, getEnergyCodeListNoParent, treeType, getTreeWidthoutLocationList } = useCommonController();
    const targetCostState = reactive<TargetCostState>({
      queryParams: {
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        searchCount: true,
        pageSize: pageSizes[0],
        pageNum: 1,
      },
      total: 0,
      isAddFlag: false,
      reqLoading: false,
      targetCostDetail: {
        id: 0,
        energyCode: '',
        energyName: '',
        targetValue: 0,
        treeId: 0,
        treeName: '',
        treeType: 1,
      },
      targetCostForm: {
        targetValue: '',
        treeId: [],
        energyCode: '',
      },
      expandKeys: [],
      treeList: [],
      dialogVisible: false,
      loading: true,
      energyCodeList: [],
      dataSource: [],
      abnormal: false,
    });
    let nums = ref<number>(1);
    const targetCostRef = ref(ElForm);
    const rules = {
      energyCode: [
        {
          required: true,
          message: '分类分项不能为空',
          trigger: ['change', 'blur'],
        },
      ],
      treeId: [
        {
          required: true,
          message: '节点不能为空',
          trigger: ['change', 'blur'],
        },
      ],
      targetValue: [{ required: true, message: '目标值不能为空', trigger: 'blur' }],
    };
    /**
     * 请求列表
     */
    const getTargetCostList = async () => {
      targetCostState.loading = true;

      try {
        const res = await TargetCostService.getTargetCostList(targetCostState.queryParams);
        if (res && res.code === 200 && res.success) {
          targetCostState.abnormal = false;
          if (res.data && res.data.list) {
            targetCostState.dataSource = res.data?.list;
            targetCostState.total = res.data?.total;
            targetCostState.loading = false;
          } else {
            targetCostState.dataSource = [];
            targetCostState.total = res.data?.total ?? 0;
            targetCostState.loading = false;
          }
        } else {
          targetCostState.dataSource = [];
          targetCostState.total = 0;
          targetCostState.loading = false;
        }
      } catch (error) {
        targetCostState.abnormal = true;
        targetCostState.dataSource = [];
        targetCostState.total = 0;
        targetCostState.loading = false;
      }
    };
    /**
     * 页面pageSize改变
     */
    const onPageSizeChange = (value: number) => {
      targetCostState.queryParams.pageSize = value;
      targetCostState.queryParams.pageNum = 1;
      getTargetCostList();
    };
    /**
     * 分页
     */
    const onCurrentChange = (value: number) => {
      targetCostState.queryParams.pageNum = Math.floor(value);
      getTargetCostList();
    };
    /**
     * 新增
     */
    const onAddDialogShow = () => {
      targetCostState.isAddFlag = true;
      targetCostState.targetCostForm.energyCode = '';
      targetCostState.targetCostForm.treeId = [];
      targetCostState.targetCostForm.targetValue = '';
      nums.value++;
      targetCostState.dialogVisible = true;
    };
    /**
     * 编辑
     */
    const editTarget = async (item: TargetCostModule.TargetCostInfo) => {
      targetCostState.targetCostDetail = cloneDeep(item);
      console.log(item.treeId);
      treeType.value = targetCostState.targetCostDetail.treeType;
      await onTreeTypeChange();
      const { treeId, energyCode, targetValue } = targetCostState.targetCostDetail;
      targetCostState.targetCostForm.treeId = [treeId];
      const index = targetCostState.energyCodeList.findIndex((item) => {
        return item.code === energyCode;
      });
      if (index !== -1) {
        targetCostState.targetCostForm.energyCode = energyCode;
      } else {
        targetCostState.targetCostForm.energyCode = '';
      }
      targetCostState.targetCostForm.targetValue = targetValue;

      targetCostState.isAddFlag = false;
      targetCostState.dialogVisible = true;
    };
    /**
     * 新增、编辑弹窗关闭事件
     */
    const onBeforeClose = () => {
      targetCostState.dialogVisible = false;
      targetCostRef.value.resetFields();
    };
    /**
     * 删除
     */
    const deleteTarget = async (id: number) => {
      proxy
        .$confirm('确认删除该条数据吗?', '删除数据', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(async () => {
          try {
            const res = await TargetCostService.deleteTarget({
              id,
            });
            if (res && res.code === 200 && res.success) {
              proxy.$message.success('删除成功');
              getTargetCostList();
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
    // 树类型change
    const onTreeTypeChange = async () => {
      targetCostState.treeList = await getTreeWidthoutLocationList();
      console.log(targetCostState.treeList);
    };
    // 树类型点击
    const onTreeSelect = (val: any) => {
      const error_dom = <HTMLImageElement>document.querySelector(`.el-form-item:nth-child(2) .el-form-item__error`);
      if (targetCostState.targetCostForm.treeId.length > 0 && error_dom !== null) {
        error_dom.style.display = 'none';
      } else if (targetCostState.targetCostForm.treeId.length === 0 && error_dom !== null) {
        const error_dom = <HTMLImageElement>document.querySelector(`.el-form-item:nth-child(2) .el-form-item__error`);
        error_dom.style.display = 'block';
      }
    };
    // 表单提交
    const onSubmit = () => {
      targetCostRef.value.validate((valid: boolean) => {
        if (valid) {
          if (targetCostState.isAddFlag) {
            getTargetCostCreate();
          } else {
            getTargetCostUpdate();
          }
        }
      });
    };
    // 新增
    const getTargetCostCreate = async () => {
      const { treeId, energyCode, targetValue } = targetCostState.targetCostForm;
      if (targetValue == 0 || targetValue == 0.0 || targetValue == 0.0 || targetValue == 0.0 || targetValue == 0.0) {
        return proxy.$message.error('目标值不能为0');
      }
      targetCostState.reqLoading = true;
      try {
        const res = await TargetCostService.addTarget({
          treeId: treeId[0],
          energyCode,
          targetValue: Number(targetValue),
        });
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('新增成功');
          targetCostState.reqLoading = false;
          targetCostRef.value.resetFields();
          targetCostState.dialogVisible = false;
          getTargetCostList();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '新增失败');
          }
          targetCostState.reqLoading = false;
        }
      } catch (error) {
        proxy.$message.error('新增失败');
        targetCostState.reqLoading = false;
      }
    };
    // 编辑
    const getTargetCostUpdate = async () => {
      const { treeId, energyCode, targetValue } = targetCostState.targetCostForm;
      console.log(treeId, 'treeId', targetCostState.treeList);
      // onTreeTypeChange.treeType
      // if(targetCostState.treeList.includes(treeId[0])){

      // }
      const { id } = targetCostState.targetCostDetail;
      targetCostState.reqLoading = true;
      try {
        const res = await TargetCostService.editTarget({
          treeId: treeId[0],
          energyCode,
          targetValue: Number(targetValue),
          id,
        });
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('编辑成功');
          targetCostState.reqLoading = false;
          targetCostRef.value.resetFields();
          targetCostState.dialogVisible = false;
          getTargetCostList();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '编辑失败');
          }
          targetCostState.reqLoading = false;
        }
      } catch (error) {
        proxy.$message.error('编辑失败');
        targetCostState.reqLoading = false;
      }
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      try {
        targetCostState.energyCodeList = await getEnergyCodeListNoParent();
        targetCostState.treeList = await getTreeWidthoutLocationList();
        targetCostState.expandKeys = getTreeExpandKeys<TreeManageModule.TreeDetail[]>(
          targetCostState.treeList,
          'id',
          'childTree',
        );
        getTargetCostList();
      } catch (error) {
        targetCostState.loading = false;
      }
    });

    return {
      ...toRefs(targetCostState),
      pageSizes,
      targetCostRef,
      rules,
      treeType,
      nums,
      deleteTarget,
      editTarget,
      onAddDialogShow,
      onBeforeClose,
      onPageSizeChange,
      onCurrentChange,
      getTargetCostList,
      onTreeTypeChange,
      onSubmit,
      onTreeSelect,
    };
  },
});
