import { existsSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'node:path'
import { projectRoot, camelToPascal, getRelativePath } from './utils.js'

/**
 * 生成路由名称（将驼峰转换为帕斯卡命名，并添加后缀）
 * @param {string} moduleName - 模块名称（驼峰）
 * @param {string} suffix - 后缀（如 List, Create, Edit, Detail）
 * @returns {string} 路由名称
 */
function generateRouteName(moduleName, suffix = '') {
  const pascalName = camelToPascal(moduleName)
  // 将驼峰转换为帕斯卡（处理多个单词的情况）
  // 例如: userManage -> UserManage -> UserManageList
  return suffix ? `${pascalName}${suffix}` : pascalName
}

/**
 * 更新路由配置
 * @param {string} routerDir - 路由目录路径
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @param {Object} pageConfig - 页面配置 {add: 'dialog'|'drawer'|'page'|null, edit: ..., detail: ...}
 */
export async function updateRoutes(
  routerDir,
  moduleName,
  moduleTitle,
  pageConfig = {},
) {
  // 生成模块路由文件
  const modulesDir = join(routerDir, 'modules')
  const moduleRouteFile = join(modulesDir, `${moduleName}.ts`)

  // 检查路由文件是否已存在
  if (existsSync(moduleRouteFile)) {
    console.log(
      `⚠️  路由文件已存在: ${getRelativePath(moduleRouteFile)}`,
    )
    console.log('   将覆盖现有路由文件')
  }

  const pascalName = generateRouteName(moduleName)
  const listRouteName = generateRouteName(moduleName, 'List')

  // 生成子路由配置
  const childrenRoutes = []

  // 列表页路由（始终存在）
  childrenRoutes.push(`          {
            path: 'list',
            name: '${listRouteName}',
            component: () => import('@/views/${moduleName}/index.vue'),
            meta: {
              title: '${moduleTitle}列表',
              requiresAuth: true,
              key: '${pascalName}',
            },
          }`)

  // 新增页面路由（仅当 add === 'page' 时）
  if (pageConfig.add === 'page') {
    const createRouteName = generateRouteName(moduleName, 'Create')
    childrenRoutes.push(`          {
            path: 'create',
            name: '${createRouteName}',
            component: () => import('@/views/${moduleName}/modules/createForm.vue'),
            meta: {
              title: '新增${moduleTitle}',
              requiresAuth: true,
              noTag: true,
              key: '${pascalName}',
            },
          }`)
  }

  // 编辑页面路由（仅当 edit === 'page' 时）
  if (pageConfig.edit === 'page') {
    const editRouteName = generateRouteName(moduleName, 'Edit')
    childrenRoutes.push(`          {
            path: 'edit',
            name: '${editRouteName}',
            component: () => import('@/views/${moduleName}/modules/createForm.vue'),
            meta: {
              title: '编辑${moduleTitle}',
              requiresAuth: true,
              noTag: true,
              key: '${pascalName}',
            },
          }`)
  }

  // 详情页面路由（仅当 detail === 'page' 时）
  if (pageConfig.detail === 'page') {
    const detailRouteName = generateRouteName(moduleName, 'Detail')
    childrenRoutes.push(`          {
            path: 'detail',
            name: '${detailRouteName}',
            component: () => import('@/views/${moduleName}/modules/detail.vue'),
            meta: {
              title: '${moduleTitle}详情',
              requiresAuth: true,
              key: '${pascalName}',
              noTag: true,
            },
          }`)
  }

  // 生成模块路由文件内容（符合当前项目的路由结构）
  // 注意：te-layout-one 组件内部处理了 router-view，所以父路由不需要 component
  const moduleRouteContent = `import Layout from '@/components/layout/index.vue';

export default [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '${moduleName}',
        name: '${pascalName}',
        meta: {
          title: '${moduleTitle}',
          requiresAuth: true,
        },
        redirect: {
          name: '${listRouteName}',
        },
        children: [
${childrenRoutes.join(',\n')}
        ],
      },
    ],
  },
];
`

  // 创建模块路由文件
  if (!existsSync(modulesDir)) {
    mkdirSync(modulesDir, { recursive: true })
  }
  writeFileSync(moduleRouteFile, moduleRouteContent, 'utf-8')
  console.log(
    `✅ 创建模块路由文件: ${getRelativePath(moduleRouteFile)}`,
  )
  console.log(
    `💡 提示: 路由文件已创建，项目使用 import.meta.glob 自动导入，无需手动配置`,
  )
}
