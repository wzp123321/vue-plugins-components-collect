import { defineComponent, reactive, toRefs, computed, PropType, onMounted, ref } from 'vue';
import energyRankingService from '@/views/pages/energy-ranking/services/energy-ranking.service';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { FGetElTreeDefaultProps, disabledProps } from '@/utils/token';
import { useCommonController } from '@/utils/use-common-controller';
import { formatDate } from '@/utils/index';
import message from '@/utils/message';

import { treeTypeList, dateScopeList } from '@/config/config';
import { cloneDeep } from 'lodash';
import { differenceInCalendarDays, startOfWeek, startOfMonth } from 'date-fns';
import { subDays } from 'date-fns';
import { getTreeAllChildIds } from '@/views/pages/energy-contrast/utils';

interface SearchState {
  expanedKeys: number[];
  treeDataList: TreeManageModule.TreeList[];
  energyCodeList: EnergyCodeManageModule.EnergyInfo[];
  loading: boolean;
  formSearch: EnergyRankingModule.EnergyRankingPageForm;
}

// 能源类型修改默认配置
const defaultTypeProps = {
  children: 'childEnergyCode',
  label: 'name',
};
const defaultTreeProps = {
  children: 'childTree',
  label: 'treeName',
};
const nodeKey = 'code';

export default defineComponent({
  name: 'PageSearchForm',
  props: {
    /**
     * 默认参数
     */
    searchParams: {
      type: Object as PropType<GlobalModule.SearchParmas>,
    },
  },
  emits: ['error', 'search', 'update:loading'],
  setup(props, { emit }) {
    const { getEnergyCodeTree, getServerDate, getTreeListWithExpandKeys, getDictDataByCode } = useCommonController();
    const { proxy } = useCurrentInstance();
    // 初始化服务器时间
    const serverDate = ref(new Date());
    // 树类型
    const treeType = ref(treeTypeList[0].value);
    // 能耗指标数组
    const energyIndicators = ref<Array<{ code: string; name: string }>>([]);

    // 能耗排名跳转
    const energyRankingLinkParam = ref<any>();

    const searchState = reactive<SearchState>({
      expanedKeys: [],
      treeDataList: [],
      loading: false,
      energyCodeList: [],
      formSearch: {
        energyCode: [],
        valueMean: '',
        date: [],
        dateScope: dateScopeList[0].value,
        treeIdList: [], // 分析树节点
      },
    });
    /**
     * 分类分项change
     * @returns
     */
    const onEnergyCodeChange = () => {
      if (searchState.formSearch.energyCode?.length === 0) {
        return;
      }
      searchState.formSearch.treeIdList = [];
      getTreeList();
    };
    /**
     * 请求分析对象tree列表
     * 需要先重置分类分项
     */
    const onTreeTypeChange = async () => {
      console.log(1321);
      if (searchState.energyCodeList?.length === 0) {
        searchState.formSearch.treeIdList = [];
        searchState.formSearch.energyCode = [];
        return;
      }
      // 重置数据
      searchState.formSearch.energyCode = [searchState.energyCodeList[0].code];
      searchState.formSearch.treeIdList = [];

      if (energyRankingLinkParam.value) {
        //    searchState.formSearch.energyCode = [energyRankingLinkParam.value.itemCode];
      }
      await getTreeList();
    };
    // 查询树
    const getTreeList = async () => {
      try {
        searchState.loading = true;
        const res = await getTreeListWithExpandKeys(treeType.value, searchState.formSearch.energyCode[0]);
        if (res && res.data) {
          searchState.treeDataList = res.data;
          searchState.expanedKeys = res.expandTreeIds;
          searchState.loading = false;
        } else {
          searchState.formSearch.treeIdList = [];
          searchState.treeDataList = [];
          searchState.expanedKeys = [];
          searchState.loading = false;
        }
      } catch (error) {
        searchState.formSearch.treeIdList = [];
        searchState.treeDataList = [];
        searchState.expanedKeys = [];
        searchState.loading = false;
      }
    };
    // 获取选中树节点
    const getCheckedKeys = () => {
      if (searchState.treeDataList?.length === 0) {
        searchState.expanedKeys = [];
        searchState.treeDataList = [];
        searchState.formSearch.treeIdList = [];
      } else {
        // 只有一个二级
        if (searchState.treeDataList[0].childTree?.length === 1) {
          // 有三级
          if (searchState.treeDataList[0].childTree[0]?.childTree?.length > 0) {
            searchState.formSearch.treeIdList = searchState.treeDataList[0].childTree[0].childTree.map(
              (item: TreeManageModule.TreeList) => {
                return item.id;
              },
            );
            // 只有一个三级
            if (searchState.treeDataList[0].childTree[0].childTree?.length === 1) {
              searchState.formSearch.treeIdList.push(searchState.treeDataList[0].childTree[0].id);
            }
          } else {
            // 没有三级
            searchState.formSearch.treeIdList = searchState.treeDataList[0].childTree.map(
              (item: TreeManageModule.TreeList) => {
                return item.id;
              },
            );
            // 只有一个二级
            if (searchState.formSearch.treeIdList?.length === 1 && !searchState.treeDataList[0]?.lockFlag) {
              searchState.formSearch.treeIdList.push(searchState.treeDataList[0].id);
            }
          }
        } else {
          searchState.formSearch.treeIdList = searchState.treeDataList[0].childTree.map(
            (item: TreeManageModule.TreeList) => {
              return item.id;
            },
          );
          // 没有二级
          if (searchState.formSearch.treeIdList?.length === 0) {
            if (!searchState.treeDataList[0]?.lockFlag) {
              searchState.formSearch.treeIdList.push(searchState.treeDataList[0].id);
            }
          }
        }
      }
      searchState.formSearch.treeIdList = searchState.formSearch.treeIdList.slice(0, 10);
    };
    /**
     * 请求服务器时间  初始化时间选择器
     */
    const initDate = async () => {
      searchState.formSearch.date = [serverDate.value, serverDate.value];
      disabledDate = (current: Date) => {
        return differenceInCalendarDays(current, new Date(serverDate.value as Date)) > 0;
      };
    };
    /**
     * 时间禁用处理
     */
    let disabledDate = (date: Date) => {
      return date.valueOf() > new Date().getTime();
    };
    /**
     * 快速选时
     */
    const switchShortTime = () => {
      switch (searchState.formSearch.dateScope) {
        case 0:
          // 今日
          searchState.formSearch.date = [serverDate.value, serverDate.value];
          break;
        case 1:
          // 本周
          const startWeek = startOfWeek(serverDate.value as Date, { weekStartsOn: 1 });
          searchState.formSearch.date = [startWeek, serverDate.value];
          break;
        case 2:
          // 本月
          const startMonth = startOfMonth(serverDate.value as Date);
          searchState.formSearch.date = [startMonth, serverDate.value];
          break;
      }
    };
    // 根据时间反选快捷选时
    const onDateChange = (value: Date[]) => {
      // console.log(value);
      dateToShortTime(value);
    };
    /**
     * 时间选择反选快捷选时
     */
    const dateToShortTime = (date: Date[]) => {
      if (!date || date.length !== 2) {
        searchState.formSearch.dateScope = -1;
        return;
      }
      const startofday = formatDate(new Date(), 'yyyy-MM-dd');
      const startofweek = formatDate(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const startofmonth = formatDate(startOfMonth(new Date()), 'yyyy-MM-dd');
      if (
        formatDate(date[0], 'yyyy-MM-dd') === formatDate(date[1], 'yyyy-MM-dd') &&
        formatDate(date[0], 'yyyy-MM-dd') === startofday
      ) {
        searchState.formSearch.dateScope = 0;
      } else if (
        formatDate(date[0], 'yyyy-MM-dd') === startofweek &&
        formatDate(date[1], 'yyyy-MM-dd') === startofday
      ) {
        searchState.formSearch.dateScope = 1;
      } else if (
        formatDate(date[0], 'yyyy-MM-dd') === startofmonth &&
        formatDate(date[1], 'yyyy-MM-dd') === startofday
      ) {
        searchState.formSearch.dateScope = 2;
      } else {
        searchState.formSearch.dateScope = -1;
      }
    };
    /**
     * 通过计算属性返回能源类型列表
     */
    const codeList = computed(() => {
      return (
        searchState.energyCodeList &&
        searchState.energyCodeList.map((item: EnergyCodeManageModule.EnergyInfo) => {
          const newItem = cloneDeep(item);
          newItem.childEnergyCode = treeType.value === 1 ? newItem.childEnergyCode : [];
          return newItem;
        })
      );
    });
    /*
     * 表单提交
     */
    const onSubmit = () => {
      if (searchState.formSearch.energyCode.length === 0) {
        proxy.$message.error('请选择能源类型！');
        return;
      }
      if (searchState.formSearch.treeIdList.length === 0) {
        proxy.$message.error('请选择分析对象！');
        return;
      }
      if (searchState.formSearch.treeIdList.length < 2) {
        proxy.$message.error('分析对象最少选择两个节点！');
        return;
      }
      if (searchState.formSearch.treeIdList.length > 10) {
        proxy.$message.error('分析对象不能超过10个！');
        return;
      }
      if (!searchState.formSearch.date) {
        proxy.$message.error('请选择日期！');
        return;
      }
      const { energyCode, date, treeIdList, valueMean } = searchState.formSearch;
      window.sessionStorage.removeItem('ems-energyRankingLinkParam');
      window.sessionStorage.removeItem('ems-energyAbnormalParams');
      emit('search', {
        energyCode,
        date,
        treeIdList,
        valueMean,
      });
    };
    /**
     * 重置
     */
    const onReset = async () => {
      try {
        emit('update:loading', true);
        treeType.value = treeTypeList[0].value;
        searchState.formSearch.valueMean =
          energyIndicators.value && energyIndicators.value?.length ? energyIndicators.value[0].code : '';
        serverDate.value = await getServerDate();
        await initDate();
        dateToShortTime(searchState.formSearch.date);
        // 查询分类分项
        searchState.energyCodeList = await getEnergyCodeTree();
        if (searchState.energyCodeList?.length === 0) {
          emit('error');
          return;
        }
        searchState.formSearch.energyCode = searchState.energyCodeList?.length
          ? [searchState.energyCodeList[0].code]
          : [];
        if (searchState.energyCodeList?.length === 0) {
          return;
        }

        if (energyRankingLinkParam.value) {
          // const sessionTreeType = Number(energyRankingLinkParam.value.classId);
          // searchState.formSearch.energyCode = [energyRankingLinkParam.value.itemCode];
          // searchState.formSearch.dateScope = -1;
          // searchState.formSearch.valueMean = energyRankingLinkParam.value.valueMean;
          // treeType.value = sessionTreeType;
        }
        //console.log('energyRankingLinkParam===', energyRankingLinkParam.value);
        //  console.log(2);
        await onTreeTypeChange();
        await getCheckedKeys();

        if (energyRankingLinkParam.value) {
          // searchState.formSearch.energyCode = [energyRankingLinkParam.value.itemCode];
          // const treeData = energyRankingLinkParam.value.groupIdList.split(',');
          // searchState.formSearch.treeIdList = treeData;
          // dateToShortTime(searchState.formSearch.date);
        }
        // console.log(
        //   'searchState.formSearch.treeIdList===',
        //   searchState.formSearch,
        // );
        onSubmit();
        if (searchState.formSearch.treeIdList?.length < 2) {
          emit('error');
          return;
        }
      } catch (error) {
        emit('error');
      }
    };
    // 获取分组下的树列表
    const getTreeListByInGroup = async (groupIdList: number[]) => {
      try {
        const res = await energyRankingService.getTreeListInGroup(groupIdList);
        if (res && res.code === 200 && res.data && res.data.length) {
          searchState.formSearch.treeIdList = res.data;
        }
      } catch (error) {
        console.log(error);
      }
    };

    /**
     * 初始化
     * 1.请求服务器时间
     * 2.请求分类分项
     * 3.请求树节点
     */
    onMounted(async () => {
      try {
        emit('update:loading', true);
        try {
          energyIndicators.value = await getDictDataByCode('value_mean');
        } catch (error) {
          energyIndicators.value = [];
        }
        searchState.formSearch.valueMean = energyIndicators.value?.length ? energyIndicators?.value[0].code : '';
        // 拿本地缓存
        const energyAbnormalParams = JSON.parse(
          JSON.stringify(window.sessionStorage.getItem('ems-energyAbnormalParams')),
        );

        serverDate.value = await getServerDate();
        await initDate();
        dateToShortTime(searchState.formSearch.date);
        // 查询分类分项
        searchState.energyCodeList = await getEnergyCodeTree();

        searchState.formSearch.energyCode = searchState.energyCodeList?.length
          ? [searchState.energyCodeList[0].code]
          : [];

        const param = JSON.parse(JSON.stringify(window.sessionStorage.getItem('ems-energyRankingLinkParam')));
        energyRankingLinkParam.value = JSON.parse(param);

        // 如果有缓存
        if (energyAbnormalParams && Object.keys(energyAbnormalParams).length) {
          const params = JSON.parse(energyAbnormalParams);

          if (params.transferDate) {
            searchState.formSearch.date = [
              new Date(subDays(new Date(params.transferDate), 1)),
              new Date(subDays(new Date(params.transferDate), 1)),
            ];
          } else {
            searchState.formSearch.date = [new Date(subDays(new Date(), 1)), new Date(subDays(new Date(), 1))];
          }

          const sessionTreeType = Number(params.treeType);
          searchState.formSearch.energyCode = [params.energyCode];
          searchState.formSearch.dateScope = -1;
          treeType.value = sessionTreeType;
          await getTreeList();
          await getTreeListByInGroup(params.groupIdList);
        } else if (energyRankingLinkParam.value) {
          const sessionTreeType = Number(energyRankingLinkParam.value.classId);
          searchState.formSearch.energyCode = [energyRankingLinkParam.value.itemCode];

          searchState.formSearch.dateScope = -1;
          searchState.formSearch.valueMean = energyRankingLinkParam.value.valueMean;
          treeType.value = sessionTreeType;
          let treeData = energyRankingLinkParam.value.areaId.split(',');
          treeData = treeData.filter((item: string) => {
            return item !== '' && item !== null;
          });

          await getTreeList();
          searchState.formSearch.treeIdList = treeData;
          dateToShortTime(searchState.formSearch.date);
        } else {
          await onTreeTypeChange();
          await getCheckedKeys();
        }
        if (searchState.energyCodeList?.length === 0) {
          emit('error');
          return;
        }
        if (energyIndicators.value?.length === 0) {
          emit('error');
          return;
        }

        if (searchState.formSearch.treeIdList?.length !== 0) {
          // 拿到所有可选的节点对节点数组进行过滤
          const allIds = getTreeAllChildIds(searchState.treeDataList);
          const newIds = cloneDeep(searchState.formSearch.treeIdList);
          searchState.formSearch.treeIdList = searchState.formSearch.treeIdList.filter((item) => {
            return allIds.includes(Number(item));
          });
          console.log(searchState.formSearch.treeIdList, newIds, allIds);
          if (searchState.formSearch.treeIdList?.length !== newIds?.length) {
            message.error('部分节点的院区权限受限或没有数据');
          }
        }

        if (searchState.treeDataList?.length === 0 || searchState.formSearch.treeIdList?.length <= 1) {
          emit('error');
          return;
        }
        if (searchState.energyCodeList?.length === 0 || searchState.formSearch?.treeIdList?.length === 0) {
          emit('error');
          return;
        }

        searchState;
        onSubmit();
      } catch (error) {
        emit('error');
      }
    });

    return {
      ...toRefs(searchState),
      codeList,
      defaultTypeProps,
      defaultTreeProps,
      nodeKey,
      energyIndicators,
      dateScopeList,
      treeTypeList,
      treeType,
      disabledProps,

      FGetElTreeDefaultProps,
      disabledDate,
      onSubmit,
      onReset,
      onTreeTypeChange,
      switchShortTime,
      onEnergyCodeChange,
      onDateChange,
    };
  },
});
