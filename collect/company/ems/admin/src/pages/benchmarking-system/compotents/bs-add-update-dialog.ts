import { defineComponent, reactive, ref } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import benchMarkingSystem from '@/pages/benchmarking-system/service/benchmarking-system.service';

interface formType {
  coolingMode: string;
  heatingMode: string;
  regionType: string;
  systemLevel: string;
  systemName: string;
  systemType: string;
}

const THROTTLE_COUNT = 5;
let time: number;

export default defineComponent({
  props: ['rows', 'dialogAdd', 'Region', 'HospitalLevel', 'HospitalType', 'HeatingMode', 'CoolingMode'],
  directives: {
    customInputFilter: {
      mounted(el) {
        const ele: any =
          el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
            ? el
            : el.querySelector('input') || el.querySelector('textarea');
        /**
         * 输入事件
         */
        const handleInput = (e: InputEvent) => {
          if (Math.abs(time - new Date().getTime()) < THROTTLE_COUNT) {
            return;
          }
          time = new Date().getTime();
          // 是否在剪切板
          if (e.isComposing) {
            return;
          }
          const characters: string = '';
          const defaultStr = String.raw`\`\-\\;\'\"<>\/\?\*\[\]\:\？\：`;
          const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
          ele.value = ele.value.replace(reg, '');
          // 过滤空格
          ele.value = ele.value.replace(/\s+/g, '');

          ele.dispatchEvent(new Event('input'));
        };
        ele.oninput = handleInput;
        ele.onblur = handleInput;
        // 解决输入中文的问题
        ele.addEventListener('compositionend', (e: InputEvent) => {
          handleInput(e);
        });
      },
    },
  },
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    let ruleForm = ref(ElForm);
    let dialogFormVisible = ref<boolean>();
    dialogFormVisible.value = props.dialogAdd;
    let cannotEdit = ref<boolean>(false);
    let rows: any = props.rows ? props.rows : '';
    // console.log('rows', rows);

    let Region: any = props.Region ? props.Region : []; // 医院所属地区
    let HospitalLevel: any = props.HospitalLevel ? props.HospitalLevel : []; // 医院等级
    let HospitalType: any = props.HospitalType ? props.HospitalType : []; // 医院类型
    let HeatingMode: any = props.HeatingMode ? props.HeatingMode : []; // 供暖方式
    let CoolingMode: any = props.CoolingMode ? props.CoolingMode : []; // 供冷方式
    // const IsGeneral = [
    //   { code: '0', name: '否' },
    //   { code: '1', name: '是' }
    // ];
    let form = reactive<formType>({
      coolingMode: '1',
      // general: '',
      heatingMode: '1',
      regionType: '1',
      systemLevel: '1',
      systemName: '',
      systemType: '1',
    });

    if (rows) {
      form.coolingMode = rows.coolingMode;
      // form.general = rows.general;
      form.heatingMode = rows.heatingMode;
      form.regionType = rows.regionType;
      form.systemLevel = rows.systemLevel;
      form.systemName = rows.systemName;
      form.systemType = rows.systemType;
    }
    // 表单校验
    const rules = {
      systemName: [
        { required: true, message: '请输入对标医院名称', trigger: 'blur' },
        {
          pattern: [/^[a-zA-Z0-9\u4e00-\u9fa5]+$/],
          min: 1,
          max: 20,
          message: '长度在 1到 20个字符',
        },
      ],
      regionType: [{ required: true, message: '请选择医院所属地区', trigger: 'change' }],
      systemLevel: [{ required: true, message: '请选择医院等级', trigger: 'change' }],
      systemType: [{ required: true, message: '请选择医院类型', trigger: 'change' }],
      heatingMode: [{ required: true, message: '请选择供暖方式', trigger: 'change' }],
      coolingMode: [{ required: true, message: '请选择供冷方式', trigger: 'change' }],
    };
    //  watch(
    //   () => props.dialogAdd,
    //   (newVal, oldVal) => {
    //     nextTick(() => {
    //     dialogFormVisible.value = newVal;
    //     })
    //   }
    // );
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
          coolingMode: form.coolingMode,
          heatingMode: form.heatingMode,
          regionType: form.regionType,
          systemLevel: form.systemLevel,
          systemName: form.systemName,
          systemType: form.systemType,
        };
        // 判断编辑情况
        if (rows) {
          let obj = {
            id: rows.id,
            coolingMode: form.coolingMode,
            // general: form.general,
            heatingMode: form.heatingMode,
            regionType: form.regionType,
            systemLevel: form.systemLevel,
            systemName: form.systemName,
            systemType: form.systemType,
          };
          try {
            // console.log('obj', obj);

            const res = await benchMarkingSystem.updateUrl(obj);
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
        benchMarkingSystem;
        try {
          // console.log('obj', obj);
          const res = await benchMarkingSystem.addurl(obj);
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
    // 表单取消
    const onCancel = () => {
      dialogFormVisible.value = false;
    };

    return {
      dialogFormVisible,
      cannotEdit,
      rules,
      rows,
      form,
      Region,
      HospitalLevel,
      HospitalType,
      HeatingMode,
      CoolingMode,
      ruleForm,
      // IsGeneral,
      onSubmit,
      onCancel,
    };
  },
});
