import { defineComponent, reactive, ref, watch, computed, nextTick } from 'vue';
import { ElForm } from 'element-plus';
// utils
import message from '@/utils/message';
import useCurrentInstance from '@/utils/use-current-instance';
import { floatDivide, transferPercent, floatSub, getTenant, floatAdd } from '@/utils/index';

import BenchmarkValueMaintenanceService from '../../services/benchmark-value-maintenance.service';

export default defineComponent({
  name: 'bvmMonthlyProportion',
  props: ['householdNumberList', 'energyCode', 'num', 'energyCodeName'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const ruleForm = ref(ElForm);
    const dialogFormVisible = ref<boolean>(false); // 控制弹框显示隐藏
    /**
     * 表单回显数据
     */
    let householdNumberList: BenchmarkValueMaintenance.HouseholdNumberListVO = props.householdNumberList
      ? props.householdNumberList
      : {};

    const formLabelWidth = '120px'; // 用于控制表单label宽度样式
    const MonthlyProportionSum = ref<number>(0); // 十二个月比例总和，用于判断总和不超过100
    /**
     * 月度比例表表单
     */
    const form = reactive<BenchmarkValueMaintenance.MonthlyFormType>({
      january: undefined,
      february: undefined,
      march: undefined,
      april: undefined,
      may: undefined,
      june: undefined,
      july: undefined,
      august: undefined,
      september: undefined,
      october: undefined,
      november: undefined,
      december: undefined,
    });

    /**
     * 剩余比例值
     */
    const surplusValue = computed(() => {
      if (
        householdNumberList === null &&
        form.january === undefined &&
        form.february === undefined &&
        form.march === undefined &&
        form.april === undefined &&
        form.may === undefined &&
        form.june === undefined &&
        form.july === undefined &&
        form.august === undefined &&
        form.september === undefined &&
        form.october === undefined &&
        form.november === undefined &&
        form.december === undefined
      ) {
        return 100;
      }
      MonthlyProportionSum.value = floatAdd(
        floatAdd(
          floatAdd(
            floatAdd(
              floatAdd(
                floatAdd(
                  floatAdd(
                    floatAdd(
                      floatAdd(
                        floatAdd(
                          floatAdd(
                            Number(form.january === undefined ? 0 : form.january),
                            Number(form.february === undefined ? 0 : form.february)
                          ),
                          Number(form.march === undefined ? 0 : form.march)
                        ),
                        Number(form.april === undefined ? 0 : form.april)
                      ),
                      Number(form.may === undefined ? 0 : form.may)
                    ),
                    Number(form.june === undefined ? 0 : form.june)
                  ),
                  Number(form.july === undefined ? 0 : form.july)
                ),
                Number(form.august === undefined ? 0 : form.august)
              ),
              Number(form.september === undefined ? 0 : form.september)
            ),
            Number(form.october === undefined ? 0 : form.october)
          ),
          Number(form.november === undefined ? 0 : form.november)
        ),
        Number(form.december === undefined ? 0 : form.december)
      );
      return Number(floatSub(100, MonthlyProportionSum.value));
    });
    // 表单校验
    const rules = {
      january: [{ required: true, message: '1月比例为必填项', trigger: 'change' }],
      february: [{ required: true, message: '2月比例为必填项', trigger: 'change' }],
      march: [{ required: true, message: '3月比例为必填项', trigger: 'change' }],
      april: [{ required: true, message: '4月比例为必填项', trigger: 'change' }],
      may: [{ required: true, message: '5月比例为必填项', trigger: 'change' }],
      june: [{ required: true, message: '6月比例为必填项', trigger: 'change' }],
      july: [{ required: true, message: '7月比例为必填项', trigger: 'change' }],
      august: [{ required: true, message: '8月比例为必填项', trigger: 'change' }],
      september: [{ required: true, message: '9月比例为必填项', trigger: 'change' }],
      october: [{ required: true, message: '10月比例为必填项', trigger: 'change' }],
      november: [{ required: true, message: '11月比例为必填项', trigger: 'change' }],
      december: [{ required: true, message: '12月比例为必填项', trigger: 'change' }],
    };
    // 表单提交
    const onSubmit = async () => {
      let flag;
      // rules();
      //   验证表单规则
      ruleForm.value.validate((valid: boolean) => {
        if (valid) {
          flag = true;
        } else {
          return false;
        }
      });
      //   表单验证通过
      if (flag) {
        if (surplusValue.value !== 0) {
          return message.error('月份比例总和必须等于100！');
        }
        try {
          const obj = {
            ...getTenant(),
            energyCode: props.energyCode,
            january: Number(floatDivide(Number(form.january), 100)),
            february: Number(floatDivide(Number(form.february), 100)),
            march: Number(floatDivide(Number(form.march), 100)),
            april: Number(floatDivide(Number(form.april), 100)),
            may: Number(floatDivide(Number(form.may), 100)),
            june: Number(floatDivide(Number(form.june), 100)),
            july: Number(floatDivide(Number(form.july), 100)),
            august: Number(floatDivide(Number(form.august), 100)),
            september: Number(floatDivide(Number(form.september), 100)),
            october: Number(floatDivide(Number(form.october), 100)),
            november: Number(floatDivide(Number(form.november), 100)),
            december: Number(floatDivide(Number(form.december), 100)),
          };
          const res = await BenchmarkValueMaintenanceService.updateHouseholdNumberList(obj);
          if (res.code == 200 && res.success) {
            context.emit('addOK');
            dialogFormVisible.value = false;
            const messageInstance = message.success(res.message);
            setTimeout(() => {
              messageInstance.close();
            }, 3000);
          } else {
            return message.error(res.message);
          }
        } catch (error) {
          return message.error('操作失败');
        }
      }
    };
    /**
     * 打开弹框
     */
    const show = () => {
      dialogFormVisible.value = true;
      // ruleForm.value.clearValidate();
      nextTick(() => {
        ruleForm.value.clearValidate();
      });
    };
    // 表单取消
    const Cancel = () => {
      dialogFormVisible.value = false;
      ruleForm.value.resetFields();
    };

    // 监听props.householdNumberList，用于回显
    watch(
      () => props.num,
      () => {
        householdNumberList = props.householdNumberList;
        if (householdNumberList) {
          form.january = Number(transferPercent(householdNumberList.january, 100));
          form.february = Number(transferPercent(householdNumberList.february, 100));
          form.march = Number(transferPercent(householdNumberList.march, 100));
          form.april = Number(transferPercent(householdNumberList.april, 100));
          form.may = Number(transferPercent(householdNumberList.may, 100));
          form.june = Number(transferPercent(householdNumberList.june, 100));
          form.july = Number(transferPercent(householdNumberList.july, 100));
          form.august = Number(transferPercent(householdNumberList.august, 100));
          form.september = Number(transferPercent(householdNumberList.september, 100));
          form.october = Number(transferPercent(householdNumberList.october, 100));
          form.november = Number(transferPercent(householdNumberList.november, 100));
          form.december = Number(transferPercent(householdNumberList.december, 100));
        }
        if (householdNumberList === null) {
          form.january = undefined;
          form.february = undefined;
          form.march = undefined;
          form.april = undefined;
          form.may = undefined;
          form.june = undefined;
          form.july = undefined;
          form.august = undefined;
          form.september = undefined;
          form.october = undefined;
          form.november = undefined;
          form.december = undefined;
          // ruleForm.value.resetFields();
        }
      }
    );
    return {
      dialogFormVisible,
      rules,
      formLabelWidth,
      form,
      ruleForm,
      MonthlyProportionSum,
      surplusValue,
      onSubmit,
      Cancel,
      show,
    };
  },
});
