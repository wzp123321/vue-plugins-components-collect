<template>
  <div
    class="te-module-table"
    ref="moduleTableRef"
    :class="{ flex: isFlex }"
    v-loading="loading"
  >
    <te-table
      ref="tableRef"
      v-bind="$attrs"
      :data="data ?? tableData"
      :row-key="rowKey"
      :key="tableKey"
      :cell-class-name="isHideCellCheckbox"
      :stripe="stripe"
      :border="border"
      class="table-main"
      :max-height="isFlex ? 'auto' : maxHeight"
      @selection-change="selectionChange"
    >
      <template v-if="!showSelectColumn">
        <te-table-column
          v-if="hasTreeData"
          fixed="left"
          width="20"
          class="table-fixed-left"
        >
        </el-table-column>
        <te-table-column
          v-if="!hasTreeData"
          fixed="left"
          width="5"
          class="table-fixed-left"
        >
        </el-table-column>
      </template>

      <!-- 1.传入showSelectColumn时展示选择列 -->
      <template v-if="showSelectColumn">
        <te-table-column
          fixed="left"
          :reserve-selection="true"
          width="38"
          type="selection"
          v-bind="$attrs"
        >
        </el-table-column>
      </template>

      <template v-if="showExpandColumn">
        <te-table-column
          type="expand"
          fixed
        >
          <template
            v-for="slot in Object.keys($slots)"
            #[slot]="scope"
          >
            <slot
              :name="`expand-${slot}`"
              v-bind="scope"
            ></slot>
          </template>
          <template #default="scope">
            <slot
              name="expand-default"
              v-bind="scope"
            ></slot>
          </template>
        </el-table-column>
        <!-- <TableColumn :column="expandColumnConfig" v-bind="$attrs">
          <template v-for="slot in Object.keys($slots)" #[slot]="scope">
            <slot :name="slot" v-bind="scope"></slot>
          </template>
        </TableColumn> -->
      </template>

      <!-- <TableColumn :column="expandColumnConfig">
        <template v-for="slot in Object.keys($slots)" #[slot]="scope">
          <slot :name="slot" v-bind="scope"> </slot>
        </template>
      </TableColumn> -->

      <template v-if="showNativeIndexColumn">
        <te-table-column
          :label="indexName"
          fixed="left"
          type="index"
          v-bind="$attrs"
          :width="setIndexColumnMinWidth()"
        />
      </template>

      <!-- 2.传入showIndexColumn时展示的序号列 -->
      <template v-if="!data && showIndexColumn && !customIndex">
        <te-table-column
          type="index"
          fixed="left"
          :width="setIndexColumnMinWidth()"
          :label="indexName"
          prop="parentIndex"
        >
          <template #default="{ row }">
            <span v-if="row.isIndex">{{ row.parentIndex }}</span>
          </template>
        </el-table-column>
      </template>

      <template v-if="!data && showIndexColumn && customIndex">
        <te-table-column
          type="index"
          fixed="left"
          :width="setIndexColumnMinWidth()"
          :label="indexName"
          prop="parentIndex"
          v-bind="$attrs"
        >
        </el-table-column>
      </template>

      <template v-if="data && showIndexColumn">
        <te-table-column
          type="index"
          fixed="left"
          :width="setIndexColumnMinWidth()"
          :label="indexName"
        />
      </template>

      <!-- 3.根据列的checked字段判断是否显示该列 -->
      <template
        v-for="item in tableColumns"
        :key="item"
      >
        <TableColumn
          v-if="item.prop && item.checked"
          :column="item"
          v-bind="$attrs"
          :minWidth="flexColumnWidth(item)"
        >
          <template
            v-for="slot in Object.keys($slots)"
            #[slot]="scope"
          >
            <slot
              :name="slot"
              v-bind="scope"
            ></slot>
          </template>
        </TableColumn>
      </template>

      <!-- 4、操作列 -->
      <template v-if="showOperationColumn">
        <TableColumn :column="operationColumn">
          <template
            v-for="slot in Object.keys($slots)"
            #[slot]="scope"
          >
            <slot
              :name="slot"
              v-bind="scope"
            >
            </slot>
          </template>
        </TableColumn>
      </template>

      <!-- 5、动态添加列，不参与列配置，始终展示-->
      <template
        v-for="item in dynamicColumns"
        :key="item"
      >
        <TableColumn
          v-if="item.prop"
          :column="item"
          :minWidth="flexColumnWidth(item)"
        >
          <template
            v-for="slot in Object.keys($slots)"
            #[slot]="scope"
          >
            <slot
              :name="slot"
              v-bind="scope"
            ></slot>
          </template>
        </TableColumn>
      </template>

      <!-- 6、空数据文本默认插槽 -->
      <template #empty>
        <div class="table-empty">
          <slot name="empty">
            <img
              v-if="isDark"
              class="empty-img"
              src="./assets/img/no-data-dark.png"
              alt="暂无数据"
            />
            <img
              v-if="!isDark"
              class="empty-img"
              src="./assets/img/no-data.svg"
              alt="暂无数据"
            />
            <div>暂无数据</div>
          </slot>
        </div>
      </template>

      <!-- 7、 插入表格最后一行之后的插槽 -->
      <template #append>
        <slot name="append"> </slot>
      </template>

      <template #body>
        <div
          class="resizebar"
          v-if="showOperationColumnSpread"
        >
          <div
            v-if="showOperationColumn"
            class="divider"
          />
          <div
            class="datasource-put-away"
            @click.capture="onOperationSpreadEvent"
          >
            <i class="svg-icon-wrapper">
              <svg
                viewBox="0 0 1024 1024"
                aria-hidden="true"
                width="1em"
                height="1em"
                fill="currentColor"
                :class="{ rotate180: showOperationColumn }"
              >
                <path
                  d="M235.52 463.872l436.565333-365.056a57.344 57.344 0 0 1 82.944 9.642667 63.402667 63.402667 0 0 1 12.970667 38.570666v729.941334c0 34.133333-26.453333 61.696-59.050667 61.696a57.429333 57.429333 0 0 1-36.864-13.482667L235.52 560.128a63.573333 63.573333 0 0 1 0-96.256z"
                ></path>
              </svg>
            </i>
          </div>
        </div>
      </template>
    </el-table>

    <!-- 分页组件 -->
    <div
      class="pagination-main"
      v-show="pagination && pageInfo.total > 0"
    >
      <slot name="pagination">
        <Pagination
          v-bind="$attrs"
          :pageInfo="pageInfo"
          :handle-size-change="handleSizeChange"
          :handle-current-change="handleCurrentChange"
        />
      </slot>
    </div>
  </div>
</template>
<script setup lang="tsx" name="TeModuleTable">
import { onMounted, ref, computed, watch, h, useAttrs, reactive } from 'vue'
import { ElTable } from 'element-plus'
import { useTable } from './hooks/useTable'
import { useTableColumn } from './hooks/useTableColumn'
import { useSelection } from './hooks/useSelection'
import Pagination from './components/Pagination.vue'
import TableColumn from './components/TableColumn.vue'
import { ColumnProps, HeaderRenderScope } from './interface'
import { isNumber } from 'lodash'
import { useResizeObserver } from '@vueuse/core'

// 判断组件库是深色还是浅色模式
const isDark = document.documentElement.className === 'dark' ? true : false

export interface ProTableProps {
  isFlex?: boolean
  maxHeight?: string | number
  columns?: ColumnProps[] // 静态 table column 数据，若存在则不会使用 requestColumnApi 返回的 column ==> 非必传
  dynamicColumns?: ColumnProps[] // 用户，动态配置列
  data?: any[] // 静态 table data 数据，若存在则不会使用 requestApi 返回的 data ==> 非必传

  requestApi?: ((params: any) => Promise<any>) | undefined // 请求表格数据的 api ==> 非必传
  initParam?: any // 初始化请求参数 ==> 非必传（默认为{}）
  requestAuto?: boolean // 是否自动执行请求 api ==> 非必传（默认为true）
  requestError?: (params: any) => void // 表格 api 请求错误监听 ==> 非必传
  dataCallback?: (data: any) => any // 返回数据的回调函数，可以对数据进行处理 ==> 非必传
  pagination?: boolean // 是否需要分页组件 ==> 非必传（默认为true）
  isPageParam?: boolean // 是否分页入参为page对象

  pageSaveApi?: (params: any) => void // 保存表格分页信息的 api ==> 非必传
  requestColumnApi?: ((params: any) => Promise<any>) | undefined // 请求表格数据的 api ==> 非必传
  initColumnParam?: any // 存储页面页数接口涉及到的参数 非必传
  requestColumnError?: (params: any) => void // 表格 api 请求错误监听 ==> 非必传
  columnCallback?: (data: any) => any // 返回数据的回调函数，可以对数据进行处理 ==> 非必传

  indexName?: string // 自定义序号label
  customIndex?: boolean
  showNativeIndexColumn?: boolean
  stripe?: boolean // 是否为斑马纹表格
  border?: boolean // 是否带有纵向边框 ==> 非必传（默认为true）
  rowKey?: string // 行数据的 Key，用来优化 Table 的渲染，当表格数据多选时，所指定的 id ==> 非必传（默认为 id）
  showIndexColumn?: boolean //是否显示索引列 非必传 （默认true）
  showSelectColumn?: boolean //是否显示全选列 非必传 （默认true）
  showExpandColumn?: boolean //否显示展开列 非必传
  showOperationColumn?: boolean // 是否显示操作列 非必传 （默认true）
  showOperationColumnSpread?: boolean // 是否显示操作列折叠按钮 非必传 （默认false）

  selectIdList?: any // 选中数据的id列表
  pageSizes?: Array<number>
}
const moduleTableRef = ref<HTMLDivElement>()
const attrs = useAttrs()
// 接受父组件参数，配置默认值
const props = withDefaults(defineProps<ProTableProps>(), {
  isFlex: false,
  maxHeight: `${48 * 11}px`,
  requestAuto: true,
  pagination: true,
  isPageParam: false,
  initParam: {},
  border: true,
  stripe: true,
  rowKey: 'id',
  showIndexColumn: true,
  showSelectColumn: true,
  indexName: '序号',
  customIndex: false,
  selectIdList: [],
  pageSizes: () => [10, 20, 100],
  showNativeIndexColumn: false,
})

// 表格的key
const tableKey = ref()
// 表格ref
const tableRef = ref<InstanceType<typeof ElTable>>()
// 页面展示的列配置项
const tableColumns = ref<ColumnProps[]>()
// 操作列宽度
let operationColumnOriginWidth = 0
// 操作列实例，用于监听其尺寸变化
const operationColumnRef = ref()
const showOperationColumn = ref(props.showOperationColumn)

/**
 * 判断是否存在树结构数据
 */
const hasTreeData = computed(() => {
  const hasTree: boolean = tableData.value?.some((item: any) => {
    return item.children?.length > 0
  })
  return hasTree
})
/**
 * 动态设置序号列的宽度
 */
const setIndexColumnMinWidth = () => {
  if (
    props.indexName == '序号' &&
    tableData.value &&
    tableData.value.length > 0
  ) {
    let [last]: any = [...tableData?.value]?.reverse()
    let indexLength =
      last?.parentIndex.toString().length * 8 + (hasTreeData.value ? 45 : 40)
    return indexLength < 56 ? 56 : indexLength
  } else {
    return getTextWidth(props.indexName) + 24
  }
}

const onOperationSpreadEvent = () => {
  showOperationColumn.value = !showOperationColumn.value
  changeResizebarStatus(!showOperationColumn.value)
}

/**
 * 是否隐藏展开行的勾选框
 */
const isHideCellCheckbox = ({ row }: any) => {
  return !row.isIndex ? 'hideCellCheckbox' : ''
}

/**
 * 遍历列的所有内容，获取最宽一列的宽度
 * @param arr
 */
const getMaxLength = (arr: any) => {
  return arr?.reduce((acc: any, item: any) => {
    if (item) {
      let calcLen = getTextWidth(item)
      if (acc < calcLen) {
        acc = calcLen
      }
    }
    return acc
  }, 0)
}

/**
 * 使用span标签包裹内容，然后计算span的宽度 width： px
 * @param str
 */
const getTextWidth = (str: string) => {
  let width = 0
  const html = document.createElement('span')
  html.innerText = str
  html.className = 'getTextWidth'
  let body: any = document.querySelector('body')
  body.appendChild(html)
  let getTextWidth: any = document.querySelector('.getTextWidth')
  width = getTextWidth.offsetWidth
  getTextWidth.remove()
  return width
}

/**
	 * te-table-column 自适应列宽
	 * 如果配置了最少需展示字符，最小宽度为 Math.min(最少字符宽度, 最大内容宽度)
	 * 否则按照表格内容设置最小宽度
	 1、计算内容宽度的最大值 a
	 2、计算label宽度 b,要考虑是否展示两个图标的宽度
	 3、取值 Math.max(a,b) c
	 4、计算设定的宽度d
	 5、如果是a>b且a>d 则取d
	 6、如果是a>b且a<d 则取a
	 7、如果是b>a 则取b
	*/
const flexColumnWidth = (item: any) => {
  if (item.minWidth) {
    return item.minWidth
  }
  // 获取每列内容最长的宽度
  const arr = tableData.value?.map((x: any) => x[item.prop])
  let maxLength = getMaxLength(arr)

  // label的宽度，如果有排序，筛选按钮需要对应增加宽度，24是边距,如果手动设置header,需要设置宽度
  let labelLength = getMaxLength([item.label]) + 16
  if (item.sortable) {
    labelLength = labelLength + 24
  }
  if (item.filterList && item.filterList.length > 0) {
    labelLength = labelLength + 24
  }

  //  自定义的宽度，空间不够的情况下最少展示minStrNum个字数 超出部分用省略号代替
  let customLength
  if (item?.minStrNum && isNumber(item?.minStrNum)) {
    const tempStr = new Array(item?.minStrNum).fill('医').join('') + '...'
    customLength = getMaxLength([tempStr])
  }

  if (!item.minStrNum) {
    return Math.max(maxLength, labelLength) + 24
  } else {
    if (
      maxLength >= labelLength &&
      maxLength >= customLength &&
      labelLength >= customLength
    ) {
      // 验证1
      return labelLength
    }
    if (
      maxLength >= labelLength &&
      maxLength >= customLength &&
      labelLength < customLength
    ) {
      // 验证1
      return customLength + 12
    }
    if (maxLength >= labelLength && maxLength < customLength) {
      // 验证1
      return maxLength + 24
    }
    if (maxLength < labelLength) {
      // 验证1
      return labelLength + 24
    }
  }
}

/**
 *操作列表头部重新渲染
 */
const renderOperationHeader = (scope: HeaderRenderScope<any>) => {
  // 智能计算操作列宽度
  const calculateOperationWidth = () => {
    // 尝试获取操作按钮组的元素
    const opts = document.getElementsByClassName('optionDiv')
    let widthArr: any = []

    // 取操作组的最大宽度
    Array.prototype.forEach.call(opts, function (item) {
      if (item.innerText) {
        widthArr.push(item.offsetWidth)
      }
    })

    if (widthArr.length > 0) {
      // 如果找到了按钮元素，使用实际宽度
      let length = Math.max(...widthArr) + 25
      return length < 80 ? 80 : length // 最小宽度80px
    } else {
      // 如果没有找到按钮元素，根据表格数据估算
      if (tableData.value && tableData.value.length > 0) {
        // 尝试从第一行数据中获取按钮信息
        const firstRow = tableData.value[0] as any
        if (firstRow && firstRow._operationButtons) {
          // 如果有按钮配置信息，根据按钮数量估算
          const buttonCount = firstRow._operationButtons.length
          return Math.max(80, buttonCount * 40 + 20) // 每个按钮约40px + 20px边距
        }
      }

      // 默认宽度，根据常见情况设置
      return 120 // 默认120px，适合2-3个按钮
    }
  }

  // 延迟计算，确保DOM已渲染
  setTimeout(() => {
    if (!scope.column.width) {
      scope.column.width = calculateOperationWidth()
    }
  }, 100)

  return h('span', scope.column.label)
}

// 操作列column参数
const operationColumn: any = reactive({
  label: '操作',
  prop: 'operation',
  checked: true,
  disabled: true,
  deleted: true,
  isFilter: false,
  sortable: null,
  minWidth: 80, // 调整默认最小宽度为80px，适合单个按钮
  width: '',
  align: 'left',
  filterCode: null,
  filterList: null,
  fixed: 'right',
  headerRender: renderOperationHeader,
  className: 'operation-column',
})

/**
 * 表头操作hooks
 */
const { tableColumnData, pageSize, getTableColumnList } = useTableColumn(
  props.requestColumnApi,
  props.initColumnParam,
  props.columnCallback,
  props.requestColumnError,
)

// 表格多选 Hooks
const { selectionChange, selectedList, selectedListIds, isSelected } =
  useSelection(props.rowKey)
// 清空选中数据列表
const clearSelection = () => tableRef.value?.clearSelection()

/**
 * 表格操作hooks
 */
const {
  tableData,
  loading,
  pageInfo,
  getTableList,
  query,
  reset,
  refresh,
  handleSizeChange,
  handleCurrentChange,
  setPageSize,
  tableParam,
  filterProp,
  resizebarRight,
} = useTable(
  pageSize.value,
  props.requestApi,
  props.initParam,
  props.pagination,
  props.dataCallback,
  props.requestError,
  props.initColumnParam,
  props.pageSaveApi,
  props.requestAuto,
  props.pageSizes,
  props.isPageParam,
)
/**
 * 改变伸缩条折叠状态
 * @param spread 是否折叠
 */
const changeResizebarStatus = (spread: boolean) => {
  if (spread) {
    resizebarRight.value = '0'
  } else {
    resizebarRight.value = `${operationColumnOriginWidth - 6}px`
  }
}

/**
 * 1、获取表格列，获取表格每页展示条数
 * 2、获取表格每页展示条数数据传递给表格数据查询接口
 * 3、请求表格数据
 * 4、是否显示操作列，传了按钮的话，计算一下操作列的宽度
 */
onMounted(async () => {
  !props.columns && (await getTableColumnList())
  tableColumns.value = (props.columns as any) ?? tableColumnData.value
  pageSize.value = (attrs['page-size'] as number) ?? pageSize.value
  pageInfo.value.pageSize = pageSize.value
  setPageSize(pageSize.value)
  // 设置默认筛选参数
  initFilter()
  props.requestAuto && getTableList()

  operationColumnRef.value =
    document.getElementsByClassName('operation-column')[0]
  useResizeObserver(operationColumnRef, (entries) => {
    entries.forEach((entry) => {
      const { width } = entry.contentRect
      if (width <= 0) {
        changeResizebarStatus(true)
      } else {
        operationColumnOriginWidth = width
        changeResizebarStatus(false)
      }
    })
  })
})

/**
 * 初始化筛选条件函数
 * 1. 检查是否有至少一个项的filterList中有checked属性为true
 * 2. 如果存在满足条件的项，则将其筛选出来，提取出id值，并存储在filteredData中
 * 3. 更新tableParam和filterProp的值，合并filteredData
 */
const initFilter = () => {
  // 检查是否存在至少一个项的filterList中有checked属性为true
  const hasCheckedItem = tableColumns.value?.some((item) => {
    return (
      item.filterList &&
      item.filterList.length > 0 &&
      item.filterList.some((subItem) => subItem.checked)
    )
  })

  // 如果存在满足条件的项
  if (hasCheckedItem) {
    // 从tableColumns中筛选出满足条件的项，提取出id值，并存储在filteredData中
    const filteredData = tableColumns.value?.reduce((result: any, item) => {
      if (item.filterList && item.filterList.length > 0) {
        // 筛选出checked属性为true的子项，并提取id值
        const checkedIds = item.filterList
          .filter((subItem) => subItem.checked)
          .map((subItem) => subItem.id)
        if (checkedIds.length > 0) {
          // 使用item.filterProp或item.prop作为键值，存储checkedIds
          const key = item.filterProp ? item.filterProp : item.prop
          result[key] = checkedIds
        }
      }
      return result
    }, {})

    // 更新tableParam和filterProp的值，合并filteredData
    tableParam.value = { ...tableParam.value, ...filteredData }
    filterProp.value = { ...filterProp.value, ...filteredData }
  }
}

/**
 * 列改变后刷新表格的key,重新渲染
 */
const reloadTable = () => {
  tableKey.value = Math.random()
}

// 隐藏对应列的时候，将filterProp中的列做对应删除,此处监听的是filterProp,正常列隐藏的时候不应该查询接口,选中的时候不需要查询接口
watch(
  () => tableColumnData.value,
  () => {
    tableColumnData.value.forEach((ele: any) => {
      if (
        ele.checked === false &&
        ele.filterList &&
        ele.filterList.length > 0
      ) {
        delete tableParam.value?.[ele.prop]
        delete filterProp.value?.[ele.prop]
        getTableList()
      }
    })
  },
  { deep: true, immediate: true },
)

// 回显数据选中状态
watch(
  () => tableData.value,
  () => {
    if (tableData.value && tableData.value?.length > 0) {
      tableData.value.forEach((item: any) => {
        if (props.selectIdList.includes(item[props.rowKey])) {
          tableRef.value?.toggleRowSelection(item, true)
        }
      })
    }
  },
  { immediate: true },
)

// 智能操作列宽度计算监听器
let lastCalculatedWidth = 0
let calculationTimeout: NodeJS.Timeout | null = null

watch(
  () => tableData.value,
  (newData) => {
    if (newData && newData.length > 0 && props.showOperationColumn) {
      // 清除之前的定时器
      if (calculationTimeout) {
        clearTimeout(calculationTimeout)
      }

      // 延迟计算，避免频繁触发
      calculationTimeout = setTimeout(() => {
        const opts = document.getElementsByClassName('optionDiv')
        let widthArr: any = []

        Array.prototype.forEach.call(opts, function (item) {
          if (item.innerText) {
            widthArr.push(item.offsetWidth)
          }
        })

        if (widthArr.length > 0) {
          let length = Math.max(...widthArr) + 25
          const newWidth = length < 80 ? 80 : length

          // 只有当宽度真正改变时才更新
          if (Math.abs(newWidth - lastCalculatedWidth) > 5) {
            operationColumn.width = newWidth
            lastCalculatedWidth = newWidth
          }
        } else {
          // 当没有找到按钮元素时，使用估算宽度
          const estimatedWidth = 120 // 默认120px
          if (Math.abs(estimatedWidth - lastCalculatedWidth) > 5) {
            operationColumn.width = estimatedWidth
            lastCalculatedWidth = estimatedWidth
          }
        }
      }, 200) // 增加延迟时间，减少触发频率
    }
  },
  { immediate: true },
)

// 暴露给父组件的参数和方法
defineExpose({
  element: tableRef,
  tableData,
  loading,
  pageInfo,
  getTableList,
  getTableColumnList,
  reloadTable,
  reset,
  query,
  refresh,
  clearSelection,
  isSelected,
  selectedList,
  selectedListIds,
  filterProp,
})
</script>

<style lang="less" scoped>
.te-module-table {
  position: relative;
  &.flex {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.resizebar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: v-bind(resizebarRight);
  z-index: 10;
  height: 100%;

  .divider {
    position: absolute;
    width: 1px;
    height: 100%;
    background-color: var(--te-border-color-divider);
  }
  .datasource-put-away {
    align-items: center;
    background: var(--te-color-white);
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    display: flex;
    width: 12px;
    height: 48px;
    justify-content: center;
    border: 1px solid var(--te-border-color-lighter);
    transform: translateY(-50%);
    box-shadow: 0px 0px 4px 0px #0000001a;
    border-left: none;

    > .svg-icon-wrapper {
      font-size: 12px;
      line-height: 12px;

      .rotate180 {
        transform: rotateZ(180deg);
      }
    }
  }
}

:deep(.te-table thead) {
  height: 48px;
}

:deep(.te-table__row) {
  height: 48px;
}

:deep(.te-table .te-table__cell) {
  padding: 0;
  font-weight: 400;
  color: var(--te-text-color-primary);
  // border: none;
  // border-bottom: 1px solid var(--te-border-color-divider-light);
}

:deep(.te-table th.te-table__cell.is-leaf) {
  // border-bottom: 1px solid var(--te-border-color-componet);
  // border-right: 1px solid var(--te-border-color-componet);
  border-left: none;
  color: var(--te-text-color-secondary);
  // background-color: var(--te-bg-color-secondary);
  font-weight: 600;
}

:deep(.te-table--border),
:deep(.te-table .te-table__body) {
  border: none;
}

:deep(.te-table--border) {
  .te-popper {
    max-width: 400px;
    word-break: break-all;
  }
}

// 去除bale最后一行的线
:deep(.te-table__border-left-patch),
:deep(.te-table__inner-wrapper::before),
:deep(.te-table__inner-wrapper::after),
:deep(.te-table::before),
:deep(.te-table--border::before),
:deep(.te-table--border::after),
:deep(.te-table__fixed-right::before),
:deep(.te-table__fixed::before),
:deep(.te-table--group::after) {
  display: none;
}

:deep(.te-table th.te-table__cell:last-child) {
  border-right: none;
}

:deep(.te-table th.te-table__cell .ascending) {
  border-bottom-color: var(--te-text-color-secondary);
}

:deep(.te-table th.te-table__cell .descending) {
  border-top-color: var(--te-text-color-secondary);
}

:deep(.te-table th.ascending .ascending) {
  border-bottom-color: var(--te-color-primary);
}

:deep(.te-table th.descending .descending) {
  border-top-color: var(--te-color-primary);
}

// 滚动条的宽度
:deep(.te-table__body-wrapper::-webkit-scrollbar) {
  width: 0; // 横向滚动条
  height: 6px; // 纵向滚动条 必写
}

//注意:hover
:deep(.te-table__body-wrapper:hover::-webkit-scrollbar) {
  width: 6px; // 横向滚动条
  height: 6px; // 纵向滚动条 必写
}

:deep(.te-table__body-wrapper:hover::-webkit-scrollbar-thumb) {
  background-color: rgba(0, 0, 0, 0.2);
}

// 滚动条的滑块
:deep(.te-table__body-wrapper::-webkit-scrollbar-thumb) {
  background-color: transparent;
  border-radius: 3px;
}

// 滚动条的滑块
:deep(.te-table__body-wrapper::-webkit-scrollbar-track) {
  background: transparent;
}

// 表格内容区域不设置边框
:deep(.te-table--enable-row-transition .te-table__body td.te-table__cell) {
  border-right: none !important;
}

:deep(.te-table-fixed-column--left.is-last-column.te-table__cell) {
  border-right: none !important;
}

:deep(.hideCellCheckbox .te-checkbox__input) {
  display: none;
}

// 解决表格数据为空时样式不居中问题(仅在element-plus中)
.te-table__empty-block {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .table-empty {
    line-height: 30px;

    .empty-img {
      width: 160px;
      height: 160px;
    }
  }
}
</style>
