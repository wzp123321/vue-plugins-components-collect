<template>
  <el-container class="main flex flex-column">
    <el-header class="main-header">
      <div class="header-left">
        <span class="header-collapse-btn" @click="toggleCollapse">
          <span class="collapse-icon" :class="{ 'is-collapsed': isCollapsed }">☰</span>
        </span>
        <div class="header-brand">
          <span class="brand-icon">📦</span>
          <h6 class="brand-title">组件&插件收集</h6>
        </div>
      </div>
    </el-header>
    <el-container class="main-container flex">
      <ems-aside :menuList="menuList" :selectedMenu="selectedMenu" :collapsed="isCollapsed"></ems-aside>
      <el-main class="main-container__content flex flex-column">
        <common-page-container>
          <router-view></router-view>
        </common-page-container>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Aside from '../layout/aside-box/aside-box.vue';
import { ElHeader, ElContainer, ElMain } from 'element-plus';
import { menuList } from '../layout/aside-box/constant';

export default defineComponent({
  components: {
    'ems-aside': Aside,
    'el-header': ElHeader,
    'el-container': ElContainer,
    'el-main': ElMain,
  },
  setup() {
    const selectedMenu = ref<string[]>([]);
    const isCollapsed = ref(false);

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    return {
      selectedMenu,
      menuList,
      isCollapsed,
      toggleCollapse,
    };
  },
});
</script>

<style lang="less" scoped>
.main {
  height: 100%;
  overflow: hidden;

  &-header {
    display: flex;
    align-items: center;
    height: 56px;
    z-index: 2033;
    padding: 0 16px;
    border-bottom: 1px solid #e4e7ed;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-collapse-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(0, 0, 0, 0.06);
      }

      .collapse-icon {
        font-size: 18px;
        transition: transform 0.3s ease;

        &.is-collapsed {
          transform: rotate(90deg);
        }
      }
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 8px;

      .brand-icon {
        font-size: 22px;
        line-height: 1;
      }

      .brand-title {
        height: 56px;
        line-height: 56px;
        font-weight: 500;
        font-size: 18px;
      }
    }
  }

  &-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    padding: 0;

    &__content {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      background-color: #f0f2f5;
    }
  }
}
</style>
