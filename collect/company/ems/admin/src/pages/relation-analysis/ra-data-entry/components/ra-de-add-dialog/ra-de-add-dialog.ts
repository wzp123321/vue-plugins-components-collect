import { defineComponent, reactive, ref, PropType, computed, watch, nextTick } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import dataEntryService from '@/pages/relation-analysis/ra-data-entry/service/ra-data-entry.service';
import { formatDate } from '@/utils/index';
// config
import { INPUT_TYPES } from '@/config/enum';

export default defineComponent({
  name: 'AddDialog',
  props: {
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
    timeType: {
      type: String,
      default: '',
    }, //时间颗粒默认选中值
    isAddFlag: {
      type: Boolean,
      default: true,
    },
    // 初始颗粒度
    startTimeType: {
      type: String,
      default: '',
    },
  },
  emits: ['success'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const addFormRef = ref(ElForm);
    // 开关
    const dialogFormVisible = ref(false);
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
    // 是否为新增
    const isAddFlag = computed(() => {
      return props.isAddFlag;
    });
    // paramName
    const paramName = computed(() => {
      return props.paramName;
    });

    // 表单
    const dataForm = reactive<DataEntryModule.SingleDataForm>({
      timeType: '',
      collectTime: '',
      paramId: props.paramId,
      val: undefined,
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
      val: [{ required: true, message: '录入值不能为空', trigger: 'change' }],
    };
    /**
     * 打开
     */
    const show = () => {
      dialogFormVisible.value = true;
      nextTick(() => {
        if (!props.isAddFlag) {
          const { collectTime, val, remark } = props.dataDetail;
          dataForm.collectTime = new Date(collectTime);
          dataForm.val = Number(val);
          dataForm.remark = remark;
        }
        addFormRef.value.clearValidate();
      });
    };
    // 表单提交
    const onSubmit = () => {
      //   验证表单规则
      addFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
          // 判断编辑情况
          const { collectTime, timeType, paramId, remark, val } = dataForm;
          let timeTypeVal = '';
          timeUnitList.value.forEach((item) => {
            if (item.timeName === timeType) {
              timeTypeVal = item.timeCode;
            }
          });
          const formCollectTime = formatDate(collectTime, 'yyyy-MM-dd');
          const params = {
            startTimeType: props.startTimeType,
            endTimeType: timeTypeVal,
            id: props.dataDetail.id,
            collectTime: formCollectTime,
            paramId,
            remark,
            val,
          };
          loading.value = true;
          try {
            const res = !props.isAddFlag
              ? await dataEntryService.updateSingleDataListUrl(params)
              : await dataEntryService.createSingleDataListUrl({
                  collectTime: formCollectTime,
                  timeType: timeTypeVal,
                  paramId,
                  remark,
                  val,
                });
            if (res.code == 200 && res.success) {
              context.emit('success');
              loading.value = false;
              proxy.$message.success(res.message || '操作成功');
              onBeforeClose();
            } else {
              loading.value = false;
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                proxy.$message.error(res.message || '操作失败');
              }
            }
          } catch (error) {
            loading.value = false;
            proxy.$message.error('操作失败');
          }
        }
      });
    };
    // 关闭前
    const onBeforeClose = () => {
      addFormRef.value.resetFields();
      dialogFormVisible.value = false;
      dataForm.collectTime = '';
      dataForm.val = undefined;
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
      paramName,
      dataForm,
      addFormRef,
      isAddFlag,
      loading,
      INPUT_TYPES,
      onSubmit,
      show,
      onBeforeClose,
    };
  },
});
