/*
 * @Description: 能源事件库
 * @Autor: kongx
 * @Date: 2022-05-12 10:53:11
 * @LastEditors: kongx
 * @LastEditTime: 2022-05-18 11:08:13
 */
import message from '@/utils/message';
import { reactive, ref, onMounted, defineComponent, watch, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { pageSizesArray } from '@/config';
import { EnergyEventSearchForm, EnergyEventList, EnergyEventCard } from './constant/options';
import EnergyEventDetailDialog from './components/energy-event-detail-dialog/energy-event-detail-dialog.vue';
import energyEventLibrary from './services/energy-event-library.service';
import { get, cloneDeep } from 'lodash';
import { ElMessage } from 'element-plus';
import { FBlobHandler } from '@/pages/management-analysis/ma-annual-details/services/services.api';
import { DetailForm } from './constant/options';

interface EnergyEventState {
  pageForm: EnergyEventSearchForm;
  total: number;
  loading: boolean;
  dataSource: EnergyEventList[];
}

export default defineComponent({
  name: 'EnergyEventLibrary',
  components: { EnergyEventDetailDialog },
  setup() {
    const exportDisable = ref<boolean>(false);
    //组件dom元素
    const internalInstance = getCurrentInstance() as ComponentInternalInstance;
    //卡片数据
    const energyEventCard = ref<EnergyEventCard[]>([]);
    // 卡片滚动
    const cardIndex = ref<number>(0);
    // 卡片滚动长度
    const cardScrollX = ref<string>('transform: translateX(0px)');
    //卡片滚动左边按钮显示
    const canSwipeLeft = ref<boolean>(false);
    //卡片滚动右边按钮显示
    const canSwipeRight = ref<boolean>(true);
    // 能耗明细详情数据
    const eventDetailObj = reactive<DetailForm>({
      eventTitle: '',
      eventTypeName: '',
      eventDetail: '',
      entryPersonnel: '',
    });
    // 能耗明细详情弹框是否显示
    const energyEventDialogVisible = ref<boolean>(false);
    // 能耗明细查询初始值条件
    const formInitialObj = reactive<EnergyEventSearchForm>({
      year: '2022',
      eventTypeId: '0',
      pageNum: 1,
      pageSize: pageSizesArray[0],
    });
    // 能耗明细查询
    const energyEventState = reactive<EnergyEventState>({
      pageForm: cloneDeep(formInitialObj),
      total: 0,
      loading: true,
      dataSource: [],
    });
    // 头部表单提交
    const onSubmit = () => {
      onQuery();
      getEnergyEventLibraryCardList();
    };
    // 重置
    const onReset = () => {
      energyEventState.pageForm = cloneDeep(formInitialObj);
      energyEventState.pageForm.year = String(new Date().getFullYear());
      onQuery();
      getEnergyEventLibraryCardList();
    };
    // 每页条数change
    const onSizeChange = (value: number) => {
      energyEventState.pageForm.pageNum = 1;
      energyEventState.pageForm.pageSize = value;
      onQuery();
    };
    // 分页
    const onPageChange = (value: number) => {
      energyEventState.pageForm.pageNum = value;
      onQuery();
    };
    // 查询列表
    const onQuery = async () => {
      energyEventState.loading = true;
      try {
        const res = await energyEventLibrary.queryEnergyEventLibraryList(energyEventState.pageForm);
        if (get(res, 'code', 0) === 200 && get(res, 'data', '')) {
          energyEventState.dataSource = get(res.data, 'list', []);
          energyEventState.total = res.data?.total || 0;
        } else {
          energyEventState.dataSource = [];
          energyEventState.total = 0;
        }
      } catch (error) {
        energyEventState.dataSource = [];
        energyEventState.total = 0;
      } finally {
        energyEventState.loading = false;
      }
    };
    // 获取详情返回对象
    const getEnergyEventDetail = async (id: number) => {
      try {
        const res = await energyEventLibrary.queryEnergyEventLibraryListDeatil({ id });
        if (get(res, 'code', 0) === 200 && get(res, 'data', '')) {
          Object.entries(res.data).forEach(([k, v]) => {
            eventDetailObj[k as keyof DetailForm] = v as any;
          });
          energyEventDialogVisible.value = true;
        }
      } catch (error) {
      } finally {
      }
    };
    // 获取card数组
    const getEnergyEventLibraryCardList = async () => {
      try {
        const res = await energyEventLibrary.queryEnergyEventLibraryCardList({ year: energyEventState.pageForm.year });
        if (get(res, 'code', 0) === 200 && get(res, 'data', '')) {
          energyEventCard.value = get(res, 'data');
          energyEventCard.value.forEach((item) => {
            item.active = false;
          });
          energyEventCard.value[0].active = true;
        }
      } catch (error) {
        energyEventCard.value = [];
      } finally {
      }
    };
    // card图标和背景图
    const mapCardIcon = (name: string) => {
      let prefixIcon;
      let prefixBackground;
      switch (name) {
        case '能源单价调整':
          prefixIcon = require('@/assets/images/energy-event-library/eel-card-energyUnitPrice.svg');
          prefixBackground = require('@/assets/images/energy-event-library/eel-card-background-energyUnitPrice.svg');
          break;
        case '用能区域变化':
          prefixIcon = require('@/assets/images/energy-event-library/eel-card-area.svg');
          prefixBackground = require('@/assets/images/energy-event-library/eel-card-background-area.svg');
          break;
        case '大功率用能设备变更':
          prefixIcon = require('@/assets/images/energy-event-library/eel-card-energyEquipment.svg');
          prefixBackground = require('@/assets/images/energy-event-library/eel-card-background-energyEquipment.svg');
          break;
        case '综合业务量变化':
          prefixIcon = require('@/assets/images/energy-event-library/eel-card-aggregateVolume.svg');
          prefixBackground = require('@/assets/images/energy-event-library/eel-card-background-aggregateVolume.svg');
          break;
        case '区域业务调整':
          prefixIcon = require('@/assets/images/energy-event-library/eel-card-regionalBusiness.svg');
          prefixBackground = require('@/assets/images/energy-event-library/eel-card-background-regionalBusiness.svg');
          break;
        case '空调供应时段调整':
          prefixIcon = require('@/assets/images/energy-event-library/eel-card-supplyTime.svg');
          prefixBackground = require('@/assets/images/energy-event-library/eel-card-background-supplyTime.svg');
          break;
        case '其他调整':
          prefixIcon = require('@/assets/images/energy-event-library/eel-card-other.svg');
          prefixBackground = require('@/assets/images/energy-event-library/eel-card-background-other.svg');
          break;
        default:
          prefixIcon = require('@/assets/images/energy-event-library/eel-card-year.svg');
          prefixBackground = require('@/assets/images/energy-event-library/eel-card-background-year.svg');
      }
      return {
        iconUrl: prefixIcon,
        backgroundUrl: `url(${prefixBackground})`,
      };
    };
    // 能源事件库导出
    const exportFile = async () => {
      const messageInstance = message.loading('正在导出');
      try {
        exportDisable.value = true;
        const res: Blob = await energyEventLibrary.queryExportFileYear(energyEventState.pageForm.year);
        const symbol = Object.getOwnPropertySymbols(res)[0];
        const name = symbol ? (res as any)[symbol] : '能源事件信息.xlsx';
        await FBlobHandler(res, name);
        exportDisable.value = false;
        messageInstance.close();
        ElMessage({
          message: '导出成功',
          type: 'success',
        });
      } catch (error) {
        exportDisable.value = false;
        messageInstance.close();
        if (error && typeof error === 'string') {
          ElMessage({
            message: `导出失败,${error}`,
            type: 'error',
          });
        }
      } finally {
        messageInstance.close();
        exportDisable.value = false;
      }
    };
    // card按钮左移
    const swipeToLeft = () => {
      if (canSwipeLeft) {
        cardIndex.value--;
      }
    };
    // card按钮右移
    const swipeToRight = () => {
      if (canSwipeRight) {
        cardIndex.value++;
      }
    };
    // 点击单项card变大
    const clickCard = (eventTypeId: number) => {
      energyEventCard.value.forEach((item) => {
        item.active = false;
        if (item.eventTypeId === eventTypeId) {
          energyEventState.pageForm.eventTypeId = String(eventTypeId);
          item.active = true;
        }
      });
      onQuery();
    };
    // 左右移动card计算
    watch(cardIndex, (newVal) => {
      const scrollWidth: number = newVal * -236;
      cardScrollX.value = `translateX(${scrollWidth}px)`;
      canSwipeLeft.value = newVal > 0;
      const sectionClientWidth: number = get(internalInstance.refs, 'section.clientWidth', 0);
      const cardClientWidth: number = get(internalInstance.refs, 'scrollCard.clientWidth', 0);
      const minusCardWidth: number = sectionClientWidth - cardClientWidth;
      if (minusCardWidth < scrollWidth) {
        canSwipeRight.value = true;
      } else {
        canSwipeRight.value = false;
      }
    });

    /**
     * 初始化
     */
    onMounted(() => {
      energyEventState.pageForm.year = String(new Date().getFullYear());
      onQuery();
      getEnergyEventLibraryCardList();
    });

    return {
      exportDisable,
      energyEventDialogVisible,
      energyEventState,
      pageSizesArray,
      eventDetailObj,
      energyEventCard,
      cardScrollX,
      canSwipeLeft,
      canSwipeRight,
      onSubmit,
      onReset,
      onSizeChange,
      onPageChange,
      getEnergyEventDetail,
      mapCardIcon,
      exportFile,
      clickCard,
      swipeToLeft,
      swipeToRight,
    };
  },
});
