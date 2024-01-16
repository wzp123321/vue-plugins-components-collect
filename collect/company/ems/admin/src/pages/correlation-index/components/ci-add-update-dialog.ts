import { defineComponent, reactive, ref } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import benchMarkingIndex from '@/pages/benchmarking-index/service/benchmarking-index.service';

interface formType {
  id: number | undefined;
  unit: string;
  name: string;
}
export default defineComponent({
  name: 'addAndEditBenchmarkingIndexDialog',
  props: ['rows', 'dialogAdd'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    let ruleForm = ref(ElForm);
    let dialogFormVisible = ref<boolean>();
    dialogFormVisible.value = props.dialogAdd;
    let cannotEdit = ref<boolean>(false);
    let rows: any = props.rows ? props.rows : [];
    let form = reactive<formType>({
      id: undefined,
      unit: '',
      name: '',
    });
    if (rows) {
      form.id = rows.id;
      form.unit = rows.unit;
      form.name = rows.name;
    }
    // 表单校验
    const rules = {
      name: [
        { required: true, message: '请输入指标名称', trigger: 'blur' },
        {
          pattern: [/^[a-zA-Z0-9\u4e00-\u9fa5]+$/],
          min: 1,
          max: 12,
          message: '长度在 1到 12个字符',
        },
      ],
      unit: [
        { required: true, message: '请输入单位', trigger: 'blur' },
        {
          pattern: [/^[a-zA-Z0-9\u4e00-\u9fa5]+$/],
          min: 1,
          max: 12,
          message: '长度在 1到 12个字符',
        },
      ],
    };
    // 表单提交
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
        let obj = {
          id: form.id,
          unit: form.unit,
          name: form.name,
        };
        // console.log('rows', rows);

        // 判断编辑情况
        if (rows.id) {
          let obj = {
            id: rows.id,
            unit: form.unit,
            name: form.name,
          };
          try {
            // console.log('obj', obj);

            const res = await benchMarkingIndex.updateCorrelationIndexUrl(obj);
            if (res.code == 200 && res.success) {
              context.emit('addOK');
              dialogFormVisible.value = false;
              return proxy.$message.success(res.message);
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                return proxy.$message.error(res.message);
              }
            }
          } catch (error) {
            return proxy.$message.error('操作失败');
          }
        }
        // 新增情况
        benchMarkingIndex;
        try {
          // console.log('obj', obj);
          const res = await benchMarkingIndex.addCorrelationIndexurl(obj);
          if (res.code == 200 && res.success) {
            context.emit('addOK');
            dialogFormVisible.value = false;
            return proxy.$message.success(res.message);
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        } catch (error) {
          return proxy.$message.error('操作失败');
        }
      }
    };
    // 表单重置
    const Reset = () => {
      // 判断编辑情况
      if (rows) {
        form.id = rows.id;
        form.unit = rows.unit;
        form.name = rows.name;
      } else {
        form.id = undefined;
        form.unit = '';
        form.name = '';
      }
    };
    return {
      dialogFormVisible,
      cannotEdit,
      rules,
      rows,
      form,
      ruleForm,
      onSubmit,
      Reset,
    };
  },
});
