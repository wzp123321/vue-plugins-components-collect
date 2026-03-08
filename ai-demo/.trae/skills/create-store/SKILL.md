---
name: create-store
description: 指导创建符合规范的Pinia Store，包括状态定义、actions、getters和模块化组织。当需要创建新的状态管理时使用本技能。
---

# 创建Pinia Store

## 使用场景

当你需要：

- 创建新的状态管理Store
- 定义状态、actions和getters
- 组织模块化的状态管理
- 处理异步状态操作

请使用本技能，并同时遵守 `.agents/rules/07-状态管理.md`。

---

## 创建Store步骤

### 1. 创建Store文件

在 `src/store/` 目录下创建新的Store文件：

```typescript
// src/store/product.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, ProductFilter } from '@/apis/product'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const loading = ref(false)
  const filter = ref<ProductFilter>({
    category: '',
    search: '',
    sortBy: 'name'
  })

  // Getters
  const productList = computed(() => products.value)
  const productCount = computed(() => products.value.length)
  const filteredProducts = computed(() => {
    let result = products.value

    if (filter.value.category) {
      result = result.filter(p => p.category === filter.value.category)
    }

    if (filter.value.search) {
      const search = filter.value.search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search))
    }

    // 排序
    result.sort((a, b) => {
      switch (filter.value.sortBy) {
        case 'price':
          return a.price - b.price
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return result
  })

  // Actions
  const fetchProducts = async () => {
    loading.value = true
    try {
      const { getProductList } = await import('@/apis/product')
      const data = await getProductList()
      products.value = data
    } catch (error) {
      console.error('获取产品列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchProductDetail = async (id: number) => {
    loading.value = true
    try {
      const { getProductDetail } = await import('@/apis/product')
      const data = await getProductDetail(id)
      currentProduct.value = data
      return data
    } catch (error) {
      console.error('获取产品详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (product: Omit<Product, 'id'>) => {
    loading.value = true
    try {
      const { createProduct } = await import('@/apis/product')
      const data = await createProduct(product)
      products.value.push(data)
      return data
    } catch (error) {
      console.error('创建产品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: number, product: Partial<Product>) => {
    loading.value = true
    try {
      const { updateProduct } = await import('@/apis/product')
      const data = await updateProduct(id, product)

      // 更新列表中的数据
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = data
      }

      // 更新当前产品
      if (currentProduct.value?.id === id) {
        currentProduct.value = data
      }

      return data
    } catch (error) {
      console.error('更新产品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: number) => {
    loading.value = true
    try {
      const { deleteProduct } = await import('@/apis/product')
      await deleteProduct(id)

      // 从列表中移除
      products.value = products.value.filter(p => p.id !== id)

      // 如果删除的是当前产品，清空当前产品
      if (currentProduct.value?.id === id) {
        currentProduct.value = null
      }
    } catch (error) {
      console.error('删除产品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const setFilter = (newFilter: Partial<ProductFilter>) => {
    filter.value = { ...filter.value, ...newFilter }
  }

  const resetFilter = () => {
    filter.value = {
      category: '',
      search: '',
      sortBy: 'name'
    }
  }

  const setCurrentProduct = (product: Product | null) => {
    currentProduct.value = product
  }

  return {
    // State
    products,
    currentProduct,
    loading,
    filter,
    // Getters
    productList,
    productCount,
    filteredProducts,
    // Actions
    fetchProducts,
    fetchProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilter,
    resetFilter,
    setCurrentProduct
  }
})
```

### 2. 在组件中使用Store

```vue
<template>
  <div class="product-list">
    <div class="filter-bar">
      <te-input v-model="filter.search" placeholder="搜索产品" @input="onSearchChange" />
      <te-select v-model="filter.category" placeholder="选择分类" @change="onCategoryChange">
        <te-option v-for="category in categories" :key="category" :label="category" :value="category" />
      </te-select>
    </div>

    <div v-if="loading" class="loading">
      <te-loading />
    </div>

    <div v-else class="products">
      <product-card
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @edit="onEditProduct"
        @delete="onDeleteProduct"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/store/product'
import ProductCard from './components/productCard.vue'

const productStore = useProductStore()

// 使用storeToRefs保持响应性
const { filteredProducts, loading, filter } = storeToRefs(productStore)

// 方法
const onSearchChange = () => {
  // 可以添加防抖
  productStore.setFilter({ search: filter.value.search })
}

const onCategoryChange = () => {
  productStore.setFilter({ category: filter.value.category })
}

const onEditProduct = (product: Product) => {
  productStore.setCurrentProduct(product)
  // 跳转到编辑页面
}

const onDeleteProduct = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个产品吗？', '提示', {
      type: 'warning'
    })
    await productStore.deleteProduct(id)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消或删除失败
  }
}

// 初始化
onMounted(async () => {
  await productStore.fetchProducts()
})
</script>
```

### 3. 持久化状态

```typescript
// src/store/settings.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const sidebarCollapsed = ref<boolean>(localStorage.getItem('sidebarCollapsed') === 'true')
  const theme = ref<'light' | 'dark'>((localStorage.getItem('theme') as 'light' | 'dark') || 'light')
  const language = ref<string>(localStorage.getItem('language') || 'zh-CN')

  // 监听状态变化并持久化
  watch(sidebarCollapsed, value => {
    localStorage.setItem('sidebarCollapsed', String(value))
  })

  watch(theme, value => {
    localStorage.setItem('theme', value)
    document.documentElement.setAttribute('data-theme', value)
  })

  watch(language, value => {
    localStorage.setItem('language', value)
    // 可以在这里切换i18n语言
  })

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
  }

  const setLanguage = (newLanguage: string) => {
    language.value = newLanguage
  }

  return {
    sidebarCollapsed,
    theme,
    language,
    toggleSidebar,
    setTheme,
    setLanguage
  }
})
```

### 4. 组合Store

```typescript
// src/store/index.ts
export { useUserStore } from './user'
export { useProductStore } from './product'
export { useSettingsStore } from './settings'

// 创建store的组合
export const useStore = () => {
  const userStore = useUserStore()
  const productStore = useProductStore()
  const settingsStore = useSettingsStore()

  // 初始化所有store
  const initStores = () => {
    userStore.init()
    settingsStore.init?.()
  }

  return {
    userStore,
    productStore,
    settingsStore,
    initStores
  }
}
```

---

## 快速检查清单

- [ ] Store文件是否放在正确的目录（`src/store/`）？
- [ ] 是否使用了Composition API风格定义Store？
- [ ] 状态是否都有明确的TypeScript类型？
- [ ] 是否使用了`storeToRefs`保持响应性？
- [ ] 异步操作是否妥善处理了错误？
- [ ] 是否需要持久化状态？
- [ ] 是否遵循了单一数据源原则？
- [ ] 计算属性是否用于派生状态？
- [ ] Store是否按业务模块合理拆分？
