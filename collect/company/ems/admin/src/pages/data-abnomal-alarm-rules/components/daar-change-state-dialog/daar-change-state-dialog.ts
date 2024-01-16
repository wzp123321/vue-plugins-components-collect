import { onMounted, computed, defineComponent, reactive, toRefs } from 'vue';
import useCurrentInstance from '@/utils/use-current-instance';
import abnomalAlarmRulesService from '@/pages/data-abnomal-alarm-rules/service/data-abnomal-alarm-rules.service';

interface changeState {
  visible: boolean;
  reasonInput: string;
}
export default defineComponent({
  name: 'energyAbomalDialog',
  props: {
    rowId: {
      type: Number,
      default: 0,
    },
    switchNum: {
      type: Number,
      default: 0,
    },
    state: {
      type: Number,
      default: 0,
    },
  },
  components: {},
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    const changeState = reactive<changeState>({
      visible: false,
      reasonInput: '',
    });
    onMounted(async () => {});
    const switchName = computed(() => {
      return props.switchNum;
    });
    // 打开弹框
    const show = async () => {
      await toReset();
      changeState.visible = true;
    };
    /**
     * 提交
     */
    const toSubmit = async () => {
      if (changeState.reasonInput == '') {
        return proxy.$message.info('请填写原因');
      }
      //开启or关闭
      if (props.switchNum == 1) {
        await toOpenState();
      } else if (props.switchNum == 0) {
        await closeSetting();
      }
    };
    /**
     * 重置
     */
    const toReset = () => {
      changeState.reasonInput = '';
      changeState.visible = false;
    };
    //启动
    const toOpenState = async () => {
      try {
        const params = {
          id: props.rowId,
          reason: changeState.reasonInput,
          status: '1',
        };
        //能耗分析状态启动
        if (props.state == 0) {
          const res = await abnomalAlarmRulesService.updatedEngAylData(params);
          if (res.code == 200 && res.success) {
            proxy.$message.success(res.message);
            //清空表格
            emit('initEngAlyTableData');
            changeState.visible = false;
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        }
        //告警规则启动
        if (props.state == 1) {
          const res = await abnomalAlarmRulesService.updatedAlarmRulesData(params);
          if (res.code == 200 && res.success) {
            proxy.$message.success(res.message);
            //清空表格
            emit('initAlarmRulesTabData');
            changeState.visible = false;
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        }
        //告警-能源异常启动
        if (props.state == 2) {
          const res = await abnomalAlarmRulesService.updatedEngAbnormalData(params);
          if (res.code == 200 && res.success) {
            proxy.$message.success(res.message);
            //清空表格
            emit('initEngAbnormalTabData');
            changeState.visible = false;
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        }
        //树类型启动
        if (props.state == 3) {
          const res = await abnomalAlarmRulesService.updatedEnergyTreeTypeData(params);
          if (res.code == 200 && res.success) {
            proxy.$message.success(res.message);
            //清空表格
            emit('initEnergyTreeTypeData');
            changeState.visible = false;
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        }
      } catch (error: any) {
        return proxy.$message.error(error.message);
      }
    };
    //关闭
    const closeSetting = async () => {
      try {
        const params = {
          id: props.rowId,
          reason: changeState.reasonInput,
          status: '0',
        };
        //能耗分析状态关闭
        if (props.state == 0) {
          const res = await abnomalAlarmRulesService.updatedEngAylData(params);
          if (res.code == 200 && res.success) {
            proxy.$message.success(res.message);
            //清空表格
            emit('initEngAlyTableData');
            changeState.visible = false;
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        }
        //告警规则关闭
        if (props.state == 1) {
          const res = await abnomalAlarmRulesService.updatedAlarmRulesData(params);
          if (res.code == 200 && res.success) {
            proxy.$message.success(res.message);
            //清空表格
            emit('initAlarmRulesTabData');
            changeState.visible = false;
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        }
        //告警-能源异常关闭
        if (props.state == 2) {
          const res = await abnomalAlarmRulesService.updatedEngAbnormalData(params);
          if (res.code == 200 && res.success) {
            proxy.$message.success(res.message);
            //清空表格
            emit('initEngAbnormalTabData');
            changeState.visible = false;
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        }
        //树类型关闭
        if (props.state == 3) {
          const res = await abnomalAlarmRulesService.updatedEnergyTreeTypeData(params);
          if (res.code == 200 && res.success) {
            proxy.$message.success(res.message);
            //清空表格
            emit('initEnergyTreeTypeData');
            changeState.visible = false;
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        }
      } catch (error: any) {
        return proxy.$message.error(error.message);
      }
    };

    return {
      ...toRefs(changeState),
      abnomalAlarmRulesService,
      show,
      switchName,
      toSubmit,
      toReset,
    };
  },
});
