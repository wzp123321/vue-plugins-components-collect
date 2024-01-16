import { openBlankUrl } from '@/utils/index';
import { defineComponent, onMounted, ref, toRef } from 'vue';
import LineEcharts from './components/haea-line-charts/haea-line-charts.vue';
import WaterEcharts from './components/haea-water-charts/haea-water-charts.vue';
import HomeComponentContainer from '../home-component-container/home-component-container.vue';

import homeAlarmEventService from './services/home-alarm-event-analysis.service';
import _ from 'lodash';
import { useRoute } from 'vue-router';

export interface ItemCode {
  value: number;
  label: string;
}

export default defineComponent({
  name: 'AlarmEventAnalysis',
  components: { LineEcharts, WaterEcharts, 'h-component-container': HomeComponentContainer },
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
    const nums = ref<number>(1);
    const index = ref<number>(1);
    const normal = ref<boolean>(true);
    const classNormal = ref<boolean>(true);

    const periodErrorTitle = ref<string>('暂无数据');
    const pieErrorTitle = ref<string>('暂无数据');

    const duringAnalysisData = ref<{
      legendData: [string];
      eriesData: [any];
      xaxisData: [string];
    }>();
    const classificationStatisticsData = ref<any>();
    const duringAnalysisDataLoading = ref<boolean>(true);
    const classificationStatisticsDataLoading = ref<boolean>(true);
    const switchSelect = ref<number>(1); // 能源类型选中
    const switchItems = ref<ItemCode[]>([
      { label: '本月', value: 1 },
      { label: '本年', value: 2 },
    ]); // 能源类型数据源

    const switchChange = _.debounce((item: number) => {
      switchSelect.value = item;
      queryClassificationStatisticsData();
    }, 800);

    // 获取时段分析数据
    const queryDuringAnalysisData = async () => {
      try {
        duringAnalysisDataLoading.value = true;
        const res = await homeAlarmEventService.queryDuringAnalysisData();
        if (res.code === 200 && res.success) {
          duringAnalysisData.value = res.data;
          normal.value = true;
        } else {
          periodErrorTitle.value = res?.message.includes('未配置数据源')
            ? '暂未配置'
            : res.message.includes('操作失败')
            ? '暂无数据'
            : res.message;
          normal.value = false;
        }
      } catch (err) {
        normal.value = false;
      } finally {
        duringAnalysisDataLoading.value = false;
      }
    };
    // 获取分级统计数据
    const queryClassificationStatisticsData = async () => {
      classificationStatisticsDataLoading.value = true;
      try {
        const res = await homeAlarmEventService.queryClassificationStatisticsData({
          timeType: switchSelect.value,
        });
        if (res.code === 200 && res.success) {
          index.value++;
          classificationStatisticsData.value = res.data || [];
          classNormal.value = true;
        } else {
          pieErrorTitle.value = res?.message.includes('未配置数据源')
            ? '暂未配置'
            : res.message.includes('操作失败')
            ? '暂无数据'
            : res.message;
          classNormal.value = false;
        }
      } catch (err) {
        classNormal.value = false;
      } finally {
        classificationStatisticsDataLoading.value = false;
      }
    };
    // 跳转详情
    const linkToDetailPage = () => {
      openBlankUrl('/web/alarmManagement', 'web', route.query);
    };

    /**
     * 初始化
     */
    onMounted(async () => {
      queryDuringAnalysisData();
      queryClassificationStatisticsData();
    });

    return {
      switchChange,
      switchSelect,
      switchItems,
      nums,
      classificationStatisticsDataLoading,
      duringAnalysisDataLoading,
      duringAnalysisData,
      classificationStatisticsData,
      index,
      normal,
      classNormal,
      periodErrorTitle,
      pieErrorTitle,
      title,

      linkToDetailPage,
    };
  },
});
