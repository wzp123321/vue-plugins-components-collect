import { defineComponent, reactive, ref, computed } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import { formatDateStamp, getTenant } from '@/utils/index';
import message from '@/utils/message';
import BenchmarkValueMaintenanceService from '../../services/benchmark-value-maintenance.service';

export default defineComponent({
  name: 'bvmEditDialog',
  props: ['rows', 'dialogAdd', 'energyCode', 'year'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const ruleForm = ref(ElForm);
    const dialogFormVisible = ref<boolean>(); // 控制弹框显示隐藏
    dialogFormVisible.value = props.dialogAdd;
    const rows: BenchmarkValueMaintenance.benchmarkValueMaintenanceListVO = props.rows ? props.rows : ''; // 回显数据
    const month = ref<string>(''); // 月，用于展示弹框title
    /**
     * 年，用于展示弹框title
     */
    const year = computed(() => {
      return props.year ? props.year : '';
    });
    const formLabelWidth = '120px'; //
    /**
     * 弹框表单
     */
    const form = reactive<BenchmarkValueMaintenance.EditFormType>({
      priceRiskLowerLimit: undefined,
      priceRiskUpperLimit: undefined,
      date: [new Date(), new Date()],
    });

    // 回显
    if (rows) {
      form.priceRiskLowerLimit = rows.priceRiskLowerLimit === null ? undefined : String(rows.priceRiskLowerLimit);
      form.priceRiskUpperLimit = rows.priceRiskUpperLimit === null ? undefined : String(rows.priceRiskUpperLimit);
      form.date = [
        rows.contractBillStartTime === null
          ? new Date(year.value + '-' + (rows.month.length === 1 ? '0' + rows.month : rows.month) + '-01  00:00:00')
          : new Date(rows.contractBillStartTime + ' 00:00:00'),
        rows.contractBillEndTime === null
          ? new Date(year.value + '-' + (rows.month.length === 1 ? '0' + rows.month : rows.month) + '-01  00:00:00')
          : new Date(rows.contractBillEndTime + ' 00:00:00'),
      ];
      month.value = rows.month;
    }
    // 表单校验
    const rules = {
      date: [{ required: true, message: '请选择合同账期', trigger: 'change' }],
    };
    // 表单提交
    const onSubmit = async () => {
      let flag;
      if (
        formatDateStamp(form.date[0].getTime(), 'YYYY-MM-DD') === '--' ||
        formatDateStamp(form.date[1].getTime(), 'YYYY-MM-DD') === '--'
      ) {
        return message.error('合同账期不能为空');
      }
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
        try {
          if (
            form.priceRiskLowerLimit !== '' &&
            form.priceRiskUpperLimit !== '' &&
            Number(form.priceRiskLowerLimit) >= Number(form.priceRiskUpperLimit)
          ) {
            return message.error('合同单价风险区间上限应大于下限，请重新填写！');
          }
          let priceRiskUpperLimit: number | null;
          let priceRiskLowerLimit: number | null;
          if (form.priceRiskUpperLimit === null || form.priceRiskUpperLimit === '') {
            priceRiskUpperLimit = null;
          } else {
            priceRiskUpperLimit = Number(form.priceRiskUpperLimit);
          }
          if (form.priceRiskLowerLimit === null || form.priceRiskLowerLimit === '') {
            priceRiskLowerLimit = null;
          } else {
            priceRiskLowerLimit = Number(form.priceRiskLowerLimit);
          }
          const obj = {
            contractBillEndTime: formatDateStamp(form.date[1].getTime(), 'YYYY-MM-DD'),
            contractBillStartTime: formatDateStamp(form.date[0].getTime(), 'YYYY-MM-DD'),
            energyCode: props.energyCode,
            month: Number(rows.month),
            priceRiskLowerLimit: priceRiskLowerLimit,
            priceRiskUpperLimit: priceRiskUpperLimit,
            ...getTenant(),
            year: props.year,
          };
          const res = await BenchmarkValueMaintenanceService.updateBenchmarkValueMaintenanceList(obj);
          if (res.code == 200 && res.success) {
            dialogFormVisible.value = false;
            const messageInstance = message.success(res.message);
            setTimeout(() => {
              messageInstance.close();
            }, 3000);
            context.emit('editOK');
          } else {
            return message.error(res.message);
          }
        } catch (error) {
          return message.error('操作失败');
        }
      }
    };
    // 表单取消
    const Cancel = () => {
      dialogFormVisible.value = false;
    };
    return {
      dialogFormVisible,
      rules,
      rows,
      formLabelWidth,
      form,
      ruleForm,
      month,
      year,
      onSubmit,
      Cancel,
    };
  },
});
