<script lang="ts" setup>
interface Props {
  title?: string;
  /** 是否显示标题栏右侧的 slot */
  showHeader?: boolean;
  /** 是否显示面板装饰（四角斜切、辉光） */
  decorated?: boolean;
}
withDefaults(defineProps<Props>(), {
  title: '',
  showHeader: true,
  decorated: true,
});
</script>

<template>
  <div class="panel-box" :class="{ 'panel-box--plain': !decorated }">
    <!-- 四角斜切装饰 -->
    <template v-if="decorated">
      <span class="panel-box__corner panel-box__corner--tl" />
      <span class="panel-box__corner panel-box__corner--tr" />
      <span class="panel-box__corner panel-box__corner--bl" />
      <span class="panel-box__corner panel-box__corner--br" />
    </template>

    <div v-if="showHeader" class="panel-box__header">
      <div class="panel-box__title-wrap">
        <span class="panel-box__title-mark" />
        <span class="panel-box__title">{{ title }}</span>
        <span class="panel-box__title-mark panel-box__title-mark--right" />
      </div>
      <div class="panel-box__extra">
        <slot name="extra" />
      </div>
    </div>

    <div class="panel-box__body">
      <slot />
    </div>
  </div>
</template>

<style lang="less" scoped>
.panel-box {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1px; // 给边框留 1px 间隙，corner 才能浮在边上
  background: linear-gradient(
    180deg,
    rgba(13, 38, 76, 0.6) 0%,
    rgba(8, 22, 48, 0.6) 100%
  );

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
        180deg,
        rgba(64, 158, 255, 0.15),
        transparent 30%
      )
      border-box;
    border: 1px solid rgba(64, 158, 255, 0.2);
  }

  &--plain {
    padding: 0;
    background: transparent;
    &::before {
      display: none;
    }
  }

  &__header {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 0.4rem;
    padding: 0 0.18rem;
    background: linear-gradient(
      90deg,
      rgba(64, 158, 255, 0.28),
      rgba(64, 158, 255, 0) 70%
    );

    // 标题下方高亮线
    &::after {
      content: '';
      position: absolute;
      left: 0.18rem;
      right: 0.18rem;
      bottom: 0;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(76, 243, 255, 0.6) 50%,
        transparent 100%
      );
    }
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    gap: 0.08rem;
  }

  &__title {
    font-size: 0.18rem;
    font-weight: 600;
    color: #e6f1ff;
    letter-spacing: 0.04rem;
    text-shadow: 0 0 8px rgba(76, 243, 255, 0.4);
  }

  &__title-mark {
    width: 0.12rem;
    height: 0.04rem;
    background: linear-gradient(90deg, #4cf3ff, transparent);
    box-shadow: 0 0 4px #4cf3ff;

    &--right {
      background: linear-gradient(90deg, transparent, #4cf3ff);
    }
  }

  &__extra {
    font-size: 0.13rem;
    color: rgba(230, 241, 255, 0.6);
  }

  &__body {
    position: relative;
    z-index: 1;
    flex: 1;
    min-height: 0;
    padding: 0.1rem 0.16rem;
  }

  // 四角斜切
  &__corner {
    position: absolute;
    width: 0.14rem;
    height: 0.14rem;
    z-index: 2;
    pointer-events: none;

    &--tl {
      top: -1px;
      left: -1px;
      border-top: 2px solid #4cf3ff;
      border-left: 2px solid #4cf3ff;
      box-shadow:
        -2px 0 8px rgba(76, 243, 255, 0.5),
        0 -2px 8px rgba(76, 243, 255, 0.5);
    }
    &--tr {
      top: -1px;
      right: -1px;
      border-top: 2px solid #4cf3ff;
      border-right: 2px solid #4cf3ff;
      box-shadow:
        2px 0 8px rgba(76, 243, 255, 0.5),
        0 -2px 8px rgba(76, 243, 255, 0.5);
    }
    &--bl {
      bottom: -1px;
      left: -1px;
      border-bottom: 2px solid #4cf3ff;
      border-left: 2px solid #4cf3ff;
      box-shadow:
        -2px 0 8px rgba(76, 243, 255, 0.5),
        0 2px 8px rgba(76, 243, 255, 0.5);
    }
    &--br {
      bottom: -1px;
      right: -1px;
      border-bottom: 2px solid #4cf3ff;
      border-right: 2px solid #4cf3ff;
      box-shadow:
        2px 0 8px rgba(76, 243, 255, 0.5),
        0 2px 8px rgba(76, 243, 255, 0.5);
    }
  }
}
</style>
