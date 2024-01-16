import { defineComponent, reactive, ref, onMounted } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import benchMarkingIndex from '@/pages/benchmarking-index/service/benchmarking-index.service';
import { log } from 'console';

interface formType {
  correlationIndexId: number;
  energyCode: string;
  name: string;
}
export default defineComponent({
  name: 'addAndEditBenchmarkingIndexDialog',
  props: ['rows', 'dialogAdd', 'Correlation', 'HospitalLevel', 'isDisabled', 'isData'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    let ruleForm = ref(ElForm);
    let dialogFormVisible = ref<boolean>();
    dialogFormVisible.value = props.dialogAdd;
    let cannotEdit = ref<boolean>(false);
    let rows: any = props.rows ? props.rows : [];
    let HospitalLevel: any = props.HospitalLevel ? props.HospitalLevel : [];
    let Correlation: any = props.Correlation ? props.Correlation : [];
    const isDataList = ref<any>(props.isData ? props.isData : []);
    // console.log('Correlation', Correlation);
    let fromItemDisabled = ref<boolean>();
    fromItemDisabled.value = props.isDisabled;

    const energyList = [
      { value: '00000', label: '总能耗' },
      { value: '01000', label: '电' },
      { value: '02000', label: '水' },
      { value: '03000', label: '燃气' },
    ];
    let form = reactive<formType>({
      correlationIndexId: 1,
      energyCode: '00000',
      name: '',
    });
    console.log(rows, 'row');

    if (rows.id > 0) {
      console.log(1111);

      form.correlationIndexId = rows.correlationIndexId;
      form.energyCode = rows.energyCode;
      form.name = rows.name;
    }
    // 表单校验
    const rules = {
      name: [
        { required: true, message: '请输入对标医院名称', trigger: 'blur' },
        {
          pattern: [/^[a-zA-Z0-9\u4e00-\u9fa5]+$/],
          min: 1,
          max: 20,
          message: '长度在 1到 20个字符',
        },
      ],
      correlationIndexId: [{ required: true, message: '请选择医院所属地区', trigger: 'change' }],
      energyCode: [{ required: true, message: '请选择医院等级', trigger: 'change' }],
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
          correlationIndexId: form.correlationIndexId,
          energyCode: form.energyCode,
          name: form.name,
        };
        // 判断编辑情况
        if (rows.id) {
          let obj = {
            id: rows.id,
            correlationIndexId: form.correlationIndexId,
            energyCode: form.energyCode,
            name: form.name,
          };
          try {
            // console.log('obj', obj);
            const res = await benchMarkingIndex.updateUrl(obj);
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
          const res = await benchMarkingIndex.addurl(obj);
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
    const onCancel = () => {
      dialogFormVisible.value = false;
    };
    // 弹框关闭
    const dialogClose = () => {
      dialogFormVisible.value = false;
      fromItemDisabled.value = false;
      isDataList.value = [];
      context.emit('dialogClose');
    };

    onMounted(async () => {});
    return {
      dialogFormVisible,
      cannotEdit,
      rules,
      rows,
      form,
      ruleForm,
      HospitalLevel,
      Correlation,
      energyList,
      fromItemDisabled,
      isDataList,
      onSubmit,
      dialogClose,
      onCancel,
    };
  },
});
