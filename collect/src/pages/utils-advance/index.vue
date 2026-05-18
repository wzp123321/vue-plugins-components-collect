<template>
  <div class="utils-advance-page">
    <h5>工具函数进阶合集</h5>
    <el-row :gutter="16">
      <el-col v-for="item in utilsList" :key="item.title" :span="8">
        <el-card class="util-card" shadow="hover" @click="router.push(item.path)">
          <div class="util-icon">{{ item.icon }}</div>
          <div class="util-title">{{ item.title }}</div>
          <div class="util-desc">{{ item.desc }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

defineOptions({ name: 'UtilsAdvance' });
const router = useRouter();

const utilsList = [
  { icon: '🔁', title: '深拷贝 & 浅拷贝', desc: '手写实现 + 原理对比，JSON/递归/structuredClone', path: '/utils-copy-clone' },
  { icon: '⏱', title: '防抖 & 节流', desc: '手写原理实现，对比 lodash 版本，可视化演示', path: '/utils-debounce-throttle' },
  { icon: '📡', title: '事件总线 mitt', desc: '跨组件通信，非父子关系的事件传递', path: '/utils-event-bus' },
  { icon: '📋', title: '剪贴板操作', desc: 'Clipboard API 复制/粘贴，兼容性处理', path: '/utils-clipboard' },
  { icon: '🗄', title: 'IndexedDB', desc: '浏览器本地数据库，存储大量结构化数据', path: '/utils-indexeddb' },
];
</script>

<style lang="less" scoped>
.utils-advance-page { padding: 20px; }
.util-card {
  cursor: pointer; text-align: center; margin-bottom: 16px; transition: transform 0.2s;
  &:hover { transform: translateY(-4px); }
  .util-icon { font-size: 36px; margin-bottom: 10px; }
  .util-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  .util-desc { font-size: 12px; color: #666; line-height: 1.5; }
}
</style>
