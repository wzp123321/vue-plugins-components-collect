import { defineComponent, ref, toRefs, onMounted, reactive } from 'vue';
import useCurrentInstance from '@/utils/use-current-instance';
// services
import thresholdConfigService from '@/pages/threshold-config/service/threshold-config.service';
import { cloneDeep } from 'lodash';
import { formatEmptyValue } from '@/utils/index';
interface EnergyCodeState {
  total: number;
  loading: boolean;
  configList: ThresholdConfigModule.TableListItem[];
}
export default defineComponent({
  name: 'thresholdConfig',
  setup() {
    const { proxy } = useCurrentInstance();
    const configState = reactive<EnergyCodeState>({
      total: 0,
      loading: false,
      configList: [],
    });
    const editflag = ref(true); // 判断是否可以编辑
    onMounted(() => {
      onQueryConfigList(true);
    });
    /**
     * 请求列表
     */
    const onQueryConfigList = async (isLoding = false) => {
      if (isLoding) {
        configState.loading = true;
      }
      await thresholdConfigService
        .getThresholdCOnfigList()
        .then((res: any) => {
          if (res && res.success) {
            let tableList = res.data || [];
            tableList.forEach((element: any) => {
              element['_edit'] = false;
            });
            configState.configList = cloneDeep(tableList);
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              proxy.$message.error((res && res.message) || '操作失败');
            }
            configState.configList = [];
          }
          configState.loading = false;
        })
        .catch((error: Error) => {
          proxy.$message.error('操作失败');
          configState.loading = false;
        });
    };
    /**
     * 列表编辑
     */
    const handleEdit = (index: number, row: any) => {
      if (editflag.value) {
        configState.configList[index]._edit = true;
        editflag.value = false;
      } else {
        configState.configList[index]._edit = false;
        proxy.$message.error('有其他数据处于编辑状态，请先处理');
      }
    };
    /**
     * 编辑取消
     */
    const handleCancel = () => {
      onQueryConfigList();
      editflag.value = true;
    };
    /**
     * 编辑保存
     */
    const handleSave = async (index: number, row: any) => {
      let data: any = cloneDeep(configState.configList[index]);
      const keyData = {
        general: data.general,
        serious: data.serious,
        deadband: data.deadband,
      };
      const notEmptyRuleMap: any = {
        general: '普通异常值',
        serious: '严重异常值',
        deadband: '死区值',
      };
      for (const key in keyData) {
        let configValue = data[key];
        if (configValue === '') {
          proxy.$message.error(notEmptyRuleMap[key] + '不得为空！');
          return;
        }
        if ((configValue === '0' || configValue === 0) && key !== 'deadband') {
          // 普通异常值和严重异常值不可以为0，死区值可以为0
          proxy.$message.error(notEmptyRuleMap[key] + '不得为0！');
          return;
        }
        if (row.thresholdType == '6' && (key === 'general' || key === 'serious')) {
          // 节能考核异常值单独处理，大于等于100
          const reg = /(1000000000)|(\d{3,}(\.\d{0,2})?)/;
          if (!reg.test(configValue)) {
            proxy.$message.error(notEmptyRuleMap[key] + '必须大于等于100！');
            return;
          }
        }
      }
      const param = {
        general: Number(data.general),
        serious: Number(data.serious),
        deadband: Number(data.deadband),
        thresholdType: data.thresholdType,
        id: data.id,
      };
      if (param.general > param.serious) {
        proxy.$message.error('普通异常值不得大于严重异常值！');
        return;
      }
      await thresholdCOnfigUpdate(param);
      configState.configList[index]._edit = false;
      editflag.value = true;
    };
    /**
     * 修改阈值信息
     */
    const thresholdCOnfigUpdate = async (param: ThresholdConfigModule.UpdateThresholdConfigValueParam) => {
      await thresholdConfigService
        .getThresholdCOnfigUpdate(param)
        .then((res: any) => {
          if (res && res.success) {
            proxy.$message.success((res && res.message) || '编辑成功');
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              proxy.$message.error((res && res.message) || '编辑失败');
            }
          }
          onQueryConfigList(true);
        })
        .catch((error: Error) => {
          proxy.$message.error('操作失败');
          onQueryConfigList();
        });
    };
    return {
      ...toRefs(configState),
      onQueryConfigList,
      formatEmptyValue,
      handleEdit,
      handleCancel,
      handleSave,
      thresholdCOnfigUpdate,
    };
  },
});
