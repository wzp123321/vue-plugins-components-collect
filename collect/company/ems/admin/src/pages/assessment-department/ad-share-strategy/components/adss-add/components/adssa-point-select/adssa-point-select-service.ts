import { reactive, ref, nextTick } from 'vue';
import { pointService, QueryParams, SelectedPoint, Adssa_PointItem } from './adssa-point-select-api';
import { cloneDeep, debounce } from 'lodash';
import message from '@/utils/message';

export class PointService {
  concentratorInput = ref('');
  concentratorLoading = ref(false);
  concentratorList = ref<Adssa_PointItem[]>([]);
  concentratorFilterList = ref<Adssa_PointItem[]>([]);

  deviceInput = ref('');
  deviceLoading = ref(false);
  deviceParams = reactive<QueryParams>({
    energyCode: '',
    id: '',
  });
  deviceList = ref<Adssa_PointItem[]>([]);
  deviceFilterList = ref<Adssa_PointItem[]>([]);

  pointInput = ref('');
  pointLoading = ref(false);
  pointParams = reactive<QueryParams>({
    energyCode: '01000',
    id: '',
  });
  pointList = ref<Adssa_PointItem[]>([]);
  pointFilterList = ref<Adssa_PointItem[]>([]);

  selectPoint = reactive<SelectedPoint>({
    concentratorId: '',
    concentratorName: '',
    deviceId: '',
    deviceName: '',
    pointNumberName: '',
    pointNumber: '',
    standardPointCode: '',
  });

  isInitPoint = ref(false);
  emit: Function;

  constructor(energyCode: string, initData: SelectedPoint | undefined | null, emit: any) {
    this.emit = emit;

    this.deviceParams.energyCode = energyCode;
    this.pointParams.energyCode = energyCode;
    if (initData) {
      this.isInitPoint.value = true;

      this.selectPoint.concentratorId = initData.concentratorId;
      this.selectPoint.concentratorName = initData.concentratorName;
      this.selectPoint.deviceId = initData.deviceId;
      this.selectPoint.deviceName = initData.deviceName;
      this.selectPoint.pointNumberName = initData.pointNumberName;
      this.selectPoint.pointNumber = initData.pointNumber;

      this.deviceParams.id = initData.concentratorId;
      this.pointParams.id = initData.deviceId;
    }
    this.getConcentratorList();
  }

  emitData() {
    this.emit('selectedPoint', cloneDeep(this.selectPoint));
  }

  async getConcentratorList() {
    this.concentratorLoading.value = true;
    this.pointLoading.value = true;
    this.deviceLoading.value = true;
    try {
      const res = await pointService.getConcentratorList({
        standardPointCode: '',
      });
      if (res && res.code === 200) {
        this.concentratorList.value = res.data
          ? res.data.map((item) => {
              return {
                id: item.id.toString(),
                name: item.name,
              };
            })
          : [];
        this.getConcentratorFilterList();

        if (res.data?.length !== 0) {
          if (!this.isInitPoint.value) {
            this.selectPoint.concentratorId = this.concentratorFilterList.value[0].id;
            this.selectPoint.concentratorName = this.concentratorFilterList.value[0].name;
            this.deviceParams.id = this.concentratorFilterList.value[0].id;
          }
          if (!isNaN(Number(this.deviceParams.id))) {
            this.getDeviceList();
          } else {
            this.deviceLoading.value = false;
            this.pointLoading.value = false;
          }
        } else {
          this.selectPoint.concentratorId = '';
          this.deviceLoading.value = false;
          this.pointLoading.value = false;
        }
      } else {
        this.deviceLoading.value = false;
        this.pointLoading.value = false;
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
      this.concentratorLoading.value = false;
    } catch (error) {
      this.deviceLoading.value = false;
      this.pointLoading.value = false;
    } finally {
      this.concentratorLoading.value = false;
    }
  }

  async getDeviceList() {
    this.deviceLoading.value = true;
    this.pointLoading.value = true;
    try {
      const res = await pointService.getDeviceList({
        standardPointCode: '',
        id: this.deviceParams.id,
      });
      if (res && res.code === 200) {
        this.deviceList.value = res.data
          ? res.data.map((item) => {
              return {
                id: item.id.toString(),
                name: item.name,
              };
            })
          : [];

        this.getDeviceFilterList();

        this.deviceLoading.value = false;
        if (res.data?.length !== 0) {
          if (!this.isInitPoint.value) {
            this.selectPoint.deviceId = this.deviceFilterList.value[0].id;
            this.selectPoint.deviceName = this.deviceFilterList.value[0].name;
            this.pointParams.id = this.deviceFilterList.value[0].id;
          }
          nextTick(() => {
            document.querySelector('.device-active')?.scrollIntoView({ block: 'center' });
          });
          if (!isNaN(Number(this.pointParams.id))) {
            this.getPointList();
          } else {
            this.deviceLoading.value = false;
            this.pointLoading.value = false;
          }
        } else {
          this.selectPoint.deviceId = '';
          // 设备查询失败，点位列表置空
          this.pointFilterList.value = [];
          this.pointLoading.value = false;
        }
      } else {
        this.selectPoint.deviceId = '';
        this.pointFilterList.value = [];
        this.pointLoading.value = false;
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      this.pointFilterList.value = [];
      this.pointLoading.value = false;
    } finally {
      this.deviceLoading.value = false;
    }
  }

  async getPointList() {
    this.pointLoading.value = true;
    try {
      const res = await pointService.getPointList(this.pointParams);
      if (res && res.code === 200) {
        this.pointList.value = res.data
          ? res.data.map((item) => {
              return {
                id: item.pointNumber.toString(),
                name: item.name,
                standardPointCode: item?.standardPointCode,
              };
            })
          : [];
        this.getPointFilterList();

        if (res.data?.length !== 0) {
          if (!this.isInitPoint.value) {
            this.selectPoint.pointNumber = '';
            this.selectPoint.pointNumberName = '';
          }
          // 把选中的点位滚动到可视区域
          nextTick(() => {
            document.querySelector('.concentrator-active')?.scrollIntoView({ block: 'center' });
            document.querySelector('.point-active')?.scrollIntoView({ block: 'center' });
          });
        } else {
          this.selectPoint.pointNumber = '';
          this.selectPoint.pointNumberName = '';
        }
        this.emitData();
      } else {
        this.selectPoint.pointNumber = '';
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
      this.pointLoading.value = false;
    } catch (error) {
    } finally {
      this.pointLoading.value = false;
    }
  }

  getConcentratorFilterList() {
    if (this.concentratorInput.value === '') {
      this.concentratorFilterList.value = this.concentratorList.value;
    } else {
      this.concentratorFilterList.value = this.concentratorList.value.filter((item) => {
        return item.name.indexOf(this.concentratorInput.value) !== -1;
      });
    }
    if (!this.isInitPoint.value) {
      this.selectPoint.concentratorId = this.concentratorFilterList.value[0]?.id ?? '';
      this.selectPoint.concentratorName = this.concentratorFilterList.value[0]?.name ?? '';
    }
  }

  getDeviceFilterList() {
    if (this.deviceInput.value === '') {
      this.deviceFilterList.value = this.deviceList.value;
    } else {
      this.deviceFilterList.value = this.deviceList.value.filter((item) => {
        return item.name.indexOf(this.deviceInput.value) !== -1;
      });
    }
    if (!this.isInitPoint.value) {
      this.selectPoint.deviceId = this.deviceFilterList.value[0]?.id ?? '';
      this.selectPoint.deviceName = this.deviceFilterList.value[0]?.name ?? '';
    }
  }

  getPointFilterList() {
    if (this.pointInput.value === '') {
      this.pointFilterList.value = this.pointList.value;
    } else {
      this.pointFilterList.value = this.pointList.value.filter((item) => {
        return item.name.indexOf(this.pointInput.value) !== -1;
      });
    }
  }

  inputChange = debounce((type: string) => {
    // 只要输入框变动，说明已经不是点位的初始化渲染了
    this.isInitPoint.value = false;
    if (type == 'concentrator') {
      this.getConcentratorFilterList();
      if (this.concentratorFilterList.value?.[0]) {
        this.deviceParams.id = this.concentratorFilterList.value[0].id;
        this.selectPoint.concentratorId = this.concentratorFilterList.value[0].id;
        this.selectPoint.concentratorName = this.concentratorFilterList.value[0].name;
        this.getDeviceList();
      } else {
        this.deviceFilterList.value = [];
        this.pointFilterList.value = [];
      }
    } else if (type === 'device') {
      this.getDeviceFilterList();
      if (this.deviceFilterList.value?.[0]) {
        this.pointParams.id = this.deviceFilterList.value[0].id;
        this.selectPoint.deviceId = this.deviceFilterList.value[0].id;
        this.selectPoint.deviceName = this.deviceFilterList.value[0].name;
        this.getPointList();
      } else {
        this.pointFilterList.value = [];
      }
    } else if (type === 'point') {
      this.getPointFilterList();
      this.selectPoint.pointNumber = '';
      this.selectPoint.pointNumberName = '';
      this.emitData();
    }
  }, 200);
}
