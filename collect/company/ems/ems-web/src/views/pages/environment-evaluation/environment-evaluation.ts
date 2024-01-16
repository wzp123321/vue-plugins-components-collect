import { defineComponent, ref, onMounted, reactive, computed, toRefs, nextTick, watch } from 'vue';
// 按需加载
// import { ElTooltip } from 'element-plus';
// utils
import { useStore } from 'vuex';
import { cloneDeep } from 'lodash';
import { formatDate } from '@/utils/index';
import { FGetElTreeDefaultProps, disabledProps } from '@/utils/token';
import { subDays } from 'date-fns';
import CommonService from '@/services/common/common.service';
import useCurrentInstance from '@/utils/use-current-instance';
// 折线图切换表格按钮icon
import { switchTableScatterChartIcons, switchLineChartTableIcons } from '@/config/config';
import url from '@/api/api-url';
import EELineChart from './components/ee-line-chart/ee-line-chart.vue'; // 折线图
import SubitemTargetChart from './components/ee-bar-chart/ee-bar-chart.vue'; // 柱状图
// services
import environment from '@/views/pages/environment-evaluation/services/environment-evaluation.service';
import { treeTypeList, dateScopeList } from '@/config/config';
import { useCommonController } from '@/utils/use-common-controller';
export interface TreeData {
  [key: string]: any;
}
// 头部搜索表单
interface formInlineType {
  treeId: any[];
  date: any[];
}

export default defineComponent({
  name: 'environmentEvaluation',
  components: {
    EELineChart,
    SubitemTargetChart,
  },
  setup() {
    const store = useStore();
    let serverDate;
    const { proxy } = useCurrentInstance();
    const formInline = reactive<formInlineType>({
      treeId: [],
      date: [],
    });
    // 图片url
    const envImgUrl = reactive({
      highScore: require('../../../assets/img/environment-evaluation/ee-high-score.svg'),
      lowerScore: require('../../../assets/img/environment-evaluation/ee-low-score.svg'),
      arrowUp: require('../../../assets/img/environment-evaluation/ee-arrow-up.png'),
      arrowDown: require('../../../assets/img/environment-evaluation/ee-arrow-down.png'),
      questionMark: require('../../../assets/img/environment-evaluation/ee-question-mark.svg'),
    });
    const lightOrDark = computed(() => {
      return store.getters.theme == 'light' ? true : false;
    });
    const selected = ref<number>(1); //图标switch按钮选中
    const switchIconSelect = ref<number>(1);
    let formInlineCopy: formInlineType; //深拷贝初始化的form表单 便于重置
    const analysisObjectExpanedKeys = ref<any>([]);
    // 树列表
    const treeList = ref<any[]>([]);
    const activeName = ref<string>('first');
    const loadings = ref<boolean>(true);
    const envCardData = ref({}); // 环境卡片数据
    const averageLineChartData = ref({}); // 折线图数据
    const subitemTargetChart = ref([]); // 柱状图数据
    const envListData = ref([]); //环境监测分析表格
    const envNodeData = ref<any[]>([]); //下级节点评测表格
    const date = ref<string>('前一天'); //判断是否为同一天
    const envTip = ref<string>('暂无数据');
    // 导出loading
    const exportLoading = ref(false);
    const { getTreeList, treeType } = useCommonController();

    // 默认禁止选择日期
    const disabledDate = (time: Date) => {
      return time.getTime() > Date.now();
    };

    // 初始化日期
    const pageInit = async () => {
      try {
        serverDate = await CommonService.getServerDate();
        formInline.date = [serverDate, serverDate];
      } catch (err) {
        formInline.date = [new Date(), new Date()];
        console.log(err);
      }
    };

    // 递归函数
    //dataArray  从接口获取的数据
    //allDataArray  用来存放所有的数据
    //needLevel  想要的层级
    //level 当前层级，初始调用不用传，递归时会自己传
    const getAllDataArray = (dataArray: any, allDataArray: any, needLevel: number, level: number) => {
      level = !level ? 1 : level; //不传则默认是第一层
      if (dataArray && dataArray.length > 0) {
        for (let i = 0; i < dataArray.length; i++) {
          if (needLevel - 1 === level) {
            allDataArray.push(dataArray[i].treeId);
            return;
          }
          //递归调用
          getAllDataArray(dataArray[i].children, allDataArray, needLevel, level++);
        }
      }
    };

    // 获取分析对象--环境评估树节点
    const geteEvironmentTreeData = async () => {
      try {
        loadings.value = true;
        const res = await environment.getEmsTreeInfo();
        if (res && res.code === 200 && res.success) {
          treeList.value = res.data;
          // 递归--获取默认展开三层的treeId
          getAllDataArray(treeList.value, analysisObjectExpanedKeys.value, 3, 3);
          formInline.treeId = res.data?.length
            ? !res.data[0]?.lockFlag
              ? [res.data[0].treeId]
              : res.data[0]?.children?.length
              ? [res.data[0]?.children[0].treeId]
              : []
            : [];
        }
      } catch (err) {
        loadings.value = false;
        console.log('error', err);
      }
    };

    // 清空数据
    const clearData = () => {
      envCardData.value = {};
      subitemTargetChart.value = [];
      averageLineChartData.value = {};
      envListData.value = [];
      envNodeData.value = [];
    };

    let levelData: number[] = [];
    let upData: number[] = [];
    // 降序
    const getLevelSort = (score: any) => {
      return (a: any, b: any) => {
        const valueA = a[score];
        const valueB = b[score];
        if (valueA < valueB) return 1;
        else if (valueA > valueB) return -1;
        else return 0;
      };
    };

    // 升序
    const getUpSort = (score: any) => {
      return (a: any, b: any) => {
        const valueA = a[score];
        const valueB = b[score];
        if (valueA > valueB) return 1;
        else if (valueA < valueB) return -1;
        else return 0;
      };
    };

    // 获取数据
    const getTableList = async () => {
      try {
        clearData();
        // 每次查询后都要重置到echarts图表页
        selected.value = 1;
        switchIconSelect.value = 1;
        loadings.value = true;
        const obj = {
          endDate: formatDate(formInline.date[1], 'yyyy-MM-dd'),
          startDate: formatDate(formInline.date[0], 'yyyy-MM-dd'),
          treeId: formInline.treeId[0],
        };
        if (obj.endDate === obj.startDate) {
          date.value = '前一天';
        } else {
          date.value = '上月';
        }
        // 获取折线图数据
        const res = await environment.queryLineChart(obj);
        if (res && res.code == 200 && res.success) {
          // 环境分数--environmentalScoreVO
          envCardData.value = res.data.environmentalScoreVO;
          // 分项指标评测---柱状图数据--energyCodeEvaluatingVOList
          subitemTargetChart.value = res.data.energyCodeEvaluatingVOList;
          // 环境监测分析environmentalMonitoringAnalysisVO---折线图数据environmentalChartVO
          averageLineChartData.value = res.data.environmentalMonitoringAnalysisVO.environmentalChartVO || {};
          // 环境监测分析environmentalMonitoringAnalysisVO---表格environmentalListVOList
          envListData.value = res.data.environmentalMonitoringAnalysisVO.environmentalListVOList || [];
          // 下级节点评测sonTreeEvaluatingVOList
          // 默认降序排序
          let levelNode: any = [];
          if (res.data.sonTreeEvaluatingVOList) {
            levelNode = cloneDeep(res.data.sonTreeEvaluatingVOList);
          } else {
            levelNode = [];
          }
          levelData = levelNode.sort(getLevelSort('treeScore'));
          upData = levelNode.sort(getUpSort('treeScore'));
          envNodeData.value = cloneDeep(upData);
          // console.log(envNodeData.value);
          // envNodeData.value = res.data.sonTreeEvaluatingVOList || [];
          if (envNodeData.value.length === 0) {
            envTip.value = '暂无数据，末端节点无下级节点评测';
          }
          loadings.value = false;
        } else {
          clearData();
          loadings.value = false;
          envTip.value = res.message;
          // return proxy.$message.error(res.message);
        }
      } catch (err) {
        console.log(err);
        loadings.value = false;
        clearData();
      } finally {
        loadings.value = false;
      }
    };

    // 评分排序
    const order = ref<any>(null);
    const sortChange = (row: any) => {
      // console.log(row.order,order.value);
      if (row.order === null) {
        envNodeData.value = envNodeData.value;
      }
      // 降序-从大到小
      if (row.order == 'descending') {
        order.value = row.order;
        envNodeData.value = cloneDeep(levelData);
      }
      // 升序-从小到大
      if (row.order == 'ascending') {
        order.value = row.order;
        envNodeData.value = cloneDeep(upData);
      }
    };

    // 监听排序的变化
    watch(
      () => order.value,
      (oldVal: any, newVal: any) => {
        if (newVal === 'descending') {
          envNodeData.value = cloneDeep(levelData);
        }
        if (newVal === 'ascending') {
          envNodeData.value = cloneDeep(upData);
        }
        // console.log(oldVal,newVal);
      },
    );

    const onSubmit = () => {
      if (formInline.treeId.length < 1) {
        loadings.value = false;
        return proxy.$message.error('分析对象不能为空');
      }
      if (formInline.date === null) {
        loadings.value = false;
        return proxy.$message.error('请选择日期！');
      }
      getTableList();
    };

    const onReset = () => {
      formInlineCopy.date = [new Date(), new Date()];
      Object.assign(formInline, formInlineCopy);
      if (formInline.treeId.length < 1) return;
      onSubmit();
    };
    const switchIconChange = (date: number) => {
      // echarts 折线图按钮切换折线图宽度100px
      nextTick(() => {
        window.dispatchEvent(new Event('resize'));
      });
      selected.value = date;
    };

    // 导出
    const exportData = async () => {
      if (exportLoading.value) {
        return;
      }
      exportLoading.value = true;
      const params: any = {
        endDate: formatDate(formInline.date[1], 'yyyy-MM-dd'),
        startDate: formatDate(formInline.date[0], 'yyyy-MM-dd'),
        treeId: formInline.treeId[0],
      };
      // everyDayRankTableObj.exportType = params;
      await CommonService.getFileStreamDownload(
        params,
        url.downLoad.exportDownloadEnvironmentalMonitoringAnalysisUrl,
        '导出',
        () => {
          exportLoading.value = false;
        },
        () => {
          exportLoading.value = false;
        },
      );
    };

    onMounted(async () => {
      try {
        await geteEvironmentTreeData();
        if (!treeList.value || treeList.value?.length === 0) {
          loadings.value = false;
          return;
        }
        await pageInit();
        if (window.sessionStorage.getItem('ems-energyAbnormalParams')) {
          const params = JSON.parse(
            JSON.parse(JSON.stringify(window.sessionStorage.getItem('ems-energyAbnormalParams'))),
          );
          if (params && params.treeId) {
            formInline.treeId = params.treeId;
            formInline.date = [new Date(subDays(new Date(), 1)), new Date(subDays(new Date(), 1))];
            window.sessionStorage.removeItem('ems-energyAbnormalParams');
          }
        }
        formInlineCopy = cloneDeep(formInline);
        if (formInline.treeId.length < 1) {
          loadings.value = false;
          return;
        }
        await onSubmit();
      } catch (error) {
        loadings.value = false;
      }
    });

    return {
      ...toRefs(envImgUrl),
      envCardData,
      envNodeData,
      envListData,
      formInline,
      treeList,
      exportLoading,
      onSubmit,
      onReset,
      analysisObjectExpanedKeys,
      disabledDate,
      activeName,
      switchTableScatterChartIcons,
      switchLineChartTableIcons,
      switchIconChange,
      switchIconSelect,
      exportData,
      selected,
      lightOrDark,
      averageLineChartData,
      subitemTargetChart,
      loadings,
      treeTypeList,
      treeType,
      date,
      envTip,
      disabledProps,

      FGetElTreeDefaultProps,
      sortChange,
    };
  },
});
