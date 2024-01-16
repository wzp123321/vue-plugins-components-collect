import { defineComponent, reactive, watch, ref, onMounted, computed, PropType } from 'vue';
import CommonService from '@/services/common/common.service';
import EnergyConservationServation from '@/services/energy-conservation/energy-conservation.service';

import { quotaTypeList } from '@/config/config';
import { CHOOSETIME } from '@/config/enum';
import { ElMessageBox, ElForm } from 'element-plus';

import { cloneDeep } from 'lodash';
import useCurrentInstance from '@/utils/use-current-instance';
import { useCommonController } from '@/utils/use-common-controller';

export interface TreeData {
  [key: string]: any;
}
export interface getAnalysisTreeDataType {
  treeType: any;
}

export default defineComponent({
  props: {
    energyTypeData: {
      type: Array as PropType<EnergyCodeManageModule.EnergyInfo[]>,
    },
    kpiDingeType: { type: String || Number },
    energyConservationEnergyCode: { type: String || Number },
  },
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const { getTreeListWithExpandKeys } = useCommonController();

    const ruleForm = ref(ElForm);
    // 能源类型
    const energyTypeData = computed(() => {
      // 数组第一位为前端加入的空数据'全部'，用于获取全部类型的数据，需要去掉
      return props.energyTypeData?.slice(1);
    });
    const energyUnit = ref<string>();
    if (energyTypeData.value && energyTypeData.value.length > 0) {
      energyUnit.value = energyTypeData.value[0].unit;
    }

    // 能源类型展开
    const codeExpandedKeys = ref<string[]>([]);
    const dingeTypeData: GlobalModule.CommonObject[] = [
      {
        label: '月',
        value: 1,
      },
    ];

    const analysisObjectData = ref<TreeData[]>([]);
    const radioData = proxy.$emsConfig.treeTypeList;
    const analysisObjectExpanedKeys = ref<number[]>([]);
    const treeLoading = ref<boolean>(false);

    let defaultTime;
    const date = new Date();
    const year = date.getFullYear();
    let month: any = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    const mydate = year.toString() + '-' + month.toString();
    defaultTime = mydate;
    const Form = reactive<any>({
      energyType: [],
      analysisObject: [],
      radioValue: 1,
      dingeType: 1,
      monthDate: defaultTime,
      dingeValue: '',
      firstWarning: '',
      secondWarning: '',
      firstAlarm: '',
      secondAlarm: '',
    });
    // 监听定额类型切换来改变月和年的默认值
    watch(
      () => Form.dingeType,
      (newVal: number) => {
        const date = new Date();
        const year = date.getFullYear();
        let month: number | string = date.getMonth() + 1;
        month = month < 10 ? '0' + month : month;
        if (newVal == 1) {
          const mydate = year.toString() + '-' + month.toString();
          defaultTime = mydate;
        } else {
          defaultTime = year.toString();
        }
        Form.monthDate = defaultTime;
      },
    );

    /**
     * 校验数据
     * @param rule
     * @param value
     * @param callback
     */
    const validateData = (rule: any, value: any, callback: any) => {
      if (value === '0') {
        callback(new Error('请输入正数'));
      } else if (!value) {
        callback(new Error('请输入定额值'));
      } else {
        callback();
      }
    };

    Form.energyType = energyTypeData.value && energyTypeData.value.length > 0 ? energyTypeData.value[0].code : null;
    const cloneForm = cloneDeep(Form);
    const rules = reactive({
      analysisObject: [{ required: true, message: '请选择分析对象', trigger: 'blur' }],
      monthDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
      dingeValue: [{ required: true, validator: validateData, trigger: 'blur' }],
    });
    /**
     * 获取分析对象数据
     */
    const getAnalysisTreeData = async (param: getAnalysisTreeDataType) => {
      try {
        treeLoading.value = true;
        const res = await getTreeListWithExpandKeys(param.treeType, Form.energyType, 2, true);
        if (res && res?.data) {
          analysisObjectData.value = res.data ?? [];
          analysisObjectExpanedKeys.value = res.expandTreeIds ?? [];
          Form.analysisObject = res.data && res.data.length > 0 ? [res.data[0].id] : [];
        } else {
          analysisObjectData.value = [];
          analysisObjectExpanedKeys.value = [];
          Form.analysisObject = [];
        }
      } catch {
        analysisObjectData.value = [];
        analysisObjectExpanedKeys.value = [];
        Form.analysisObject = [];
        Form.value = false;
      } finally {
        treeLoading.value = false;
      }
    };
    const treeRaidoChange = () => {
      getAnalysisTreeData({
        treeType: Form.radioValue,
      });
    };
    const treeSelectChange = () => {
      // console.log(formInline.analysisObject);
    };
    const onCancel = () => {
      Object.assign(Form, cloneForm);
      context.emit('dialogCancel');
    };
    const onSure = async () => {
      try {
        let flag;
        ruleForm.value.validate((valid: boolean) => {
          if (valid) {
            flag = true;
          } else {
            return false;
          }
        });
        if (flag) {
          const obj: any = {
            energyCode: Form.energyType,
            inputSource: 1,
            quotaTime: Form.monthDate,
            quotaType: Form.dingeType,
            quotaValue: Form.dingeValue,
            treeId: Form.analysisObject[0],
          };
          if (Form?.dingeType === 2) {
            ElMessageBox.confirm('当年月定额值会统一刷新成年定额值的平均值，是否确定？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'success',
            }).then(async () => {
              const res = await EnergyConservationServation.addUrl(obj);
              if (res && res.code === 200 && res.success) {
                context.emit('successFn', 'true');
                proxy.$message.success(res.message);
              } else {
                if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
                  proxy.$message.error(res.message || '新增失败');
                }
              }
            });
          } else {
            const res = await EnergyConservationServation.addUrl(obj);
            if (res && res.code === 200 && res.success) {
              context.emit('successFn', 'true');
              proxy.$message.success(res.message);
            } else {
              if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
                proxy.$message.error(res.message || '新增失败');
              }
            }
          }
        }
      } catch (err) {
        return proxy.$message.error('新增失败');
      }
    };
    // 定额类型change
    const onTypeChange = () => {
      Form.dingeValue = '';
    };
    onMounted(async () => {
      if (props.energyConservationEnergyCode && props.kpiDingeType) {
        Form.energyType = props.energyConservationEnergyCode;
        Form.dingeType = Number(props.kpiDingeType);
        Form.radioValue = 1;
        await getAnalysisTreeData({
          treeType: 1,
        });
      } else {
        await getAnalysisTreeData({
          treeType: Form.radioValue,
        });
      }
    });
    // 切换能源类型
    const energyChange = (itemCode: string) => {
      energyTypeData.value?.map((item: EnergyCodeManageModule.EnergyInfo) => {
        if (itemCode === item.code) {
          energyUnit.value = item.unit;
        }
      });
      getAnalysisTreeData({
        treeType: Form.radioValue,
      });
    };
    return {
      CHOOSETIME,
      Form, // 新增表单数据
      energyTypeData, // 能源类型数据
      energyUnit,
      codeExpandedKeys,
      dingeTypeData, // 定额类型数据
      ruleForm, // 节点
      cloneForm, // 深拷贝表单数据
      rules, // 规则
      analysisObjectData, // 分析对象数据
      radioData, // 分析对象按钮组内容
      analysisObjectExpanedKeys, // 分析对象展开节点
      treeLoading,

      onCancel, // 取消事件
      onSure, // 确认事件
      getAnalysisTreeData, // 获取分析对象数据源事件
      treeRaidoChange, // 分析对象按钮切换事件
      treeSelectChange, // 分析对象树节点更改事件
      onTypeChange,
      energyChange,
    };
  },
});
