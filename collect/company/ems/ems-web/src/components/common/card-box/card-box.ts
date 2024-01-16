import { defineComponent, ref, computed, watch, onUnmounted, reactive, onMounted } from 'vue';
import useCurrentInstance from '@/utils/use-current-instance';

import CommonService from '@/services/common/common.service';

// utils
import { openBlankUrl } from '@/utils/index';
import { useRoute } from 'vue-router';
import { Subject } from 'rxjs';
import HomeRankService from '@/views/pages/home/services/home-rank.service';
import { getCampusParams } from '@/utils/token';

export default defineComponent({
  name: 'CardBox',
  props: {
    headTitle: {
      type: String,
      default: '',
    },
    componentCode: {
      type: String,
      default: '',
    },
    uid: {
      type: Number,
      default: null,
    },
    isSwitch: {
      try: Array,
      default: [],
    },
    treeRankList: {
      try: Array,
      default: [],
    },
    configContent: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    //#region 生命周期
    const _destroy$ = new Subject<void>();
    const hRankService = reactive(HomeRankService);

    const componentRequestParams = ref<any>({});

    const route = useRoute();
    const { proxy } = useCurrentInstance();
    const associationDownLoadUrl = '/energyPortal/exportCorrelationAnalyseExcel';

    const associationDownLoadLoading = ref(false);

    const isDownLoadBtnShow = computed(() => {
      props.isSwitch.forEach((item: any) => {
        if (item.id === props.uid) {
          const downLoadBtnDom = <HTMLImageElement>document.querySelector(`.isShow_${props.uid}`);
          // console.log(item);
          if (item.isShow) {
            downLoadBtnDom.style.display = 'none';
          } else {
            downLoadBtnDom.style.display = 'block';
          }
        }
      });
    });
    // 树的id
    onMounted(() => {
      proxy.emitter.on('sendRequestParams', (value: any) => {
        componentRequestParams.value = value;
      });
    });

    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
    });

    // 关联分析下载
    const associationDownLoad = async () => {
      if (associationDownLoadLoading.value) {
        return;
      }
      associationDownLoadLoading.value = true;
      try {
        const params = {
          id: props.uid,
          ...componentRequestParams.value,
          ...getCampusParams(),
        };
        await CommonService.getFileStreamDownload(
          params,
          associationDownLoadUrl,
          '导出',
          () => {
            associationDownLoadLoading.value = false;
          },
          () => {
            associationDownLoadLoading.value = false;
          },
        );
      } catch (error) {
        proxy.$message.error(error);
        associationDownLoadLoading.value = false;
      }
    };

    const goDetail = (code: string, uid: number) => {
      //  console.log(code, uid);
      let treeList: number[] = [];
      const list = props.treeRankList?.map((item: { code: string; uid: number; treeIds: number[] }) => {
        if (item.code === code && item.uid === uid) {
          treeList = item.treeIds;
        }
      });
      // treeList = list;
      // console.log('====', code, treeList);
      let path = '';
      switch (code) {
        // 告警事件详情
        case 'ZJ007':
          path = '/web/alarmManagement';
          break;
        // 同环比概览
        case 'ZJ002':
          path = '/web/energyAnalysis';
          break;
        // kpi
        case 'ZJ003':
          const configContent = props.configContent;
          let kipType;
          if (configContent) {
            const configContentdata = JSON.parse(configContent);
            kipType = configContentdata.kpiType;
          }
          if (kipType === '1') {
            path = '/web/energyConservationAssess';
          } else if (kipType === '2') {
            path = '/web/kpiManagement';
          }
          break;
        // 重点区域能耗
        case 'ZJ005':
          path = '/web/energyAnalysis';
          break;
        //  能源成本分析
        case 'ZJ006':
          path = '/web/costAnalysis';
          break;
        // 滑动能耗
        case 'ZJ008':
          path = '/web/energyAnalysis';
          break;
        // 用能分项
        case 'ZJ010':
          path = '/web/energyAnalysis';
          break;
        // 关联分析
        case 'ZJ011':
          path = '/web/relationAnalysis';
          break;
        // 能耗排名
        case 'ZJ004':
          window.sessionStorage.removeItem('ems-energyRankingLinkParam');
          // console.log('props.configContent=====', props.configContent);
          if (props.configContent) {
            const configContentdata = JSON.parse(props.configContent);

            const { treeType, energyCode, treeIdList } = configContentdata;
            const classid = treeType;
            const Itemcode = energyCode;

            const param = {
              classId: classid,
              itemCode: Itemcode,
              reportDate: '',
              areaId: treeList.length > 0 ? treeList.toString() : '',
              groupIdList: treeList.length > 0 ? treeList.toString() : '',
              valueMean: '1',
            };
            // console.log('param====', param);
            window.sessionStorage.setItem('ems-energyRankingLinkParam', JSON.stringify(param));
            path = '/web/energyRanking';
          } else {
            path = '/web/energyRanking';
          }

          break;
        // 单位面积能耗排名
        case 'ZJ013':
          window.sessionStorage.removeItem('ems-energyRankingLinkParam');
          if (props.configContent) {
            const configContentdata = JSON.parse(props.configContent);

            const { treeType, energyCode, treeIds } = configContentdata;
            const classid = treeType;
            const Itemcode = energyCode;

            const param = {
              classId: classid,
              itemCode: Itemcode,
              reportDate: '',
              areaId: treeList.length > 0 ? treeList.toString() : '',
              groupIdList: treeList.length > 0 ? treeList.toString() : '',
              valueMean: '3',
            };
            //   console.log('param2====', param);
            window.sessionStorage.setItem('ems-energyRankingLinkParam', JSON.stringify(param));
            path = '/web/energyRanking';
          } else {
            path = '/web/energyRanking';
          }
          break;
        default:
          break;
      }
      openBlankUrl(path, 'web', route.query);
      // proxy.$message.success('详情');
    };

    const goMMOverview = () => {
      const path = '/web/energyAnalysis';
      //  console.log(route.query);
      openBlankUrl(path, 'web', route.query);
      // proxy.$message.success('详情');
    };

    const goKPI = () => {
      const configContent = props.configContent;
      let kipType;
      if (configContent) {
        const configContentdata = JSON.parse(configContent);
        kipType = configContentdata.kpiType;
      }
      let path = '';
      if (kipType === '1') {
        path = '/web/energyConservationAssess';
      } else if (kipType === '2') {
        path = '/web/kpiManagement';
      }
      openBlankUrl(path, 'web', route.query);
      //  proxy.$message.success('详情');
    };

    const goKeyAreaAnalysis = () => {
      const path = '/web/energyAnalysis';
      //  console.log(route.query);
      openBlankUrl(path, 'web', route.query);
      // proxy.$message.success('详情');
    };
    watch(
      () => props.isSwitch,
      () => {
        props.isSwitch.forEach((item: any) => {
          if (item.id === props.uid) {
            const downLoadBtnDom = <HTMLImageElement>document.querySelector(`.isShow_${props.uid}`);
            //  console.log(item);
            if (item.isShow) {
              downLoadBtnDom.style.display = 'none';
            } else {
              downLoadBtnDom.style.display = 'block';
            }
          }
        });
      },
    );

    return {
      associationDownLoad,
      goDetail,
      goMMOverview,
      goKPI,
      goKeyAreaAnalysis,
      isDownLoadBtnShow,
    };
  },
});
