import { defineComponent, ref, PropType, computed, watch, reactive, onMounted, toRefs } from 'vue';
import { cloneDeep } from 'lodash';
import { ElForm } from 'element-plus';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
// index
import basicParamConfigService from '@/pages/basic-param-config/service/basic-param-config.service';

interface BasicState {
  alarmLower: number | string;
  alarmUpper: number | string;
  comfortableLower: number | string;
  comfortableUpper: number | string;
  energyCode: string | null; // 能源编码
  energyCodeName: string; // 能源名称
  id: number;
  seasonId: number | null;
  seasonName?: string;
  weight: number | string;
}

export default defineComponent({
  name: 'basicDialog',
  props: {
    basicParamConfigDetail: {
      type: Object as PropType<BasicParamConfigModule.BasicParamConfigInfo>,
      defualt: {},
    },
    energylList: {
      type: Array,
      default: [],
    },
    seasonList: {
      type: Array,
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
    let ruleForm = ref(ElForm);
    const { proxy } = useCurrentInstance();
    const dialogFormVisible = ref<boolean>(props.dialogOpen);
    const flag = ref<boolean>(true); // true-温度，false不为温度
    let aUpperValue: any = ''; //记录上次一次告警上限合法的温度值
    let aLowerValue: any = ''; //记录上次一次告警下限合法的温度值
    let cUpperValue: any = ''; //记录上次一次舒适上限合法的温度值
    let cLowerValue: any = ''; //记录上次一次舒适下限合法的温度值
    // 采样类型-能源名称
    const energylList = computed(() => {
      if (props.energylList && props.energylList.length > 0) {
        let list: any[] = cloneDeep(props.energylList);
        if (list[0].name === '所有采样') {
          list.shift();
        }
        return list;
      }
    });
    const isAddFlag = computed(() => {
      return props.isAddFlag;
    });
    // 表单
    const pageForm = reactive<BasicState>({
      alarmLower: '',
      alarmUpper: '',
      comfortableLower: '',
      comfortableUpper: '',
      energyCode: null, // 能源编码
      energyCodeName: '', // 能源名称
      id: 0,
      seasonName: '',
      seasonId: 0,
      weight: '',
    });

    if (isAddFlag.value) {
      // 新增默认赋值
      let energy: any = props.energylList[1];
      let season: any = props.seasonList[0];
      pageForm.energyCode = energy && energy.code ? energy.code : '';
      pageForm.seasonId = season && season.id ? season.id : '';
      if (pageForm.energyCode === 'N1000') {
        flag.value = true;
      } else {
        flag.value = false;
      }
    } else {
      // console.log(props.seasonList);
      // 编辑
      pageForm.alarmLower =
        props.basicParamConfigDetail?.alarmLower || Number(props.basicParamConfigDetail?.alarmLower);
      pageForm.alarmUpper =
        props.basicParamConfigDetail?.alarmUpper || Number(props.basicParamConfigDetail?.alarmUpper);
      pageForm.comfortableLower =
        props.basicParamConfigDetail?.comfortableLower || Number(props.basicParamConfigDetail?.comfortableLower);
      pageForm.comfortableUpper =
        props.basicParamConfigDetail?.comfortableUpper || Number(props.basicParamConfigDetail?.comfortableUpper);
      pageForm.id = props.basicParamConfigDetail?.id || Number(props.basicParamConfigDetail?.id);
      pageForm.energyCode = props.basicParamConfigDetail?.energyCode || '';
      pageForm.energyCodeName = props.basicParamConfigDetail?.energyCodeName || '';
      pageForm.seasonId = props.basicParamConfigDetail?.seasonId || Number(props.basicParamConfigDetail?.seasonId);
      pageForm.seasonName = props.basicParamConfigDetail?.seasonName;
      pageForm.weight = Number(props.basicParamConfigDetail?.weight);
      if (props.basicParamConfigDetail?.seasonName === null) {
        pageForm.seasonId = null;
        pageForm.seasonName = '';
      }
      if (pageForm.energyCode === 'N1000') {
        flag.value = true;
      } else {
        flag.value = false;
      }
    }

    // 告警上限
    const onFocus = (val: any) => {
      if (!isAddFlag.value) {
        aUpperValue = val;
      }
    };

    const resetValue = (value: any) => {
      if (value == '' || value == '-') {
        aUpperValue = value;
        return value;
      }

      let reg = new RegExp(/^-?[0-9]{1,10}([\.][0-9]{0,4})?$/);
      if (!reg.test(value)) {
        return aUpperValue;
      }

      if (value.indexOf('0') == 0) {
        //0开头
        if (value.length > 1 && value.substring(1, 2) != '.') {
          //如果长度大于1，并且第2位不是小数点
          return aUpperValue;
        }
      }

      if (value.indexOf('-0') == 0) {
        //0开头
        if (value.length > 2 && value.substring(2, 3) != '.') {
          //如果长度大于2，并且第3位不是小数点
          return aUpperValue;
        }
      }
      aUpperValue = value; //保存当前合法的值
      return value;
    };
    const resetValues = (value: any) => {
      return resetValue(value.toString());
    };

    // 舒适上限

    const onFocus2 = (val: any) => {
      if (!isAddFlag.value) {
        cUpperValue = val;
      }
    };

    const resetValue2 = (value: any) => {
      if (value == '' || value == '-') {
        cUpperValue = value;
        return value;
      }

      let reg = new RegExp(/^-?[0-9]{1,10}([\.][0-9]{0,4})?$/);
      if (!reg.test(value)) {
        return cUpperValue;
      }

      if (value.indexOf('0') == 0) {
        //0开头
        if (value.length > 1 && value.substring(1, 2) != '.') {
          //如果长度大于1，并且第2位不是小数点
          return cUpperValue;
        }
      }

      if (value.indexOf('-0') == 0) {
        //0开头
        if (value.length > 2 && value.substring(2, 3) != '.') {
          //如果长度大于2，并且第3位不是小数点
          return cUpperValue;
        }
      }
      cUpperValue = value; //保存当前合法的值
      return value;
    };
    const resetValues2 = (value: any) => {
      return resetValue2(value.toString());
    };

    // 舒适下限
    const onFocus3 = (val: any) => {
      if (!isAddFlag.value) {
        cLowerValue = val;
      }
    };

    const resetValue3 = (value: any) => {
      if (value == '' || value == '-') {
        cLowerValue = value;
        return value;
      }

      let reg = new RegExp(/^-?[0-9]{1,10}([\.][0-9]{0,4})?$/);
      if (!reg.test(value)) {
        return cLowerValue;
      }

      if (value.indexOf('0') == 0) {
        //0开头
        if (value.length > 1 && value.substring(1, 2) != '.') {
          //如果长度大于1，并且第2位不是小数点
          return cLowerValue;
        }
      }

      if (value.indexOf('-0') == 0) {
        //0开头
        if (value.length > 2 && value.substring(2, 3) != '.') {
          //如果长度大于2，并且第3位不是小数点
          return cLowerValue;
        }
      }
      cLowerValue = value; //保存当前合法的值
      return value;
    };
    const resetValues3 = (value: any) => {
      return resetValue3(value.toString());
    };

    // 告警下限
    const onFocus4 = (val: any) => {
      if (!isAddFlag.value) {
        aLowerValue = val;
      }
    };

    const resetValue4 = (value: any) => {
      if (value == '' || value == '-') {
        aLowerValue = value;
        return value;
      }

      let reg = new RegExp(/^-?[0-9]{1,10}([\.][0-9]{0,4})?$/);
      if (!reg.test(value)) {
        return aLowerValue;
      }

      if (value.indexOf('0') == 0) {
        //0开头
        if (value.length > 1 && value.substring(1, 2) != '.') {
          //如果长度大于1，并且第2位不是小数点
          return aLowerValue;
        }
      }

      if (value.indexOf('-0') == 0) {
        //0开头
        if (value.length > 2 && value.substring(2, 3) != '.') {
          //如果长度大于2，并且第3位不是小数点
          return aLowerValue;
        }
      }
      aLowerValue = value; //保存当前合法的值
      return value;
    };
    const resetValues4 = (value: any) => {
      return resetValue4(value.toString());
    };

    // 判断告警上限>舒适上限>舒适下限>告警下限
    const isTrue = (alarmUpper: number, comfortableUpper: number, comfortableLower: number, alarmLower: number) => {
      if (alarmUpper <= comfortableUpper) {
        proxy.$message.error('告警上限必须大于舒适上限');
        return false;
      } else if (comfortableUpper <= comfortableLower) {
        proxy.$message.error('舒适上限必须大于舒适下限');
        return false;
      } else if (comfortableLower <= alarmLower) {
        proxy.$message.error('舒适下限必须大于告警下限');
        return false;
      }
      return true;
    };
    // 表单校验
    const rules = reactive({
      // 告警上限
      alarmUpper: [{ required: true, message: '请输入告警上限', trigger: 'blur' }],
      // 舒适上限
      comfortableUpper: [{ required: true, message: '请输入舒适上限', trigger: 'blur' }],
      // 舒适下限
      comfortableLower: [{ required: true, message: '请输入舒适下限', trigger: 'blur' }],
      // 告警下限
      alarmLower: [{ required: true, message: '请输入告警下限', trigger: 'blur' }],
      // 权重
      weight: [{ required: true, message: '请输入权重', trigger: 'blur' }],
    });
    // 表单提交
    const onSubmit = async () => {
      ruleForm.value.validate(async (valid: boolean) => {
        // console.log(valid);
        if (valid) {
          const energylList: any[] = cloneDeep(props.energylList);
          energylList.forEach((item) => {
            if (item.code === pageForm.energyCode) {
              pageForm.energyCodeName = item.name;
            }
          });
          const params: any = {
            alarmLower: Number(pageForm.alarmLower),
            alarmUpper: Number(pageForm.alarmUpper),
            comfortableLower: Number(pageForm.comfortableLower),
            comfortableUpper: Number(pageForm.comfortableUpper),
            energyCode: pageForm.energyCode,
            energyCodeName: pageForm.energyCodeName, // 能源名称
            id: pageForm.id,
            seasonId: pageForm.seasonId,
            weight: Number(pageForm.weight),
          };
          const result = isTrue(params.alarmUpper, params.comfortableUpper, params.comfortableLower, params.alarmLower);
          if (result) {
            try {
              //   新增/修改
              const res = props.isAddFlag
                ? await basicParamConfigService.getBasicParamConfigCreate({
                    alarmLower: Number(pageForm.alarmLower),
                    alarmUpper: Number(pageForm.alarmUpper),
                    comfortableLower: Number(pageForm.comfortableLower),
                    comfortableUpper: Number(pageForm.comfortableUpper),
                    energyCode: pageForm.energyCode ?? '',
                    energyCodeName: pageForm.energyCodeName, // 能源名称
                    seasonId: pageForm.seasonId,
                    weight: Number(pageForm.weight),
                  })
                : await basicParamConfigService.getBasicParamConfigUpdate(params);
              //   await basicParamConfigService.getBasicParamConfigUpdate({});
              if (res.code == 200 && res.success) {
                context.emit('success');
                dialogFormVisible.value = false;
                proxy.$message.success(res.message);
                ruleForm.value.resetFields();
              } else {
                if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                  proxy.$message.error(res.message || '操作失败');
                }
              }
            } catch (error) {
              proxy.$message.error('操作失败');
            }
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

    const addReset = () => {
      if (isAddFlag.value) {
        pageForm.alarmLower = '';
        pageForm.alarmUpper = '';
        pageForm.comfortableLower = '';
        pageForm.comfortableUpper = '';
        pageForm.weight = '';
        aLowerValue = '';
        aUpperValue = '';
        cLowerValue = '';
        cUpperValue = '';
      }
    };

    /**
     * 监听数据变化
     */
    watch(
      () => props.basicParamConfigDetail,
      (newVal) => {
        if (props.isAddFlag) {
          pageForm.energyCode = '';
        } else {
          pageForm.energyCode = newVal && newVal.energyCode ? newVal.energyCode : '';
        }
      },
    );
    /**
     * 监听采样类型变化
     */
    watch(
      () => pageForm.energyCode,
      (newVal) => {
        if (newVal === 'N1000') {
          flag.value = true;
          addReset();
        } else {
          flag.value = false;
          addReset();
        }
      },
    );

    onMounted(async () => {});
    return {
      onBeforeClose,
      energylList,
      dialogFormVisible,
      rules,
      ...toRefs(pageForm),
      pageForm,
      isAddFlag,
      ruleForm,
      onSubmit,
      show,
      isTrue,
      resetValues,
      resetValues2,
      resetValues3,
      resetValues4,
      flag,
      onFocus,
      onFocus2,
      onFocus3,
      onFocus4,
    };
  },
});
