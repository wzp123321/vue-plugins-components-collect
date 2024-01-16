import { defineComponent, ref, computed, PropType, watch, onMounted } from 'vue';
// utils
import { useCommonController } from '@/utils/use-common-controller';
import { getTreeExpandKeys } from '@/utils/index';
// config
import { treeTypeList } from '@/config/index';
import { ElForm } from 'element-plus';
import EnergyComparisonGroupService from '@/pages/energy-comparison-group/service/energy-comparison-group.service';

export default defineComponent({
  name: 'addAndEditDialog',
  props: {
    compareGroupDetail: {
      type: Object as PropType<EnergyComparisonGroupModule.EnergyCompareGroupInfo>,
      default: () => {},
    },
    isAddFlag: {
      type: Boolean,
      default: true,
    },
    dialogOpen: {
      type: Boolean,
      default: false,
    },
    energyTopLevelList: {
      type: Array,
    },
  },
  setup(props, { emit }) {
    const { proxy, treeType, getTreeWidthoutLocationList, getEnergyCodeListNoParent } = useCommonController();
    const compareFormRef = ref(ElForm);
    // 分类分项
    const energyTopLevelList = ref<any>(props.energyTopLevelList);
    // 弹框开关
    const addAndEditVisible = ref(props.dialogOpen);
    // 是否为新增
    const isAddFlag = computed(() => {
      return props.isAddFlag;
    });
    // 操作loading
    const reqLoading = ref(false);
    // 树loading
    const treeLoading = ref(false);
    // 表单
    const pageForm = ref<EnergyComparisonGroupModule.CompareGroupForm>({
      energyCode: '',
      name: '',
      contrastTreeId: [],
      treeId: [],
    });
    // 树类型
    let treeIdType = ref(props.isAddFlag ? treeTypeList[0].value : props.compareGroupDetail.treeType);
    let contrastTreeIdType = ref(props.isAddFlag ? treeTypeList[0].value : props.compareGroupDetail.treeType);
    const treeList = ref<TreeManageModule.TreeDetail[]>([]);
    const contrastTreeList = ref<TreeManageModule.TreeDetail[]>([]);
    const treeExpandKeys = ref<number[]>();
    const contrastExpandKeys = ref<number[]>();
    const rules = {
      name: [{ required: true, message: '分组名称不能为空', trigger: 'blur' }],
      energyCode: [{ required: true, message: '请选择分类分项', trigger: 'change' }],
      treeId: [
        {
          required: true,
          message: '请选择原节点',
          trigger: ['change', 'blur'],
        },
      ],
      contrastTreeId: [
        {
          required: true,
          message: '请选择对比节点',
          trigger: ['change', 'blur'],
        },
      ],
    };

    /**
     * 获取分类分项列表
     */
    const getEnergyCodeList = async () => {
      energyTopLevelList.value = await getEnergyCodeListNoParent();
    };
    // 打开
    const show = async () => {
      addAndEditVisible.value = true;
      await getEnergyCodeList();
      if (props.isAddFlag) {
        const list = await getTreeWidthoutLocationList();
        treeList.value = list;
        contrastTreeList.value = list;
        treeExpandKeys.value = getTreeExpandKeys<TreeManageModule.TreeDetail[]>(treeList.value, 'id', 'childTree');
        contrastExpandKeys.value = getTreeExpandKeys<TreeManageModule.TreeDetail[]>(
          contrastTreeList.value,
          'id',
          'childTree',
        );
      }
    };
    // 关闭前
    const onBeforeClose = () => {
      addAndEditVisible.value = false;
      pageForm.value.contrastTreeId = [];
      pageForm.value.treeId = [];
      compareFormRef.value.resetFields();
    };
    /**
     * 选择原节点单选切换事件
     */
    const treeIdRaidoChange = async (value: number) => {
      treeLoading.value = true;
      try {
        treeIdType.value = value;
        treeType.value = value;
        pageForm.value.treeId = [];
        treeList.value = await getTreeWidthoutLocationList();
        treeExpandKeys.value = getTreeExpandKeys(treeList.value, 'id', 'childTree');
        console.log(treeExpandKeys.value);
      } catch (error) {
        treeList.value = [];
      } finally {
        setTimeout(() => {
          treeLoading.value = false;
        });
      }
    };
    /**
     * 选择原节点切换事件
     */
    const treeIdSelectChange = () => {
      compareFormRef.value.validateField('treeId');
    };
    /**
     * 选择对比节点单选切换事件
     */
    const contrastTreeIdRaidoChange = async (value: number) => {
      treeLoading.value = true;
      try {
        treeType.value = value;
        pageForm.value.contrastTreeId = [];
        contrastTreeIdType.value = value;
        contrastTreeList.value = await getTreeWidthoutLocationList();

        contrastExpandKeys.value = getTreeExpandKeys(contrastTreeList.value, 'id', 'childTree');
      } catch (error) {
        contrastTreeList.value = [];
      } finally {
        treeLoading.value = false;
      }
    };
    /**
     * 选择对比节点切换事件
     */
    const contrastTreeIdSelectChange = () => {
      compareFormRef.value.validateField('contrastTreeId');
    };
    /**
     * 弹窗新增
     */
    const handleOk = () => {
      compareFormRef.value.validate((valid: boolean) => {
        if (valid) {
          if (!props.isAddFlag) {
            editComparisonData();
          } else {
            addComparisonData();
          }
        }
      });
    };
    /**
     * 新增
     */
    const addComparisonData = async () => {
      const { name, energyCode, treeId, contrastTreeId } = pageForm.value;
      if (pageForm.value.contrastTreeId[0] === pageForm.value.treeId[0]) {
        proxy.$message.error('原节点和对比节点不能为同一节点');
        return;
      }
      reqLoading.value = true;
      await EnergyComparisonGroupService.addComparison({
        name,
        energyCode,
        treeId: treeId[0],
        contrastTreeId: contrastTreeId[0],
      })
        .then((res: any) => {
          if (res && res.code == 200 && res.success) {
            proxy.$message.success((res && res.message) || '操作成功');
            emit('success');
            reqLoading.value = false;
            addAndEditVisible.value = false;
            compareFormRef.value.resetFields();
          } else {
            reqLoading.value = false;
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              proxy.$message.error((res && res.message) || '操作失败');
            }
          }
        })
        .catch((error: Error) => {
          reqLoading.value = false;
          proxy.$message.error('操作失败');
        });
    };
    /**
     * 编辑
     */
    const editComparisonData = async () => {
      const { name, energyCode, treeId, contrastTreeId } = pageForm.value;
      if (treeId[0] === contrastTreeId[0]) {
        proxy.$message.error('原节点和对比节点不能为同一节点');
        return;
      }
      reqLoading.value = true;
      await EnergyComparisonGroupService.editComparison({
        id: props.compareGroupDetail.id,
        name,
        energyCode,
        treeId: treeId[0],
        contrastTreeId: contrastTreeId[0],
      })
        .then((res: any) => {
          if (res && res.code == 200 && res.success) {
            proxy.$message.success((res && res.message) || '操作成功');
            emit('success');
            addAndEditVisible.value = false;
            reqLoading.value = false;
            compareFormRef.value.resetFields();
          } else {
            reqLoading.value = false;
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              proxy.$message.error((res && res.message) || '操作失败');
            }
          }
        })
        .catch((error: Error) => {
          reqLoading.value = false;
          proxy.$message.error('操作失败');
        });
    };

    onMounted(async () => {
      treeType.value = props.isAddFlag ? treeTypeList[0].value : props.compareGroupDetail.treeType;
      treeIdType.value = props.isAddFlag ? treeTypeList[0].value : props.compareGroupDetail.treeType;
      contrastTreeIdType.value = props.isAddFlag ? treeTypeList[0].value : props.compareGroupDetail.treeType;

      treeLoading.value = true;
      try {
        const list = await getTreeWidthoutLocationList();
        treeList.value = list;
        contrastTreeList.value = list;
        treeExpandKeys.value = getTreeExpandKeys<TreeManageModule.TreeDetail[]>(treeList.value, 'id', 'childTree');
        contrastExpandKeys.value = getTreeExpandKeys<TreeManageModule.TreeDetail[]>(
          contrastTreeList.value,
          'id',
          'childTree',
        );
      } catch (error) {
        contrastTreeList.value = [];
        treeList.value = [];
      } finally {
        treeLoading.value = false;
      }

      if (!isAddFlag.value) {
        pageForm.value.name = props.compareGroupDetail.name;
        const index = energyTopLevelList.value.findIndex((item: any) => {
          return item.code === props.compareGroupDetail.energyCode;
        });
        if (index !== -1) {
          pageForm.value.energyCode = props.compareGroupDetail.energyCode;
        } else {
          pageForm.value.energyCode = '';
        }
        pageForm.value.treeId = [props.compareGroupDetail.treeId];
        pageForm.value.contrastTreeId = [props.compareGroupDetail.contrastTreeId];
      }
    });
    return {
      isAddFlag,
      addAndEditVisible,
      pageForm,
      rules,
      treeIdType,
      contrastTreeIdType,
      treeList,
      contrastTreeList,
      treeTypeList,
      treeType,
      compareFormRef,
      energyTopLevelList,
      treeExpandKeys,
      contrastExpandKeys,
      reqLoading,
      treeLoading,
      treeIdRaidoChange,
      treeIdSelectChange,
      handleOk,
      contrastTreeIdRaidoChange,
      contrastTreeIdSelectChange,
      show,
      onBeforeClose,
    };
  },
});
