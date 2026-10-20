<template>
  <te-cascader
    ref="teSpaceSelectRef"
    class="te-space-select"
    :class="randomClass"
    :model-value="selectedValue"
    :max-collapse-tags="props.maxCollapseTags"
    :show-all-levels="props.showAllLevels"
    collapse-tags
    collapse-tags-tooltip
    clearable
    popper-class="custom-space-cascader-popper"
    filterable
    :before-filter="handleSearch"
    :filter-method="filterMethod"
    :options="options"
    :props="tsCascaderProps"
    @visible-change="handleShowDrop"
    @expand-change="handleShowHeader"
    @update:model-value="handleChangeSelected"
    @focus="handleFocus"
  >
    <template #default="{ _node, data }">
      <span v-if="data.isChild" class="tss-tree-child">
        {{ data.label.split('/').length === 2 ? data.label.split('/')[1] : data.label }}
      </span>
      <span v-else class="tss-tree-parent">{{ data.label }}</span>
    </template>
  </te-cascader>
</template>
<script setup lang="ts">
import { TeCascader, TeMessage } from '@tiansu/element-plus';
import type { CascaderProps, TeCascaderPanelContext } from '@tiansu/element-plus';
import { ref, h, render, nextTick, watch, computed, onMounted } from 'vue';
import TssDropdownTitle from './tss-dropdown-title.vue';
import LocationV2ApiApi from './apis/LocationV2ApiApi';
import { LocationTypeEnum } from '../../models/LocationTypeEnum';
import { useRemoteData } from './use-remote-data';
import { cloneDeep, isEqual, debounce } from 'lodash';
import LocationV2LazyTreeResponseVO from '../../models/LocationV2LazyTreeResponseVO';
import LocationPathV2DetailResponseVO from '../../models/LocationPathV2DetailResponseVO';
import LocationV2DetailResponseVO from '../../models/LocationV2DetailResponseVO';
import LocationV2FuzzyPageRequestVO from '../../models/LocationV2FuzzyPageRequestVO';

const { dealwithLazyData, dealwithSearchData, dealwithEchoData, detailMap } = useRemoteData();

interface MenuList {
  nodes: {
    checked: boolean;
    pathValues: string[];
    value: string;
    data: { disabled: boolean; initialDisabled: boolean; parentId?: string };
  }[];
  panel: TeCascaderPanelContext;
}

// 允许选择的层级类型声明
interface AllowSelectAllLevels {
  campus: boolean;
  building: boolean;
  buildingPart: boolean;
  floor: boolean;
  floorPart: boolean;
  room: boolean;
  roomPart: boolean;
}

const randomClass = `custom-random-cascader-${String(Math.random())}`;

const props = withDefaults(
  defineProps<{
    modelValue?: string[] | { id: string }[]; //下拉框选中值
    valueType?: 'string' | 'object';
    multiple?: boolean; //是否多选
    allowSelectAllLevels?: AllowSelectAllLevels; //指定可选的层级
    showAllLevels?: boolean; //选中项是否显示全称
    maxCollapseTags?: number; //选中项超过最大数量折叠tag
    axios: any; //axios实例
    tenantId: string; //租户id
    campusIds?: string[]; //院区id
    autoFocus?: boolean; //是否默认获取焦点
    openOnFocus?: boolean; //获取焦点时是否展开下拉面板，autoFocus为true时openOnFocus默认为true
    searchSelectFirst?: boolean; //单选搜索时自动选择第一个
    hideFromLevel?: keyof AllowSelectAllLevels; // 隐藏从该级别开始，只能是building、floor、room
  }>(),
  {
    modelValue: () => [],
    valueType: 'string',
    multiple: false,
    allowSelectAllLevels: () => {
      return {
        campus: true,
        building: true,
        buildingPart: true,
        floor: true,
        floorPart: true,
        room: true,
        roomPart: true,
      };
    },
    showAllLevels: true,
    maxCollapseTags: 1,
    campusIds: () => [],
    autoFocus: false,
    openOnFocus: undefined,
    searchSelectFirst: false,
  }
);

const emit = defineEmits(['update:modelValue']);

// autoFocus为true时openOnFocus默认为true
const openOnFocus = computed(() => (props.autoFocus ? props.openOnFocus ?? true : props.openOnFocus));

onMounted(() => {
  nextTick(() => {
    observeInput();
    observeSearchPanel();
    setTimeout(() => {
      props.autoFocus && getInputDom()?.focus();
    }, 200);
  });
});

//监听搜索值变化
const observeInput = () => {
  const inputDom = getInputDom();
  // 搜索框
  inputDom.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    searchWord.value = value;
    if (!value) {
      clearExpandingNode();
      refreshLazyData();
    }
  });
};

// 监听搜索结果面板滚动，滚动到底部时触发懒加载下一页
const observeSearchPanel = () => {
  const contentEl = teSpaceSelectRef.value.contentRef as HTMLElement;
  const listEl = contentEl.querySelector('.te-cascader__suggestion-panel .te-scrollbar__wrap');
  listEl?.addEventListener(
    'scroll',
    debounce(function (this: HTMLElement) {
      if (this.scrollHeight - this.scrollTop <= this.clientHeight + 10) {
        handleSearchLazyLoad();
      }
    }, 100)
  );
};

// focus事件是否由togglePopperVisible(false)触发
let focusByTogglePopperVisibleFalse = false;
//选择器的选项列表
const options = ref([]);
//选择器选中值的代理,始终是个二维数组
const selectedValueProxy = ref<string[][]>([]);
//选择器绑定的选中值,单选是一维数组，多选是二维数组
const selectedValue = computed({
  get() {
    //单选,将组件绑定值设为一维数组
    if (!props.multiple) {
      return cloneDeep(selectedValueProxy.value.flat());
    } else {
      //多选,将组件绑定值设为二维数组
      return cloneDeep(selectedValueProxy.value);
    }
  },
  set(value) {},
});
//传给外层组件的model-value，valueType为object时，需要转换
const modelValueProxy = computed(() => {
  return selectedValueProxy.value.map((item) => item[item.length - 1]);
});
/**
 * 选中值改变
 */
const handleChangeSelected = (value: string[] | string[][] | null) => {
  //单选，设置代理值
  if (!props.multiple) {
    if (!value) {
      selectedValueProxy.value = [] as string[][];
    } else {
      selectedValueProxy.value = cloneDeep([value]) as string[][];
    }
    //单选场景下选择完直接关闭弹窗
    teSpaceSelectRef.value.togglePopperVisible(false);
    focusByTogglePopperVisibleFalse = true;
  } else {
    const newVal = (value || []).map((item) => item[item.length - 1]);
    // 选中，判断选中项是否有上级或下级空间被选中
    if (newVal.length > modelValueProxy.value.length) {
      const newId = newVal.find((item) => !modelValueProxy.value.includes(item))!;
      const childChecked = getChildChecked(newId);
      const parentChecked = getParentChecked(newId);
      if (childChecked || parentChecked) {
        TeMessage.warning(
          childChecked ? '下级空间已被选中，请先取消选中再进行操作' : '上级空间已被选中，请先取消选中再进行操作'
        );
        // 还原value
        value = cloneDeep(selectedValueProxy.value);
        // 将当前节点放到第一位，保持当前面板展开在当前节点，否则第一个节点为其他节点时展开面板会改变到其他节点
        // 修改了传入数据的顺序，可能对业务使用有影响
        const idPath = detailMap.get(newId)?.idPath || '';
        const findIndex = selectedValueProxy.value.findIndex((item) => idPath.includes(item[0]));
        if (findIndex > 0) {
          const element = value.splice(findIndex, 1)[0];
          value.unshift(element);
        }
      }
    }
    // 非搜索状态下才刷新禁用状态，否则搜索面板点击选中会不生效
    if (!searchWord.value) {
      refreshDisabled();
    }
    //多选，设置代理值
    selectedValueProxy.value = cloneDeep(value) as string[][];
    // 原先的取消选中的方法unCheckNode后直接return会导致再次打开面板时回显为空
  }
  emit(
    'update:modelValue',
    props.valueType === 'string' ? modelValueProxy.value : modelValueProxy.value.map((id) => detailMap.get(id))
  );
};

//缓存初次懒加载的事件
let resolveInitLazy = null;
let nodeInitLazy = null;
//选择器的配置参数
const tsCascaderProps: CascaderProps = {
  lazy: true,
  multiple: props.multiple,
  checkStrictly: true,
  lazyLoad(node, resolve) {
    return getLazyLoad(node, resolve);
  },
};
/**
 * 懒加载数据
 */
const getLazyLoad = (node, resolve) => {
  if (!requestState) {
    return resolve([]);
  }

  const { level } = node;
  if (level === 0) {
    resolveInitLazy = resolve;
    nodeInitLazy = node;
  }

  let parms = {
    // 空间类型：PROJECT-院区；BUILDING-建筑及分区；FLOOR-楼层及分区；ROOM-房间及分区
    typeEq: getLevelType(level),
    // 父级id
    idEq: (node.value as string) || '',
    // 非必填，若有表示仅筛选此院区id下的层级
    projectIn: props.campusIds,
    fetchRealPName: true,
  };

  LocationV2ApiApi.queryLocationV2LazyTree(props.axios, props.tenantId, parms).then((res) => {
    let result = res as unknown as LocationV2LazyTreeResponseVO[];
    if (res.errcode) {
      result = res.data || [];
      if (res.errcode !== '0') {
        return resolve([]);
      }
    }

    let resultData = dealwithLazyData(parms.typeEq, result, props.allowSelectAllLevels, props.hideFromLevel);
    resolve(resultData);
    if (props.multiple) {
      refreshDisabled();
    }
  });
};

/**
 * 根据层级判断是哪个类型
 * @param level
 */
const getLevelType = (level: number) => {
  let defaultObj = {
    0: LocationTypeEnum.PROJECT,
    1: LocationTypeEnum.BUILDING,
    2: LocationTypeEnum.FLOOR,
    3: LocationTypeEnum.ROOM,
  };
  return defaultObj[level];
};

//级联选择器的ref
const teSpaceSelectRef = ref();

// 输入框聚焦，展开下拉面板
const handleFocus = () => {
  if (!openOnFocus.value) {
    return;
  }

  // togglePopperVisible(false)后会触发focus，此时不展开下拉面板
  if (focusByTogglePopperVisibleFalse) {
    focusByTogglePopperVisibleFalse = false;
    return;
  }

  teSpaceSelectRef.value.togglePopperVisible(true);
};

/**
 * 创建虚拟DOM插入下拉面板的标题
 */
const handleShowHeader = () => {
  nextTick(() => {
    // let domPanel = teSpaceSelectRef.value.contentRef.querySelectorAll('.te-cascader-menu');
    let domPanel = teSpaceSelectRef.value.contentRef.children[0].children;
    domPanel[0]?.firstChild && render(h(TssDropdownTitle, { title: '院区' }), domPanel[0].firstChild);
    domPanel[1]?.firstChild && render(h(TssDropdownTitle, { title: '建筑及分区' }), domPanel[1].firstChild);
    domPanel[2]?.firstChild && render(h(TssDropdownTitle, { title: '楼层及分区' }), domPanel[2].firstChild);
    domPanel[3]?.firstChild && render(h(TssDropdownTitle, { title: '房间及分区' }), domPanel[3].firstChild);
  });
  if (props.multiple) {
    refreshDisabled();
  }
};

/**
 * 展开或折叠下拉框事件
 */
const handleShowDrop = (e: boolean) => {
  if (e) {
    //展开式插入标题
    handleShowHeader();
  } else {
    //折叠后清空面板
    handleBlur();
  }
};

// fix HLMS-PORTAL-72824 ISMS-10129 只展开两级时，关闭再打开面板会显示第二级暂无数据，此时需清除组件内部的展开节点
// 展开两级后搜索时的搜索结果如果是第二级中的空间，清空搜索后也会出现这个问题
const clearExpandingNode = () => {
  const menuList = teSpaceSelectRef.value.cascaderPanelRef.menuList as MenuList[];
  const panel0 = menuList?.[0]?.panel;
  // 单选选择后关闭也会展示暂无数据，直接都清除不区分展开第几级了
  panel0?.expandingNode && (panel0.expandingNode = null);
};

//#################回显数据######################
/**
 * 编辑回显数据
 */
watch(
  () => props.modelValue,
  (val) => {
    const ids = (val || []).map((item) => item?.id || item) as string[];
    //如果是编辑后emit出去重新传值进来，则不触发回显逻辑
    if (isEqual(ids, modelValueProxy.value)) {
      return;
    }
    nextTick(async () => {
      //关闭默认的给选中值赋值后，重新渲染列表操作
      requestState = false;

      if (!val || val.length === 0) {
        selectedValueProxy.value = [];
      } else {
        selectedValueProxy.value = await getEchoValues(ids);
      }
      setTimeout(() => {
        //给选中值赋值后，重新渲染列表，保证数据回显
        refreshLazyData();
      }, 100);
    });
  },
  { immediate: true }
);

/**
 * 二次编辑需要回显时，绑定数据先处理后赋值
 */
const getEchoValues = async (val: string[]) => {
  let data = {
    ids: val,
  };
  let res = await LocationV2ApiApi.locationPathForDetail(props.axios, props.tenantId, data);
  let result = res as unknown as LocationPathV2DetailResponseVO[];
  if (res.errcode) {
    result = res.data || [];
    if (res.errcode !== '0') {
      return [];
    }
  }
  return dealwithEchoData(result as LocationV2DetailResponseVO[]);
};

//################搜索################
//搜索关键字
const searchWord = ref('');
// 搜索结果原始数据
const searchRes = ref<LocationPathV2DetailResponseVO[]>([]);
// 搜索结果页码
const searchPageNum = ref(1);
const PAGE_SIZE = 50;
const searchTotal = ref(0);
// 是否是下一页
let isSearchNextPage = false;
// 搜索结果加载下一页
const handleSearchLazyLoad = debounce(async () => {
  if (searchPageNum.value * PAGE_SIZE >= searchTotal.value) {
    return;
  }

  requestState = false;
  // 设置搜索结果下一页标志
  isSearchNextPage = true;
  searchPageNum.value++;
  searchRes.value = [...searchRes.value, ...(await loadSearchResult())];

  // 搜索框重新触发搜索事件，重新渲染options
  const inputDom = getInputDom();
  const inputValue = inputDom.value;
  inputDom.value = inputValue + ' ';
  inputDom.dispatchEvent(new Event('input'));
  setTimeout(() => {
    inputDom.value = inputValue;
    inputDom.dispatchEvent(new Event('input'));
  }, 10);
}, 100);
//搜索逻辑
const searchLogic = async () => {
  const val = searchWord.value;
  if (!val) {
    return false;
  }

  let result = [...searchRes.value];

  if (modelValueProxy.value.length > 0) {
    let checkedData = {
      ids: modelValueProxy.value,
    };
    let resChecked = await LocationV2ApiApi.locationPathForDetail(props.axios, props.tenantId, checkedData);
    let resultChecked = resChecked as unknown as LocationPathV2DetailResponseVO[];
    if (resChecked.errcode) {
      resultChecked = resChecked.data || [];
      if (resChecked.errcode !== '0') {
        return false;
      }
    }
    result = result.concat(resultChecked);
  }
  options.value = dealwithSearchData(result, props.allowSelectAllLevels);
  if (props.searchSelectFirst && !props.multiple && options.value.length) {
    const value = [options.value[0].value] as string[];
    let children = options.value[0].children;
    while (children?.length) {
      value.push(children[0].value);
      children = children[0].children;
    }
    setTimeout(() => {
      selectedValueProxy.value = [value];
    }, 200);
  }
  return true;
};
// 加载搜索分页结果
const loadSearchResult: () => Promise<LocationV2DetailResponseVO[]> = () => {
  return new Promise((resolve) => {
    const params = new LocationV2FuzzyPageRequestVO();
    params.nameLike = searchWord.value;
    params.projectIn = props.campusIds;
    params.page = { pageNum: searchPageNum.value, pageSize: PAGE_SIZE };
    const { hideFromLevel } = props;
    if (hideFromLevel) {
      const levelMap: Record<string, LocationTypeEnum[]> = {
        building: [LocationTypeEnum.PROJECT],
        floor: [LocationTypeEnum.PROJECT, LocationTypeEnum.BUILDING],
        room: [LocationTypeEnum.PROJECT, LocationTypeEnum.BUILDING, LocationTypeEnum.FLOOR],
      };
      levelMap[hideFromLevel] && (params.typeIn = levelMap[hideFromLevel]);
    }
    LocationV2ApiApi.fuzzyQueryForPage(props.axios, props.tenantId, params)
      .then((res: any) => {
        if (res.errcode) {
          if (res.errcode === '0') {
            searchTotal.value = res.data?.total || 0;
            resolve(res.data?.records || []);
          }
        } else {
          searchTotal.value = res?.total || 0;
          resolve(res?.records || []);
        }
      })
      .catch(() => {
        resolve([]);
      });
  });
};
/**
 * 搜索时，延时300ms，确定用户是否正在逐个删光搜索词
 * 若搜索词被删空，则不进行搜索逻辑，改为重新渲染列表
 */
const handleSearch = async () => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(async () => {
      // fix HLMS-PORTAL-72825
      // 搜索触发handleSearch的300ms内清空了关键词触发refreshLazyData将requestState设置为true
      // 但handleSearch 中 setTimeout 300ms 后会再次将 requestState 设置为false，导致后续 getLazyLoad 返回空
      // 所以需要判断搜索词是否为空，如果为空，则不进行搜索逻辑
      if (!searchWord.value) {
        return;
      }
      //关闭懒加载
      requestState = false;
      // 如果不是isNextPage，则需要重新获取searchRes
      // isNextPage时直接取已在handleSearchLazyLoad获取到的searchRes，
      if (!isSearchNextPage) {
        searchPageNum.value = 1;
        searchRes.value = await loadSearchResult();
      }
      let res = await searchLogic();
      isSearchNextPage = false;
      if (res) {
        resolve();
      } else {
        reject();
      }
    }, 300);
  });
};
// 获取搜索框input元素
const getInputDom = () => {
  const dom = document.getElementsByClassName(randomClass)[0];
  const inputDom = dom.getElementsByClassName(
    props.multiple ? 'te-cascader__search-input' : 'te-input__inner'
  )[0] as HTMLInputElement;
  return inputDom;
};

//为true才可以请求懒加载数据
let requestState = true;

/**
 * 折叠面板，结束搜索操作
 */
const handleBlur = () => {
  clearExpandingNode();
  searchWord.value = '';
  refreshLazyData();
};

//重新渲染数据
const refreshLazyData = () => {
  //开启懒加载
  requestState = true;
  //触发重新渲染数据，先赋值，再重新渲染
  getLazyLoad(nodeInitLazy, resolveInitLazy);
};

//自定义搜索词匹配逻辑
const filterMethod = (node, key) => {
  return node.label.includes(key);
};

// 刷新disabled状态
const refreshDisabled = () => {
  nextTick(() => {
    teSpaceSelectRef.value.cascaderPanelRef.menuList.forEach((menu: MenuList) => {
      (menu?.nodes || []).forEach((node) => {
        if (
          modelValueProxy.value.some(
            (sel) => sel !== node.value && (node.pathValues.includes(sel) || sel === node.data.parentId)
          )
        ) {
          node.data.disabled = true;
        } else {
          node.data.disabled = node.data.initialDisabled;
        }
      });
    });
  });
};

// 点击选中时判断当前节点的下级是否被选中
const getChildChecked = (id: string) => {
  return modelValueProxy.value.some((selId) => {
    const idPath = detailMap.get(selId)?.idPath;
    if (!idPath) {
      return false;
    }

    return selId !== id && idPath.includes(id);
  });
};
// 搜索时判断当前节点的父级是否被选中
const getParentChecked = (id: string) => {
  const idPath = detailMap.get(id)?.idPath;
  if (!idPath) {
    return false;
  }
  return modelValueProxy.value.some((selId) => {
    return selId !== id && idPath.includes(selId);
  });
};
</script>
<style lang="less">
.custom-space-cascader-popper {
  .te-cascader-menu__wrap {
    height: 240px;
  }
  .te-cascader__suggestion-list {
    max-height: 240px;
  }
}
.custom-space-cascader-popper .te-scrollbar__view {
  padding-top: 38px !important;
}
.custom-space-cascader-popper .te-scrollbar__view:has(.te-cascader__empty-text) {
  padding-top: 0 !important;
}
.custom-space-cascader-popper .te-scrollbar__view:has(.te-cascader__suggestion-item) {
  padding-top: 0 !important;
}
/**子元素为树节点子节点则缩进 */
.custom-space-cascader-popper .te-cascader-node:has(.tss-tree-child) {
  padding-left: 40px;
}
</style>
