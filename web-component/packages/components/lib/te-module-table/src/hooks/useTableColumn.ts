import { TableColumn } from './interface'
import { reactive, toRefs } from 'vue'

/**
 * @description table 表头操作方法封装
 * @param {Function} api 获取表格表头数据 API 方法（必传）
 * @param {Object} initParam 获取表头初始化参数（非必传，默认为空对象）
 * @param {Function} dataCallBack 对后台返回的表头数据进行处理的方法（非必传）
 * @param {Function} requestError 请求错误处理方法（非必传）
 * @return {Object} 包含表格表头相关属性和方法的响应式对象
 */
export const useTableColumn = <T>(
  api?: (params: any) => Promise<any>,
  initParam: Record<string, unknown> = {},
  dataCallBack?: (data: any) => any,
  requestError?: (error: any) => void
) => {
  const state = reactive<TableColumn.StateProps<T>>({
    // 表头数据
    tableColumnData: [],
    // 表存储的后台分页数据，默认10
    pageSize: 10
  })

  /**
   * @description 获取表格表头数据
   * @return void
   */
  const getTableColumnList = async () => {
    if (!api) return

    try {
      const res = await api(initParam)

      let columns: any
      let pageSize: any

      if (res.data.columns && res.data.pageSize) {
        // 直接赋值
        ({ columns, pageSize } = res.data)
        dataCallBack && (columns = dataCallBack(columns))
      } else {
        // 使用dataCallBack进行处理
       ({ columns, pageSize } = dataCallBack ? dataCallBack(res) : res)
      }

      // 更新state中的值
      state.tableColumnData = columns
      state.pageSize = pageSize
    } catch (error) {
      // 请求错误处理
      if (requestError) {
        requestError(error)
      }
    }
  }

  return {
    ...toRefs(state), // 将state转换为响应式的对象属性
    getTableColumnList // 返回获取表头数据的方法
  }
}
