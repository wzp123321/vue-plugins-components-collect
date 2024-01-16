import { defineComponent, unref, ref, reactive, toRefs, watch } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import alarmManage from '../services/alarm-management';
import message from '@/utils/message';

interface formType {
  handleRemarks: string;
}
export default defineComponent({
  name: 'operationDialog',
  props: {
    rows: {},
    alarmIdTypeCheck: {},
    title: {
      type: String,
      default: false,
    },
    dialogAdd: {
      type: Boolean,
      default: false,
    },
    isSingle: {
      type: Boolean,
    },
  },
  setup(props, context) {
    const ruleForm = ref(ElForm);
    const { proxy } = useCurrentInstance();
    let rows: any = props.rows;
    let alarmIdTypeCheck: any = props.alarmIdTypeCheck;
    const title = props.title;
    const dialogFormVisible = ref<boolean>(false);
    dialogFormVisible.value = props.dialogAdd ? true : false;
    const form = reactive<formType>({
      handleRemarks: '',
    });
    // 单个操作入参
    const OperationAlarmQuery = reactive<AlarmModule.operationAlarmType>({
      alarmId: 0,
      operateType: '',
      handleRemarks: '',
    });
    // 批量操作入参
    const OperationAlarmBotchQuery = reactive<AlarmModule.operationAlarmBatchType>({
      alarmIds: [],
      operateType: '',
      handleRemarks: '',
    });
    // 单个操作
    if (rows && props.isSingle) {
      OperationAlarmQuery.operateType = rows.alarmStatus;
      OperationAlarmQuery.alarmId = rows.id;
      switch (title) {
        case '处理':
          OperationAlarmQuery.operateType = '3';
          break;
      }
    }

    if (alarmIdTypeCheck.length > 0 && props.isSingle === false) {
      switch (title) {
        case '批量处理':
          OperationAlarmBotchQuery.operateType = '3';
          break;
      }
    }

    /**
     * 表单提交
     */
    const onEnergyCodeFormSubmit = async () => {
      let flag;
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
        if (props.title === '处理') {
          // 单个操作
          OperationAlarmQuery.handleRemarks = form.handleRemarks;
          singleOperation();
        } else {
          // 批量操作
          OperationAlarmBotchQuery.handleRemarks = form.handleRemarks;
          OperationAlarmBotchQuery.alarmIds = alarmIdTypeCheck;
          botchOperation();
        }
      }
    };
    // 操作单个
    const singleOperation = async () => {
      try {
        if (OperationAlarmQuery.alarmId === 0 && OperationAlarmQuery.operateType === '') {
          return proxy.$message.error('操作频繁，请稍后再试');
        }
        const res = await alarmManage.operationAlarm(OperationAlarmQuery);
        if (res && res.code === 200 && res.success) {
          dialogFormVisible.value = false;
          context.emit('opeartionOK');
          OperationAlarmQuery.alarmId = 0;
          OperationAlarmQuery.operateType = '';
          OperationAlarmQuery.handleRemarks = '';
          alarmIdTypeCheck = [];
          rows = {};
          form.handleRemarks = '';
          message.success(res.message || '操作成功');
        } else {
          dialogFormVisible.value = true;
          message.error(res.message || '操作失败');
        }
      } catch (error) {
        dialogFormVisible.value = true;
        message.error('操作失败');
      }
    };

    // 批量操作
    const botchOperation = async () => {
      try {
        const res = await alarmManage.operationAlarmBotch(OperationAlarmBotchQuery);
        if (res && res.code === 200 && res.success) {
          context.emit('opeartionOK');
          OperationAlarmBotchQuery.alarmIds = [];
          OperationAlarmBotchQuery.operateType = '';
          OperationAlarmBotchQuery.handleRemarks = '';
          alarmIdTypeCheck = [];
          rows = {};
          dialogFormVisible.value = false;
          form.handleRemarks = '';
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      } catch (error) {
        message.error('操作失败');
      }
    };

    // 显示
    const show = async () => {
      dialogFormVisible.value = true;
    };
    // 关闭前初始化
    const onInitBeforeClose = () => {
      form.handleRemarks = '';
      dialogFormVisible.value = false;
    };

    return {
      form,
      title,
      ruleForm,
      rows,
      dialogFormVisible,
      OperationAlarmQuery,
      onInitBeforeClose,
      close,
      show,
      onEnergyCodeFormSubmit,
    };
  },
});
