import { defineComponent, ref, computed, onMounted } from 'vue';
import { ElForm, ElDialog } from 'element-plus';
import GroupConfiguration from '../gr-group-configuration/gr-group-configuration.vue';

import { useCommonController } from '@/utils/use-common-controller';

export default defineComponent({
  components: {
    GroupConfiguration,
  },
  props: {
    isAddFlag: {
      type: Boolean,
      default: true,
    },
    groupDetail: {
      type: Object,
      default: {},
    },
    dialogOpen: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const { getEnergyCodeListNoParent } = useCommonController();
    const dataFormRef = ref(ElForm);
    // 树选择
    const selectTreeRef = ref(ElDialog);
    // 开关
    const dialogFormVisible = ref<boolean>(props.dialogOpen);
    const energyCodeList = ref<EnergyCodeManageModule.EnergyInfo[]>([]);
    // 操作类型
    const isAddFlag = computed(() => {
      return props.isAddFlag;
    });
    // 表单
    const pageForm = ref<GroupRankedModule.GroupRankedInfo>({
      name: '',
      energyCode: '',
      energyName: '',
      id: -1,
    });

    if (!isAddFlag.value) {
      pageForm.value.name = props.groupDetail.name;
      pageForm.value.id = props.groupDetail.id;
      pageForm.value.energyName = props.groupDetail.energyName;
    }
    let nums = ref<number>(1);
    let dialogOpen = ref<boolean>(false);
    // 表单校验
    const rules = {
      name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
      energyCode: [
        { required: true, message: '请选择分类分项类型', trigger: 'change' },
      ],
    };
    // 下一步按钮
    const nextStep = () => {
      dataFormRef.value.validate((valid: boolean) => {
        if (valid) {
          energyCodeList.value.forEach((item) => {
            if (item.code === pageForm.value.energyCode) {
              pageForm.value.energyName = item.name + '';
            }
          });
          nums.value++;

          dialogOpen.value = true;
          // selectTreeRef.value.show();
        } else {
          return false;
        }
      });
    };
    const closeDialogFormVisible = () => {
      dialogFormVisible.value = false;
      context.emit('success');
    };
    // 关闭前
    const onBeforeClose = () => {
      dialogFormVisible.value = false;
      dataFormRef.value.resetFields();
    };
    onMounted(async () => {
      energyCodeList.value = await getEnergyCodeListNoParent();
      const index = energyCodeList.value.findIndex((item) => {
        return item.code === props.groupDetail.energyCode;
      });
      if (index !== -1) {
        pageForm.value.energyCode = props.groupDetail.energyCode;
      } else {
        pageForm.value.energyCode = '';
      }
    });
    return {
      dialogFormVisible,
      pageForm,
      rules,
      isAddFlag,
      dataFormRef,
      energyCodeList,
      selectTreeRef,
      nums,
      dialogOpen,
      closeDialogFormVisible,
      onBeforeClose,
      nextStep,
    };
  },
});
