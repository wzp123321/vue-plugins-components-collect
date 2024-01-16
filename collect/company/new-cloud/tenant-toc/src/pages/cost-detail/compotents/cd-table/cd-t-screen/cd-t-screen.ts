/*
 * @Description: 表头过滤
 * @Author: zpwan
 * @Date: 2022-11-14 10:18:01
 * @Last Modified by: zpwan
 * @Last Modified time: 2023-05-06 09:56:30
 */
import { defineComponent, onMounted, onUnmounted, ref, toRef, PropType } from 'vue';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import sceenService from './cd-t-screen.service';
import toolbarService from '../../cd-toolbar/cd-toolbar.service';
import { SCREEN_STORAGE_KEY, CD_TS_SelectVO } from './cd-t-screen.api';
import eventBus from '../../../../../core/eventbus/index';
import { isJsonString } from '../../../../../core/token/token';

import { Search } from '@element-plus/icons-vue';

const regularStr = String.raw`\`\\;\'\"<>`;

export default defineComponent({
  name: 'CdTableScreen',
  props: {
    title: {
      type: String,
      default: '',
    },
    columnKey: {
      type: String as PropType<
        | 'amount'
        | 'balance'
        | 'billCode'
        | 'billDate'
        | 'billMonth'
        | 'billProjectContent'
        | 'billTitleContent'
        | 'billTypeName'
        | 'billYear'
        | 'costNode'
        | 'costType'
        | 'employeeCode'
        | 'employeeDepartment'
        | 'employeeName'
        | 'employeeType'
        | 'ledgerCode'
        | 'ledgerName'
        | 'productCode'
        | 'productName'
        | 'productType'
        | 'productTypeName'
        | 'projectNumber'
        | 'projectTaskName'
        | 'recordTime'
      >,
      default: '',
    },
    screenBg: {
      type: Boolean,
      default: false,
    },
    firstHh: {
      type: Boolean,
      default: false,
    },
    hasFilter: {
      type: Boolean,
      default: false,
    },
    districts: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },
  setup(props, { emit }) {
    const title = toRef(props, 'title');
    const hasFilter = toRef(props, 'hasFilter');
    const screenBg = props.screenBg;
    const firstHh = props.firstHh;
    const amountMap = ref<Map<string, number>>(new Map());

    //#region 过滤弹框服务
    const sSceen = sceenService;
    const destroy = new Subject<void>();

    onMounted(() => {
      sSceen.isLoading.pipe(takeUntil(destroy)).subscribe((v) => {
        isLoading.value = v;
      });
      sSceen.isEmpty.pipe(takeUntil(destroy)).subscribe((v) => {
        isEmpty.value = v;
        isEmpty.value = false;
      });
      // 订阅数据源
      sSceen.data.pipe(takeUntil(destroy)).subscribe((v) => {
        if (!popoverVisible.value) {
          return;
        }
        amountMap.value.clear();

        if (v?.queryChoice) {
          let dataList = Object.keys(v?.queryChoice);
          // 调整空白的位置
          if (dataList?.includes('空白')) {
            dataList = dataList?.filter((item) => item !== '空白');
            dataList.unshift('空白');
          }
          screenData.value = dataList ?? [];
          showList.value = dataList ?? [];
          Object.entries(v?.queryChoice).forEach(([k, v]) => {
            amountMap.value.set(String(k), v);
          });

          // 当前是否处于查询状态
          const acitveFlag = sSceen.screenSelectMap.get(props.columnKey)?.isActive as boolean;
          // 高亮状态就是用选中的节点，如果不是判断是否全选
          const list: string[] = acitveFlag
            ? (sSceen.screenSelectMap.get(props.columnKey)?.checkList as string[])
            : sSceen.screenSelectMap.get(props.columnKey)?.checked
            ? dataList
            : [];
          const allCheck: boolean =
            list?.length > 0 && list?.length === dataList?.length && checkArrayIncludesOther(list, dataList);

          // 将选中的节点用全部数据过滤一遍，如果数组为空则全选半选状态未不勾选
          const filterList = list?.filter((item) => dataList?.includes(item));
          const hasCheckNode = filterList?.length > 0;

          // 如果当前列是高亮状态 ---- 需要判断是否是全新
          // 如果当前状态非高亮 判断checked是否选中 如果选中则是全数据 如果没有则是空数据
          sSceen.screenSelectMap.set(props.columnKey, {
            checked: allCheck,
            indeterminate: acitveFlag && !allCheck && hasCheckNode,
            checkList: list,
            dataSource: dataList,
            isActive: acitveFlag,
          });
        }

        // 修改其他筛选项
        Object.entries(v?.otherChoice).forEach(([key, dataSource]: [string, string[] | undefined]) => {
          // 当前是否处于查询状态
          const acitveFlag = sSceen.screenSelectMap.get(key)?.isActive as boolean;
          // 高亮状态就是用选中的节点，如果不是判断是否全选
          const list: string[] = acitveFlag
            ? (sSceen.screenSelectMap.get(key)?.checkList as string[])
            : sSceen.screenSelectMap.get(key)?.checked
            ? (dataSource as string[])
            : [];
          const allCheck: boolean =
            list?.length > 0 && list?.length === dataSource?.length && checkArrayIncludesOther(list, dataSource);

          // 如果当前列是高亮状态 ---- 需要判断是否是全新
          // 如果当前状态非高亮 判断checked是否选中 如果选中则是全数据 如果没有则是空数据
          sSceen.screenSelectMap.set(key, {
            checked: allCheck,
            indeterminate: acitveFlag && !allCheck,
            checkList: list,
            dataSource: dataSource as string[],
            isActive: acitveFlag,
          });
        });

        // 当前打开的筛选框
        if (popoverVisible.value) {
          checkedList.value = sSceen.screenSelectMap.get(props.columnKey)?.checkList as string[];
          isAllChecked.value = sSceen.screenSelectMap.get(props.columnKey)?.checked as boolean;
          indeterminate.value = sSceen.screenSelectMap.get(props.columnKey)?.indeterminate as boolean;
        }
      });

      eventBus.on('cost-reset', () => {
        window.localStorage.removeItem(SCREEN_STORAGE_KEY);
        checkedList.value = [];
        isAllChecked.value = false;
        filterText.value = '';
        isActiveRe.value = false;
        isActive.value = false;
        sSceen.resetData();
      });

      // 判断是否有缓存
      if (
        window.localStorage.getItem(SCREEN_STORAGE_KEY) &&
        isJsonString(window.localStorage.getItem(SCREEN_STORAGE_KEY) as string)
      ) {
        const obj = JSON.parse(window.localStorage.getItem(SCREEN_STORAGE_KEY) as string);
        Object.entries(obj)?.forEach(([k, v]) => {
          if (k === props.columnKey) {
            // 修改数据
            isActive.value = (v as CD_TS_SelectVO)?.isActive;
            checkedList.value = (v as CD_TS_SelectVO)?.checkList;
            isAllChecked.value = (v as CD_TS_SelectVO)?.checked;

            isAllCheckedRe.value = (v as CD_TS_SelectVO)?.checked;
            indeterminate.value = (v as CD_TS_SelectVO)?.indeterminate;
            checkListRe.value = (v as CD_TS_SelectVO)?.checkList;
            isActiveRe.value = (v as CD_TS_SelectVO)?.isActive;

            // 修改map数据
            sSceen.screenSelectMap.set(k, {
              checked: (v as CD_TS_SelectVO)?.checked,
              indeterminate: (v as CD_TS_SelectVO)?.indeterminate,
              checkList: (v as CD_TS_SelectVO)?.checkList,
              dataSource: [],
              isActive: (v as CD_TS_SelectVO)?.isActive,
            });
          }
        });
      }
    });
    onUnmounted(() => {
      sSceen.destroyInstance();
      eventBus.off('cost-reset');

      destroy.next();
      destroy.complete();
    });
    //#endregion
    const isLoading = ref<boolean>(true);
    const screenData = ref<string[]>([]);
    const isEmpty = ref<boolean>(false);

    //#region
    const popoverVisible = ref<boolean>(false);
    const isActive = ref<boolean>(false);
    const filterText = ref<string>('');
    const isAllChecked = ref<boolean>(false);
    const indeterminate = ref<boolean>(false);
    const showList = ref<string[]>([]);
    const checkedList = ref<string[]>([]);
    // 主动变成全选 还是被动变成全选

    const mapCostTypeName = (code: string) => {
      if (props.columnKey !== 'costType') {
        return code;
      }
      let name = code;
      sSceen.costTypeList?.forEach((item) => {
        if (item.code === code) {
          name = item.name;
        }
      });
      return name;
    };

    const mapItemCount = (column: string) => {
      return amountMap.value?.has(column) ? amountMap.value.get(column) : '';
    };
    //#endregion

    //过滤
    const handleDataFilter = () => {
      showList.value = screenData.value?.filter((item) => {
        return item && item.toLocaleLowerCase().indexOf(filterText.value.toLocaleLowerCase()) !== -1;
      });

      if (checkedList.value?.length) {
        isAllChecked.value = checkArrayIncludesOther(showList.value, checkedList.value);
        indeterminate.value = !checkArrayIncludesOther(showList.value, checkedList.value);

        sSceen.screenSelectMap.set(props.columnKey, {
          checked: isAllChecked.value,
          indeterminate: indeterminate.value,
          checkList: checkedList.value,
          dataSource: screenData.value,
          isActive: sSceen.screenSelectMap.get(props.columnKey)?.isActive ?? false,
        });
      }
    };
    /**
     * 校验数组b是否包含数组a
     * @param a
     * @param b
     * @returns
     */
    const checkArrayIncludesOther = (a: string[], b: string[]) => {
      return (
        b?.length >= a?.length &&
        a?.filter((item) => {
          return !b?.includes(item);
        })?.length === 0
      );
    };
    /**
     * 打开弹框
     */
    const showPopver = async () => {
      filterText.value = '';

      if (props.columnKey === 'costType') {
        await sSceen.queryCostTypeList();
      }
      sSceen.queryScreen(filterText.value, props.columnKey, props.districts);
      sSceen.screenSelectMap.set(props.columnKey, {
        checked: isAllCheckedRe.value,
        indeterminate: indeterminateRe.value,
        checkList: checkListRe.value,
        dataSource: dataSourceRe.value,
        isActive: isActiveRe.value,
      });
    };

    // 储存筛选成功后的screenSelectMap
    const isAllCheckedRe = ref<boolean>(false);
    const indeterminateRe = ref<boolean>(false);
    const checkListRe = ref<string[]>([]);
    const dataSourceRe = ref<string[]>([]);
    const isActiveRe = ref<boolean>(false);

    // 关闭筛选
    const cancelScreen = () => {
      popoverVisible.value = false;

      timer(200)
        .pipe(takeUntil(destroy))
        .subscribe(() => {
          checkedList.value = checkListRe.value;
          isAllChecked.value = isAllCheckedRe.value;
          indeterminate.value = indeterminateRe.value;
          screenData.value = dataSourceRe.value;
          isActive.value = isActiveRe.value;
        });
    };

    // 点击确认按钮-关闭筛选框并筛选
    const hidePopver = () => {
      checkListRe.value = checkedList.value;
      isAllCheckedRe.value = isAllChecked.value;
      indeterminateRe.value = indeterminate.value;
      dataSourceRe.value = screenData.value;
      isActiveRe.value = isActive.value;

      emit('query', sSceen.screenSelectMap);
      sSceen.queryScreen(filterText.value, props.columnKey, props.districts);

      // 如果有筛选项，则修改toolbar的按钮状态
      let flag = false;
      sSceen.screenSelectMap?.forEach((k, v) => {
        if (k?.isActive) {
          flag = true;
        }
      });
      toolbarService.setFilterFlag(flag);
      setFilterFtorage();

      popoverVisible.value = false;
    };
    // 设置过滤参数缓存
    const setFilterFtorage = () => {
      // 将筛选项缓存
      window.localStorage.removeItem(SCREEN_STORAGE_KEY);

      if (sSceen.screenSelectMap?.size) {
        let obj = {};
        sSceen.screenSelectMap?.forEach((v, k) => {
          const { checkList, checked, indeterminate, isActive } = v;
          obj = {
            ...obj,
            [k]: {
              checkList,
              checked,
              indeterminate,
              isActive,
            },
          };
        });
        window.localStorage.setItem(SCREEN_STORAGE_KEY, JSON.stringify(obj));
      }
    };
    /**
     * 全选
     * 如果是未经过滤的全选则存入[], 否则存入过滤后的数组
     * @param key
     */
    const selectAll = (val: boolean) => {
      isActive.value = false;

      isAllChecked.value = val;
      indeterminate.value = false;

      const list = val ? showList.value : [];
      checkedList.value = list;
      checkedList.value = checkedList.value?.filter((item) => {
        return item && item.toLocaleLowerCase().indexOf(filterText.value.toLocaleLowerCase()) !== -1;
      });

      sSceen.selectAll(props.columnKey, list, val, screenData.value);
    };
    /**
     * 选中
     * @param checkList
     */
    const handleSelect = (checkList: string[]) => {
      isAllChecked.value = checkList?.length !== 0 && checkArrayIncludesOther(showList.value, checkedList.value);
      indeterminate.value = checkList?.length !== 0 && !checkArrayIncludesOther(showList.value, checkedList.value);

      // 过滤掉不在列表中的筛选项
      checkedList.value = checkedList.value?.filter((item) => {
        return (
          item &&
          item.toLocaleLowerCase().indexOf(filterText.value.toLocaleLowerCase()) !== -1 &&
          screenData.value?.includes(item)
        );
      });
      // 非全选状态下（如果没有过滤条件，全勾选了则代表全选；如果有过滤条件，勾选后再次打开只要重置过滤条件即可，选中的是上一次勾选的而不是全选）
      isActive.value = ((isAllChecked.value && !!filterText.value) || !isAllChecked.value) && checkList?.length > 0;

      sSceen.screenSelectMap.set(props.columnKey, {
        checked: isAllChecked.value,
        indeterminate: indeterminate.value,
        checkList: checkedList.value,
        dataSource: screenData.value,
        isActive: isActive.value,
      });
    };

    // 仅筛选一项
    const oneSelect = (item: any) => {
      checkedList.value = [item];
      isActive.value = true;

      checkListRe.value = checkedList.value;
      isAllCheckedRe.value = isAllChecked.value;
      indeterminateRe.value = indeterminate.value;
      dataSourceRe.value = screenData.value;
      isActiveRe.value = isActive.value;

      sSceen.screenSelectMap.set(props.columnKey, {
        checked: isAllChecked.value,
        indeterminate: indeterminate.value,
        checkList: checkedList.value,
        dataSource: screenData.value,
        isActive: isActive.value,
      });
      emit('query', sSceen.screenSelectMap);
      sSceen.queryScreen(filterText.value, props.columnKey, props.districts);

      // 如果有筛选项，则修改toolbar的按钮状态
      let flag = false;
      sSceen.screenSelectMap?.forEach((k, v) => {
        if (k?.isActive) {
          flag = true;
        }
      });
      toolbarService.setFilterFlag(flag);
      setFilterFtorage();

      popoverVisible.value = false;
    };

    // 鼠标移入移出显隐筛选按钮
    const selectIndex = ref<any>(true);
    const enter = (index: any) => {
      selectIndex.value = index;
    };
    const leave = () => {
      selectIndex.value = '';
    };

    // 清除筛选
    const clearSelect = () => {
      checkedList.value = [];
      isAllChecked.value = false;
      isActive.value = false;
      indeterminate.value = false;
      sSceen.screenSelectMap.set(props.columnKey, {
        checked: isAllChecked.value,
        indeterminate: indeterminate.value,
        checkList: checkedList.value,
        dataSource: screenData.value,
        isActive: isActive.value,
      });
    };

    // 反选
    const selectInvert = () => {
      checkedList.value = showList.value.filter((item) => {
        return !checkedList.value.includes(item);
      });
      isAllChecked.value = checkArrayIncludesOther(showList.value, checkedList.value);
      sSceen.screenSelectMap.set(props.columnKey, {
        checked: isAllChecked.value,
        indeterminate: indeterminate.value,
        checkList: checkedList.value,
        dataSource: screenData.value,
        isActive: isActive.value,
      });
    };
    //#endregion

    return {
      Search,

      checkListRe,
      selectIndex,
      isActive,
      hasFilter,
      regularStr,
      title,
      screenBg,
      firstHh,
      popoverVisible,
      isLoading,
      isEmpty,
      filterText,
      screenData,
      sSceen,
      showList,
      checkedList,
      isAllChecked,
      indeterminate,

      enter,
      leave,
      clearSelect,
      selectInvert,
      cancelScreen,
      oneSelect,
      selectAll,
      handleSelect,
      handleDataFilter,
      showPopver,
      hidePopver,
      mapCostTypeName,
      mapItemCount,
    };
  },
  methods: {},
});
