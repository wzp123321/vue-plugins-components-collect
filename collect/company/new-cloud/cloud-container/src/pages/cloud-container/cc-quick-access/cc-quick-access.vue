<!--
 * @Author: yut
 * @Date: 2023-08-10 19:21:57
 * @LastEditors: yut
 * @LastEditTime: 2023-11-16 19:32:48
 * @Descripttion: 
-->
<template>
  <transition name="quick-access">
    <div class="cc-quick-access" v-if="showPopover" @mouseover="onQuickMouseover" @mouseleave="onQuickMouseleave">
      <div class="cqa-latest-visit" v-if="CcQuickAccessService.recentlyAccessedMenuList.length">
        <h5>最近访问</h5>
        <div class="cqa-latest-container">
          <te-link
            :underline="false"
            :class="!item.accessed ? 'not-allowed' : ''"
            v-for="item in CcQuickAccessService.recentlyAccessedMenuList"
            @click="onLinkTo(item.url, item.iframeFlag, item.id.toString(), item.accessed)"
            :key="item.id"
            >{{ item.name }}</te-link
          >
        </div>
      </div>
      <div class="cqa-work-guideline">
        <h5>工作指南</h5>
        <div class="cqa-work-bar" v-for="item in CcQuickAccessService.quickList" :key="item.name">
          <div :class="mapClass(item.name)">
            <component :is="mapIcon(item.name)"></component>
            <span>{{ item.name }}</span>
          </div>
          <te-link
            :underline="false"
            v-for="it in item.dataList"
            :class="!it.accessed ? 'not-allowed' : ''"
            @click="onLinkTo(it.url, it.iframeFlag, it.id.toString(), it.accessed)"
            :key="it.id"
            >{{ it.name }}</te-link
          >
        </div>
      </div>
    </div>
  </transition>
</template>
<script lang="ts" setup>
import { IconCoin, IconHosted, IconUser } from '@arco-iconbox/vue-te';
import { TeLink } from '@tiansu/element-plus';
import CcQuickAccessService from './cc-quick-access.service';
import { CQA_ERole } from './cc-quick-access.api';
import sFrame from '../services/cc-frame.service';
import { computed, ref } from 'vue';

const emit = defineEmits(['changeDefaultActive', 'close']);
const props = defineProps<{ showPopverFlag: boolean }>();

const showPopover = computed(() => {
  return CcQuickAccessService.quickList.length && (props.showPopverFlag || operateFlag.value);
});

const onLinkTo = (url: string, flag: number, id: string, accessed: boolean | null) => {
  if (!accessed) {
    return;
  }
  sFrame.loadFrame(url, flag).then(() => {
    operateFlag.value = false;
    emit('close');
  });
  emit('changeDefaultActive', id);
};

/**
 * 图标
 * @param name
 */
const mapIcon = (name: string) => {
  let icon = null;
  switch (name) {
    case CQA_ERole.财务:
      icon = IconCoin;
      break;
    case CQA_ERole.管理层:
      icon = IconUser;
      break;
    case CQA_ERole.能源经理:
      icon = IconHosted;
      break;
  }
  return icon;
};

/**
 * 类名
 * @param name
 */
const mapClass = (name: string) => {
  let className = '';
  switch (name) {
    case CQA_ERole.财务:
      className = 'cqa-finance-tag';
      break;
    case CQA_ERole.管理层:
      className = 'cqa-manager-tag';
      break;
    case CQA_ERole.能源经理:
      className = 'cqa-energy-tag';
      break;
  }
  return className;
};

// 鼠标是否移入组件内部
const operateFlag = ref(false);
const onQuickMouseover = () => {
  if (props.showPopverFlag) {
    operateFlag.value = true;
  }
};
const onQuickMouseleave = () => {
  setTimeout(() => {
    operateFlag.value = false;
  }, 500);
};
</script>
<style lang="less" scoped>
.cc-quick-access {
  width: 720px;
  // height: 188px;
  padding: var(--te-space-20) var(--te-space-12);
  position: absolute;
  left: 230px;
  top: 8px;
  border-radius: 2px;
  background-color: var(--te-color-white);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1), 0px 2px 6px rgba(0, 0, 0, 0.12);
  z-index: 99999;
  .cqa-latest-visit,
  .cqa-work-guideline {
    h5 {
      // height: 24px;
      line-height: 22px;
      color: var(--te-text-color-primary);
      font-size: var(--te-font-size-b12);
    }
    .cqa-work-bar:last-child {
      border: none;
      padding-bottom: 0;
    }
  }

  .cqa-latest-container,
  .cqa-work-bar {
    // height: 24px;
    line-height: 24px;
    overflow: hidden;
    display: flex;
    gap: var(--te-space-20);
    flex-wrap: wrap;
    padding: 12px 0;
    border-bottom: 1px var(--te-border-color) dashed;
    .te-link {
      font-size: var(--te-font-size-b12);
    }
  }

  .cqa-latest-container {
    margin-top: var(--te-space-16);
    margin-bottom: var(--te-space-12);
    line-height: 22px;
    border: none;
    padding: 0;
  }

  .cqa-work-guideline h5 {
    margin-bottom: 4px;
  }

  .cqa-work-divider {
    width: 100%;
    height: 1px;
    margin: 10px 0;
    border-top: 1px var(--te-border-color) dashed;
  }

  .cqa-finance-tag {
    width: 68px;
    border-radius: 4px;
    font-weight: 500;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: var(--te-color-warning-light-9);
    color: var(--te-color-warning) !important;
    gap: var(--te-space-8);
    font-size: var(--te-font-size-b12);
  }
  .cqa-energy-tag {
    width: 92px;
    border-radius: 4px;
    font-weight: 500;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: var(--te-color-primary-light-9);
    color: var(--te-color-primary) !important;
    gap: var(--te-space-8);
    font-size: var(--te-font-size-b12);
  }
  .cqa-manager-tag {
    width: 80px;
    border-radius: 4px;
    font-weight: 500;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: var(--te-color-success-light-9);
    color: var(--te-color-success) !important;
    gap: var(--te-space-8);
    font-size: var(--te-font-size-b12);
  }
  .not-allowed {
    color: var(--te-text-color-placeholder);
    cursor: not-allowed !important;
  }
}

// 元素开始进入的状态 | 元素离开结束的状态
.quick-access-enter-from,
.quick-access-leave-to {
  opacity: 0;
}
// 元素进入结束的状态 ｜ 元素开始离开的状态。这里不写也可以！！！！！！
.quick-access-enter-to,
.quick-access-leave-from {
  opacity: 1;
}
// 元素进入 ｜ 结束时，过渡的效果
.quick-access-enter-active,
.quick-access-leave-active {
  // 过渡动画的使用
  transition: opacity 0.3s linear 0s;
}
</style>
