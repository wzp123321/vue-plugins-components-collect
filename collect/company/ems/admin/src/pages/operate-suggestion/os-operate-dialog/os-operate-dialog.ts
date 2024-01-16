import { defineComponent, reactive, ref, computed, toRefs, PropType, watch, onMounted } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import operateSuggestionService from '@/pages/operate-suggestion/service/operate-suggestion.service';

interface OperateDialogState {
  pageForm: {
    name: string;
    causeId: number | undefined;
  };
  abnormalList: any[];
  reqLoading: boolean;
}
export default defineComponent({
  name: 'osOperateDialog',
  props: {
    isAddFlag: {
      type: Boolean,
      default: true,
    },
    operateSuggestionDetail: {
      type: Object as PropType<OperateSuggestionModule.OperateSuggestionInfo>,
      default: {},
    },
    dialogShow: {
      type: Boolean,
      default: false,
    },
    abnormalList: {
      type: Array,
      default: [],
    },
  },
  emits: ['success'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const operateState = reactive<OperateDialogState>({
      pageForm: {
        name: '',
        causeId: undefined,
      },
      abnormalList: [],
      reqLoading: false,
    });
    const isAddFlag = computed(() => {
      return props.isAddFlag;
    });
    let ruleForm = ref(ElForm);
    const dialogFormVisible = ref<boolean>(props.dialogShow);
    const operateSuggestionDetail = ref<any>(props.operateSuggestionDetail);
    if (!isAddFlag.value) {
      operateState.pageForm.name = operateSuggestionDetail.value.name;
      operateState.pageForm.causeId = operateSuggestionDetail.value.causeId;
    }
    if (isAddFlag.value) {
      operateState.pageForm.name = '';
      operateState.pageForm.causeId = undefined;
    }
    operateState.abnormalList = props.abnormalList || [];
    // 表单校验
    const rules = {
      name: [
        { required: true, message: '操作建议不能为空', trigger: 'blur' },
        {
          min: 1,
          max: 128,
          message: '长度在 1到 128个字符',
          trigger: 'blur',
        },
      ],
      causeId: [
        {
          required: true,
          message: '所属异常原因不能为空',
          trigger: 'change',
        },
      ],
    };
    // 表单提交
    const onSubmit = async () => {
      //   验证表单规则
      ruleForm.value.validate(async (valid: boolean) => {
        if (valid) {
          const { causeId, name } = operateState.pageForm;
          const params = {
            causeId: Number(causeId),
            name,
            id: props.operateSuggestionDetail.id,
          };
          try {
            operateState.reqLoading = true;
            const res = props.isAddFlag
              ? await operateSuggestionService.getOperateSuggestionCreate({
                  causeId: Number(causeId),
                  name,
                })
              : await operateSuggestionService.getOperateSuggestionUpdate(params);
            if (res.code == 200 && res.success) {
              context.emit('success');
              dialogFormVisible.value = false;
              proxy.$message.success(res.message);
              operateState.reqLoading = true;
              ruleForm.value.resetFields();
            } else {
              operateState.reqLoading = false;
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                proxy.$message.error(res.message || '操作失败');
              }
            }
          } catch (error) {
            operateState.reqLoading = false;
            proxy.$message.error('操作失败');
          }
        }
      });
    };
    // 请求异常原因列表
    const getAbnormalList = async () => {
      try {
        const res = await operateSuggestionService.getSolutionRelationList();
        if (res && res.code === 200 && res.data) {
          operateState.abnormalList = res.data;
          if (isAddFlag.value) {
            operateState.pageForm.causeId = res.data.length > 0 ? res.data[0].id : undefined;
          }
        } else {
          operateState.abnormalList = [];
        }
      } catch (error: any) {
        operateState.abnormalList = [];
        proxy.$message.error('操作失败');
      }
    };
    // 打开
    const show = () => {
      dialogFormVisible.value = true;
      getAbnormalList();
    };
    // 关闭前
    const onBeforeClose = () => {
      dialogFormVisible.value = false;
      ruleForm.value.resetFields();
    };
    watch(
      () => props.operateSuggestionDetail,
      (newVal) => {
        if (props.isAddFlag) {
          operateState.pageForm.name = '';
          operateState.pageForm.causeId = undefined;
        } else {
          operateState.pageForm.name = newVal.name;
          operateState.pageForm.causeId = newVal.causeId;
        }
      },
    );
    onMounted(async () => {
      await getAbnormalList();
    });
    return {
      ...toRefs(operateState),
      isAddFlag,
      dialogFormVisible,
      rules,
      ruleForm,
      onSubmit,
      show,
      onBeforeClose,
    };
  },
});
