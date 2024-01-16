<template>
  <div id="esm-t-table">
    <el-table
      style="width: 100%"
      :data="tableData"
      :header-cell-style="mapHeaderStyle"
      :span-method="mapSpanMethod"
      :cell-class-name="mapCellClassName"
      :key="elTableKey"
      ref="elTableRef"
    >
      <el-table-column fixed="left" label="管理措施" :width="MEASURE1_WIDTH + MEASURE2_WIDTH">
        <el-table-column :width="MEASURE1_WIDTH" label="管理措施1">
          <template #default="{ row }" fixed="left">
            <div :title="row.energyName">{{ row.energyName }}</div>
            <div v-if="row.energyUnit">({{ row.energyUnit }})</div>
          </template>
        </el-table-column>
        <el-table-column :width="MEASURE2_WIDTH" fixed="left" label="管理措施2">
          <template #default="{ row, $index }">
            <input
              v-if="editRowIndex === -1 && editColumnIndex === $index"
              v-inputFilter:search="{ allowSpace: false }"
              maxlength="20"
              ref="measure"
              v-model="row.measureName"
              type="text"
              style="width: 100%; height: 36px"
              @change="handleInputBlur(row.measureName, row)"
              @blur="blurEvt"
              @keydown.enter="blurEvt"
            />
            <div
              :title="row?.measureName !== '' && row?.measureName !== null ? row?.measureName : '-'"
              v-show="!(editRowIndex === -1 && editColumnIndex === $index)"
              class="ett-item-name"
            >
              <span>{{ row?.measureName !== '' && row?.measureName !== null ? row?.measureName : '-' }}</span>
              <el-popover
                placement="bottom"
                :width="70"
                trigger="click"
                v-if="!(editRowIndex === -1 && editColumnIndex === $index)"
              >
                <div class="t-table-btn">
                  <div @click="editMeasureName(row, $event, -1, $index)"><Edit />编辑</div>
                  <div @click="deleteMeasure(row)"><Delete />删除</div>
                </div>
                <template #reference>
                  <More
                    v-show="!row.summaryFlag && !row.totalFlag"
                    :class="changeColor === $index ? 'active-svg' : ''"
                    @click="more($index)"
                  />
                </template>
              </el-popover>
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        v-for="(item, index) in props.headList"
        :label="item"
        :min-width="NORMAL_WIDTH"
        :key="`${item}${index}`"
      >
        <template #default="{ row, $index }">
          <input
            v-if="editRowIndex === index && editColumnIndex === $index"
            v-model="row.dataList[index]"
            type="text"
            style="width: 100%; height: 36px"
            @change="handleInputBlur(row.dataList[index], row, item, index, $index)"
            @blur="blurEvt(row.dataList[index], item)"
            @keydown.enter="blurEvt(row.dataList[index], item)"
            v-inputFilter:number="{ integral: 10, decimal: 2 }"
          />
          <div
            v-show="!(editRowIndex === index && editColumnIndex === $index)"
            :title="
              row.savingFlag
                ? mapPercent(row?.dataList[index])
                : row?.dataList[index] !== '' && row?.dataList[index] !== null
                ? thousandSeparation(Number(row?.dataList[index]))
                : '-'
            "
          >
            {{
              row.savingFlag
                ? mapPercent(row?.dataList[index])
                : row?.dataList[index] !== '' && row?.dataList[index] !== null
                ? thousandSeparation(Number(row?.dataList[index]))
                : '-'
            }}
            <img
              class="edit-icon"
              v-if="mapColumnEditable(row)"
              src="@/assets/images/management-analysis/ma-monthly/ma-monthly-edit-icon.svg"
              title="编辑"
              @click="triggerEdit(row, $event, index, $index)"
              alt="编辑"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="合计" :width="OPERATE_WIDTH">
        <template #default="{ row }">
          <span
            :title="
              row.savingFlag
                ? mapPercent(row.lineTotal)
                : row.lineTotal !== '' && row.lineTotal !== null
                ? thousandSeparation(Number(row.lineTotal))
                : '-'
            "
            >{{
              row.savingFlag
                ? mapPercent(row.lineTotal)
                : row.lineTotal !== '' && row.lineTotal !== null
                ? thousandSeparation(Number(row.lineTotal))
                : '-'
            }}</span
          >
        </template>
      </el-table-column>
      <el-table-column label="备注" :width="OPERATE_WIDTH">
        <template #default="{ row, $index }">
          <el-input
            v-if="editRowIndex === row.dataList.length + 2 && editColumnIndex === $index"
            v-inputFilter:search="{ allowSpace: false }"
            v-model="row.remarks"
            type="text"
            style="width: 100%; height: 36px"
            maxlength="200"
            @change="handleInputRemarkBlur(row)"
            @blur="blurEvt"
            @keydown.enter="blurEvt"
          />
          <div
            v-show="!(editRowIndex === row.dataList.length + 2 && editColumnIndex === $index)"
            :title="row?.remarks !== '' && row?.remarks !== null ? row?.remarks : '-'"
          >
            {{ row?.remarks !== '' && row?.remarks !== null ? row?.remarks : '-' }}
            <img
              class="edit-icon"
              v-if="mapColumnEditable(row)"
              src="@/assets/images/management-analysis/ma-monthly/ma-monthly-edit-icon.svg"
              title="编辑"
              @click="triggerEdit(row, $event, row.dataList.length + 2, $index)"
              alt="编辑"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts" setup>
import { ref, onUnmounted, nextTick, computed } from 'vue';
// 组件
import { More, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
// 服务
import EsmTTableService from './esm-t-table.service';
import searchbarService from '../esm-searchbar.service';
// API
import { getTenant, thousandSeparation } from '../../../../../utils/index';
import { mapPercent } from '../../../utils/index';
import message from '@/utils/message';
import { ESM_INextList } from '@/pages/energy-saving-management/energy-saving-management.api';

const MEASURE1_WIDTH = 85;
const MEASURE2_WIDTH = 192;
const NORMAL_WIDTH = 96;
const OPERATE_WIDTH = 145;

const changeColor = ref<any>();
const tableData = computed(() => props.lineList);
const props = defineProps(['lineList', 'headList', 'savingType', 'index']);
const emits = defineEmits(['search', 'update']);

const savingType = computed(() => {
  return props.savingType;
});
// props
const index = computed(() => {
  return props.index;
});

const elTableRef = ref();
const visible = ref<boolean>(false);

function mapHeaderStyle({
  row,
  colunm,
  rowIndex,
  columnIndex,
}: {
  row: string[][];
  colunm: any;
  rowIndex: number;
  columnIndex: number;
}) {
  if (rowIndex === 1) {
    return { display: 'none' };
  }
}
const mapSpanMethod = ({ row, colunm, rowIndex, columnIndex }: any) => {
  let rowspan = 1;
  let colspan = 1;

  if (columnIndex === 0) {
    const arr =
      props.lineList.filter((item: any) => {
        return item.energyCode === row.energyCode;
      }) ?? [];
    // 当前行所在位置
    const idx = arr?.findIndex((item: any) => {
      return item.measureId === row.measureId && item.tenantId === row.tenantId;
    });
    // 最后一行是否是小结
    const lastIsSummary = arr[arr.length - 1].summaryFlag;
    // 非第一个的都为0，如果最后一个是小计，则为1
    rowspan = idx > 0 ? (idx !== arr.length - 1 ? 0 : row.summaryFlag ? 1 : 0) : arr.length - (lastIsSummary ? 1 : 0);
    if (row.summaryFlag) {
      rowspan = 1;
    }

    if (row.totalFlag) {
      rowspan = 1;
      colspan = 2;
    }
  }

  if (columnIndex === 1) {
    if (row.totalFlag) {
      rowspan = 0;
      colspan = 0;
    }
  }

  return {
    rowspan: rowspan,
    colspan: colspan,
  };
};
const mapCellClassName = ({ row, colunm, rowIndex, columnIndex }: any) => {
  if (row.summaryFlag) {
    return 'summary';
  }

  if (row.totalFlag) {
    return 'total';
  }

  if (rowIndex % 2 === 1 && columnIndex > 1) {
    return 'stripe';
  }
};

const measure = ref<HTMLInputElement>();

const editShow = ref<boolean>(true);
const editRowIndex = ref<number | null>(null);
const editColumnIndex = ref<number | null>(null);

/**
 * 判断是否需要渲染编辑图标
 * 非小计、合计、节费率的行，以及（备注列||数据列）
 * @param row
 */
const mapColumnEditable = (row: ESM_INextList) => {
  return !row.totalFlag && !row.summaryFlag && !row.savingFlag;
};
/**
 * 输入框失焦
 * @param value
 * @param item
 */
const blurEvt = (value?: any, item?: any) => {
  editShow.value = true;
  editRowIndex.value = null;
  editColumnIndex.value = null;
  if (item && value === '-') {
    nextTick(() => {
      emits('update');
    });
  }
};

const setEditStore = ref<number | string>();
/**
 * 触发编辑
 * @param row
 * @param e
 * @param index
 * @param $index
 */
const triggerEdit = (row: any, e: Event, index: number, $index: number) => {
  editShow.value = true;
  editRowIndex.value = index;
  editColumnIndex.value = $index;
  setEditStore.value = row.dataList[index] || null;
  nextTick(() => {
    (e.target as HTMLElement).parentNode?.parentNode?.querySelector('input')?.focus();
  });
};
const setMeasureNameStore = ref<string>();
const editMeasureName = (row: any, e: Event, index: number, $index: number) => {
  editShow.value = true;
  editRowIndex.value = index;
  editColumnIndex.value = $index;
  setMeasureNameStore.value = row.measureName;
  nextTick(() => {
    measure.value?.focus();
  });
};
// 失焦锁 按键同样会触发失焦
const elTableKey = ref<any>();
// 编辑措施
const handleInputBlur = async (value: any, row: any, column?: any, index1?: any, idx?: any) => {
  editShow.value = true;
  editRowIndex.value = null;
  editColumnIndex.value = null;
  // 貌似失焦和按键事件同时使用 会触发两次函数
  if (column) {
    try {
      if (value === '-') {
        return;
      }
      const res = await EsmTTableService.updateTableData({
        value: value === '-' ? null : value,
        year: column.split('-')[0],
        month: column.split('-')[1],
        measureId: row.measureId,
        ...getTenant(),
      });
      if (res?.success && res.code === 200) {
        message.success('编辑成功');
        // 表格设置一个随机key值，只更新改变的单元格，对于频繁编辑的单元格，防止每次编辑页面都loading
        elTableKey.value = Math.random();
        emits('search');
      } else {
        message.error(res.message);
        row.dataList[index1] = setEditStore.value;
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    changeColor.value = '';
    try {
      const res = await EsmTTableService.updateMeasureName({
        index: index.value,
        savingType: savingType.value,
        measureId: row.measureId,
        energyCode: row.energyCode,
        measureName: value.trim(),
        ...getTenant(),
      });
      if (res?.success && res.code === 200) {
        message.success('编辑成功');
        elTableKey.value = Math.random();
        emits('search');
      } else {
        message.error(res.message);
        row.measureName = setMeasureNameStore.value;
      }
    } catch (error) {
      console.log(error);
    }
  }
};

// 编辑备注
const handleInputRemarkBlur = async (row: any) => {
  editShow.value = true;
  editRowIndex.value = null;
  editColumnIndex.value = null;
  // 貌似失焦和按键事件同时使用 会触发两次函数
  try {
    const res = await EsmTTableService.updateRemark({
      remarks: row.remarks === '' ? null : row.remarks,
      measureId: row.measureId,
    });
    if (res?.success && res.code === 200) {
      message.success('编辑成功');
      elTableKey.value = Math.random();
      // 备注不影响其他数据，编辑成功不查询数据
      // emits('search');
    } else {
      message.error(res.message);
      row.remarks = setEditStore.value;
    }
  } catch (error) {
    console.log(error);
  }
};

// 删除措施
const measureId = ref<number>();
const deleteMeasure = async (row: any) => {
  measureId.value = row.measureId;
  visible.value = true;
  ElMessageBox.confirm('删除后无法恢复，确定要删除此措施吗？', '删除', {
    type: 'warning',
    confirmButtonText: '确定',
    customClass: 'esm-delete-confirm',
    cancelButtonText: '取消',
  })
    .then(() => {
      onSubmit();
    })
    .catch(() => {});
};

const onCancel = () => {
  visible.value = false;
  changeColor.value = '';
};

// 删除提交
const onSubmit = async () => {
  try {
    const res = await EsmTTableService.deleteManageMeasure({
      measureId: measureId.value,
      index: searchbarService.queryParamsRef,
      startTime: searchbarService.startTime.value,
      endTime: searchbarService.endTime.value,
      ...getTenant(),
    });
    if (res.success && res.code === 200) {
      emits('search');
      onCancel();
      changeColor.value = '';
      message.success(res.message ?? '操作成功');
    } else {
      message.error(res.message ?? '操作失败');
    }
  } catch (error) {
    console.log(error);
  }
};

const more = (v: number) => {
  changeColor.value = v;
  document.addEventListener('click', (e) => clickOutSide(e));
};

const clickOutSide = (e: any) => {
  const moreBtn = document.querySelector('.active-svg');
  if (moreBtn && !moreBtn.contains(e.target)) {
    changeColor.value = '';
  }
};

const debounce = (fn: any, deley: number) => {
  let timer: any;
  return function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(debounce, arguments);
    }, deley);
  };
};

onUnmounted(() => {
  document.removeEventListener('click', clickOutSide);
});
</script>

<style lang="less" scoped>
#esm-t-table {
  :deep(.el-table th.el-table__cell) {
    padding: 0px !important;
  }
  :deep(.el-table) tbody tr {
    td.el-table__cell {
      position: relative;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      border-bottom: 1px solid var(--color-text-divider) !important;
      background-color: #fff !important;

      img.edit-icon {
        cursor: pointer;
        width: 16px;
        height: 16px;
        position: absolute;
        top: 50%;
        left: 80%;
        transform: translateY(-50%);
        vertical-align: text-bottom;
        display: none;
      }

      &:hover img.edit-icon {
        display: inline-block;
      }
    }
    &.el-table__row:hover td:not(.summary):not(.total):not(.stripe),
    &.el-table__row.hover-row > td:not(.summary):not(.total):not(.stripe) {
      background-color: transparent !important;
    }
    td.el-table__cell.stripe {
      background-color: #fafafa !important;
    }
    td.el-table__cell.summary {
      background-color: #fffbe6 !important;
    }
    td.el-table__cell.total {
      background-color: #edf5fc !important;
    }
    div.cell > div {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    span {
      width: calc(100%);
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ett-item-name {
      overflow: inherit;
      padding: 12px 0;

      > span {
        width: calc(100% - 30px);
        word-wrap: break-word;
        white-space: initial;
      }
    }

    svg {
      cursor: pointer;
      height: 16px;
      width: 16px;
      position: absolute;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);
      vertical-align: text-bottom;

      &:hover {
        color: #1890ff;
      }
    }
  }

  :deep(.el-table) {
    .el-table::before,
    .el-table__fixed-right::before,
    .el-table__fixed::before {
      display: none !important;
    }
  }
}

.el-divider--horizontal {
  margin: 8px 0px;
}

.t-table-btn {
  & > div:first-child {
    margin-bottom: 4px;
  }

  & > div {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      color: #1890ff;
    }
  }
}
.active-svg {
  color: #1890ff;
}
</style>

<style lang="less">
.el-popover.el-popper {
  min-width: 70px;
}
.el-message-box.esm-delete-confirm {
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
