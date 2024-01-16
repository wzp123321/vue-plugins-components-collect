import { defineComponent, ref, PropType, computed, watch } from 'vue';
import { cloneDeep } from 'lodash';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import abnormalReason from '@/pages/abnormal-reason/service/abnormal-reason.service';

export default defineComponent({
  name: 'AddUpdateDialog',
  props: {
    abnormalReasonDetail: {
      type: Object as PropType<AbnormalReasonModule.AbnormalReasonInfo>,
      defualt: {},
    },
    abnormalList: {
      type: Array as PropType<OperateSuggestionModule.AbnormalInfo[]>,
      default: [],
    },
    isAddFlag: {
      type: Boolean,
      default: true,
    },
    dialogOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['success'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    let ruleForm = ref(ElForm);
    const dialogFormVisible = ref<boolean>(props.dialogOpen);
    const reqLoading = ref(false);
    // 异常原因列表
    const abnormalList = computed(() => {
      let list = cloneDeep(props.abnormalList);
      if (list.length > 0) {
        if (list[0].name === '全部') {
          list.shift();
        }
      }
      return list;
    });
    const isAddFlag = computed(() => {
      return props.isAddFlag;
    });

    // 表单
    const pageForm = ref<{ name: string; typeIdList: number[] }>({
      name: '',
      typeIdList: abnormalList.value.length > 0 ? [abnormalList.value[0].id] : [],
    });
    if (!isAddFlag.value) {
      pageForm.value.name = (props.abnormalReasonDetail && props.abnormalReasonDetail.name) || '';
      pageForm.value.typeIdList =
        props.abnormalReasonDetail && props.abnormalReasonDetail.typeId
          ? props.abnormalReasonDetail.typeId.split(',').map((item) => {
              return Number(item);
            })
          : [];
    }
    // 表单校验
    const rules = {
      name: [{ required: true, message: '异常原因不能为空', trigger: 'blur' }],
      typeIdList: [
        {
          required: true,
          message: '所属异常不能为空！',
          trigger: 'change',
        },
      ],
    };
    // 表单提交
    const onSubmit = async () => {
      ruleForm.value.validate(async (valid: boolean) => {
        if (valid) {
          const params = {
            name: pageForm.value.name,
            typeIdList: pageForm.value.typeIdList,
          };
          reqLoading.value = true;
          try {
            const res = props.isAddFlag
              ? await abnormalReason.getAbnormalReasonCreate(params)
              : await abnormalReason.getAbnormalReasonUpdate({
                  ...params,
                  id: props.abnormalReasonDetail && props.abnormalReasonDetail.id ? props.abnormalReasonDetail.id : 0,
                });
            if (res.code == 200 && res.success) {
              context.emit('success');
              dialogFormVisible.value = false;
              reqLoading.value = false;
              proxy.$message.success(res.message);
              ruleForm.value.resetFields();
            } else {
              reqLoading.value = false;
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                proxy.$message.error(res.message || '操作失败');
              }
            }
          } catch (error) {
            reqLoading.value = false;
            proxy.$message.error('操作失败');
          }
        }
      });
    };
    // 打开
    const show = () => {
      dialogFormVisible.value = true;
    };
    // 关闭前
    const onBeforeClose = () => {
      dialogFormVisible.value = false;
      ruleForm.value.resetFields();
    };
    /**
     * 监听数据变化
     */
    watch(
      () => props.abnormalReasonDetail,
      (newVal) => {
        if (props.isAddFlag) {
          pageForm.value.name = '';
          pageForm.value.typeIdList = [];
        } else {
          pageForm.value.name = newVal && newVal.name ? newVal.name : '';
          pageForm.value.typeIdList =
            newVal && newVal.typeId
              ? newVal.typeId.split(',').map((item) => {
                  return Number(item);
                })
              : [];
        }
      },
    );
    return {
      abnormalList,
      dialogFormVisible,
      rules,
      pageForm,
      isAddFlag,
      ruleForm,
      onSubmit,
      show,
      onBeforeClose,
    };
  },
});
