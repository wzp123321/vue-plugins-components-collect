import { mkdirSync } from 'fs'
import { join } from 'node:path'
import { createFileIfNotExists, projectRoot, getRelativePath } from './utils.js'

/**
 * 生成简单的API类型文件
 * @param {string} _moduleName - 模块名称（未使用，保留用于未来扩展）
 * @param {string} _moduleTitle - 模块标题（未使用，保留用于未来扩展）
 * @returns {string} API类型文件内容
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export function generateApiTypes(_moduleName, _moduleTitle) {
  return `export interface FormData {
  id?: string | number
  name?: string
  [key: string]: any
}

export interface QueryParams {
  pageNum?: number
  pageSize?: number
  searchValue?: string
  [key: string]: any
}

export interface ListRow {
  id?: string | number
  name?: string
  [key: string]: any
}
`
}

/**
 * 生成简单的API接口文件
 * @param {string} moduleName - 模块名称
 * @param {boolean} useMock - 是否使用 Mock 数据
 * @returns {string} API接口文件内容
 */
export function generateApiFile(moduleName, useMock = false) {
  const apiPath = `/sec/${moduleName}`

  if (useMock) {
    return `import { request } from '@/utils/request'
import { QueryParams, FormData, ListRow } from './index.api'
import { CommonResponseType, ListResData } from '../models'
import * as mockApis from './index.mock'

/**
 * Mock 数据开关
 * 
 * 使用说明：
 * 1. 当后端接口未开发完成时，设置 USE_MOCK_DATA = true 使用本地模拟数据
 * 2. 当后端接口开发完成后，设置 USE_MOCK_DATA = false 或删除此配置使用真实接口
 * 3. 完全移除 mock 数据：
 *    - 设置 USE_MOCK_DATA = false
 *    - 删除 index.mock.ts 文件
 *    - 删除上面的 mock 导入语句
 */
const USE_MOCK_DATA = true // 设置为 true 启用 mock 数据，false 使用真实接口

if (USE_MOCK_DATA) {
  console.warn('⚠️ ${moduleName}模块正在使用 Mock 数据，请在后端接口开发完成后切换到真实接口')
}

export const getList = (data: QueryParams): CommonResponseType<ListResData<ListRow>> => {
  if (USE_MOCK_DATA) {
    return mockApis.mockGetList(data) as Promise<{ errcode: string; message: string; data: ListResData<ListRow> }>
  }
  return request({
    url: \`${apiPath}/page\`,
    method: 'post',
    data,
  })
}

export const getDetail = (id: string | number): CommonResponseType<ListRow> => {
  if (USE_MOCK_DATA) {
    return mockApis.mockGetDetail(id) as Promise<{ errcode: string; message: string; data: ListRow }>
  }
  return request({
    url: \`${apiPath}/getById\`,
    method: 'post',
    data: { id },
  })
}

export const createData = (data: FormData): CommonResponseType<any> => {
  if (USE_MOCK_DATA) {
    return mockApis.mockCreateData(data) as Promise<{ errcode: string; message: string; data: any }>
  }
  return request({
    url: \`${apiPath}/add\`,
    method: 'post',
    data,
  })
}

export const editData = (data: FormData): CommonResponseType<any> => {
  if (USE_MOCK_DATA) {
    return mockApis.mockEditData(data) as Promise<{ errcode: string; message: string; data: any }>
  }
  return request({
    url: \`${apiPath}/update\`,
    method: 'post',
    data,
  })
}

export const deleteData = (id: string | number): CommonResponseType<any> => {
  if (USE_MOCK_DATA) {
    return mockApis.mockDeleteData(id) as Promise<{ errcode: string; message: string; data: any }>
  }
  return request({
    url: \`${apiPath}/delete\`,
    method: 'post',
    data: { id },
  })
}

export const getTableColumns = (data: { tableCode: string }): CommonResponseType<any> => {
  if (USE_MOCK_DATA) {
    return mockApis.mockGetTableColumns(data) as Promise<{ errcode: string; message: string; data: any }>
  }
  return request({
    url: \`/commonConfig/bff/web/v1/tableConfig/\${data.tableCode}/getTableConfig\`,
    method: 'post',
  })
}
`
  }

  return `import { request } from '@/utils/request'
import { QueryParams, FormData, ListRow } from './index.api'
import { CommonResponseType, ListResData } from '../models'

export const getList = (data: QueryParams): CommonResponseType<ListResData<ListRow>> =>
  request({
    url: \`${apiPath}/page\`,
    method: 'post',
    data,
  })

export const getDetail = (id: string | number): CommonResponseType<ListRow> =>
  request({
    url: \`${apiPath}/getById\`,
    method: 'post',
    data: { id },
  })

export const createData = (data: FormData): CommonResponseType<any> =>
  request({
    url: \`${apiPath}/add\`,
    method: 'post',
    data,
  })

export const editData = (data: FormData): CommonResponseType<any> =>
  request({
    url: \`${apiPath}/update\`,
    method: 'post',
    data,
  })

export const deleteData = (id: string | number): CommonResponseType<any> =>
  request({
    url: \`${apiPath}/delete\`,
    method: 'post',
    data: { id },
  })

export const getTableColumns = (data: { tableCode: string }): CommonResponseType<any> =>
  request({
    url: \`/commonConfig/bff/web/v1/tableConfig/\${data.tableCode}/getTableConfig\`,
    method: 'post',
  })
`
}

/**
 * 生成 Mock 数据文件
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @returns {string} Mock 数据文件内容
 */
export function generateMockFile(moduleName, moduleTitle) {
  return `/**
 * ${moduleTitle}模块 - Mock 数据
 * 
 * 注意：此文件仅用于前端开发时模拟后端接口
 * 当后端接口开发完成后，可以通过配置切换到真实接口
 * 删除此文件和相关引用即可完全移除 mock 数据
 */

import type { QueryParams, FormData, ListRow } from './index.api'

// 模拟数据存储（使用内存存储，刷新页面会重置）
// eslint-disable-next-line prefer-const
let mockDataList: ListRow[] = [
  {
    id: 1,
    name: '测试数据1',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 1,
  },
  {
    id: 2,
    name: '测试数据2',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 1,
  },
  {
    id: 3,
    name: '测试数据3',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 0,
  },
  {
    id: 4,
    name: '测试数据4',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 1,
  },
  {
    id: 5,
    name: '测试数据5',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 1,
  },
  {
    id: 6,
    name: '测试数据6',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 1,
  },
  {
    id: 7,
    name: '测试数据7',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 0,
  },
  {
    id: 8,
    name: '测试数据8',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 1,
  },
  {
    id: 9,
    name: '测试数据9',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 1,
  },
  {
    id: 10,
    name: '测试数据10',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 1,
  },
  {
    id: 11,
    name: '测试数据11',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 0,
  },
  {
    id: 12,
    name: '测试数据12',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    status: 1,
  },
]

let nextId = 13

// 模拟延迟
const delay = (ms: number = 300) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

/**
 * Mock API - 获取列表（分页）
 */
export const mockGetList = async (data: QueryParams) => {
  await delay(500)
  
  const { pageNum = 1, pageSize = 10, searchValue = '' } = data
  
  // 模拟搜索
  let filteredList = mockDataList
  if (searchValue) {
    filteredList = mockDataList.filter((item) =>
      item.name?.toLowerCase().includes(searchValue.toLowerCase())
    )
  }
  
  // 模拟分页
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  const list = filteredList.slice(start, end)
  const total = filteredList.length
  
  return {
    errcode: '0',
    message: '成功',
    data: {
      list,
      total,
      pageNum,
      pageSize,
    },
  }
}

/**
 * Mock API - 获取详情
 */
export const mockGetDetail = async (id: string | number) => {
  await delay(300)
  
  const item = mockDataList.find((item) => item.id === id)
  
  if (!item) {
    return {
      errcode: '404',
      message: '数据不存在',
      data: null,
    }
  }
  
  return {
    errcode: '0',
    message: '成功',
    data: { ...item },
  }
}

/**
 * Mock API - 新增
 */
export const mockCreateData = async (data: FormData) => {
  await delay(400)
  
  const newItem: ListRow = {
    id: nextId++,
    ...data,
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
  }
  
  mockDataList.unshift(newItem)
  
  return {
    errcode: '0',
    message: '新增成功',
    data: newItem,
  }
}

/**
 * Mock API - 编辑
 */
export const mockEditData = async (data: FormData) => {
  await delay(400)
  
  const index = mockDataList.findIndex((item) => item.id === data.id)
  
  if (index === -1) {
    return {
      errcode: '404',
      message: '数据不存在',
      data: null,
    }
  }
  
  mockDataList[index] = {
    ...mockDataList[index],
    ...data,
    updateTime: new Date().toLocaleString('zh-CN'),
  }
  
  return {
    errcode: '0',
    message: '编辑成功',
    data: mockDataList[index],
  }
}

/**
 * Mock API - 删除
 */
export const mockDeleteData = async (id: string | number) => {
  await delay(300)
  
  const index = mockDataList.findIndex((item) => item.id === id)
  
  if (index === -1) {
    return {
      errcode: '404',
      message: '数据不存在',
      data: null,
    }
  }
  
  mockDataList.splice(index, 1)
  
  return {
    errcode: '0',
    message: '删除成功',
    data: null,
  }
}

/**
 * Mock API - 获取表格列配置
 */
export const mockGetTableColumns = async (data: { tableCode: string }) => {
  await delay(200)
  
  // 返回默认的表格列配置（符合 CommonTableColType 接口格式）
  const columns = [
    {
      id: 1,
      appId: '',
      align: 'left',
      checked: true,
      disabled: false,
      empId: '',
      filter: false,
      label: 'ID',
      order: 1,
      orgId: '',
      prop: 'id',
      show: true,
      sortable: false,
      tableCode: data.tableCode,
      tenantId: '',
      twoLines: 0,
      width: 80,
    },
    {
      id: 2,
      appId: '',
      align: 'left',
      checked: true,
      disabled: false,
      empId: '',
      filter: false,
      label: '名称',
      order: 2,
      orgId: '',
      prop: 'name',
      show: true,
      sortable: true,
      tableCode: data.tableCode,
      tenantId: '',
      twoLines: 0,
      width: 200,
    },
    {
      id: 3,
      appId: '',
      align: 'center',
      checked: true,
      disabled: false,
      empId: '',
      filter: false,
      label: '状态',
      order: 3,
      orgId: '',
      prop: 'status',
      show: true,
      sortable: false,
      tableCode: data.tableCode,
      tenantId: '',
      twoLines: 0,
      width: 100,
    },
    {
      id: 4,
      appId: '',
      align: 'left',
      checked: true,
      disabled: false,
      empId: '',
      filter: false,
      label: '创建时间',
      order: 4,
      orgId: '',
      prop: 'createTime',
      show: true,
      sortable: true,
      tableCode: data.tableCode,
      tenantId: '',
      twoLines: 0,
      width: 180,
    },
    {
      id: 5,
      appId: '',
      align: 'left',
      checked: true,
      disabled: false,
      empId: '',
      filter: false,
      label: '更新时间',
      order: 5,
      orgId: '',
      prop: 'updateTime',
      show: true,
      sortable: true,
      tableCode: data.tableCode,
      tenantId: '',
      twoLines: 0,
      width: 180,
    },
  ]
  
  // 返回格式：{ columns, pageSize, tableCode }
  return {
    errcode: '0',
    message: '成功',
    data: {
      columns,
      pageSize: 10, // 默认每页10条
      tableCode: data.tableCode,
    },
  }
}
`
}

/**
 * 创建API相关文件
 * @param {string} apisDir - APIs目录路径
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @param {boolean} useMock - 是否生成 Mock 数据
 */
export function createApiFiles(
  apisDir,
  moduleName,
  moduleTitle,
  useMock = false,
) {
  const apiDir = join(apisDir, moduleName)

  // 创建API目录
  mkdirSync(apiDir, { recursive: true })
  console.log(`✅ 创建API目录: ${getRelativePath(apiDir)}`)

  // 创建API类型文件
  createFileIfNotExists(
    join(apiDir, 'index.api.ts'),
    generateApiTypes(moduleName, moduleTitle),
    'API类型文件',
  )

  // 创建API接口文件
  createFileIfNotExists(
    join(apiDir, 'index.ts'),
    generateApiFile(moduleName, useMock),
    'API接口文件',
  )

  // 如果需要，创建 Mock 数据文件
  if (useMock) {
    createFileIfNotExists(
      join(apiDir, 'index.mock.ts'),
      generateMockFile(moduleName, moduleTitle),
      'Mock数据文件',
    )
    console.log(
      `✅ 已生成 Mock 数据文件，可在 index.ts 中设置 USE_MOCK_DATA = true 启用`,
    )
  }
}
