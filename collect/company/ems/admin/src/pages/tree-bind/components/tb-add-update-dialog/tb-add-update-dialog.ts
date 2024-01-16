import { defineComponent, reactive, toRefs, watch } from 'vue';
import treeBindingService from '@/pages/tree-bind/service/tree-bind.service';
import useCurrentInstance from '@/utils/use-current-instance';
// components
import SelectList from '../tb-select-list/tb-select-list.vue';

interface AddState {
  visible: boolean;
  loading: boolean;
  concentratorList: TreeBindingModule.ConcentratorInfo[];
  deviceList: TreeBindingModule.ConcentratorInfo[];
  pointList: TreeBindingModule.DevicePointInfoListInfo[];
  concentratorId: number;
  deviceId: number;
  pointNumber: number;
  pointId: number;
  concentratorLoading: boolean;
  deviceLoading: boolean;
  pointLoading: boolean;
}

export default defineComponent({
  name: 'BindingPointAddDialog',
  props: {
    energyCode: {
      type: String,
      default: '',
    },
  },
  components: {
    SelectList,
  },
  emits: ['add'],
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    const addState = reactive<AddState>({
      visible: false,
      loading: false,
      concentratorList: [],
      deviceList: [],
      pointList: [],
      concentratorId: 0,
      deviceId: 0,
      pointId: -1,
      pointNumber: -1,
      concentratorLoading: false,
      deviceLoading: false,
      pointLoading: false,
    });
    /**
     * 监听分类分项变化
     */
    watch(
      () => props.energyCode,
      () => {
        addState.concentratorId = 0;
        addState.deviceList = [];
        addState.deviceId = 0;
        addState.pointList = [];
        addState.pointNumber = -1;
      },
    );
    /**
     * 打开弹框重置数据
     */
    const show = () => {
      addState.visible = true;
      getConcentratorList();
      // addState.concentratorId = 0;
      // addState.deviceList = [];
      // addState.deviceId = 0;
      // addState.pointList = [];
      // addState.pointNumber = -1;
    };
    // 选择站点
    const onConcentratorChoose = () => {
      addState.pointList = [];
      addState.pointId = -1;
      addState.pointNumber = -1;
      addState.deviceList = [];
      addState.deviceId = -1;
      getDeviceList();
    };
    // 选择设备
    const onDeviceIdChoose = () => {
      addState.pointList = [];
      addState.pointId = -1;
      addState.pointNumber = -1;
      getPointList();
    };
    /**
     * 请求站点列表
     */
    const getConcentratorList = async () => {
      try {
        addState.concentratorLoading = true;
        const res = await treeBindingService.getConcentratorList();
        if (res && res.code === 200 && res.data) {
          addState.concentratorList = res.data;
          addState.concentratorLoading = false;
        } else {
          addState.concentratorLoading = false;
          addState.concentratorList = [];
        }
      } catch (error) {
        addState.concentratorLoading = false;
        proxy.$message.error('请求失败！');
      }
    };
    /**
     * 请求设备列表
     */
    const getDeviceList = async () => {
      const { energyCode } = props;
      const { concentratorId } = addState;
      try {
        addState.deviceLoading = true;
        const res = await treeBindingService.getDeviceList({
          id: concentratorId,
          energyCode,
        });
        if (res && res.code === 200 && res.data) {
          addState.deviceList = res.data;
          addState.deviceLoading = false;
        } else {
          addState.deviceList = [];
          addState.deviceLoading = false;
        }
      } catch (error) {
        addState.deviceLoading = false;
        proxy.$message.error('请求失败！');
      }
    };
    /**
     * 查询点位列表
     */
    const getPointList = async () => {
      const { deviceId } = addState;
      const { energyCode } = props;
      try {
        addState.pointLoading = true;
        const res = await treeBindingService.getPointListByDeviceId({
          energyCode,
          id: deviceId,
        });
        if (res && res.code === 200 && res.data) {
          addState.pointList = res.data;
          addState.pointLoading = false;
        } else {
          addState.pointLoading = false;
          addState.pointList = [];
        }
      } catch (error) {
        addState.pointLoading = false;
        addState.pointList = [];
      }
    };
    /**
     * 提交
     */
    const onSubmit = () => {
      const { concentratorId, deviceId, pointId } = addState;
      if (!concentratorId) {
        proxy.$message.warning('请选择站点！');
        return;
      }
      if (!deviceId) {
        proxy.$message.warning('请选择设备！');
        return;
      }
      if (pointId < 0) {
        proxy.$message.warning('请选择点位！');
        return;
      }
      let pointNumber = -1;
      let standardPointCode = '';
      let concentratorName = '';
      let deviceName = '';
      let pointName = '';
      addState.pointList.forEach((item) => {
        if (item.id === pointId) {
          standardPointCode = item.standardPointCode;
          pointName = item.name;
          pointNumber = item.pointNumber;
        }
      });
      addState.concentratorList.forEach((item) => {
        if (item.id === concentratorId) {
          concentratorName = item.name;
        }
      });
      addState.deviceList.forEach((item) => {
        if (item.id === deviceId) {
          deviceName = item.name;
        }
      });
      emit('add', {
        concentratorId,
        concentratorName,
        pointNumber,
        pointName,
        pointId,
        deviceId,
        deviceName,
        standardPointCode,
      });
      addState.visible = false;
    };
    return {
      ...toRefs(addState),
      show,
      onSubmit,
      getDeviceList,
      onDeviceIdChoose,
      onConcentratorChoose,
    };
  },
});
