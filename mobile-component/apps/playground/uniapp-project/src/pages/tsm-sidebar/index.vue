<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="demo-card">
        <tsm-sidebar
          :menus="sidebarMenus"
          @item-click="onClick"
          :badge="{
            isDot: false,
            prop: 'num',
          }"
        >
        </tsm-sidebar>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import iconGrid3 from '@/uni_modules/@tiansu/ts-icon/mobile/vue/icon-grid3.vue';
import { markRaw } from 'vue';

const onClick = (item: any, index: any) => {
  console.log('点击了菜单项', item, index);
};
const sidebarMenus = [
  { label: '菜', num: 8, icon: markRaw(iconGrid3) },
  { label: '菜', num: 8, icon: markRaw(iconGrid3) },
  { label: '菜', num: 8, icon: markRaw(iconGrid3) },
  { label: '菜', num: 8, icon: markRaw(iconGrid3) },
  { label: '菜', num: 8, icon: markRaw(iconGrid3) },
  { label: '菜单3', num: 99 },
  { label: '菜单4', num: 0 },
  { label: '菜单5', num: 10 },
  { label: '四个中文四个中文四四个中文四个中文四四个中文四个中文四', num: 5 },
  { label: 'item', num: 15 },
  { label: '菜单5', num: 20 },
  { label: '菜单5', num: 25 },
  { label: '菜单5', num: 30 },
  { label: '菜单5', num: 35 },
  { label: '菜单5', num: 40 },
  { label: '菜单5', num: 45 },
  { label: '菜单5', num: 50 },
  { label: '菜单5', num: 55 },
  { label: '菜单5', num: 60 },
  { label: '菜单5', num: 65 },
  { label: '菜单5', num: 70 },
];
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  background: #f7f8fa;
  height: calc(100vh - 64px);
  box-sizing: border-box;
}

.header {
  padding: 10px 10px 4px;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.subtitle {
  margin-top: 10px;
  font-size: 18px;
  color: #6b7280;
  text-align: center;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 12px 12px;
  margin-bottom: 10px;
  height: calc(100% - 14px);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #111827;
}

.demo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
}

.demo-item--wide {
  width: 100%;
  align-items: flex-start;
}

.demo-item__label {
  margin-top: 6px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.2;
}
</style>
