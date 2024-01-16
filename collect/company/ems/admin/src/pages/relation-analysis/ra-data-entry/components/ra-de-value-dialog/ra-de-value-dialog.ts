import { defineComponent, reactive, ref, computed, PropType, watch, nextTick } from 'vue';
import { ElForm } from 'element-plus';
import dataEntryService from '@/pages/relation-analysis/ra-data-entry/service/ra-data-entry.service';
import { formatDate } from '../../../../../utils/index';
// config
import { INPUT_TYPES } from '@/config/enum';
import message from '@/utils/message';

export default defineComponent({
  name: 'ValueDialog',
  props: {
    //编辑时当前行的数据 新增为null
    dataDetail: {
      type: Object as PropType<DataEntryModule.DataEntryInfo>,
      default: {},
    },
    //参数名称
    paramName: {
      type: String,
      default: '',
    },
    timeUnitList: {
      type: Array as PropType<DataEntryModule.TimeDTOInfo[]>,
      default: [],
    }, //表单时间颗粒数组
    paramId: {
      type: Number,
      default: 0,
    }, //父页面的id
    //时间颗粒默认选中值
    timeType: {
      type: String,
      default: '',
    },
    // 是否为新增
    isAddFlag: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['success'],
  setup(props, context) {
    // 表单
    const dataFormRef = ref(ElForm);
    // 开关
    const dialogFormVisible = ref<boolean>(false);
    // 是否为新增
    const isAddFlag = computed(() => {
      return props.isAddFlag;
    });
    // loading
    const loading = ref(false);
    // 时间颗粒度
    const timeUnitList = computed(() => {
      return props.isAddFlag
        ? props.timeUnitList
        : props.timeUnitList.filter((item) => {
            return item.timeCode === props.timeType;
          });
    });
    // 表单
    let dataForm = reactive<DataEntryModule.DifferenceValueForm>({
      paramId: props.paramId,
      timeType: '',
      collectTime: '',
      startValue: '',
      endValue: '',
      remark: '',
    });
    // 表单校验
    const rules = {
      collectTime: [
        {
          type: 'date',
          required: true,
          message: '请选择时间',
          trigger: 'change',
        },
      ],
      startValue: [{ required: true, message: '录入值不能为空', trigger: 'blur' }],
      endValue: [{ required: true, message: '录入值不能为空', trigger: 'blur' }],
    };
    // 表单提交
    const onSubmit = () => {
      //   验证表单规则
      dataFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
          const { paramId, remark, collectTime, startValue, endValue } = dataForm;
          const formCollTime = formatDate(collectTime, 'yyyy-MM-dd');
          const params = {
            endValue,
            startValue,
            collectTime: formCollTime,
            paramId,
            remark,
          };
          const updateParams = {
            ...params,
            dataId: props.dataDetail.id,
          };
          try {
            loading.value = true;
            const res = !props.isAddFlag
              ? await dataEntryService.getDifferenceDataUpdate(updateParams)
              : await dataEntryService.getDifferenceDataCreate(params);
            if (res.code == 200 && res.success) {
              context.emit('success');
              message.success(res.message);
              onBeforeClose();
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                message.error(res.message || '操作失败');
              }
            }
          } catch (error) {
            message.error('操作失败');
          } finally {
            loading.value = false;
          }
        }
      });
    };
    // 展开
    const show = () => {
      dialogFormVisible.value = true;
      nextTick(() => {
        if (!props.isAddFlag) {
          const { collectTime, startValue, endValue, remark } = props.dataDetail;
          dataForm.collectTime = new Date(collectTime);
          dataForm.startValue = String(Number(startValue));
          dataForm.endValue = String(Number(endValue));
          dataForm.remark = remark;
        }
        dataFormRef.value.clearValidate();
      });
    };
    // 关闭前
    const onBeforeClose = () => {
      dataFormRef.value.resetFields();
      dialogFormVisible.value = false;
      dataForm.collectTime = '';
      dataForm.startValue = '';
      dataForm.endValue = '';
      dataForm.remark = '';
    };
    // 监听
    watch(
      () => props.timeType,
      () => {
        props.timeUnitList.forEach((item) => {
          if (item.timeCode === props.timeType) {
            dataForm.timeType = item.timeName;
          }
        });
      },
      {
        immediate: true,
      },
    );

    return {
      dialogFormVisible,
      rules,
      timeUnitList,
      dataFormRef,
      dataForm,
      isAddFlag,
      loading,
      INPUT_TYPES,
      onBeforeClose,
      onSubmit,
      show,
    };
  },
});
