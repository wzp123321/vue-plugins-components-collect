import { ref, defineComponent, onMounted, reactive, watch, onUnmounted } from 'vue';
import { MA_HOME_EPopupType, MA_HOME_EDateType } from '../../services';
import { Subject } from 'rxjs';
import { useStore } from 'vuex';
import { sDatabase } from '../../services/index';
import { takeUntil } from 'rxjs/operators';
import MhmEnergyTotalEcharts from './components/mhm-energy-total-echarts/mhm-energy-total-echarts.vue';
import MhmEnergyTotalTable from './components/mhm-energy-total-table/mhm-energy-total-table.vue';
import MhmGoodsCost from './components/mhm-goods-cost/mhm-goods-cost.vue';
import MaHomeModeService from './services/ma-home-model.service';
import { TabObj, ComponentsObj, TableNameObj } from './constant/options';
import MhmMasterNodeModel from './components/mhm-master-node-model/mhm-master-node-model.vue';
import MhmActualPayment from './components/mhm-actual-payment/mhm-actual-payment.vue';
import MhmActualPaymentTable from './components/mhm-actual-payment-table/mhm-actual-payment-table.vue';
import MhmActualPaymentBill from './components/mhm-actual-payment-bill/mhm-actual-payment-bill.vue';
import { cloneDeep } from 'lodash';

export default defineComponent({
  name: 'MaHomeModel',
  components: {
    MhmEnergyTotalEcharts,
    MhmEnergyTotalTable,
    MhmMasterNodeModel,
    MhmGoodsCost,
    MhmActualPayment,
    MhmActualPaymentTable,
    MhmActualPaymentBill,
  },
  setup() {
    const store = useStore();
    //#region 生命周期
    const _destroy$ = new Subject<void>();
    // 开始时间、结束时间
    const startTime = ref<string>('');
    const endTime = ref<string>('');
    //时间维度
    const queryType = ref<number>();
    //单年年份
    const year = ref<number>();
    //弹框宽度
    const dialogWidth = ref<string>();
    const dialogVisible = ref<boolean>(false);
    const dialogTitle = ref<string>('');
    const componentsObj = reactive<ComponentsObj>({
      left: '',
      right: '',
    });
    const showComponentName = ref<string>('');
    const tableData = ref<any>([]);
    const tableDataName = ref<TabObj[]>([]);
    const tableEchartsData = ref<TableNameObj[]>([]);
    const chartList = ref<TableNameObj[]>([]);
    const treeList = ref<TabObj[]>([]);
    //请求完成子组件loading不显示
    const loadingStatus = ref<boolean>(true);
    //组件显示标识id
    // 1:天溯毛利
    // 2:货物成本
    // 3:实际缴费
    // 4:节能总收益
    // 5:技术节能
    // 6:票据展示
    const showComponentId = ref<string>('');
    watch(
      () => store.state.dialogData,
      (val) => {
        if (JSON.stringify(val) !== '{}' && sDatabase.dateType !== MA_HOME_EDateType.按月) {
          showComponentId.value = '';
          let componentId: string = '';
          switch (val.popup) {
            case MA_HOME_EPopupType.节能项:
              componentId = '4';
              break;
            case MA_HOME_EPopupType.实缴:
              componentId = '3';
              break;
            case MA_HOME_EPopupType.主节点:
              componentId = '1';
              break;
            case MA_HOME_EPopupType.默认:
              componentId = '2';
          }
          showComponentId.value = componentId;
          showComponentName.value = componentsObj.right;
          dialogTitle.value = '';
          dialogTitle.value = val.name;
          queryDiff();
          loadingStatus.value = true;
          dialogVisible.value = true;
          actualTable.value = false;
        }
      },
      {
        deep: true,
      },
    );
    watch(showComponentId, (val) => {
      switch (val) {
        case '1':
          componentsObj.left = '';
          componentsObj.right = 'MhmMasterNodeModel';
          dialogWidth.value = '730px';
          break;
        case '2':
          componentsObj.left = 'MhmEnergyTotalTable';
          componentsObj.right = 'MhmGoodsCost';
          dialogWidth.value = '925px';
          break;
        case '3':
          componentsObj.left = 'MhmActualPaymentTable';
          componentsObj.right = 'MhmActualPayment';
          dialogWidth.value = '925px';
          break;
        case '6':
          componentsObj.left = 'MhmActualPaymentBill';
          componentsObj.right = 'MhmActualPayment';
          dialogWidth.value = '925px';
          break;
        default:
          componentsObj.left = 'MhmEnergyTotalTable';
          componentsObj.right = 'MhmEnergyTotalEcharts';
          dialogWidth.value = '1053px';
      }
      showComponentName.value = componentsObj.right;
      if (val === '6' || actualTable.value) {
        showComponentName.value = componentsObj.left;
      } else {
        showComponentName.value = componentsObj.right;
      }
    });
    //关闭弹框
    const closeDialog = () => {
      store.commit('SET_DIALOG_Data', {});
    };
    //背景图选择
    const mapBackgroundUrl = (value: string) => {
      if (value === 'MhmMasterNodeModel' || value === '') {
        return '';
      }
      const backgroundComponents = ['MhmEnergyTotalTable', 'MhmActualPaymentTable', 'MhmActualPaymentBill'];
      let modeBackgroundUrl;
      let width;
      let height;
      if (backgroundComponents.includes(value)) {
        if (showComponentId.value === '4' || showComponentId.value === '5') {
          modeBackgroundUrl = require('@/assets/images/management-analysis/ma-home-model/ma-home-model-dialog-left.svg');
          width = '1031px';
          height = '430px';
        } else {
          modeBackgroundUrl = require('@/assets/images/management-analysis/ma-home-model/ma-home-model-dialog-common-left.svg');
          width = '896px';
          height = '455px';
        }
      } else {
        if (showComponentId.value === '4' || showComponentId.value === '5') {
          modeBackgroundUrl = require('@/assets/images/management-analysis/ma-home-model/ma-home-model-dialog-right.svg');
          width = '1031px';
          height = '430px';
        } else {
          modeBackgroundUrl = require('@/assets/images/management-analysis/ma-home-model/ma-home-model-dialog-common-right.svg');
          width = '896px';
          height = '455px';
        }
      }
      return `background: url(${modeBackgroundUrl}) no-repeat; width: ${width};height: ${height}`;
    };
    const changeMode = (value: 'left' | 'right') => {
      if (value === 'right') {
        if (actualTable.value) {
          showComponentId.value = '3';
          actualTable.value = false;
        }
      }
      showComponentName.value = componentsObj[value];
      MaHomeModeService.getIsChange(value);
    };
    //技术节能返回
    const back = () => {
      loadingStatus.value = true;
      showComponentId.value = '4';
      queryDiff();
    };
    //子组件触发更新组件
    const actualTable = ref<boolean>(false);
    const changeComponents = (val: string, id: string) => {
      if (val) {
        loadingStatus.value = true;
        dialogTitle.value = val;
        showComponentId.value = '5';
        queryDiff();
      }
      if (id) {
        showComponentId.value = id;
        actualTable.value = true;
      }
    };
    //子组件触发tab更新
    const changeTab = (val: string) => {
      loadingStatus.value = true;
      queryDiff(val);
    };
    //弹框宽度动态显示
    const queryDiff = async (val?: string) => {
      tableDataName.value = [];
      tableData.value = [];
      tableEchartsData.value = [];
      if (!val) {
        treeList.value = [];
        chartList.value = [];
      }
      const timeObj = {
        queryStart: startTime.value,
        queryEnd: endTime.value,
        queryType: String(queryType.value),
      };
      console.log(timeObj);
      switch (showComponentId.value) {
        case '2':
          try {
            let resTable: any = {};
            const obj = {
              year: queryType.value === MA_HOME_EDateType.按年 ? year.value : '',
              ...timeObj,
            };
            // 以前是根据是否有id判断调用不同接口，现在如果id为空渲染会有问题，补充一个自定义id，改成根据自定义标识custom进行判断
            if (store.state.dialogData.id && !store.state.dialogData.id.includes('custom-')) {
              resTable = await MaHomeModeService.queryGoodsCost({ nodeId: store.state.dialogData.id, ...obj });
            } else {
              // 节点在数据库中没有id的走这个接口
              resTable = await MaHomeModeService.queryEnergy({ energyCode: store.state.dialogData.energyCode, ...obj });
            }
            if (resTable.code === 200 && resTable.data && resTable.data !== null) {
              tableDataName.value = [
                {
                  name: '日期',
                },
                {
                  name: `${store.state.dialogData.name}(元)`,
                },
              ];
              tableData.value = resTable.data.springFrameQueryVOS.map((item: any) => {
                return {
                  date: item.date,
                  value: item.value,
                };
              });
              tableEchartsData.value = resTable.data.springFrameQueryVOS.map((item: any) => {
                if (Number(item.value) >= 0) {
                  return {
                    date: item.date,
                    type: dialogTitle.value,
                    value: item.value ? Number(item.value) : null,
                  };
                } else {
                  return {
                    date: item.date,
                    type: `${dialogTitle.value}(负)`,
                    value: item.value ? Number(item.value) : null,
                  };
                }
              });
            }
          } catch (error) {
            tableDataName.value = [];
            tableData.value = [];
            tableEchartsData.value = [];
          }
          break;
        case '4':
          try {
            const resTree = await MaHomeModeService.queryEnergySavingTotalSurplusLineChart(timeObj);
            if (resTree.code === 200 && resTree.data) {
              treeList.value = resTree.data.lineChartNames.slice(1);
              dialogTitle.value = resTree.data.lineChartNames[0].name;
              tableDataName.value = resTree.data.tableNames;
              tableData.value = resTree.data.datas;
              const chartListCopy: TableNameObj[] = [];
              resTree.data.datas.forEach((item: any, index: number) => {
                const obj = {
                  date: '',
                  type: '',
                  index,
                  value: null as null | number,
                  rate: null as null | number,
                };
                obj.date = item.date;
                resTree.data.lineChartNames.forEach((items: any, index: number) => {
                  const key = Object.keys(item)[index + 1];
                  const name = items.name;
                  obj.type = name;
                  if (key === 'totalSurplus') {
                    obj.rate = item[key] ? Number(item[key]) : null;
                    obj.value = null;
                  } else {
                    obj.rate = null;
                    obj.value = item[key] ? Number(item[key]) : null;
                  }
                  chartListCopy.push(cloneDeep(obj));
                });
              });
              chartList.value = chartListCopy;
            }
          } catch (error) {
            tableDataName.value = [];
            tableData.value = [];
            treeList.value = [];
            chartList.value = [];
          }
          break;
        case '5':
          try {
            if (!val) {
              const resTree = await MaHomeModeService.queryTechEnergySavingLineChart(timeObj);
              if (resTree.code === 200 && resTree.data) {
                treeList.value = resTree.data.names.slice(1);
                const chartListCopy: any = [];
                resTree.data.datas.forEach((item: any, index: number) => {
                  const obj = {
                    date: '',
                    type: '',
                    index,
                    value: null as null | number,
                    rate: null as null | number,
                  };
                  obj.date = item.date;
                  resTree.data.names.forEach((items: any, indexs: number) => {
                    obj.type = items.name;
                    if (indexs === 0) {
                      obj.rate = item[items.enName] ? Number(item[items.enName]) : null;
                      obj.value = null;
                    } else {
                      obj.rate = null;
                      obj.value = item[items.enName] ? Number(item[items.enName]) : null;
                    }
                    chartListCopy.push(cloneDeep(obj));
                  });
                });
                chartList.value = chartListCopy;
              }
            }
            const resTable = await MaHomeModeService.queryTechEnergySavingTable({
              projectCode: val ?? treeList.value[0].code,
              ...timeObj,
            });
            if (resTable.code === 200 && resTable.data) {
              tableDataName.value = resTable.data.names;
              tableData.value = resTable.data.datas;
            }
          } catch (error) {
            tableDataName.value = [];
            tableData.value = [];
            treeList.value = [];
            chartList.value = [];
          }
          break;
      }
      loadingStatus.value = false;
    };
    onMounted(() => {
      sDatabase.refStart$.pipe(takeUntil(_destroy$)).subscribe((v) => {
        if (v) {
          startTime.value = String(v.getTime());
          year.value = v.getFullYear();
        } else {
          startTime.value = String(new Date().getTime());
          year.value = new Date().getFullYear();
        }
      });
      sDatabase.refEnd$.pipe(takeUntil(_destroy$)).subscribe((v) => {
        if (v) {
          endTime.value = String(v.getTime());
          year.value = v.getFullYear();
        } else {
          endTime.value = String(new Date().getTime());
          year.value = new Date().getFullYear();
        }
      });
      sDatabase.refDimension$.pipe(takeUntil(_destroy$)).subscribe((v) => {
        queryType.value = v;
      });
    });
    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
    });
    return {
      dialogVisible,
      dialogTitle,
      showComponentName,
      showComponentId,
      tableDataName,
      tableData,
      treeList,
      tableEchartsData,
      loadingStatus,
      chartList,
      dialogWidth,
      changeMode,
      mapBackgroundUrl,
      closeDialog,
      back,
      changeComponents,
      changeTab,
    };
  },
});
