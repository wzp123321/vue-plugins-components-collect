import { defineComponent, reactive, toRefs, ref, onMounted, nextTick } from 'vue';
// config
import { pageSizes, FORM_CHECK_RULES } from '@/config/index';
import { INPUT_TYPES } from '@/config/enum';
// utils
import { timeUnits, resetTimeUnit, onPageTo, getRelationDeviceParams } from '../utils/index';
import message from '@/utils/message';
// service
import globalParameterService from './service/ra-global-parameter-manage.service';
import {
  ParameterQueryParams,
  ParameTypeInfo,
  RelationParamterForm,
  RA_IGlobalParameterVO,
} from './ra-global-parameter-manage.api';
import { PARAM_TYPES } from '../ra-node-parameter-manage/ra-node-parameter-manage.api';
import { AssociateDeviceDetail } from '../relation-analysis.api';
import useRelationAnalysisController from '../common-controller';

import { ElForm, ElMessageBox } from 'element-plus';

interface GlobalParamsState {
  loading: boolean;
  reqLoading: boolean;
  dialogVisible: boolean;
  queryParams: ParameterQueryParams;
  total: number;
  parameterTypeList: ParameTypeInfo[];
  pageForm: RelationParamterForm;
  dataSource: RA_IGlobalParameterVO[];
  energyCodeList: EnergyCodeManageModule.EnergyCodeCommonParams[];
  disabledList: boolean[];
  isAddFlag: boolean;
  queryLoading: boolean;
}

export default defineComponent({
  name: 'GlobalParameterManage',
  setup() {
    const form = ref(ElForm);
    const { getDeviceList } = useRelationAnalysisController();
    const globalParamsState = reactive<GlobalParamsState>({
      loading: true,
      reqLoading: false,
      dialogVisible: false,
      queryParams: {
        keyword: '',
        pageSize: pageSizes[0],
        pageNum: 1,
        searchCount: true,
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
      },
      total: 0,
      parameterTypeList: [],
      pageForm: {
        id: -1,
        name: '',
        unit: '',
        paramTypes: [],
        energyCode: '',
        timeTypes: [],
        standardPointName: '',
        deviceId: '',
      },
      dataSource: [],
      energyCodeList: [],
      isAddFlag: true,
      disabledList: [false, false, false, false],
      queryLoading: false,
    });
    const deviceList = ref<AssociateDeviceDetail[]>([]);
    // 校验规则
    const rules = {
      name: [
        {
          required: true,
          message: '请输入参数名称',
          trigger: 'blur',
        },
      ],
      unit: [
        {
          required: true,
          message: '请输入单位',
          trigger: 'blur',
        },
      ],
      paramTypes: [
        {
          required: true,
          message: '请选择参数类型',
          trigger: 'change',
        },
      ],
      energyCode: [
        {
          required: true,
          message: '请选择能源名称',
          trigger: 'change',
        },
      ],
      timeTypes: [
        {
          required: true,
          message: '请选择时间颗粒度',
          trigger: 'change',
        },
      ],
      deviceId: [
        {
          required: true,
          message: '请选择关联设备',
          trigger: 'change',
        },
      ],
    };
    // 头部表单提交
    const onSearch = () => {
      queryGlobalParameterList();
    };
    // 重置
    const onReset = () => {
      globalParamsState.queryParams.pageSize = pageSizes[0];
      globalParamsState.queryParams.pageNum = 1;
      globalParamsState.queryParams.keyword = '';
      queryGlobalParameterList();
    };
    // 打开新增弹框
    const onAddDialogShow = async () => {
      globalParamsState.isAddFlag = true;
      globalParamsState.dialogVisible = true;
      if (globalParamsState.parameterTypeList.length === 0) {
        await getRelationTypeList();
      }
      nextTick(() => {
        form.value.clearValidate();
      });
    };
    // 打开编辑弹框
    const onUpdateDialogShow = async (row: RA_IGlobalParameterVO) => {
      try {
        globalParamsState.isAddFlag = false;
        globalParamsState.dialogVisible = true;
        const { id, name, unit, energyCode, timeTypes, paramType, standardPointName, deviceId, pointNumber } = row;
        if (globalParamsState.parameterTypeList.length === 0) {
          await getRelationTypeList();
        }

        if (paramType === PARAM_TYPES.DEVICE_ACQUISITION) {
          globalParamsState.disabledList = [false, false, false, false];
        } else {
          if (paramType === PARAM_TYPES.SINGLE_DATA || paramType === PARAM_TYPES.ARITHMETIC_MEAN) {
            globalParamsState.disabledList = [true, true, false, false];
          }
          if (paramType === PARAM_TYPES.DATA_DIFFERENCE || paramType === PARAM_TYPES.DATE_DIFFERENCE) {
            globalParamsState.disabledList = [true, true, false, true];
          }
        }
        const paramTypes = [paramType];
        globalParamsState.parameterTypeList.forEach((item) => {
          if (item.children && item.children.length) {
            const ids = item.children.map((childitem) => {
              return childitem.value;
            });
            if (ids.includes(paramType)) {
              paramTypes.unshift(item.value);
            }
          }
        });
        let compTimeTypes = !timeTypes || timeTypes.length === 0 ? [] : timeTypes.split(',');
        compTimeTypes = compTimeTypes.filter((item) => {
          return item;
        });
        // 查询设备
        if (paramType === PARAM_TYPES.DEVICE_ACQUISITION) {
          await queryEnergyTypeList();
          onEnergyCodeChange(energyCode);
        }
        globalParamsState.pageForm = {
          id,
          name,
          unit,
          paramTypes,
          timeTypes: compTimeTypes,
          energyCode,
          standardPointName,
          deviceId: !deviceId ? '' : `${deviceId}_${pointNumber}`,
        };
        nextTick(() => {
          form.value.clearValidate();
        });
      } catch (error) {
        globalParamsState.dialogVisible = true;
      }
    };
    // 查询关联类型列表
    const getRelationTypeList = async () => {
      try {
        const res = await globalParameterService.getQueryCorrelationParamTypeNameList();
        if (res && res.code === 200 && res.success) {
          if (res.data && res.data.length) {
            globalParamsState.parameterTypeList = res.data;
          }
        } else {
          globalParamsState.parameterTypeList = [];
        }
      } catch (error) {
        globalParamsState.parameterTypeList = [];
      }
    };
    // 请求能源类型列表
    const queryEnergyTypeList = async () => {
      try {
        const res = await globalParameterService.getEnergyList();
        if (res && res.data && res.success) {
          if (res.data && res.data.length) {
            globalParamsState.energyCodeList = res.data;
          }
        } else {
          globalParamsState.energyCodeList = [];
        }
      } catch (error) {
        globalParamsState.energyCodeList = [];
      }
    };
    // 能源类型change
    const onEnergyCodeChange = async (value: string) => {
      let standardPoints = '';
      deviceList.value = [];
      globalParamsState.energyCodeList.forEach((item) => {
        if (item.code === value) {
          standardPoints = item.standardPoints as string;
        }
      });
      try {
        globalParamsState.queryLoading = true;
        globalParamsState.pageForm.deviceId = '';
        deviceList.value = await getDeviceList(standardPoints);
        globalParamsState.queryLoading = false;
      } catch (error) {
        globalParamsState.queryLoading = false;
      }
    };
    // 新增 编辑弹框提交
    const onAddUpdateDialogSubmit = () => {
      if (globalParamsState.loading) {
        return;
      }
      form.value.validate((res: any) => {
        if (res) {
          if (globalParamsState.pageForm.id !== -1) {
            getGlobalParameterUpdate();
          } else {
            getGlobalParameterAdd();
          }
        }
      });
    };
    // 新增全局参数
    const getGlobalParameterAdd = async () => {
      const { name, timeTypes, unit, paramTypes, energyCode, deviceId } = globalParamsState.pageForm;
      try {
        globalParamsState.reqLoading = true;
        const res = await globalParameterService.getGlobalParameterAdd({
          name,
          timeTypes: timeTypes.join(','),
          unit,
          paramType: paramTypes[paramTypes.length - 1],
          code: energyCode,
          addDTO: !deviceId ? null : getRelationDeviceParams(deviceList.value, deviceId),
        });
        if (res && res.code === 200 && res.data) {
          message.success('新增成功');
          queryGlobalParameterList();
          globalParamsState.reqLoading = false;
          globalParamsState.dialogVisible = false;
          onbeforeClose();
        } else {
          globalParamsState.reqLoading = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            message.error(res.message || '新增失败');
          }
        }
      } catch (error) {
        globalParamsState.reqLoading = false;
        message.error('新增失败');
      }
    };
    // 编辑全局参数
    const getGlobalParameterUpdate = async () => {
      const { id, name, timeTypes, unit, paramTypes, energyCode, deviceId } = globalParamsState.pageForm;
      try {
        globalParamsState.reqLoading = true;
        const res = await globalParameterService.getGlobalParameterUpdate({
          id: Number(id),
          name,
          timeTypes: timeTypes.join(','),
          unit,
          paramType: paramTypes[paramTypes.length - 1],
          code: energyCode,
          addDTO: !deviceId ? null : getRelationDeviceParams(deviceList.value, deviceId),
        });
        if (res && res.code === 200 && res.data) {
          message.success('编辑成功');
          queryGlobalParameterList();
          globalParamsState.reqLoading = false;
          onbeforeClose();
        } else {
          globalParamsState.reqLoading = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            message.error(res.message || '编辑失败');
          }
        }
      } catch (error) {
        globalParamsState.reqLoading = false;
        message.error('编辑失败');
      }
    };
    // pagesize
    const onSizeChange = (value: number) => {
      globalParamsState.queryParams.pageNum = 1;
      globalParamsState.queryParams.pageSize = value;
      queryGlobalParameterList();
    };
    const onCurrentChange = (value: number) => {
      globalParamsState.queryParams.pageNum = Math.floor(value);
      queryGlobalParameterList();
    };
    // 请求列表
    const queryGlobalParameterList = async () => {
      try {
        const { queryParams } = globalParamsState;
        globalParamsState.loading = true;
        const res = await globalParameterService.queryParameterList(queryParams);
        if (res && res.code === 200 && res.success) {
          if (res.data && res.data.list) {
            globalParamsState.loading = false;
            globalParamsState.dataSource = res.data?.list ?? [];
            globalParamsState.total = res.data?.total ?? 0;
          } else {
            globalParamsState.loading = false;
            globalParamsState.dataSource = [];
            globalParamsState.total = res.data?.total;
          }
        } else {
          globalParamsState.loading = false;
          globalParamsState.dataSource = [];
          globalParamsState.total = 0;
        }
      } catch (error) {
        globalParamsState.loading = false;
        globalParamsState.dataSource = [];
        globalParamsState.total = 0;
      }
    };
    // 参数类型change
    const onCascaderChange = (value: number[]) => {
      const type = value.length && value[value.length - 1];
      globalParamsState.pageForm.timeTypes = [];
      globalParamsState.disabledList = [false, false, false, false];
      globalParamsState.pageForm.energyCode = '';
      if (type === PARAM_TYPES.DEVICE_ACQUISITION) {
        queryEnergyTypeList();
      } else {
        if (type === PARAM_TYPES.SINGLE_DATA || type === PARAM_TYPES.ARITHMETIC_MEAN) {
          globalParamsState.disabledList = [true, true, false, false];
        }
        if (type === PARAM_TYPES.DATA_DIFFERENCE || type === PARAM_TYPES.DATE_DIFFERENCE) {
          globalParamsState.disabledList = [true, true, false, true];
        }
      }
    };
    // 删除确认
    const onDeleteConfirm = (id: number, paramType: number) => {
      ElMessageBox.confirm('确认删除该条数据?', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async (res: any) => {
          try {
            if (res === 'confirm') {
              const res = await globalParameterService.getGlobalParamterDelete({
                id,
                paramType,
              });
              if (res && res.code === 200 && res.success) {
                message.success('删除成功');
                queryGlobalParameterList();
              } else {
                if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                  message.error(res.message || '删除失败');
                }
              }
            }
          } catch (error) {
            message.error('删除失败');
          }
        })
        .catch(() => {});
    };
    // 弹框关闭前
    const onbeforeClose = () => {
      globalParamsState.dialogVisible = false;
      globalParamsState.reqLoading = false;
      form.value.resetFields();
      globalParamsState.pageForm = {
        id: -1,
        name: '',
        unit: '',
        paramTypes: [],
        energyCode: '',
        timeTypes: [],
        standardPointName: '',
        deviceId: '',
      };
      deviceList.value = [];
    };
    /**
     * 初始化
     */
    onMounted(() => {
      queryGlobalParameterList();
    });

    return {
      ...toRefs(globalParamsState),
      pageSizes,
      rules,
      timeUnits,
      form,
      deviceList,
      FORM_CHECK_RULES,
      PARAM_TYPES,
      INPUT_TYPES,

      onSearch,
      onReset,
      onAddDialogShow,
      onSizeChange,
      onCurrentChange,
      onPageTo,
      onUpdateDialogShow,
      onbeforeClose,
      onDeleteConfirm,
      onCascaderChange,
      onAddUpdateDialogSubmit,
      resetTimeUnit,
      onEnergyCodeChange,
    };
  },
});
