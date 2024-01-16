import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { parseISO } from 'date-fns/fp';
import { ElForm, ElMessageBox } from 'element-plus';
import { useCommonController } from '@/utils/use-common-controller';
import useCurrentInstance from '@/utils/use-current-instance';

import { CHOOSETIME } from '@/config/enum';
import { format } from 'date-fns';

import CommonService from '@/services/common/common.service';
import KPIQuota from '../services/kpi-quota-configuration';

export interface TreeData {
  [key: string]: any;
}
export default defineComponent({
  props: {
    dialogAdd: {
      type: Boolean,
      default: false,
    },
    KPITypeData_copys: {},
    rows: {},
    analysisObjectData: {},
    kpiDingeType: { type: Number || String },
    kpiTypeId: { type: Number || String },
  },
  setup(props, context) {
    const { getTreeListWithExpandKeys } = useCommonController();
    const { proxy } = useCurrentInstance();
    const dingeTypeData = ref<KPIQuota.CommonObject[]>([]);
    const ruleForm = ref(ElForm);
    const date = new Date();
    const year = date.getFullYear();
    let month: number | string = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    const mydate = year.toString() + '-' + month.toString();
    let defaultTime = mydate;
    const dialogFormVisibleAdd = ref<boolean>(false);
    dialogFormVisibleAdd.value = props.dialogAdd;
    const Form = ref<any>({
      KPIType: '',
      analysisObject: [],
      radioValue: 1,
      dingeType: 1,
      monthDate: defaultTime,
      dingeValue: '',
      consumptionValue: '',
    });
    const quotaUnit = ref('');
    const consumeUnit = ref('');
    const analysisObjectData = ref<any>([]);
    const radioData = proxy.$emsConfig.treeTypeList;
    const analysisObjectExpanedKeys = ref<number[]>([]);
    const treeLoading = ref<boolean>(false);

    let KPITypeData = reactive<any>([]);
    const rows: any = props.rows ? props.rows : null;
    KPITypeData = props.KPITypeData_copys;
    const formatObj = ref<any>({ integral: 10, decimal: 2 });
    if (KPITypeData.length) {
      Form.value.KPIType = KPITypeData[0].kpiTypeId;
    }
    if (Array.isArray(KPITypeData) && KPITypeData.length) {
      dingeTypeData.value = KPITypeData[0].quotaTypeList || [];
      Form.value.dingeType = dingeTypeData.value[0].quotaType;
      quotaUnit.value = KPITypeData[0].quotaUnit;
      consumeUnit.value = KPITypeData[0].consumeUnit;
    }
    if (rows) {
      Form.value.KPIType = rows.manageTypeId;
      Form.value.analysisObject = [rows.treeId];
      Form.value.dingeType = rows.quotaType;
      Form.value.monthDate =
        rows.quotaType === '1' ? format(parseISO(rows.quotaTime), 'yyyy-MM') : format(parseISO(rows.quotaTime), 'yyyy');
      Form.value.dingeValue = rows.quotaValue;
      Form.value.consumptionValue = rows.consumeValue;
      quotaUnit.value = rows.quotaUnit;
      consumeUnit.value = rows.consumeUnit ? rows.consumeUnit : '';
    }

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

    const rules = reactive({
      analysisObject: [{ required: true, message: '请选择分析对象', trigger: 'blur' }],
      monthDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
      dingeValue: [{ required: true, validator: validateData, trigger: 'blur' }],
      consumptionValue: [{ required: true, message: '请输入消耗值', trigger: 'blur' }],
    });

    watch(
      () => Form.value.KPIType,
      (newVal: any) => {
        console.log(newVal, 1111);
        Form.value.consumptionValue = null;
        if (newVal === 1 || newVal === 2) {
          formatObj.value = {
            integral: Form.value.dingeType === 1 ? 10 : 12,
            decimal: 0,
          };
        } else {
          formatObj.value = {
            integral: Form.value.dingeType === 1 ? 10 : 12,
            decimal: 2,
          };
        }
        KPITypeData.forEach((item: any) => {
          if (item.kpiTypeId === Form.value.KPIType) {
            dingeTypeData.value = item.quotaTypeList || [];
            if (!props.kpiDingeType || (!props.kpiTypeId && props.kpiTypeId !== 0)) {
              Form.value.dingeType = dingeTypeData.value[0].quotaType;
            }

            quotaUnit.value = item.quotaUnit;
            consumeUnit.value = item.consumeUnit;
            Form.value.consumptionValue = consumeUnit.value ? Form.value.consumptionValue : null;
            //  consumeUnit.value=rows.consumeUnit?rows.consumeUnit:''
          }
        });
      },
    );
    // 监听定额类型切换来改变月和年的默认值
    watch(
      () => Form.value.dingeType,
      (newVal: number | any) => {
        const date = new Date();
        const year = date.getFullYear();
        let month: number | string = date.getMonth() + 1;
        month = month < 10 ? '0' + month : month;
        if (newVal === 1) {
          const mydate = year.toString() + '-' + month.toString();
          defaultTime = mydate;
        } else {
          defaultTime = year.toString();
        }
        Form.value.monthDate = defaultTime;
      },
    );
    /**
     * 获取分析对象数据
     */
    const getAnalysisTreeData = async (param: any) => {
      try {
        treeLoading.value = true;
        const res = await getTreeListWithExpandKeys(param.treeType, '00000', 2, true);
        if (res && res?.data) {
          analysisObjectData.value = res.data ?? [];
          analysisObjectExpanedKeys.value = res.expandTreeIds ?? [];
          Form.value.analysisObject = res.data && res.data.length > 0 ? [res.data[0].id] : [];
        } else {
          analysisObjectData.value = [];
          analysisObjectExpanedKeys.value = [];
          Form.value.analysisObject = [];
        }
      } catch {
        analysisObjectData.value = [];
        analysisObjectExpanedKeys.value = [];
        Form.value.analysisObject = [];
      } finally {
        treeLoading.value = false;
      }
    };
    const treeRaidoChange = () => {
      getAnalysisTreeData({
        treeType: Form.value.radioValue,
      });
    };
    const treeSelectChange = () => {
      // console.log(formInline.analysisObject);
    };
    // 确定按钮
    const onSure = async () => {
      try {
        let flag;
        //   验证表单规则
        ruleForm.value.validate((valid: boolean) => {
          if (valid) {
            flag = true;
          } else {
            return false;
          }
        });
        if (flag) {
          const obj = {
            consumeValue: Form.value.consumptionValue,
            inputSource: 1,
            manageTypeId: Form.value.KPIType,
            quotaTime: Form.value.monthDate,
            quotaType: Form.value.dingeType,
            quotaValue: Form.value.dingeValue,
            treeId: Form.value.analysisObject[0],
          };
          if (rows) {
            if (rows.quotaType === 2) {
              ElMessageBox.confirm('当年月定额值会统一刷新成年定额值的平均值，是否确定？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'success',
              })
                .then(async () => {
                  const editObj = {
                    ...obj,
                    id: rows.id,
                  };
                  const res = await KPIQuota.update(editObj);
                  if (res.code === 200 && res.success) {
                    context.emit('addOk');
                    proxy.$message.success(res.message);
                    dialogFormVisibleAdd.value = false;
                  } else {
                    if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
                      proxy.$message.error(res.message);
                    }
                  }
                  return;
                })
                .catch(() => {
                  console.log('cancel');
                });
            } else {
              const editObj = {
                ...obj,
                id: rows.id,
              };
              editObj.inputSource = rows.inputSource;
              const res = await KPIQuota.update(editObj);
              if (res.code === 200 && res.success) {
                context.emit('addOk');
                proxy.$message.success(res.message);
                dialogFormVisibleAdd.value = false;
              } else {
                if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
                  proxy.$message.error(res.message);
                }
              }
              return;
            }
            return;
          } else {
            // 新增
            if (Form.value.dingeType === 2) {
              ElMessageBox.confirm('当年月定额值会统一刷新成年定额值的平均值，是否确定？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'success',
              })
                .then(async () => {
                  const res = await KPIQuota.add(obj);
                  if (res.code === 200 && res.success) {
                    context.emit('addOk');
                    proxy.$message.success(res.message);
                    dialogFormVisibleAdd.value = false;
                  } else {
                    if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
                      proxy.$message.error(res.message);
                    }
                  }
                })
                .catch(() => {
                  console.log('cancel');
                });
            } else {
              const res = await KPIQuota.add(obj);
              if (res.code === 200 && res.success) {
                context.emit('addOk');
                proxy.$message.success(res.message);
                dialogFormVisibleAdd.value = false;
              } else {
                if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
                  proxy.$message.error(res.message);
                }
              }
            }
          }
        }
      } catch (err) {
        return proxy.$message.error('操作失败');
      }
    };
    // 切换定额类型
    const onTypeChange = () => {
      Form.value.dingeValue = '';
      Form.value.consumptionValue = '';
    };
    onMounted(async () => {
      console.log(props.rows);
      console.log(Form.value);

      if (!rows) {
        if (props.kpiDingeType && props.kpiTypeId) {
          Form.value.KPIType = props.kpiTypeId;
          Form.value.dingeType = String(props.kpiDingeType);
          Form.value.radioValue = 1;
          await getAnalysisTreeData({
            treeType: 1,
          });
        } else {
          await getAnalysisTreeData({
            treeType: Form.value.radioValue,
          });
        }
      } else {
        Form.value.KPIType = rows.manageTypeId;
        Form.value.analysisObject = [rows.treeId];
        Form.value.dingeType = rows.quotaType;
        Form.value.monthDate =
          rows.quotaType === '1'
            ? format(parseISO(rows.quotaTime), 'yyyy-MM')
            : format(parseISO(rows.quotaTime), 'yyyy');
        Form.value.dingeValue = rows.quotaValue;
        Form.value.consumptionValue = rows.consumeValue;
        quotaUnit.value = rows.quotaUnit;
        consumeUnit.value = rows.consumeUnit ? rows.consumeUnit : '';
      }
    });
    return {
      dialogFormVisibleAdd,
      KPITypeData,
      Form,
      CHOOSETIME,
      dingeTypeData,
      rules,
      analysisObjectData,
      treeLoading,
      radioData,
      analysisObjectExpanedKeys,
      quotaUnit,
      rows,
      consumeUnit,
      ruleForm,
      formatObj,

      treeRaidoChange,
      treeSelectChange,
      onSure,
      onTypeChange,
    };
  },
});
