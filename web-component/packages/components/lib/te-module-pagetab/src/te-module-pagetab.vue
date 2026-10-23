<template>
  <te-tabs class="hlms-layout-withtab" :addable="props.showTabTip">
    <template #addIcon>
      <span @click="handleTipBtn">{{ showTip ? '收起' : '展开' }}</span>
    </template>
    <div>
      <div v-if="showTip" class="tip">
        <slot name="tip"></slot>
      </div>
      <div class="divider"></div>
      <div>
        <slot></slot>
      </div>
    </div>
  </el-tabs>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { ElTabs } from 'element-plus'

interface PropType {
  showTabTip: boolean
}

const props = withDefaults(defineProps<PropType>(), {
  showTabTip: false
})

const showTip = ref(false)

const handleTipBtn = () => {
  showTip.value = !showTip.value
}
</script>
<style scoped lang="less">
.hlms-layout-withtab {
  background-color: var(--te-bg-color-page);
  display: flex;
  flex-direction: column;

  :deep(.te-tabs__new-tab) {
    background-color: #eef0f3;
    margin: 0;
    padding: 0 16px 0 0;
    width: 40px;
    height: 100%;
    border: none;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    color: var(--te-text-color-primary);
    box-sizing: content-box;
  }

  :deep(.te-tabs__header::after) {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0;
    background-color: rgba(232, 232, 232, 1);
    z-index: var(--te-index-normal);
  }

  :deep(.te-tabs__header) {
    background-color: #eef0f3;
    flex: 0 0 40px;
    margin-bottom: 0;

    .te-tabs__nav-wrap {
      .te-tabs__item {
        border-right: 1px solid var(--te-border-color-divider);
        border-bottom: 2px solid #eef0f3;
        box-sizing: border-box;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        color: var(--te-text-color-primary);
      }

      .te-tabs__item.is-active {
        border-bottom: 2px solid var(--te-text-color-primary);
        box-sizing: border-box;
      }

      .te-tabs__active-bar {
        display: none;
      }

      .te-tabs__item.is-top:nth-child(2) {
        padding-left: var(--te-space-20);
      }

      .te-tabs__item.is-top:last-child {
        padding-right: var(--te-space-20);
      }

      .te-tabs__item.is-active,
      .te-tabs__item:hover {
        color: var(--te-text-color-primary);
      }
    }
  }

  :deep(.te-tabs__content) {
    flex: 1 1 auto;
    overflow: auto;

    .layout-padding {
      padding: 0;
    }

    .te-tab-pane {
      padding: var(--te-space-20);
      background-color: var(--te-bg-color);
    }
  }

  :deep(.te-tabs__nav-wrap::after) {
    height: 0 !important;
  }
}

.tip {
  background: var(--Bg---te-bg-color, #fff);
  padding: 24px 20px;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.14);
}

.divider {
  width: 100%;
  height: 20px;
  background-color: transparent;
}
</style>
