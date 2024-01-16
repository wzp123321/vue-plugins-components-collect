<template>
  <div class="bm-collapse-home" id="bm-collapse-home" v-loading="loading">
    <el-collapse v-model="activeNames">
      <el-collapse-item v-for="(item, index) in boundaryList" :key="'collapse_' + index" :name="item.boundaryTypeName">
        <template #title>
          <header class="bm-ch-collapse-header">
            <div class="header-title">
              <img :src="mapTitleIcon(item.boundaryTypeId + '')" alt="" />
              <span class="label">{{ item.boundaryTypeName }}</span>
            </div>
            <span :class="['header-tag', item.persistentType !== '持续性' ? 'no-sustained' : '']">
              {{ item.persistentType }}
            </span>
          </header>
        </template>
        <!-- 事件列表 -->
        <t-tabs :value="Number(item.tableData[item.activeEventIndex].eventId)" :theme="'card'" v-if="!loading">
          <t-tab-panel
            v-for="(tabItem, tabIndex) in mapEventList(item.tableData)"
            :key="'tab_' + tabIndex"
            :value="tabItem.code"
          >
            <template #label>
              <div @click="handleEventTabChange(tabItem.code, item)" class="bm-ch-tab-label">
                <span> {{ tabItem.name }}</span>
                <el-popover
                  popper-class="bm-ch-popper"
                  v-if="item.tableData[item.activeEventIndex].eventId === tabItem.code"
                  :width="72"
                  trigger="click"
                >
                  <template #reference>
                    <i class="toc-iconfont icon-toc-more-outline"></i>
                  </template>
                  <ul>
                    <li @click="handleEditDialogShow($event, tabItem.code, tabItem.chainId)">
                      <i class="toc-iconfont icon-toc-edit-outline"></i><span>编辑</span>
                    </li>
                    <li @click="handleDeleteConfirm($event, tabItem.code)">
                      <i class="toc-iconfont icon-toc-shanchu"></i><span>删除</span>
                    </li>
                  </ul>
                </el-popover>
              </div>
            </template>
          </t-tab-panel>
        </t-tabs>
        <!-- 事件数据列表 -->
        <table>
          <thead>
            <tr>
              <template
                v-for="(thItem, thIndex) in item.tableData?.[item.activeEventIndex].titleList"
                :key="'th_' + thIndex"
              >
                <th
                  :colspan="mapThColSpan(item.tableData?.[item.activeEventIndex].headerColSpan, thIndex)"
                  v-if="mapThColSpan(item.tableData?.[item.activeEventIndex].headerColSpan, thIndex) !== 0"
                  :style="{
                    width:
                      thIndex === 0
                        ? item.tableData?.[item.activeEventIndex].headerColSpan !== 3
                          ? '182px'
                          : '310px'
                        : 'auto',
                  }"
                >
                  {{ thItem }}
                </th>
              </template>
              <th>合计</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(trItem, trIndex) in item.tableData?.[item.activeEventIndex].dataList"
              :key="'tr_' + trIndex"
              :class="{
                'is-comment': trItem?.commentFlag,
                'is-summary': trItem?.summaryFlag,
              }"
            >
              <!-- 能源类型 -->
              <td
                class="is-white"
                :colspan="
                  mapTdColSpan(
                    item.tableData?.[item.activeEventIndex].headerColSpan,
                    trItem?.commentFlag,
                    trItem?.summaryFlag,
                    trItem.hostingAreaName,
                    'energyCode',
                  )
                "
                :rowspan="
                  mapTdRowSpan(
                    item.tableData?.[item.activeEventIndex].dataList,
                    trItem.energyCode,
                    trItem.hostingAreaId,
                    trItem.summaryFlag,
                    trItem.commentFlag,
                    trIndex,
                    'energyCode',
                  )
                "
                v-if="
                  mapTdRowSpan(
                    item.tableData?.[item.activeEventIndex].dataList,
                    trItem.energyCode,
                    trItem.hostingAreaId,
                    trItem.summaryFlag,
                    trItem.commentFlag,
                    trIndex,
                    'energyCode',
                  ) !== 0
                "
              >
                <div v-if="!trItem?.summaryFlag && !trItem?.commentFlag" class="flex flex-column">
                  <span>{{ trItem.energyName }}</span>
                  <span>({{ trItem.energyUnit }})</span>
                </div>
                <div v-else>
                  {{ trItem?.summaryFlag ? '小计(元)' : '备注' }}
                </div>
              </td>
              <!-- 托管区域 -->
              <td
                class="is-white"
                v-if="
                  item.tableData?.[item.activeEventIndex].headerColSpan === 3 &&
                  !trItem?.commentFlag &&
                  !trItem?.summaryFlag &&
                  mapTdRowSpan(
                    item.tableData?.[item.activeEventIndex].dataList,
                    trItem.energyCode,
                    trItem.hostingAreaId,
                    trItem.summaryFlag,
                    trItem.commentFlag,
                    trIndex,
                    'hostingAreaName',
                  ) !== 0 &&
                  mapTdColSpan(
                    item.tableData?.[item.activeEventIndex].headerColSpan,
                    trItem?.commentFlag,
                    trItem?.summaryFlag,
                    trItem.hostingAreaName,
                    'hostingAreaName',
                  ) !== 0
                "
                :colspan="
                  mapTdColSpan(
                    item.tableData?.[item.activeEventIndex].headerColSpan,
                    trItem?.commentFlag,
                    trItem?.summaryFlag,
                    trItem.hostingAreaName,
                    'hostingAreaName',
                  )
                "
                :rowspan="
                  mapTdRowSpan(
                    item.tableData?.[item.activeEventIndex].dataList,
                    trItem.energyCode,
                    trItem.hostingAreaId,
                    trItem.summaryFlag,
                    trItem.commentFlag,
                    trIndex,
                    'hostingAreaName',
                  )
                "
                :title="trItem.hostingAreaName"
              >
                {{ trItem.hostingAreaName }}
              </td>
              <!-- 分类 -->
              <td
                v-if="
                  !trItem?.commentFlag &&
                  !trItem?.summaryFlag &&
                  item.tableData?.[item.activeEventIndex].headerColSpan !== 0
                "
                :colspan="
                  mapTdColSpan(
                    item.tableData?.[item.activeEventIndex].headerColSpan,
                    trItem?.commentFlag,
                    trItem?.summaryFlag,
                    trItem.hostingAreaName,
                    'itemName',
                  )
                "
                class="is-white"
              >
                {{ trItem.itemName }}
              </td>
              <template v-if="!trItem.commentFlag">
                <td
                  v-for="(tdItem, tdIndex) in trItem.dataList"
                  :key="'td_' + tdIndex"
                  :class="{
                    'td-editable': mapTdEditable(
                      item.tableData?.[item.activeEventIndex].editableMonths,
                      item.tableData?.[item.activeEventIndex].titleList,
                      item.tableData?.[item.activeEventIndex].headerColSpan,
                      trItem.editFlag,
                      tdIndex,
                    ),
                    'td-editing': mapTdIsEditing(
                      item.boundaryTypeId,
                      item.tableData?.[item.activeEventIndex].eventId,
                      trItem.energyCode,
                      trItem.editFlag,
                      trItem.hostingAreaId,
                      item.tableData?.[item.activeEventIndex].titleList,
                      item.tableData?.[item.activeEventIndex].headerColSpan,
                      tdIndex,
                      trItem.itemName,
                    ),
                  }"
                >
                  <span
                    v-if="
                      !mapTdIsEditing(
                        item.boundaryTypeId,
                        item.tableData?.[item.activeEventIndex].eventId,
                        trItem.energyCode,
                        trItem.editFlag,
                        trItem.hostingAreaId,
                        item.tableData?.[item.activeEventIndex].titleList,
                        item.tableData?.[item.activeEventIndex].headerColSpan,
                        tdIndex,
                        trItem.itemName,
                      )
                    "
                    class="bm-ch-td-label"
                    :title="tdItem !== null ? thousandSeparation(tdItem) + '' : ''"
                  >
                    {{ tdItem === null ? '-' : thousandSeparation(tdItem) }}
                  </span>
                  <input
                    v-else
                    type="text"
                    :value="tdItem"
                    autofocus
                    v-inputFilter:number="{
                      decimal: mapInputDecimal(trItem.itemName),
                      negative: mapInputNegative(trItem.itemName),
                    }"
                    @blur="handleInputBlur($event)"
                    @keydown.enter="handleInputEnter($event)"
                  />
                  <img
                    src="../../../assets/images/common/common-edit.svg"
                    alt="edit"
                    title="编辑"
                    @click="
                      triggerEdit(
                        $event,
                        item.boundaryTypeId,
                        item.persistentType,
                        item.tableData?.[item.activeEventIndex].titleList,
                        item.tableData?.[item.activeEventIndex].headerColSpan,
                        trItem.energyCode,
                        item.tableData?.[item.activeEventIndex].eventId,
                        trItem.hostingAreaId,
                        tdItem,
                        tdIndex,
                        trItem.itemName,
                      )
                    "
                  />
                </td>
              </template>
              <template v-else>
                <td
                  :colspan="
                    item.tableData?.[item.activeEventIndex].titleList.length -
                    item.tableData?.[item.activeEventIndex].headerColSpan +
                    1
                  "
                  :title="trItem.comment ? trItem.comment + '' : '-'"
                >
                  {{ trItem.comment === '' || trItem.comment === null ? '-' : trItem.comment }}
                </td>
              </template>
              <td
                v-if="!trItem.commentFlag"
                :title="trItem.lineTotal !== null ? thousandSeparation(trItem.lineTotal) : '-'"
              >
                {{ trItem.lineTotal !== null ? thousandSeparation(trItem.lineTotal) : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import bmDataService from '../boundary-management.service';
import BmCollapseHomeService from './bm-collapse-home.service';
import bmAddEditDialogService from '../bm-add-edit-dialog/bm-add-edit-dialog.service';

import { BM_IBoundaryTypeDataVO, BM_BOUNDARY_EVENT_SESSION_KEY } from './bm-collapse-home.api';
import { BM_IEventTableListVO, BM_IEventDataVO } from '../boundary-management.api';
import { BM_EBoundaryType } from '../bm-add-edit-dialog/bm-add-edit-dialog.api';
import { BM_IAddManagementForm } from '../bm-search-bar/bm-search-bar.api';

import { Tabs as TTabs, TabPanel as TTabPanel } from 'tdesign-vue-next';
// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';
import { ElMessageBox } from 'element-plus';

import { thousandSeparation } from '../../../utils/index';

const bmCollapseHome = new BmCollapseHomeService();
const destroy$ = new Subject();
// 列表
const boundaryList = ref<BM_IBoundaryTypeDataVO[]>([]);
// loading
const loading = ref<boolean>(false);
// collapse names
const activeNames = ref<string[]>([]);
// 边界类型中的事件选中
let boundaryEventMap = new Map<number, number>();
/**
 * 根据边界类型获取图标
 * @param id
 */
const mapTitleIcon = (id: string) => {
  let imageName = '';
  switch (id) {
    case BM_EBoundaryType.医院综合业务量变化:
      imageName = 'bm-portfolio';
      break;
    case BM_EBoundaryType.能源单价调整:
      imageName = 'bm-unit-price-adjustment';
      break;
    case BM_EBoundaryType.兜底条款:
      imageName = 'bm-save-clause';
      break;
    case BM_EBoundaryType.第三方经营业务服务范围扩大:
      imageName = 'bm-service-expansion';
      break;
    case BM_EBoundaryType.工程施工用能:
      imageName = 'bm-engineering-construction';
      break;
    case BM_EBoundaryType.用能设备及器具调整:
      imageName = 'bm-equipment-adjustment';
      break;
    case BM_EBoundaryType.业务面积或业务用途调整:
      imageName = 'bm-new-area';
      break;
    default:
      imageName = 'bm-new-area';
  }
  return require(`../../../assets/images/boundary-management/${imageName}.svg`);
};
/**
 *
 * 获取当前边界类型下的事件列表
 * @param list
 */
const mapEventList = (list: BM_IEventTableListVO[]) => {
  return list?.map((it) => {
    return {
      code: it.eventId as number,
      name: it.eventName,
      chainId: it.chainId,
    };
  });
};
/**
 * 头部能源类型合并列
 * @param headerColSpan 列头合并
 * @param index 列索引
 */
const mapThColSpan = (headerColSpan: number, index: number) => {
  return index >= headerColSpan ? 1 : index === 0 ? headerColSpan : 0;
};
/**
 * 输入框负数过滤
 * @param itemName
 */
const mapInputNegative = (itemName: string) => {
  return itemName?.includes('能耗量');
};
/**
 * 小数位
 * @param itemName
 */
const mapInputDecimal = (itemName: string) => {
  return itemName?.includes('能耗量') ? 2 : 4;
};
/**
 * td的合并列
 * @param headerSpan 列头合并
 * @param commentFlag 是否是备注
 * @param summaryFlag 是否是合计
 * @param hostingAreaName 托管区域
 * @param columnName 列
 */
const mapTdColSpan = (
  headerSpan: number,
  commentFlag: boolean,
  summaryFlag: boolean,
  hostingAreaName: string,
  columnName: string,
) => {
  let colSpan = 1;
  if (columnName === 'energyCode') {
    colSpan = commentFlag || summaryFlag ? headerSpan : !hostingAreaName ? headerSpan - 1 : 1;
  } else {
    colSpan = commentFlag || summaryFlag || (columnName === 'hostingAreaName' && !hostingAreaName) ? 0 : 1;
  }
  return colSpan;
};
/**
 * 根据能源类型、托管区域判断行合并
 * @param list 数据
 * @param energyCode 能源类型
 * @param hostingAreaId 托管区域
 * @param summaryFlag 是否是小计
 * @param commentFlag 是否是备注
 * @param rowIndex 行索引
 * @param columnName 列名
 */
const mapTdRowSpan = (
  list: BM_IEventDataVO[],
  energyCode: string,
  hostingAreaId: number | null,
  summaryFlag: boolean,
  commentFlag: boolean,
  rowIndex: number,
  columnName: string,
) => {
  let rowSpan = 1;
  if (summaryFlag || commentFlag) {
    return rowSpan;
  }
  if (columnName === 'energyCode') {
    const len = list?.filter((it) => it.energyCode === energyCode)?.length;
    rowSpan = rowIndex === list?.findIndex((it) => it.energyCode === energyCode) ? len : 0;
  } else if (columnName === 'hostingAreaName') {
    const len = list?.filter((it) => it.energyCode === energyCode && it.hostingAreaId === hostingAreaId)?.length;
    rowSpan =
      rowIndex === list?.findIndex((it) => it.energyCode === energyCode && it.hostingAreaId === hostingAreaId)
        ? len
        : 0;
  }
  return rowSpan;
};
/**
 * 切换事件tab
 * @param eventId 事件id
 * @param item 当前边界类型数据
 */
const handleEventTabChange = (eventId: number, item: BM_IBoundaryTypeDataVO) => {
  boundaryEventMap.set(item.boundaryTypeId, eventId);
  item.activeEventIndex = item.tableData?.findIndex((it) => it.eventId === eventId);
  setActiveEventMap();
};
/**
 * 设置缓存
 */
const setActiveEventMap = () => {
  let obj = {};
  boundaryEventMap.forEach((v, k) => {
    obj = {
      ...obj,
      [k]: v,
    };
  });
  window.sessionStorage.setItem(BM_BOUNDARY_EVENT_SESSION_KEY, JSON.stringify(obj));
};
/**
 * 获取缓存
 */
const getActiveEventMap = () => {
  const sessionIem = window.sessionStorage.getItem(BM_BOUNDARY_EVENT_SESSION_KEY);
  if (!!sessionIem && sessionIem !== '{}') {
    const parseObj = JSON.parse(sessionIem);
    Object.entries(parseObj).forEach(([k, v]) => {
      boundaryEventMap.set(Number(k), Number(v));
    });
  } else {
    boundaryEventMap = new Map();
  }
};
/**
 * 删除事件
 * @param eventId
 */
const handleDeleteConfirm = async (ev: Event, eventId: number) => {
  ev.preventDefault();
  ElMessageBox.confirm('删除后无法恢复，确定要删除此事件吗？', '删除事件', {
    type: 'warning',
    confirmButtonText: '确定',
    customClass: 'bm-delete-confirm',
    cancelButtonText: '取消',
  })
    .then(async (res) => {
      if (res === 'confirm') {
        if (await bmCollapseHome.handleEventDelete(eventId)) {
          bmDataService.query();
        }
      }
    })
    .catch((error) => {
      console.log('取消删除');
    });
};
/**
 * 打开编辑弹框
 * @param ev 事件对象
 * @param eventId 事件id
 * @param chainId
 */
const handleEditDialogShow = (ev: Event, eventId: number, chainId: number) => {
  ev.preventDefault();
  bmAddEditDialogService.handleShow({ id: eventId, chainId });
};
/**
 * 判断当前单元格是否可编辑
 * @param editableMonths 可编辑月数组
 * @param titleList 表头
 * @param headerColSpan 表头合并数
 * @param editFlag 是否可编辑
 * @param columnIndex 列
 */
const mapTdEditable = (
  editableMonths: number[] | null,
  titleList: string[],
  headerColSpan: number,
  editFlag: boolean,
  columnIndex: number,
) => {
  const { month } = mapColumnYearMonth(titleList, headerColSpan, columnIndex);
  return (
    editFlag &&
    (!editableMonths ||
      editableMonths?.length === 0 ||
      (editableMonths?.length && editableMonths?.includes(Number(month))))
  );
};
/**
 * 触发编辑
 * @param event 事件对象
 * @param boundaryTypeId 边界id
 * @param persistentType 事件类型
 * @param energyCode 能源类型
 * @param eventId 事件id
 * @param hostingAreaId 托管区域id
 * @param value 单元格值
 * @param columnIndex 列索引
 * @param itemName 修改项
 */
const triggerEdit = (
  event: Event,
  boundaryTypeId: number,
  persistentType: string,
  titleList: string[],
  headerColSpan: number,
  energyCode: string,
  eventId: number | null,
  hostingAreaId: number,
  value: number,
  columnIndex: number,
  itemName: string,
) => {
  const { year, month } = mapColumnYearMonth(titleList, headerColSpan, columnIndex);
  if (bmCollapseHome.isEditing) {
    return;
  }
  bmCollapseHome.setEditStore({
    boundaryTypeId,
    persistentType,
    year,
    month,
    eventId,
    hostingAreaId,
    energyCode,
    amount: null,
    originValue: value !== null ? value + '' : '',
    itemName,
  });

  if (event.target) {
    nextTick(() => {
      (event.target as HTMLElement).parentNode?.parentNode?.querySelector('input')?.focus();
    });
  }
};
/**
 * 判断是否处于编辑状态
 * @param boundaryTypeId 边界id
 * @param eventId 事件id
 * @param energyCode 能源类型
 * @param editFlag 可编辑
 * @param hostingAreaId 托管区域id
 * @param titleList 表头列表
 * @param headerColSpan 表头合并数
 * @param columnIndex 列索引
 * @param itemName 修改项
 */
const mapTdIsEditing = (
  boundaryTypeId: number,
  eventId: number | null,
  energyCode: string,
  editFlag: boolean,
  hostingAreaId: number | null,
  titleList: string[],
  headerColSpan: number,
  columnIndex: number,
  itemName: string,
) => {
  const { year, month } = mapColumnYearMonth(titleList, headerColSpan, columnIndex);
  return (
    editFlag && bmCollapseHome.checkIsEditing(boundaryTypeId, energyCode, eventId, hostingAreaId, year, month, itemName)
  );
};
/**
 * 根据表头数据获取年、月
 * @param titleList
 * @param headerColSpan
 * @param columnIndex
 */
const mapColumnYearMonth = (titleList: string[], headerColSpan: number, columnIndex: number) => {
  const yearMonthStr = titleList?.[headerColSpan + columnIndex];
  const yearMonthArr = yearMonthStr?.split('-');
  const year = yearMonthArr?.[0];
  const month = yearMonthArr?.[1];
  return {
    year,
    month,
  };
};
/**
 * 输入框失焦
 * @param e
 */
const handleInputBlur = async (e: FocusEvent) => {
  const value = (e.target as HTMLInputElement).value;

  // 如果值没有变
  if (
    value === bmCollapseHome.editStore.originValue ||
    (!value && !bmCollapseHome.editStore.originValue) ||
    value === '-'
  ) {
    bmCollapseHome.cancelEdit();
    return;
  }
  // 通过修改项判断调用接口
  const res = bmCollapseHome.editStore.itemName?.includes('能耗量')
    ? await bmCollapseHome.handleEnergyCountEdit(queryForm, value)
    : await bmCollapseHome.handleEnergyPriceEdit(queryForm, value);
  if (res) {
    bmDataService.query();
  }
};
/**
 * 回车
 * @param e
 */
const handleInputEnter = (e: KeyboardEvent) => {
  if (e?.target) {
    (e?.target as HTMLInputElement)?.blur();
  }
};
// 查询入参
let queryForm: BM_IAddManagementForm = {
  hostingPeriod: null,
  verificationType: '',
  measureType: '',
  startTime: '',
  endTime: '',
};
/**
 * 订阅数据
 * 判断缓存数据
 */
onMounted(() => {
  bmDataService.bmBoundaryEventResult.pipe(takeUntil(destroy$)).subscribe((v) => {
    getActiveEventMap();
    boundaryList.value =
      v?.map((item) => {
        const activeEventIndex = item?.tableData?.findIndex((it) => {
          const eventId = boundaryEventMap.get(item.boundaryTypeId);
          return eventId === it.eventId;
        });
        return {
          boundaryTypeName: item?.boundaryTypeName ?? '',
          persistentType: item?.persistentType ?? '',
          boundaryTypeId: item?.boundaryTypeId,
          activeEventIndex: activeEventIndex === -1 ? item?.activeEventIndex : activeEventIndex,
          tableData: item?.tableData ?? [],
        };
      }) ?? [];
    activeNames.value = v?.map((item) => item.boundaryTypeName);
  });
  bmDataService.bmSearchLoading.pipe(takeUntil(destroy$)).subscribe((v) => {
    loading.value = v;
  });
  bmDataService.bmQueryParams.pipe(takeUntil(destroy$)).subscribe((v) => {
    queryForm = {
      ...queryForm,
      ...v,
    };
  });
});
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});
</script>
<style lang="less" scoped>
#bm-collapse-home {
  width: 100%;
  flex: auto;
  --summary-td-bg-color: rgba(255, 251, 230, 1);
  --comment-td-bg-color: rgba(237, 245, 252, 1);
  --td-comp-size-xxl: 40px;

  :deep(.t-tabs) {
    .t-tabs__nav--card {
      background-color: var(--color-default);
    }

    .t-tabs__nav-item {
      padding: 0;
      border-bottom: none;
      border-color: var(--color-text-divider);
      border-top: 1px solid var(--color-text-divider);

      > div {
        display: none;
      }
    }

    .t-tabs__nav-item.t-is-active {
      text-shadow: none;

      .bm-ch-tab-label,
      .toc-iconfont {
        color: var(--color-primary);
      }
    }

    .t-tabs__nav-item-text-wrapper,
    .t-tabs__nav-item-text-wrapper .bm-ch-tab-label {
      height: var(--td-comp-size-xxl);
      line-height: var(--td-comp-size-xxl);
      width: 100%;
    }

    .t-tabs__nav-item-text-wrapper .bm-ch-tab-label {
      position: relative;
      color: var(--color-text-title);
      padding: 0 20px;

      .toc-iconfont {
        margin-left: 8px;

        position: relative;
        top: 3px;
      }
    }
  }

  :deep(.el-collapse) {
    .bm-ch-collapse-header {
      flex: auto;
      margin-right: 24px;

      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      .header-title {
        display: flex;
        flex-direction: row;
        align-items: center;

        img {
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }

        > span.label {
          color: var(--color-text-title);
          font-size: 14px;
        }
      }

      .header-tag {
        padding: 2px 10px;
        font-size: 12px;
        line-height: 20px;
        text-align: center;
        color: rgba(24, 144, 255, 1);
        border: 1px solid rgba(209, 233, 255, 1);
        box-sizing: border-box;
        background: rgba(232, 244, 255, 1);
      }

      .header-tag.no-sustained {
        color: rgba(250, 140, 22, 1);
        border: 1px solid rgba(254, 232, 208, 1);
        box-sizing: border-box;
        background: rgba(255, 244, 232, 1);
      }
    }

    table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;

      thead > tr > th,
      tbody > tr > td {
        border-right: 1px solid var(--color-text-divider);
      }

      tbody tr {
        td {
          position: relative;
          overflow: hidden;
          text-overflow: ellipsis;

          > img {
            cursor: pointer;
            width: 14px;
            height: 14px;

            position: absolute;
            top: 50%;
            right: 8px;
            transform: translateY(-50%);
            display: none;
          }

          &.td-editable:not(.td-editing):hover > img {
            display: inline-block;
          }

          &.td-editing > input {
            width: 100%;
          }
        }
        &.is-summary > td {
          background-color: var(--summary-td-bg-color);
        }

        &.is-comment > td {
          background-color: var(--comment-td-bg-color);
        }

        &:not(.is-summary):not(.is-comment) > td.is-white {
          background-color: var(--color-default);
          border-bottom: 1px solid var(--color-text-divider);
        }
      }
    }
  }
}
</style>
<style lang="less">
.el-popover.bm-ch-popper {
  padding: 4px 0;
  min-width: auto;
  box-sizing: border-box;

  ul {
    margin-bottom: 0;
  }

  ul li {
    cursor: pointer;
    padding: 7px 12px;
    line-height: 22px;

    .toc-iconfont {
      margin-right: 4px;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }
}
</style>
<style lang="less">
.el-message-box.bm-delete-confirm {
  padding-bottom: 0;

  .el-message-box__header {
    background: rgba(240, 244, 249, 1);
    padding: 15px 20px;
  }

  .el-message-box__content {
    padding: 20px 12px 20px 20px;
  }

  .el-message-box__btns {
    border-top: 1px solid rgba(0, 0, 0, 0.15);
    padding: 12px 20px 12px 0;

    button.el-button {
      height: 32px !important;
      line-height: 32px !important;
    }
  }
}
</style>
