<template>
  <tsm-theme-provider>
    <view class="container">
      <text class="title">主题切换演示</text>
      <text class="desc">当前主题：{{ themeMode }}</text>

      <view class="actions">
        <view class="actions__item"><tsm-button type="primary" @click="setTheme('light')">切换 Light</tsm-button></view>
        <view class="actions__item"><tsm-button type="info" @click="setTheme('dark')">切换 Dark</tsm-button></view>
      </view>

      <view class="preview">
        <view class="preview__item"><tsm-tag type="primary" text="Primary" /></view>
        <view class="preview__item"><tsm-tag type="success" text="Success" /></view>
        <view class="preview__item"><tsm-tag type="warning" text="Warning" /></view>
        <view class="preview__item"><tsm-tag type="error" text="Danger" /></view>
        <view class="preview__item"><tsm-tag type="info" text="Info" /></view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getThemeMode, setThemeMode } from '@/uni_modules/@tiansu/ts-mobile-token/index';

type ThemeMode = 'light' | 'dark';

function getCurrentThemeMode(): ThemeMode {
  return getThemeMode();
}

const themeMode = ref<ThemeMode>(getCurrentThemeMode());

function setTheme(mode: ThemeMode) {
  setThemeMode(mode);
  themeMode.value = getCurrentThemeMode();
}
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  height: 100%;
  padding: 20px;
  background-color: var(--tsm-color-bg-tertiary);
}

.title {
  font-size: var(--tsm-font-size-display-xs);
  color: var(--tsm-color-text-primary);
  font-weight: 600;
}

.desc {
  margin-top: 8px;
  color: var(--tsm-color-text-secondary);
  font-size: var(--tsm-font-size-text-m);
}

.actions {
  margin-top: 20px;
  display: flex;
  @include tsm-gap(12px, 0);
}

.actions__item {
  @include tsm-flex-wrap-gap-item(12px, 0);
}

.preview {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid var(--tsm-color-border-secondary);
  border-radius: var(--tsm-radius-m);
  background-color: var(--tsm-color-bg-white);
  display: flex;
  flex-wrap: wrap;
  @include tsm-gap(12px, 12px);
}

.preview__item {
  @include tsm-flex-wrap-gap-item(12px, 12px);
}
</style>
