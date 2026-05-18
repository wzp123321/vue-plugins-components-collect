<template>
  <div class="vue3-advanced">
    <h5>Vue3 进阶特性</h5>
    <el-row :gutter="20">
      <el-col v-for="item in featureList" :key="item.title" :span="8">
        <el-card class="feature-card" shadow="hover" @click="router.push(item.path)">
          <div class="feature-icon">{{ item.icon }}</div>
          <h3 class="feature-title">{{ item.title }}</h3>
          <p class="feature-desc">{{ item.desc }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

defineOptions({ name: 'Vue3Advanced' });

const router = useRouter();

const featureList = [
  {
    icon: '🔗',
    title: 'defineModel',
    desc: 'Vue3.4+ 新写法，简化组件双向绑定，替代 modelValue + emit',
    path: '/vue3-define-model',
  },
  {
    icon: '🚪',
    title: 'Teleport 传送门',
    desc: '将组件渲染到 DOM 树中任意位置，常用于弹窗、通知等场景',
    path: '/vue3-teleport',
  },
  {
    icon: '⏳',
    title: 'Suspense 异步组件',
    desc: '优雅处理异步组件加载状态，展示 loading 占位内容',
    path: '/vue3-suspense',
  },
  {
    icon: '💉',
    title: 'provide / inject',
    desc: '跨层级组件通信，避免多层 props 透传',
    path: '/vue3-provide-inject',
  },
  {
    icon: '👁',
    title: 'watch 对比',
    desc: 'watch / watchEffect / watchSyncEffect 使用场景对比演示',
    path: '/vue3-watch-compare',
  },
];
</script>

<style lang="less" scoped>
.vue3-advanced {
  width: 100%;
  padding: 20px;

  h5 {
    margin-bottom: 20px;
    font-size: 18px;
  }

  .feature-card {
    cursor: pointer;
    text-align: center;
    transition: transform 0.2s ease;
    margin-bottom: 20px;

    &:hover {
      transform: translateY(-4px);
    }

    .feature-icon {
      font-size: 40px;
      margin-bottom: 12px;
    }

    .feature-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .feature-desc {
      font-size: 13px;
      color: #666;
      line-height: 1.5;
    }
  }
}
</style>
