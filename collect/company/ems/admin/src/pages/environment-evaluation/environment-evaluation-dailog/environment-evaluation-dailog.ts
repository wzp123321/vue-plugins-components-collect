import { cloneDeep } from 'lodash';
import { defineComponent, reactive, ref, computed, toRefs, PropType, watch, onMounted } from 'vue';
import { ElForm, ElMessageBox } from 'element-plus';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { useCommonController } from '@/utils/use-common-controller';
import environmentEvaluationService from '@/pages/environment-evaluation/service/environment-evaluation.service';

interface EnvironmentDialogState {
  pageForm: {
    id: number;
    description?: string;
    upper: number;
    lower: number;
    energyCodeName: string | null;
    energyCode: string;
  };
  // 采样类型-能源编码 name
  energylList: any[];
  environmentAllList: any[];
  reqLoading: boolean;
}
export default defineComponent({
  // 父组件传过来的值
  props: {
    // 传过来的参数赋值给input框
    environmentEvaluationDetail: {
      type: Object as PropType<EnvironmentEvaluationModule.EnvironmentEvaluationInfo>,
      default: {},
    },
    dialogShow: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['success'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const environmentState = reactive<EnvironmentDialogState>({
      // 初始值
      pageForm: {
        description: '',
        upper: 0,
        lower: 0,
        id: 0,
        energyCodeName: '',
        energyCode: '',
      },
      energylList: [],
      environmentAllList: [],
      reqLoading: false,
    });
    let ruleForm = ref(ElForm);
    const dialogFormVisible = ref<boolean>(props.dialogShow);
    const rules = reactive({
      upper: [{ required: true, message: '请输入品质上限', trigger: 'blur' }],
      lower: [{ required: true, message: '请输入品质下限', trigger: 'blur' }],
    });
    //判断品质区间上下限是否重叠
    const getIsOverlap = (arr: any, upper: number, lower: number, id: number): boolean => {
      for (const key in arr) {
        if (arr[key].id === id) {
          continue;
        }
        if (arr[key].upper >= upper && upper >= arr[key].lower) {
          // 重叠
          return true;
        }
        if (arr[key].upper >= lower && lower >= arr[key].lower) {
          // 重叠
          return true;
        }
        if (upper >= arr[key].upper && arr[key].upper >= lower) {
          // 重叠
          return true;
        }
        if (upper >= arr[key].lower && arr[key].lower >= lower) {
          // 重叠
          return true;
        }
      }
      // 不重叠
      return false;
    };
    // 表单提交
    const onSubmit = async () => {
      //   验证表单规则
      ruleForm.value.validate(async (valid: boolean) => {
        const upper: number = environmentState.pageForm.upper;
        const lower: number = environmentState.pageForm.lower;
        if (valid) {
          // 判断下限是否大于上限
          if (Number(upper) < Number(lower)) {
            return proxy.$message.error('"品质下限"不能大于"品质上限"');
          } else {
            const result = getIsOverlap(
              environmentState.environmentAllList,
              upper,
              lower,
              environmentState.pageForm.id,
            );
            // true重叠 false不重叠
            if (result) {
              proxy.$message.error('所选范围已存在，请重新选择！');
            } else {
              // 不重叠就发送请求把值传给后端
              try {
                environmentState.energylList.forEach((item) => {
                  if (item.name === environmentState.pageForm.energyCodeName) {
                    // console.log(item.code+'-----'+item.name);
                    environmentState.pageForm.energyCode = item.code;
                  }
                });
                if (environmentState.pageForm.energyCodeName === '--') {
                  environmentState.pageForm.energyCodeName = null;
                }
                const params = cloneDeep(environmentState.pageForm);
                const res = await environmentEvaluationService.getEnvironmentEvaluationUpdate({
                  energyCode: params?.energyCode,
                  energyCodeName: params?.energyCodeName,
                  id: params?.id,
                  lower: params?.lower,
                  upper: params?.upper,
                });
                if (res.code == 200 && res.success) {
                  context.emit('success', environmentState.pageForm);
                  ruleForm.value.resetFields();
                  dialogFormVisible.value = false;
                } else {
                  if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                    proxy.$message.error(res.message || '操作失败');
                  }
                }
              } catch (error) {
                proxy.$message.error('操作失败！');
              }
            }
          }
        }
      });
    };
    const getEnergylList = () => {
      environmentState.energylList = [
        { code: '', name: '--' },
        { code: 'N1000', name: '温度' },
        { code: 'N2000', name: '湿度' },
        { code: 'N6000', name: '二氧化碳' },
        { code: 'N7000', name: 'PM2.5' },
        { code: 'N8000', name: '一氧化碳' },
      ];
    };
    // 查询所有环境评价的list
    const getEnvironmentList = async () => {
      try {
        const res = await environmentEvaluationService.getEnvironmentEvaluationAllList(
          environmentState.environmentAllList,
        );
        if (res && res.code === 200 && res.data) {
          environmentState.environmentAllList = res.data;
        } else {
          environmentState.environmentAllList = [];
        }
      } catch (error) {
        proxy.$message.error('获取失败');
      }
    };
    // 重置
    // const onReset = () => {
    //     console.log('onReset');
    //     // 把值回显
    //     environmentState.pageForm = cloneDeep(props.environmentEvaluationDetail)
    //     console.log(props.environmentEvaluationDetail);
    // }
    // 打开
    const show = () => {
      dialogFormVisible.value = true;
    };
    onMounted(async () => {
      // console.log(props.environmentEvaluationDetail.energyCodeName);
      environmentState.pageForm = cloneDeep(props.environmentEvaluationDetail);
      // 能源编码--采样类型
      getEnergylList();
      await getEnvironmentList();
    });
    // 关闭前
    const onBeforeClose = () => {
      dialogFormVisible.value = false;
      ruleForm.value.resetFields();
    };
    return {
      ...toRefs(environmentState),
      dialogFormVisible,
      rules,
      ruleForm,
      onSubmit,
      show,
      onBeforeClose,
    };
  },
});
