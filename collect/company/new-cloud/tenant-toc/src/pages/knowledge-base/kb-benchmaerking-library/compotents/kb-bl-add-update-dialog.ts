import { defineComponent, reactive, ref } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import benchMarkingLibrary from '@/pages/knowledge-base/kb-benchmaerking-library/service/kb-benchmaerking-library.service';

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
    const ruleForm = ref(ElForm);
    const dialogFormVisible = ref<boolean>(); // 控制弹框显示与隐藏
    dialogFormVisible.value = props.dialogAdd;
    const cannotEdit = ref<boolean>(false);
    const rows: BenchmarkingLibrary.tableDataSourceVO = props.rows ? props.rows : '';
    const Region: GeneralModule.DictionaryInfo[] = props.Region ? props.Region : []; // 医院所属地区
    const HospitalLevel: GeneralModule.DictionaryInfo[] = props.HospitalLevel ? props.HospitalLevel : []; // 医院等级
    const HospitalType: GeneralModule.DictionaryInfo[] = props.HospitalType ? props.HospitalType : []; // 医院类型
    const HeatingMode: GeneralModule.DictionaryInfo[] = props.HeatingMode ? props.HeatingMode : []; // 供暖方式
    const CoolingMode: GeneralModule.DictionaryInfo[] = props.CoolingMode ? props.CoolingMode : []; // 供冷方式
    const formLabelWidth = '120px';
    // 弹框表单
    const form = reactive<BenchmarkingLibrary.addUrlParams>({
      coolingMode: '',
      heatingMode: '',
      regionType: '',
      systemLevel: '',
      systemName: '',
      systemType: '',
    });
    // 新增弹框初始化
    if (props.Region.length > 0 && !rows) {
      form.regionType = props.Region[0].code;
    }
    if (props.HospitalLevel.length > 0 && !rows) {
      form.systemLevel = props.HeatingMode[0].code;
    }
    if (props.HospitalType.length > 0 && !rows) {
      form.systemType = props.HospitalType[0].code;
    }
    if (props.HeatingMode.length > 0 && !rows) {
      form.heatingMode = props.HeatingMode[0].code;
    }
    if (props.CoolingMode.length > 0 && !rows) {
      form.coolingMode = props.CoolingMode[0].code;
    }
    // 编辑数据回显
    if (rows) {
      form.coolingMode = rows.coolingMode;
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
        const obj = {
          coolingMode: form.coolingMode,
          heatingMode: form.heatingMode,
          regionType: form.regionType,
          systemLevel: form.systemLevel,
          systemName: form.systemName,
          systemType: form.systemType,
        };
        // 判断编辑情况
        if (rows) {
          const obj = {
            id: rows.id,
            coolingMode: form.coolingMode,
            heatingMode: form.heatingMode,
            regionType: form.regionType,
            systemLevel: form.systemLevel,
            systemName: form.systemName,
            systemType: form.systemType,
          };
          try {
            const res = await benchMarkingLibrary.updateUrl(obj);
            if (res.code == 200 && res.success) {
              context.emit('addOK');
              dialogFormVisible.value = false;
              return proxy.$message.success(res.message);
            } else {
              return proxy.$message.error(res.message);
            }
          } catch (error) {
            return proxy.$message.error('操作失败');
          }
        }
        // 新增情况
        try {
          const res = await benchMarkingLibrary.addurl(obj);
          if (res.code == 200 && res.success) {
            context.emit('addOK');
            dialogFormVisible.value = false;
            return proxy.$message.success(res.message);
          } else {
            return proxy.$message.error(res.message);
          }
        } catch (error) {
          return proxy.$message.error('操作失败');
        }
      }
    };
    // 表单取消
    const Reset = () => {
      // 重置判断编辑情况
      // if (rows) {
      //   form.coolingMode = rows.coolingMode;
      //   form.heatingMode = rows.heatingMode;
      //   form.regionType = rows.regionType;
      //   form.systemLevel = rows.systemLevel;
      //   form.systemName = rows.systemName;
      //   form.systemType = rows.systemType;
      // } else {
      //   form.coolingMode = CoolingMode.length > 0 ? '1' : '';
      //   form.heatingMode = HeatingMode.length > 0 ? '1' : '';
      //   form.regionType = Region.length > 0 ? '1' : '';
      //   form.systemLevel = HospitalLevel.length > 0 ? '1' : '';
      //   form.systemName = '';
      //   form.systemType = HospitalType.length > 0 ? '1' : '';
      // }
      dialogFormVisible.value = false;
    };
    return {
      dialogFormVisible,
      cannotEdit,
      rules,
      rows,
      formLabelWidth,
      form,
      Region,
      HospitalLevel,
      HospitalType,
      HeatingMode,
      CoolingMode,
      ruleForm,
      onSubmit,
      Reset,
    };
  },
});
