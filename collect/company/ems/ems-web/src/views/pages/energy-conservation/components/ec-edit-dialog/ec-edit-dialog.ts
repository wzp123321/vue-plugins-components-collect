import { defineComponent, reactive, ref } from 'vue';
import EnergyConservationServation from '@/services/energy-conservation/energy-conservation.service';
import useCurrentInstance from '@/utils/use-current-instance';
import { ElMessageBox, ElForm } from 'element-plus';

export default defineComponent({
  props: ['editData'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const ruleForm = ref(ElForm);
    const disabledValue = true;
    const Form = ref<any>();
    let arr = [];

    /**
     * 校验数据
     * @param rule
     * @param value
     * @param callback
     */
    const validateData = (rule: any, value: any, callback: any) => {
      console.log('%c🚀 ~ ec-edit-dialog.ts ~ 22行', 'font-size: 18px', value);
      if (value === '0') {
        callback(new Error('请输入正数'));
      } else if (!value) {
        callback(new Error('定额值不能为空'));
      } else {
        callback();
      }
    };

    const rules = reactive({
      treeName: [{ required: true, message: '分析对象不能为空', trigger: 'blur' }],
      quotaTimeCopy: [{ required: true, message: '日期不能为空', trigger: 'blur' }],
      quotaValue: [{ required: true, validator: validateData, trigger: 'blur' }],
    });
    Form.value = { ...props.editData };
    console.log(Form.value);
    // 格式化选择年、月
    if (Form.value.quotaTime && Form.value.quotaType == 1) {
      arr = Form.value.quotaTime.split(' ');
      const index = arr[0].lastIndexOf('-');
      const c = arr[0].slice(0, index);
      Form.value.quotaTimeCopy = c;
    } else if (Form.value.quotaTime && Form.value.quotaType == 2) {
      arr = Form.value.quotaTime.split(' ');
      const index = arr[0].indexOf('-');
      const c = arr[0].slice(0, index);
      Form.value.quotaTimeCopy = c;
    }
    const onCancel = () => {
      context.emit('dialogEditCancel');
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
        console.log('%c🚀 ~ ec-edit-dialog.ts ~ 46行', 'font-size: 18px', flag);

        if (flag) {
          const { id, highAlarm, highWarning, lowAlarm, lowWarning, quotaValue, energyCode, quotaType, treeId } =
            Form.value;
          const obj: any = {
            highAlarm,
            highWarning,
            id,
            treeId,
            inputSource: 1,
            lowAlarm,
            lowWarning,
            quotaValue,
            energyCode,
            quotaType,
            quotaTime: Form.value.quotaTimeCopy,
          };
          for (const i in obj) {
            if (obj.id) {
            } else if (typeof obj[i] == 'number' || (typeof obj[i] == 'string' && obj[i].length >= 1)) {
              obj[i] = Number(obj[i]);
            } else {
              obj[i] = null;
            }
          }
          if (Form.value?.quotaType === 2) {
            ElMessageBox.confirm('当年月定额值会统一刷新成年定额值的平均值，是否确定？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'success',
            }).then(async () => {
              const res = await EnergyConservationServation.getTreeBindRefresh(obj);
              if (res && res.code === 200 && res.success) {
                context.emit('dialogEditSure');
                proxy.$message.success(res.message);
              } else {
                if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
                  proxy.$message.error(res.message || '编辑失败');
                }
              }
            });
          } else {
            const res = await EnergyConservationServation.getTreeBindRefresh(obj);
            if (res && res.code === 200 && res.success) {
              context.emit('dialogEditSure');
              proxy.$message.success(res.message);
            } else {
              if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
                proxy.$message.error(res.message || '编辑失败');
              }
            }
          }
        }
      } catch (err) {
        return proxy.$message.error('编辑失败');
      }
    };

    const energyUnit = ref<string>();
    return {
      Form,
      ruleForm,
      disabledValue,
      rules,
      energyUnit,
      onCancel,
      onSure,
    };
  },
});
