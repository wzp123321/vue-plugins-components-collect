/** * Card 卡片组件 * @description 卡片组件，用于展示内容 */
<template>
  <view class="tsm-card">
    <view class="tsm-card__header">
      <view class="tsm-card__info-panel">
        <view class="tsm-card__title-panel" v-if="getIsShowTitle">
          <text class="tsm-card__title">{{ title }}</text>
          <svg
            v-if="showInfoIcon"
            @click="emit('info', $event)"
            class="tsm-card__icon-info"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M8 6.66667C8.36819 6.66667 8.66667 6.96514 8.66667 7.33333V10.7565C8.86578 10.8718 9 11.0867 9 11.3333C9 11.7015 8.70153 12 8.33334 12H8C7.63181 12 7.33334 11.7015 7.33334 11.3333V8L7.26498 7.99675C6.92889 7.96252 6.66667 7.67845 6.66667 7.33333C6.66667 6.96514 6.96515 6.66667 7.33334 6.66667H8Z"
              fill="#717680"
            />
            <path
              d="M8 4.66667C8.36819 4.66667 8.66667 4.96514 8.66667 5.33333C8.66667 5.70152 8.36819 6 8 6C7.63181 6 7.33334 5.70152 7.33334 5.33333C7.33334 4.96514 7.63181 4.66667 8 4.66667Z"
              fill="#717680"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33334 11.6819 1.33334 8C1.33334 4.3181 4.3181 1.33333 8 1.33333ZM8 2.66667C5.05448 2.66667 2.66667 5.05448 2.66667 8C2.66667 10.9455 5.05448 13.3333 8 13.3333C10.9455 13.3333 13.3333 10.9455 13.3333 8C13.3333 5.05448 10.9455 2.66667 8 2.66667Z"
              fill="#717680"
            />
          </svg>
        </view>

        <text v-if="subTitle" class="tsm-card__sub-title">{{ subTitle }}</text>
      </view>
      <view class="tsm-card__option-panel">
        <view class="tsm-card__option-item" @click="emit('more', $event)" v-if="showMorePanel">
          <text class="tsm-card__option-text">查看更多</text>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.66837 3.19547C5.92869 2.93515 6.35039 2.9352 6.61075 3.19547L11.0424 7.62613C11.4327 8.01661 11.4327 8.64971 11.0424 9.0402L6.61075 13.4709C6.35042 13.7312 5.92872 13.7312 5.66837 13.4709C5.40826 13.2105 5.4081 12.7887 5.66837 12.5285L9.86368 8.33317L5.66837 4.13785C5.40815 3.87755 5.4082 3.45581 5.66837 3.19547Z"
              fill="#A4A7AE"
            />
          </svg>
        </view>
        <svg
          v-if="showOptionPanel"
          @click="emit('option', $event)"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 10.5C6.39782 10.5 6.77936 10.658 7.06066 10.9393C7.34196 11.2206 7.5 11.6022 7.5 12C7.5 12.3978 7.34196 12.7794 7.06066 13.0607C6.77936 13.342 6.39782 13.5 6 13.5C5.60218 13.5 5.22064 13.342 4.93934 13.0607C4.65804 12.7794 4.5 12.3978 4.5 12C4.5 11.6022 4.65804 11.2206 4.93934 10.9393C5.22064 10.658 5.60218 10.5 6 10.5ZM12 10.5C12.3978 10.5 12.7794 10.658 13.0607 10.9393C13.342 11.2206 13.5 11.6022 13.5 12C13.5 12.3978 13.342 12.7794 13.0607 13.0607C12.7794 13.342 12.3978 13.5 12 13.5C11.6022 13.5 11.2206 13.342 10.9393 13.0607C10.658 12.7794 10.5 12.3978 10.5 12C10.5 11.6022 10.658 11.2206 10.9393 10.9393C11.2206 10.658 11.6022 10.5 12 10.5ZM18 10.5C18.3978 10.5 18.7794 10.658 19.0607 10.9393C19.342 11.2206 19.5 11.6022 19.5 12C19.5 12.3978 19.342 12.7794 19.0607 13.0607C18.7794 13.342 18.3978 13.5 18 13.5C17.6022 13.5 17.2206 13.342 16.9393 13.0607C16.658 12.7794 16.5 12.3978 16.5 12C16.5 11.6022 16.658 11.2206 16.9393 10.9393C17.2206 10.658 17.6022 10.5 18 10.5Z"
            fill="#717680"
          />
        </svg>
      </view>
    </view>
    <view v-if="$slots.default" class="tsm-card__body">
      <slot />
    </view>
    <!-- <view
      v-if="$slots.footer"
      class="tsm-card__footer"
    >
      <slot name="footer" />
    </view> -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CardProps } from './props';
import { defaultProps } from './props';

const props = withDefaults(defineProps<CardProps>(), defaultProps);

const emit = defineEmits<{
  info: [e: Event];
  more: [e: Event];
  option: [e: Event];
}>();

const getIsShowTitle = computed(() => !!props.title && (props.showMorePanel || props.showTitle));
</script>

<style scoped lang="scss">
.tsm-card {
  border-radius: var(--tsm-radius-l);
  border: 1px solid var(--tsm-color-border-tertiary);
  background: var(--tsm-color-text-white);
  box-shadow:
    0 0 3px 0 var(--tsm-shadow-s-01),
    0 1px 2px -1px var(--tsm-shadow-s-02);
  display: flex;
  padding: 0 0 0 0;
  flex-direction: column;
  align-items: flex-start;
}

.tsm-card__header {
  box-sizing: border-box;
  width: 100%;
  padding: 16px 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.tsm-card__info-panel {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tsm-card__title-panel {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.tsm-card__title {
  overflow: hidden;
  color: var(--tsm-color-text-primary);
  text-overflow: ellipsis;

  /* Body-Semibold/l */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  font-style: normal;
  font-weight: var(-tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-l);
  /* 150% */
}

.tsm-card__icon-info {
  margin-left: 4px;
}

.tsm-card__sub-title {
  overflow: hidden;
  color: var(--tsm-color-text-secondary);
  text-overflow: ellipsis;

  /* Body/s */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-s);
  font-style: normal;
  font-weight: var(-tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-s);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  /* 166.667% */
}

.tsm-card__option-panel {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
}

.tsm-card__option-item {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
}

.tsm-card__option-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--tsm-color-text-quaternary);
  text-align: center;
  text-overflow: ellipsis;

  /* Body/m */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-m);
  font-style: normal;
  font-weight: var(-tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m);
  /* 157.143% */
}

.tsm-card__body {
  padding: 4px 16px 12px;
  box-sizing: border-box;
  width: 100%;
}
</style>
