import { defineComponent, reactive, toRefs, ref, toRef, onMounted } from 'vue';
import KeyAreaAnalysisCard from './components/home-kaa-card.vue';
import HomeComponentContainer from '../home-component-container/home-component-container.vue';

import { noConfigImg } from '@/config/config';
import keyAreaAnalysis from './services/home-key-area-analysis';
import EnergyCodeService from './components/services/home-kaa-card';

import { FGetElTreeDefaultProps, disabledProps } from '@/utils/token';
import { openBlankUrl } from '@/utils/index';

import { useRoute } from 'vue-router';

export interface CardDataState {
  isCardLoading: boolean;
  isCardNoData: boolean;
  isCardNoDataMsg: string;
  isCardNoConfig: boolean;
  isCardNoConfigMsg: string;
  cardData: any[];
}
export default defineComponent({
  name: 'KeyAreaAnalysis',
  components: {
    KeyAreaAnalysisCard,
    'h-component-container': HomeComponentContainer,
  },
  props: {
    uid: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const route = useRoute();
    const title = toRef(props, 'title');
    const energyTypeData = ref<any[]>([]); // 存放能源类型数据
    const areaChooseData = ref<GlobalModule.CommonObject[]>([]);
    const formSearch = ref<GlobalModule.CommonObject>({
      energyType: [],
      areaChoose: [],
    });
    onMounted(async () => {
      try {
        await getEnergyTypeData();
        if (energyTypeData.value?.length === 0) {
          cardDataState.isCardLoading = false;
          return;
        }
        await getTreeData();
        if (areaChooseData.value?.length && formSearch.value.areaChoose?.length) {
          await getEnergyData();
        } else {
          cardDataState.isCardNoData = areaChooseData.value?.length !== 0;
          cardDataState.isCardNoConfig = areaChooseData.value?.length === 0;
          cardDataState.isCardNoDataMsg = '暂无数据';
          cardDataState.isCardNoConfigMsg = '暂未配置';
          cardDataState.isCardLoading = false;
        }
      } catch (err) {
        console.log(err);
      }
    });
    const cardDataState = reactive<CardDataState>({
      isCardLoading: true,
      isCardNoData: false,
      isCardNoDataMsg: '暂无数据',
      isCardNoConfig: false,
      isCardNoConfigMsg: '暂未配置',
      cardData: [],
    });

    // 获取能源类型数据
    const getEnergyTypeData = async () => {
      try {
        cardDataState.isCardLoading = true;
        const res = await EnergyCodeService.getAllEnergyCodeTree();
        if (res.code === 200 && res.success) {
          energyTypeData.value = res.data || [];
          formSearch.value.energyType = res.data && res.data.length > 0 ? [res.data[0].code] : [];
        }
      } catch (err) {
        cardDataState.isCardLoading = false;
      }
    };
    // 获取区域树数据
    const getTreeData = async () => {
      try {
        cardDataState.isCardLoading = true;
        cardDataState.isCardNoData = false;
        cardDataState.isCardNoConfig = false;
        const res = await keyAreaAnalysis.getAreaTree({
          energyCode: formSearch.value.energyType[0],
          id: props.uid,
        });
        if (res.code === 200 && res.success && res.data) {
          areaChooseData.value = [res?.data];
          formSearch.value.areaChoose =
            areaChooseData.value?.length > 0
              ? !areaChooseData.value[0]?.lockFlag
                ? [areaChooseData.value[0].id]
                : areaChooseData.value[0]?.childTree?.length
                ? [areaChooseData.value[0]?.childTree[0].id]
                : []
              : [];
          cardDataState.isCardLoading = false;
        } else {
          areaChooseData.value = [];
          formSearch.value.areaChoose = [];
          cardDataState.isCardNoData = true;
          cardDataState.isCardNoConfig = false;
          cardDataState.isCardNoConfigMsg = res?.message.includes('未配置数据源')
            ? '暂未配置'
            : res.message.includes('操作失败')
            ? '暂无数据'
            : res.message;
          cardDataState.isCardNoDataMsg = cardDataState.isCardNoConfigMsg;
          if (res?.code === 200) {
            cardDataState.isCardNoConfigMsg = '暂无数据';
            cardDataState.isCardNoDataMsg = '暂无数据';
          }
        }
      } catch (err) {
        areaChooseData.value = [];
        formSearch.value.areaChoose = [];
        cardDataState.isCardNoConfig = true;
        cardDataState.isCardNoConfigMsg = '暂无配置';
        cardDataState.isCardLoading = false;
      }
    };
    // 获取能源卡片数据
    const getEnergyData = async () => {
      try {
        cardDataState.isCardLoading = true;
        cardDataState.isCardNoData = false;
        cardDataState.isCardNoConfig = false;

        const res = await keyAreaAnalysis.getEnergy({
          energyCode: formSearch.value.energyType[0],
          treeId: formSearch.value.areaChoose[0],
        });
        if (res.code === 200 && res.success) {
          if (res.data) {
            cardDataState.cardData = res.data.map((item: any, index: number) => {
              // 不用三元运算 因为需求经常改
              if (index === 1) {
                item.lastYearValuePercentage = null;
              }
              if (index === 3) {
                item.lastValuePercentage = null;
              }
              return {
                unit: item.unit,
                hbTitle: item.hbTitle,
                tbTitle: item.tbTitle,
                monthCompare: item.monthRatio,
                value2: item.currentEnergyValue,
                yearCompare: item.yearRatio,
              };
            });
          } else {
            console.log(res);
            cardDataState.isCardNoData = true;
            cardDataState.isCardNoDataMsg = res?.message.includes('未配置数据源')
              ? '暂未配置'
              : res.message.includes('操作失败')
              ? '暂无数据'
              : res.message;
          }
        } else {
          cardDataState.isCardNoData = false;
          cardDataState.isCardNoConfig = false;
          if (res?.message.includes('未配置数据源')) {
            cardDataState.isCardNoConfig = true;
          } else {
            cardDataState.isCardNoData = true;
          }
          cardDataState.isCardNoConfigMsg = res?.message.includes('未配置数据源')
            ? '暂未配置'
            : res.message.includes('操作失败')
            ? '暂无数据'
            : res.message;
          cardDataState.isCardNoConfigMsg = cardDataState.isCardNoConfigMsg;
        }
      } catch (err) {
        cardDataState.isCardNoData = true;
        cardDataState.isCardNoConfig = false;
        cardDataState.isCardNoConfigMsg = '暂无数据';
      } finally {
        cardDataState.isCardLoading = false;
      }
    };
    // 能源类型事件切换
    const treeSelectChange = async () => {
      await getTreeData();
      if (areaChooseData.value?.length === 0) {
        cardDataState.isCardLoading = false;
        return;
      }
      await getEnergyData();
    };
    // 区域树选择切换
    const areaTreeSelectChange = async () => {
      await getEnergyData();
    };
    // 跳转详情
    const linkToDetailPage = () => {
      openBlankUrl('/web/energyAnalysis', 'web', route.query);
    };

    return {
      ...toRefs(cardDataState),
      formSearch,
      energyTypeData,
      areaChooseData,
      noConfigImg,
      disabledProps,
      title,

      FGetElTreeDefaultProps,
      treeSelectChange,
      getEnergyData,
      areaTreeSelectChange,
      getTreeData,
      linkToDetailPage,
    };
  },
});
