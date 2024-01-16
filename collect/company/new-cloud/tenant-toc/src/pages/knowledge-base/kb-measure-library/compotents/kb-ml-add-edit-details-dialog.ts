import { defineComponent, nextTick, reactive, ref, toRefs, watch, computed } from 'vue';
import { ElForm } from 'element-plus';

// utils
import useCurrentInstance from '@/utils/use-current-instance';
import measureLibrary from '../service/kb-measure-library.services';

interface dialogType {
  form: MeasureLibrary.addUrlParams;
  dialogFormVisible: boolean;
  formLabelWidth: string;
  addLoading: boolean;
  editLoading: boolean;
}

export default defineComponent({
  name: 'BkMlAddEditDetailsDialog',
  props: ['num', 'systemList', 'measureStatusList', 'executionCycleList', 'isType', 'rows'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const ruleForm = ref(ElForm);
    const systemList = computed(() => {
      return props.systemList ? props.systemList : [];
    });
    const measureStatusList = computed(() => {
      return props.measureStatusList ? props.measureStatusList : [];
    });
    const executionCycleList = computed(() => {
      return props.executionCycleList ? props.executionCycleList : [];
    });

    /**
     * 弹框表单
     * @param  description 描述
     * @param  executionCycle 建议执行周期：1-每日、2-工作日、3-每周、4-每月、5-特殊时间
     * @param  measureName 措施名
     * @param  measureStatus 措施状态：1-有效、2-无效
     * @param  systemId 所属系统：1-暖通，2-能源管理系统，3-综合监控系统，4-其他
     * @param  measureCode 措施编码
     */
    const dialogContentType = reactive<dialogType>({
      form: {
        description: '',
        executionCycle: '',
        measureName: '',
        measureStatus: '',
        systemId: '',
        measureCode: '',
      },
      dialogFormVisible: false,
      formLabelWidth: '120px',
      addLoading: false,
      editLoading: false,
    });

    // 表单校验
    const rules = {
      measureName: [{ required: true, message: '请输入措施名称', trigger: 'change' }],
      measureCode: [{ required: true, message: '措施编码为必填', trigger: 'change' }],
      systemId: [{ required: true, message: '请选择所属系统', trigger: 'change' }],
      executionCycle: [{ required: true, message: '请选择建议执行周期', trigger: 'change' }],
      measureStatus: [{ required: true, message: '请选择措施状态', trigger: 'change' }],
    };

    // 取消
    const onClose = () => {
      dialogContentType.dialogFormVisible = false;
      ruleForm.value.clearValidate();
    };

    // 提交
    const onSubmit = async () => {
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
        // 编辑
        if (props.rows && props.isType === 2) {
          if (dialogContentType.editLoading) {
            return;
          }
          dialogContentType.editLoading = true;
          const editObj = {
            description: dialogContentType.form.description,
            executionCycle: dialogContentType.form.executionCycle,
            id: props.rows.id,
            measureCode: props.rows.measureCode,
            measureName: dialogContentType.form.measureName,
            measureSource: props.rows.measureSource,
            measureStatus: dialogContentType.form.measureStatus,
            systemId: dialogContentType.form.systemId,
            updateTime: props.rows.updateTime,
          };
          try {
            const res = await measureLibrary.updateUrl(editObj);
            if (res.code == 200 && res.success) {
              context.emit('operationOK');
              dialogContentType.dialogFormVisible = false;
              setTimeout(() => {
                dialogContentType.editLoading = false;
              }, 1000);
              return proxy.$message.success('编辑成功');
            } else {
              setTimeout(() => {
                dialogContentType.editLoading = false;
              }, 1000);
              return proxy.$message.error('编辑失败, ' + res.message);
            }
          } catch (error) {
            setTimeout(() => {
              dialogContentType.editLoading = false;
            }, 1000);
            return proxy.$message.error('编辑失败');
          }
        }

        // 新增
        try {
          if (dialogContentType.addLoading) {
            return;
          }
          dialogContentType.addLoading = true;
          const addObj = {
            description: dialogContentType.form.description,
            executionCycle: dialogContentType.form.executionCycle,
            measureName: dialogContentType.form.measureName,
            measureStatus: dialogContentType.form.measureStatus,
            systemId: dialogContentType.form.systemId,
          };
          const res = await measureLibrary.addurl(addObj);
          if (res.code == 200 && res.success) {
            context.emit('operationOK');
            dialogContentType.dialogFormVisible = false;
            setTimeout(() => {
              dialogContentType.addLoading = false;
            }, 1000);
            return proxy.$message.success('新增成功');
          } else {
            setTimeout(() => {
              dialogContentType.addLoading = false;
            }, 1000);
            return proxy.$message.error('新增失败, ' + res.message);
          }
        } catch (error) {
          setTimeout(() => {
            dialogContentType.addLoading = false;
          }, 1000);
          return proxy.$message.error('新增失败');
        }
      }
    };

    watch(
      () => props.num,
      () => {
        dialogContentType.dialogFormVisible = true;
        // 初始化
        // 新增
        if (props.rows === null && props.isType === 1) {
          if (props.executionCycleList.length > 0) {
            props.executionCycleList.forEach((item: MeasureLibrary.type) => {
              if (item.code === '2') {
                dialogContentType.form.executionCycle = '2';
              }
            });
          } else {
            dialogContentType.form.executionCycle = '';
          }
          dialogContentType.form.description = '';
          dialogContentType.form.measureName = '';
          dialogContentType.form.measureStatus =
            props.measureStatusList.length > 0 ? props.measureStatusList[0].code : '';
          dialogContentType.form.systemId = props.systemList.length > 0 ? props.systemList[0].code : '';
          nextTick(() => {
            const error_dom = <HTMLImageElement>document.querySelector('.measureName .el-form-item__error');
            if (error_dom) {
              ruleForm.value.clearValidate();
            }
          });
        }
        // 编辑或详情回显
        if (props.rows && (props.isType === 2 || props.isType === 3)) {
          dialogContentType.form.description = props.rows.description;
          dialogContentType.form.executionCycle = props.rows.executionCycle;
          dialogContentType.form.measureName = props.rows.measureName;
          dialogContentType.form.measureStatus = props.rows.measureStatus;
          dialogContentType.form.systemId = props.rows.systemId;
          dialogContentType.form.measureCode = props.rows.measureCode;
        }
      }
    );

    return {
      ...toRefs(dialogContentType),
      systemList,
      measureStatusList,
      executionCycleList,
      ruleForm,
      rules,
      onClose,
      onSubmit,
    };
  },
});
