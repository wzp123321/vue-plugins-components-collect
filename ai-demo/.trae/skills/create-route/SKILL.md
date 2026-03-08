---
name: create-route
description: 指导创建符合规范的路由配置，包括路由模块、导航守卫、权限控制。当需要创建新的路由或配置路由守卫时使用本技能。
---

# 创建路由配置

## 使用场景

当你需要：

- 创建新的路由配置
- 设置导航守卫和权限控制
- 配置动态路由
- 创建路由模块

请使用本技能，并同时遵守 `.agents/rules/06-路由规范.md`。

---

## 创建路由步骤

### 1. 创建路由模块

在 `src/router/modules/` 目录下创建新的路由模块：

```typescript
// src/router/modules/product.ts
import type { AppRouteRecordRaw } from '../types'

const productRoutes: AppRouteRecordRaw[] = [
  {
    path: '/product',
    name: 'product',
    component: () => import('@/layouts/default.vue'),
    redirect: '/product/list',
    meta: {
      title: '产品管理',
      requiresAuth: true,
      icon: 'product',
      order: 3,
      permissions: ['product:view']
    },
    children: [
      {
        path: 'list',
        name: 'productList',
        component: () => import('@/views/product/list.vue'),
        meta: {
          title: '产品列表',
          keepAlive: true,
          permissions: ['product:view']
        }
      },
      {
        path: 'detail/:id',
        name: 'productDetail',
        component: () => import('@/views/product/detail.vue'),
        meta: {
          title: '产品详情',
          hideInMenu: true,
          permissions: ['product:view']
        }
      },
      {
        path: 'create',
        name: 'productCreate',
        component: () => import('@/views/product/create.vue'),
        meta: {
          title: '创建产品',
          permissions: ['product:create']
        }
      },
      {
        path: 'edit/:id',
        name: 'productEdit',
        component: () => import('@/views/product/edit.vue'),
        meta: {
          title: '编辑产品',
          hideInMenu: true,
          permissions: ['product:update']
        }
      }
    ]
  }
]

export default productRoutes
```

### 2. 在主路由配置中注册

```typescript
// src/router/routes.ts
import type { AppRouteRecordRaw } from './types'
import homeRoutes from './modules/home'
import userRoutes from './modules/user'
import productRoutes from './modules/product'
import orderRoutes from './modules/order'

export const routes: AppRouteRecordRaw[] = [
  ...homeRoutes,
  ...userRoutes,
  ...productRoutes,
  ...orderRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      hideInMenu: true
    }
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '没有权限',
      hideInMenu: true
    }
  }
]
```

### 3. 创建路由类型定义

```typescript
// src/router/types.ts
import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由元信息
 */
export interface RouteMeta {
  title?: string // 页面标题
  requiresAuth?: boolean // 是否需要登录
  permissions?: string[] // 需要的权限列表
  roles?: string[] // 需要的角色
  keepAlive?: boolean // 是否缓存页面
  hideInMenu?: boolean // 是否在菜单中隐藏
  icon?: string // 菜单图标
  order?: number // 菜单排序，数字越小越靠前
  activeMenu?: string // 高亮菜单项
  breadcrumb?: boolean // 是否显示面包屑
  affix?: boolean // 是否固定标签页
}

/**
 * 应用路由类型
 */
export type AppRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  title: string
  path?: string
  name?: string
  noRedirect?: boolean
}
```

### 4. 配置导航守卫

```typescript
// src/router/guards.ts
import type { Router, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from '@tiansu/element-plus'
import { getToken } from '@/utils/auth'

/**
 * 设置路由守卫
 */
export function setupGuards(router: Router) {
  // 白名单路由
  const whiteList = ['login', 'register', '404', '403']

  /**
   * 检查权限
   */
  const hasPermission = (route: RouteLocationNormalized): boolean => {
    const { permissions, roles } = route.meta || {}
    const userStore = useUserStore()

    // 检查权限
    if (permissions && permissions.length > 0) {
      const hasRequiredPermission = permissions.some(permission => userStore.permissions.includes(permission))
      if (!hasRequiredPermission) return false
    }

    // 检查角色
    if (roles && roles.length > 0) {
      const hasRequiredRole = roles.some(role => userStore.roles.includes(role))
      if (!hasRequiredRole) return false
    }

    return true
  }

  /**
   * 全局前置守卫
   */
  router.beforeEach(async (to, from, next) => {
    // 设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - 管理系统`
    }

    const hasToken = getToken()
    const userStore = useUserStore()

    if (hasToken) {
      // 有token
      if (to.name === 'login') {
        // 已登录，跳转到首页
        next({ name: 'dashboard' })
        return
      }

      // 检查是否需要获取用户信息
      if (!userStore.userInfo) {
        try {
          await userStore.getUserInfo()
        } catch (error) {
          // 获取用户信息失败，清除token并跳转到登录页
          await userStore.logout()
          next({
            name: 'login',
            query: { redirect: to.fullPath }
          })
          return
        }
      }

      // 检查权限
      if (!hasPermission(to)) {
        ElMessage.error('您没有访问权限')
        next({ name: '403' })
        return
      }

      next()
    } else {
      // 没有token
      if (whiteList.includes(to.name as string)) {
        // 在白名单中，直接放行
        next()
      } else {
        // 不在白名单中，跳转到登录页
        ElMessage.warning('请先登录')
        next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
      }
    }
  })

  /**
   * 全局后置守卫
   */
  router.afterEach((to, from) => {
    // 记录访问日志
    console.log(`路由跳转: ${from.path} -> ${to.path}`)

    // 可以在这里添加页面访问统计
    // trackPageView(to)
  })

  /**
   * 全局错误处理
   */
  router.onError(error => {
    console.error('路由错误:', error)
    ElMessage.error('页面加载失败')
  })
}
```

### 5. 创建路由实例

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { Router } from 'vue-router'
import { routes } from './routes'
import { setupGuards } from './guards'

/**
 * 创建路由实例
 */
export const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 保存滚动位置
    if (savedPosition) {
      return savedPosition
    }

    // 锚点定位
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }

    // 滚动到顶部
    return { top: 0, behavior: 'smooth' }
  }
})

// 设置路由守卫
setupGuards(router)

export default router
```

---

## 动态路由

### 从后端获取路由配置

```typescript
// src/router/dynamic.ts
import type { AppRouteRecordRaw } from './types'
import { useUserStore } from '@/stores/user'

/**
 * 生成动态路由
 */
export async function generateDynamicRoutes(): Promise<AppRouteRecordRaw[]> {
  const userStore = useUserStore()

  try {
    // 从后端获取路由配置
    const { getUserRoutes } = await import('@/apis/user')
    const routeData = await getUserRoutes()

    // 转换为Vue Router格式
    return transformRoutes(routeData)
  } catch (error) {
    console.error('获取动态路由失败:', error)
    return []
  }
}

/**
 * 转换路由数据
 */
function transformRoutes(data: any[]): AppRouteRecordRaw[] {
  return data.map(item => ({
    path: item.path,
    name: item.name,
    component: loadComponent(item.component),
    meta: {
      title: item.title,
      icon: item.icon,
      permissions: item.permissions,
      order: item.order,
      keepAlive: item.keepAlive,
      hideInMenu: item.hideInMenu
    },
    children: item.children ? transformRoutes(item.children) : []
  }))
}

/**
 * 加载组件
 */
function loadComponent(component: string) {
  // 组件路径映射
  const componentMap: Record<string, () => Promise<any>> = {
    dashboard: () => import('@/views/dashboard/index.vue'),
    user: () => import('@/views/user/index.vue'),
    product: () => import('@/views/product/index.vue'),
    order: () => import('@/views/order/index.vue')
  }

  return componentMap[component] || (() => import('@/views/error/404.vue'))
}
```

### 添加动态路由

```typescript
// 在登录后添加动态路由
import { generateDynamicRoutes } from '@/router/dynamic'

const addDynamicRoutes = async () => {
  const dynamicRoutes = await generateDynamicRoutes()

  dynamicRoutes.forEach(route => {
    router.addRoute(route)
  })
}
```

---

## 路由工具函数

### 面包屑生成

```typescript
// src/router/utils.ts
import type { RouteLocationMatched } from 'vue-router'
import type { BreadcrumbItem } from './types'

/**
 * 生成面包屑
 */
export function generateBreadcrumbs(matched: RouteLocationMatched[]): BreadcrumbItem[] {
  return matched
    .filter(item => item.meta?.title)
    .map(item => ({
      title: item.meta!.title!,
      path: item.path,
      name: item.name as string,
      noRedirect: item.redirect === undefined
    }))
}
```

### 菜单生成

```typescript
/**
 * 根据路由生成菜单
 */
export function generateMenu(routes: AppRouteRecordRaw[]) {
  return routes
    .filter(route => !route.meta?.hideInMenu)
    .sort((a, b) => (a.meta?.order || 0) - (b.meta?.order || 0))
    .map(route => ({
      title: route.meta?.title || '',
      icon: route.meta?.icon || '',
      path: route.path,
      name: route.name,
      children: route.children ? generateMenu(route.children) : []
    }))
}
```

---

## 快速检查清单

- [ ] 路由模块是否放在正确的目录？
- [ ] 路由路径是否使用kebab-case命名？
- [ ] 路由组件是否使用懒加载？
- [ ] 是否配置了必要的路由元信息？
- [ ] 导航守卫是否正确设置？
- [ ] 权限验证逻辑是否完善？
- [ ] 是否处理了404等错误页面？
- [ ] 路由类型定义是否完整？
- [ ] 动态路由是否正确处理？
