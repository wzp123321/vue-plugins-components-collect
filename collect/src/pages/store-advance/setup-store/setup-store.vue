<template>
  <div class="setup-store-page">
    <h5>Pinia Setup Store — 组合式写法</h5>
    <el-alert type="info" :closable="false" style="margin-bottom:20px">
      Pinia 支持两种写法：<strong>Options Store</strong>（类似 Vuex）和 <strong>Setup Store</strong>（更灵活，类 Composition API）。
      Setup Store 可以使用 computed、watch 等全部 Vue3 响应式 API。
    </el-alert>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header>购物车 Setup Store 演示</template>
          <div class="cart-demo">
            <div class="product-list">
              <div v-for="item in products" :key="item.id" class="product-item">
                <span>{{ item.name }}</span>
                <span class="price">¥{{ item.price }}</span>
                <el-button size="small" type="primary" @click="cartStore.addItem(item)">加入购物车</el-button>
              </div>
            </div>
            <el-divider>购物车（{{ cartStore.totalCount }} 件）</el-divider>
            <div v-if="cartStore.items.length === 0" class="empty-cart">购物车为空</div>
            <div v-else>
              <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
                <span>{{ item.name }}</span>
                <div class="quantity-ctrl">
                  <el-button size="small" @click="cartStore.decreaseItem(item.id)">-</el-button>
                  <span>{{ item.quantity }}</span>
                  <el-button size="small" @click="cartStore.increaseItem(item.id)">+</el-button>
                </div>
                <span class="price">¥{{ item.price * item.quantity }}</span>
                <el-button size="small" type="danger" text @click="cartStore.removeItem(item.id)">删除</el-button>
              </div>
              <div class="total">
                <span>合计：<strong>¥{{ cartStore.totalPrice }}</strong></span>
                <el-button type="danger" size="small" @click="cartStore.clearCart">清空购物车</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>Setup Store 源码</template>
          <pre class="code-block">{{ setupStoreCode }}</pre>
        </el-card>
      </el-col>

      <el-col :span="24" style="margin-top:16px">
        <el-card>
          <template #header>Options Store vs Setup Store 对比</template>
          <el-row :gutter="16">
            <el-col :span="12">
              <p class="sub-title">Options Store（传统写法）</p>
              <pre class="code-block">{{ optionsCode }}</pre>
            </el-col>
            <el-col :span="12">
              <p class="sub-title">Setup Store（组合式写法，推荐）</p>
              <pre class="code-block">{{ setupCode }}</pre>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

defineOptions({ name: 'SetupStore' });

// ===== 购物车 Setup Store =====
interface Product { id: number; name: string; price: number; }
interface CartItem extends Product { quantity: number; }

const useCartStore = defineStore('cart-demo', () => {
  const items = ref<CartItem[]>([]);

  // computed（等同于 Options Store 的 getters）
  const totalCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0));
  const totalPrice = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0));

  // actions
  const addItem = (product: Product) => {
    const existing = items.value.find((i) => i.id === product.id);
    if (existing) { existing.quantity++; }
    else { items.value.push({ ...product, quantity: 1 }); }
  };

  const removeItem = (id: number) => { items.value = items.value.filter((i) => i.id !== id); };
  const increaseItem = (id: number) => { const item = items.value.find((i) => i.id === id); if (item) item.quantity++; };
  const decreaseItem = (id: number) => {
    const item = items.value.find((i) => i.id === id);
    if (!item) return;
    if (item.quantity > 1) { item.quantity--; } else { removeItem(id); }
  };
  const clearCart = () => { items.value = []; };

  return { items, totalCount, totalPrice, addItem, removeItem, increaseItem, decreaseItem, clearCart };
});

const cartStore = useCartStore();

const products: Product[] = [
  { id: 1, name: 'MacBook Pro', price: 9999 },
  { id: 2, name: 'iPhone 15', price: 5999 },
  { id: 3, name: 'AirPods Pro', price: 1899 },
  { id: 4, name: 'Apple Watch', price: 2999 },
];

const setupStoreCode = `// stores/cart.ts — Setup Store 写法
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // ref → state
  const items = ref<CartItem[]>([])

  // computed → getters
  const totalCount = computed(() =>
    items.value.reduce((s, i) => s + i.quantity, 0)
  )
  const totalPrice = computed(() =>
    items.value.reduce((s, i) => s + i.price * i.quantity, 0)
  )

  // 普通函数 → actions
  const addItem = (product: Product) => {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) { existing.quantity++ }
    else { items.value.push({ ...product, quantity: 1 }) }
  }

  // 可以直接使用 watch！
  watch(items, (newItems) => {
    console.log('购物车变化', newItems.length)
  }, { deep: true })

  // 必须 return 所有要暴露的内容
  return { items, totalCount, totalPrice, addItem }
}, {
  persist: true  // 搭配持久化插件
})`;

const optionsCode = `export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0, name: 'Eduardo' }),

  getters: {
    doubleCount: (state) => state.count * 2,
  },

  actions: {
    increment() { this.count++ },
    async fetchUser(id: number) {
      this.name = await fetchUser(id)
    },
  },
})`;

const setupCode = `export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)
  const name = ref('Eduardo')

  // getters（直接用 computed）
  const doubleCount = computed(() => count.value * 2)

  // actions（普通函数）
  const increment = () => count.value++
  async function fetchUser(id: number) {
    name.value = await fetchUserAPI(id)
  }

  // 可以用 watch、watchEffect...
  watch(count, (val) => console.log('count changed:', val))

  return { count, name, doubleCount, increment, fetchUser }
})`;
</script>

<style lang="less" scoped>
.setup-store-page { padding: 20px; overflow-y: auto; }
.product-list { display: flex; flex-direction: column; gap: 8px; }
.product-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; background: #f5f7fa; border-radius: 6px;
  .price { color: #f56c6c; font-weight: 500; }
}
.cart-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px; border-bottom: 1px solid #f0f0f0;
  .quantity-ctrl { display: flex; align-items: center; gap: 8px; font-weight: 500; }
  .price { color: #f56c6c; font-weight: 500; }
}
.total { display: flex; justify-content: space-between; align-items: center; padding: 12px 0 0; font-size: 16px; }
.empty-cart { text-align: center; color: #999; padding: 20px 0; }
.sub-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #303133; }
.code-block {
  background: #1e1e2e; color: #cdd6f4; border-radius: 8px;
  padding: 14px; font-size: 11px; line-height: 1.7; overflow-x: auto; white-space: pre;
}
</style>
