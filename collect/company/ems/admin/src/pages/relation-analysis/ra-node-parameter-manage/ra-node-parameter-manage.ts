import { defineComponent, reactive, toRefs, ref, onMounted, nextTick } from 'vue';
// config
import { pageSizes, treeTypeList, FORM_CHECK_RULES } from '@/config/index';
import { INPUT_TYPES } from '@/config/enum';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { useCommonController } from '@/utils/use-common-controller';
import { timeUnits, resetTimeUnit, onPageTo, getRelationDeviceParams } from '../utils/index';
import { getTreeExpandKeys } from '@/utils';
// service
import globalParameterService from '@/pages/relation-analysis/ra-global-parameter-manage/service/ra-global-parameter-manage.service';
import nodeParameterService from '@/pages/relation-analysis/ra-node-parameter-manage/service/ra-node-parameter-manage.service';
import { ParameTypeInfo } from '../ra-global-parameter-manage/ra-global-parameter-manage.api';
import { AssociateDeviceDetail } from '../relation-analysis.api';
import {
  ParameterQueryParams,
  NodeParamterForm,
  NodeParameterDetail,
  PARAM_TYPES,
} from './ra-node-parameter-manage.api';
import paramCommonController from '../common-controller';

import { ElForm, ElTree } from 'element-plus';

/**
 * @treeType 树类型
 * @treeList 树列表
 * @param selectedTreeIds 选中的树节点
 * @param treeLoading 树加载
 * @loading  loading
 * @dialogVisible 新增编辑开关
 * @queryParams 头部查询参数
 * @total 总数
 * @parameterTypeList 参数类型列表
 * @pageForm 新增编辑表单
 * @dataSource 数据源
 * @energyCodeList 能源类型列表
 * @disabledList 时间颗粒度禁用列表
 */
interface NodeParamsState {
  treeList: TreeManageModule.TreeDetail[];
  treeLoading: boolean;
  loading: boolean;
  reqLoading: boolean;
  formLoading: boolean;
  dialogVisible: boolean;
  queryParams: ParameterQueryParams;
  total: number;
  parameterTypeList: ParameTypeInfo[];
  pageForm: NodeParamterForm;
  dataSource: NodeParameterDetail[];
  energyCodeList: EnergyCodeManageModule.EnergyCodeCommonParams[];
  disabledList: boolean[];
  treeExpandKeys: number[];
  isAddFlag: boolean;
  treeMap: Map<number, number[]>;
}
const defaultProps = {
  label: 'treeName',
  disabled: '',
  children: 'childTree',
};

export default defineComponent({
  name: 'NodeParameterManage',
  setup() {
    const { proxy } = useCurrentInstance();
    const { getDeviceList } = paramCommonController();
    const form = ref(ElForm);
    const relationTree = ref(ElTree);
    const { getTreeWidthoutLocationList, treeType } = useCommonController();
    // 选中的树节点id
    const nodeParamsState = reactive<NodeParamsState>({
      loading: false,
      dialogVisible: false,
      treeLoading: false,
      formLoading: false,
      treeList: [],
      reqLoading: false,
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
        timeTypes: [],
        treeIds: [],
        energyCode: '',
        paramType: [],
        standardPointName: '',
        deviceId: '',
      },
      dataSource: [],
      energyCodeList: [],
      disabledList: [false, false, false, false],
      treeExpandKeys: [],
      isAddFlag: true,
      treeMap: new Map(),
    });
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
      paramType: [
        {
          required: true,
          message: '请选择参数类型',
          trigger: 'change',
        },
      ],
      treeIds: [
        {
          required: true,
          message: '请选择节点',
          trigger: 'blur',
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
    const deviceList = ref<AssociateDeviceDetail[]>([]);
    // 头部表单提交
    const onSubmit = () => {
      queryNodeParameterList();
    };
    // 充值
    const onReset = () => {
      nodeParamsState.queryParams.pageNum = 1;
      nodeParamsState.queryParams.pageSize = pageSizes[0];
      nodeParamsState.queryParams.keyword = '';
      queryNodeParameterList();
    };
    // 打开新增弹框
    const onAddDialogShow = async () => {
      nodeParamsState.isAddFlag = true;
      nodeParamsState.treeLoading = true;

      try {
        nodeParamsState.treeList = await getTreeWidthoutLocationList();
        nodeParamsState.treeExpandKeys = getTreeExpandKeys(nodeParamsState.treeList, 'id', 'childTree');
      } catch (error) {
        nodeParamsState.treeList = [];
      } finally {
        nodeParamsState.treeLoading = false;
      }
      nodeParamsState.pageForm.id = -1;
      nodeParamsState.dialogVisible = true;
      if (nodeParamsState.parameterTypeList.length === 0) {
        await getRelationTypeList();
      }
      nextTick(() => {
        form.value.clearValidate();
      });
    };
    // 树节点变化
    const onTreeSelect = () => {
      nodeParamsState.treeMap.set(treeType.value, nodeParamsState.pageForm.treeIds);
      nextTick(() => {
        form.value.clearValidate('treeIds');
      });
    };
    // 新增 编辑弹框提交
    const onAddUpdateDialogSubmit = () => {
      if (nodeParamsState.loading) {
        return;
      }
      form.value.validate((res: any) => {
        if (res) {
          if (!nodeParamsState.isAddFlag) {
            getNodeParameterUpdate();
          } else {
            getNodeParameterAdd();
          }
        }
      });
    };
    // 新增节点参数
    const getNodeParameterAdd = async () => {
      const treeIds = getTreeIdsFromMap();
      const { name, timeTypes, unit, paramType, energyCode, deviceId } = nodeParamsState.pageForm;
      try {
        const res = await nodeParameterService.getNodeParameterAdd({
          name,
          timeTypes: timeTypes.join(','),
          unit,
          paramType: paramType[paramType.length - 1],
          code: energyCode,
          treeIds,
          addDTO: !deviceId ? null : getRelationDeviceParams(deviceList.value, deviceId),
        });
        nodeParamsState.reqLoading = true;
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('新增成功');
          nodeParamsState.reqLoading = false;
          queryNodeParameterList();
          onbeforeClose();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '新增失败');
          }
          nodeParamsState.reqLoading = false;
        }
      } catch (error) {
        nodeParamsState.reqLoading = false;
        proxy.$message.error('新增失败');
      }
    };
    // 编辑节点参数
    const getNodeParameterUpdate = async () => {
      const treeIds = getTreeIdsFromMap();
      const { name, timeTypes, id, unit, paramType, energyCode, deviceId } = nodeParamsState.pageForm;
      try {
        const res = await nodeParameterService.getNodeParameterUpdate({
          paramId: Number(id),
          treeIds,
          name,
          timeTypes: timeTypes.join(','),
          unit,
          paramType: paramType[paramType.length - 1],
          code: energyCode,
          addDTO: !deviceId ? null : getRelationDeviceParams(deviceList.value, deviceId),
        });
        nodeParamsState.reqLoading = true;
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('编辑成功');
          queryNodeParameterList();
          nodeParamsState.reqLoading = false;
          onbeforeClose();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '编辑失败');
          }
          nodeParamsState.reqLoading = false;
        }
      } catch (error) {
        proxy.$message.error('编辑失败');
        nodeParamsState.reqLoading = false;
      }
    };
    // 从map中获取treeIds
    const getTreeIdsFromMap = () => {
      const { treeMap } = nodeParamsState;
      let list: number[] = [];
      treeMap.forEach((values: number[], key: number) => {
        list = [...list, ...values];
      });
      return list;
    };
    // pagesize
    const onSizeChange = (value: number) => {
      nodeParamsState.queryParams.pageNum = 1;
      nodeParamsState.queryParams.pageSize = value;
      queryNodeParameterList();
    };
    const onCurrentChange = (value: number) => {
      nodeParamsState.queryParams.pageNum = Math.floor(value);
      queryNodeParameterList();
    };
    // 请求列表
    const queryNodeParameterList = async () => {
      const { queryParams } = nodeParamsState;
      try {
        nodeParamsState.loading = true;
        const res = await nodeParameterService.queryNodeParameterList(queryParams);
        if (res && res.code === 200 && res.success) {
          if (res.data && res.data.list) {
            nodeParamsState.loading = false;
            nodeParamsState.dataSource = res.data?.list;
            nodeParamsState.total = res.data?.total;
          } else {
            nodeParamsState.loading = false;
            nodeParamsState.dataSource = [];
            nodeParamsState.total = res.data?.total;
          }
        } else {
          nodeParamsState.loading = false;
          nodeParamsState.dataSource = [];
          nodeParamsState.total = 0;
        }
      } catch (error) {
        nodeParamsState.loading = false;
        nodeParamsState.dataSource = [];
        nodeParamsState.total = 0;
      }
    };
    // 查询关联类型列表
    const getRelationTypeList = async () => {
      try {
        const res = await globalParameterService.getQueryCorrelationParamTypeNameList();
        if (res && res.code === 200 && res.success) {
          if (res.data && res.data.length) {
            nodeParamsState.parameterTypeList = res.data;
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '查询关联类型失败');
          }
          nodeParamsState.parameterTypeList = [];
        }
      } catch (error) {
        proxy.$message.error('查询关联类型失败');
      }
    };
    // 参数类型change
    const onCascaderChange = (value: number[]) => {
      const type = value.length && value[value.length - 1];
      nodeParamsState.pageForm.timeTypes = [];
      nodeParamsState.pageForm.energyCode = '';
      nodeParamsState.disabledList = [false, false, false, false];
      if (type === PARAM_TYPES.DEVICE_ACQUISITION) {
        queryEnergyTypeList();
      } else if (type === PARAM_TYPES.TIMETABLE) {
        nodeParamsState.disabledList = [false, false, false, false];
      } else if (type === PARAM_TYPES.SINGLE_DATA || type === PARAM_TYPES.ARITHMETIC_MEAN) {
        nodeParamsState.disabledList = [true, true, false, false];
      } else if (type === PARAM_TYPES.DATA_DIFFERENCE || type === PARAM_TYPES.DATE_DIFFERENCE) {
        nodeParamsState.disabledList = [true, true, false, true];
      }
    };
    // 请求能源类型列表
    const queryEnergyTypeList = async () => {
      try {
        const res = await globalParameterService.getEnergyList();
        if (res && res.data && res.success) {
          if (res.data && res.data.length) {
            nodeParamsState.energyCodeList = res.data;
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '查询能源类型失败');
          }
        }
      } catch (error) {
        proxy.$message.error('查询能源类型失败');
      }
    };
    // 删除确认
    const onDeleteConfirm = (id: number, paramType: number) => {
      proxy
        .$confirm('确认删除该条数据?', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(async (res: any) => {
          try {
            if (res === 'confirm') {
              const res = await nodeParameterService.getNodeParamterDelete({
                id,
                paramType,
              });
              if (res && res.code === 200 && res.success) {
                proxy.$message.success('删除成功');
                queryNodeParameterList();
              } else {
                if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                  proxy.$message.error(res.message || '删除失败');
                }
              }
            }
          } catch (error) {
            proxy.$message.error('删除失败');
          }
        })
        .catch(() => {});
    };
    // 弹框关闭前
    const onbeforeClose = () => {
      nodeParamsState.dialogVisible = false;
      nodeParamsState.reqLoading = false;
      form.value.resetFields();
      nodeParamsState.pageForm = {
        id: -1,
        name: '',
        unit: '',
        timeTypes: [],
        treeIds: [],
        energyCode: '',
        paramType: [],
        standardPointName: '',
        deviceId: '',
      };
      deviceList.value = [];
      nodeParamsState.treeMap = new Map();
      treeType.value = 1;
    };
    // 打开关联节点弹框
    const onRelationNodeDialogShow = async (row: NodeParameterDetail) => {
      try {
        nodeParamsState.isAddFlag = false;
        nodeParamsState.dialogVisible = true;
        nodeParamsState.formLoading = true;
        const {
          unit,
          name,
          paramId,
          timeTypes,
          paramType,
          treeMap,
          energyCode,
          standardPointName,
          deviceId,
          pointNumber,
        } = row;
        let treeIds: number[] = [];
        let treeNames: string[] = [];
        if (Object.keys(treeMap) && Object.keys(treeMap).length) {
          Object.keys(treeMap).forEach((item) => {
            nodeParamsState.treeMap.set(Number(item), treeMap[item].treeIds);
            if (item === String(2) && treeMap[item].treeIds?.length && treeMap[1]?.treeIds?.length === 0) {
              treeType.value = 2;
            } else {
              treeType.value = 1;
            }
            treeIds = [...treeIds, ...treeMap[item].treeIds];
            treeNames = [...treeNames, ...treeMap[item].treeNames];
          });
        }

        nodeParamsState.treeLoading = true;
        try {
          nodeParamsState.treeList = await getTreeWidthoutLocationList();
          nodeParamsState.treeExpandKeys = getTreeExpandKeys(nodeParamsState.treeList, 'id', 'childTree');
        } catch (error) {
          nodeParamsState.treeList = [];
        } finally {
          nodeParamsState.treeLoading = false;
        }

        if (nodeParamsState.parameterTypeList.length === 0) {
          await getRelationTypeList();
        }

        if (paramType === PARAM_TYPES.DEVICE_ACQUISITION || paramType === PARAM_TYPES.TIMETABLE) {
          nodeParamsState.disabledList = [false, false, false, false];
        } else if (paramType === PARAM_TYPES.SINGLE_DATA || paramType === PARAM_TYPES.ARITHMETIC_MEAN) {
          nodeParamsState.disabledList = [true, true, false, false];
        } else if (paramType === PARAM_TYPES.DATA_DIFFERENCE || paramType === PARAM_TYPES.DATE_DIFFERENCE) {
          nodeParamsState.disabledList = [true, true, false, true];
        }

        const paramTypes = [paramType];
        nodeParamsState.parameterTypeList.forEach((item) => {
          if (item.children && item.children.length) {
            const ids = item.children.map((childitem) => {
              return childitem.value;
            });
            if (ids.includes(paramType)) {
              paramTypes.unshift(item.value);
            }
          }
        });
        if (paramType == PARAM_TYPES.DEVICE_ACQUISITION) {
          onCascaderChange(paramTypes);
          // 查询设备
          await queryEnergyTypeList();
          onEnergyCodeChange(energyCode);
        }

        let compTimeTypes = !timeTypes || timeTypes.length === 0 ? [] : timeTypes.split(',');
        compTimeTypes = compTimeTypes.filter((item) => {
          return item;
        });
        nodeParamsState.pageForm = {
          unit,
          name,
          id: paramId,
          timeTypes: compTimeTypes,
          paramType: paramTypes,
          treeIds,
          energyCode,
          standardPointName,
          deviceId: !deviceId ? '' : `${deviceId}_${pointNumber}`,
        };
        nextTick(() => {
          form.value.clearValidate();
          nodeParamsState.formLoading = false;
        });
      } catch (error) {
        nodeParamsState.formLoading = true;
      }
    };
    // 切换树类型
    const onTreeTypeChange = async () => {
      nodeParamsState.treeLoading = true;
      try {
        nodeParamsState.treeList = await getTreeWidthoutLocationList();
        nodeParamsState.pageForm.treeIds = nodeParamsState.treeMap.has(treeType.value)
          ? (nodeParamsState.treeMap.get(treeType.value) as number[])
          : [];
        nodeParamsState.treeExpandKeys = getTreeExpandKeys(nodeParamsState.treeList, 'id', 'childTree');
      } catch (error) {
        nodeParamsState.treeList = [];
      } finally {
        nodeParamsState.treeLoading = false;
      }

      form.value.validateField('treeIds');
    };
    // 重置表格上节点名渲染
    const resetTreeNames = (treeMap: { [key: number]: { treeIds: number[]; treeNames: string[] } }) => {
      let names: string[] = [];
      if (Object.keys(treeMap) && Object.keys(treeMap).length) {
        Object.keys(treeMap).forEach((item) => {
          names = [...names, ...treeMap[item].treeNames];
        });
      }
      return names.join(',');
    };
    // 能源类型change
    const onEnergyCodeChange = async (value: string) => {
      deviceList.value = [];
      try {
        let standardPoints = '';
        nodeParamsState.formLoading = true;
        nodeParamsState.energyCodeList.forEach((item) => {
          if (item.code === value) {
            standardPoints = item.standardPoints as string;
          }
        });
        nodeParamsState.pageForm.deviceId = '';
        deviceList.value = await getDeviceList(standardPoints);
        nodeParamsState.formLoading = false;
      } catch (error) {
        nodeParamsState.formLoading = false;
      }
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      await queryNodeParameterList();
    });
    return {
      ...toRefs(nodeParamsState),
      pageSizes,
      rules,
      form,
      timeUnits,
      treeTypeList,
      defaultProps,
      FORM_CHECK_RULES,
      treeType,
      deviceList,
      relationTree,
      PARAM_TYPES,
      INPUT_TYPES,
      onSubmit,
      onReset,
      onAddDialogShow,
      onSizeChange,
      onCurrentChange,
      onPageTo,
      onbeforeClose,
      onDeleteConfirm,
      onCascaderChange,
      onAddUpdateDialogSubmit,
      onRelationNodeDialogShow,
      onTreeTypeChange,
      resetTimeUnit,
      resetTreeNames,
      onEnergyCodeChange,
      onTreeSelect,
    };
  },
});
