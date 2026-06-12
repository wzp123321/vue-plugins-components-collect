<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">ActionSheet 动作面板</text>
        <text class="subtitle">底部弹出的动作面板，支持列表和宫格模式</text>
      </view>

      <view class="demo-card">
        <text class="section-title">列表模式</text>
        <view class="demo-list">
          <view class="demo-row" @click="showBasic = true">
            <view class="demo-row-content">
              <view class="demo-row-icon default">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">基础用法</text>
                <text class="demo-row-subtitle">打开基础 ActionSheet</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showDesc = true">
            <view class="demo-row-content">
              <view class="demo-row-icon info">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">顶部描述 + 左对齐</text>
                <text class="demo-row-subtitle">打开带描述的 ActionSheet</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showLeft = true">
            <view class="demo-row-content">
              <view class="demo-row-icon success">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">按钮左对齐 + 图标</text>
                <text class="demo-row-subtitle">打开左对齐ActionSheet</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showItemDesc = true">
            <view class="demo-row-content">
              <view class="demo-row-icon primary">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">带描述列表型</text>
                <text class="demo-row-subtitle">打开带描述按钮的 ActionSheet</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showSpecial = true">
            <view class="demo-row-content">
              <view class="demo-row-icon danger">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">禁用状态 + 危险操作</text>
                <text class="demo-row-subtitle">打开特殊状态ActionSheet</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showScroll = true">
            <view class="demo-row-content">
              <view class="demo-row-icon default">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">超长列表滚动</text>
                <text class="demo-row-subtitle">打开超长列表</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showNoCancel = true">
            <view class="demo-row-content">
              <view class="demo-row-icon info">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">隐藏取消按钮</text>
                <text class="demo-row-subtitle">打开无取消按钮的 ActionSheet</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">高级功能</text>
        <view class="demo-list">
          <view class="demo-row" @click="showSlot = true">
            <view class="demo-row-content">
              <view class="demo-row-icon success">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">插槽自定义内容</text>
                <text class="demo-row-subtitle">打开自定义插槽ActionSheet</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="openMethod">
            <view class="demo-row-content">
              <view class="demo-row-icon primary">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">方法控制</text>
                <text class="demo-row-subtitle">调用 open/close 方法</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showBeforeClose = true">
            <view class="demo-row-content">
              <view class="demo-row-icon warning">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">beforeClose 拦截</text>
                <text class="demo-row-subtitle">打开拦截示例</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">宫格模式</text>
        <view class="demo-list">
          <view class="demo-row" @click="showGridStack = true">
            <view class="demo-row-content">
              <view class="demo-row-icon default">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">宫格堆叠</text>
                <text class="demo-row-subtitle">打开宫格堆叠</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showGridScroll = true">
            <view class="demo-row-content">
              <view class="demo-row-icon success">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">宫格滚动</text>
                <text class="demo-row-subtitle">打开宫格滚动</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showGridStatus = true">
            <view class="demo-row-content">
              <view class="demo-row-icon warning">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">宫格状态</text>
                <text class="demo-row-subtitle">打开宫格状态</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showGridSlot = true">
            <view class="demo-row-content">
              <view class="demo-row-icon primary">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">宫格插槽自自定义</text>
                <text class="demo-row-subtitle">打开宫格插槽</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
          <view class="demo-row" @click="showGridDescDivider = true">
            <view class="demo-row-content">
              <view class="demo-row-icon info">
                <icon-box />
              </view>
              <view class="demo-row-text">
                <text class="demo-row-title">宫格描述居中+分割线</text>
                <text class="demo-row-subtitle">打开描述居中有分割线的宫格</text>
              </view>
            </view>
            <icon-box class="demo-row-arrow" />
          </view>
        </view>
      </view>

      <tsm-action-sheet v-model:show="showBasic" :actions="basicActions" @select="onSelect" @cancel="onCancel" />
      <tsm-action-sheet
        v-model:show="showDesc"
        description="需要一组与当前场景操作相关的关联操作时使用，点击页面空白区域可关闭弹出层"
        description-align="left"
        :actions="basicActions"
        @select="onSelect"
        @cancel="onCancel"
      />
      <tsm-action-sheet
        v-model:show="showLeft"
        description="请选择分享方式"
        item-align="left"
        :actions="iconActions"
        @select="onSelect"
        @cancel="onCancel"
      >
        <template #action-0="{ item }">
          <view class="custom-action">
            <icon-wechat-fill class="custom-action__icon" />
            <text class="custom-action__text">{{ item.label }}</text>
          </view>
        </template>
        <template #action-1="{ item }">
          <view class="custom-action">
            <icon-share class="custom-action__icon" />
            <text class="custom-action__text">{{ item.label }}</text>
          </view>
        </template>
        <template #action-2="{ item }">
          <view class="custom-action">
            <icon-link class="custom-action__icon" />
            <text class="custom-action__text">{{ item.label }}</text>
          </view>
        </template>
      </tsm-action-sheet>
      <tsm-action-sheet v-model:show="showItemDesc" :actions="descActions" @select="onSelect" @cancel="onCancel" />
      <tsm-action-sheet
        v-model:show="showSpecial"
        description="危险操作请谨慎"
        :actions="specialActions"
        @select="onSelect"
        @cancel="onCancel"
      />
      <tsm-action-sheet
        v-model:show="showScroll"
        description="选项过多时支持内部滚动"
        :actions="scrollActions"
        @select="onSelect"
        @cancel="onCancel"
      />
      <tsm-action-sheet v-model:show="showNoCancel" :actions="basicActions" :show-cancel="false" @select="onSelect" />
      <tsm-action-sheet
        v-model:show="showSlot"
        description="支持 action-{index} 插槽完全自定义"
        :actions="slotActions"
        @select="onSelect"
        @cancel="onCancel"
      >
        <template #action-0="{ item }">
          <view class="custom-action custom-action--red">
            <icon-delete class="custom-action__icon" />
            <text class="custom-action__text">{{ item.text }}</text>
          </view>
        </template>
        <template #action-1="{ item }">
          <view class="custom-action">
            <icon-share class="custom-action__icon" />
            <text class="custom-action__text">{{ item.text }}</text>
          </view>
        </template>
      </tsm-action-sheet>
      <tsm-action-sheet
        ref="methodRef"
        v-model:show="showMethod"
        description="通过 ref 调用 open / close 方法控制"
        :actions="basicActions"
        @select="onSelect"
        @cancel="onCancel"
      />
      <tsm-action-sheet
        v-model:show="showBeforeClose"
        description="beforeClose 示例"
        :actions="basicActions"
        :before-close="beforeCloseHandler"
        @select="onSelect"
        @cancel="onCancel"
      />
      <tsm-action-sheet
        v-model:show="showKey"
        description="自定义字段映射"
        text-key="name"
        value-key="id"
        :actions="keyActions"
        @select="onKeySelect"
        @cancel="onCancel"
      />
      <tsm-action-sheet
        v-model:show="showGridStack"
        description="请选择分享方式"
        mode="grid"
        grid-mode="stack"
        :actions="gridActions"
        @select="onSelect"
        @cancel="onCancel"
      />
      <tsm-action-sheet
        v-model:show="showGridScroll"
        description="横向滑动查看更多"
        mode="grid"
        grid-mode="scroll"
        :actions="gridScrollActions"
        @select="onSelect"
        @cancel="onCancel"
      />
      <tsm-action-sheet
        v-model:show="showGridStatus"
        mode="grid"
        grid-mode="stack"
        :actions="gridStatusActions"
        @select="onSelect"
        @cancel="onCancel"
      />
      <tsm-action-sheet
        v-model:show="showGridSlot"
        description="顶部 48×48 区域支持插槽自定义"
        mode="grid"
        grid-mode="stack"
        :actions="gridSlotActions"
        @select="onSelect"
        @cancel="onCancel"
      >
        <template #grid-icon-0="{ item }">
          <view class="custom-grid-icon custom-grid-icon--red">
            <icon-delete />
          </view>
        </template>
        <template #grid-icon-1="{ item }">
          <view class="custom-grid-icon custom-grid-icon--blue">
            <icon-share />
          </view>
        </template>
        <template #grid-icon-2="{ item }">
          <view class="custom-grid-icon custom-grid-icon--green">
            <icon-link />
          </view>
        </template>
      </tsm-action-sheet>
      <tsm-action-sheet
        v-model:show="showGridDescDivider"
        description="请选择分享方式"
        description-align="center"
        show-description-divider
        mode="grid"
        grid-mode="stack"
        :actions="gridActions"
        @select="onSelect"
        @cancel="onCancel"
      />
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showBasic = ref(false);
const showDesc = ref(false);
const showLeft = ref(false);
const showItemDesc = ref(false);
const showSpecial = ref(false);
const showScroll = ref(false);
const showNoCancel = ref(false);
const showSlot = ref(false);
const showMethod = ref(false);
const showBeforeClose = ref(false);
const showKey = ref(false);
const showGridStack = ref(false);
const showGridScroll = ref(false);
const showGridStatus = ref(false);
const showGridSlot = ref(false);
const showGridDescDivider = ref(false);
const methodRef = ref<any>(null);

let beforeCloseCount = 0;
const beforeCloseHandler = (action: string) => {
  beforeCloseCount++;
  if (beforeCloseCount % 2 === 1) {
    uni.showToast({ title: `beforeClose 阻止了${action} 关闭`, icon: 'none' });
    return false;
  }
  return true;
};

const openMethod = () => {
  methodRef.value?.open();
};

const basicActions = ref([{ label: '选项一' }, { label: '选项二' }, { label: '选项三' }]);

const iconActions = ref([{ label: '微信好友' }, { label: '朋友圈' }, { label: '复制链接' }]);

const descActions = ref([
  { label: 'Action', description: 'description' },
  { label: 'Action', description: 'description' },
  { label: 'Action', description: 'description' },
]);

const specialActions = ref([
  { label: '普通选项', type: 'default' },
  { label: '删除账号', type: 'danger' },
  { label: '禁用选项', type: 'disabled' },
]);

const scrollActions = ref(
  Array.from({ length: 20 }, (_, i) => ({
    label: `选项 ${i + 1}`,
  }))
);

const slotActions = ref([{ label: '删除' }, { label: '分享' }, { label: '普通选项' }]);

const gridIconUrl =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNjE3MmYzIj48cGF0aCBkPSJNMTggOGwtNi02LTYgNiAxLjQxIDEuNDFMMTIgNC44M2w0LjU5IDQuNThMMTggOHptMCA4bC0xLjQxLTEuNDFMMTIgMTkuMTdsLTQuNTktNC41OEw2IDE2bDYgNiA2LTZ6Ii8+PC9zdmc+';

const gridActions = ref([
  { label: '微信', icon: gridIconUrl },
  { label: '朋友圈', icon: gridIconUrl },
  { label: 'QQ', icon: gridIconUrl },
  { label: '微博', icon: gridIconUrl },
  { label: '链接', icon: gridIconUrl },
  { label: '更多', icon: gridIconUrl },
]);

const gridScrollActions = ref([
  { label: '微信', icon: gridIconUrl },
  { label: '朋友圈', icon: gridIconUrl },
  { label: 'QQ', icon: gridIconUrl },
  { label: '微博', icon: gridIconUrl },
  { label: '链接', icon: gridIconUrl },
  { label: '更多', icon: gridIconUrl },
  { label: '收藏', icon: gridIconUrl },
  { label: '举报', icon: gridIconUrl },
]);

const gridStatusActions = ref([
  { label: '普通', icon: gridIconUrl, type: 'default' },
  { label: '删除', icon: gridIconUrl, type: 'danger' },
  { label: '禁用', icon: gridIconUrl, type: 'disabled' },
  { label: '默认', icon: gridIconUrl },
]);

const keyActions = ref([
  { name: '选项 A', id: 'a' },
  { name: '选项 B', id: 'b' },
  { name: '选项 C', id: 'c' },
]);

const gridSlotActions = ref([{ label: '删除' }, { label: '分享' }, { label: '链接' }]);

const onSelect = (item: any, index: number) => {
  uni.showToast({
    title: `选中: ${item.label || item.name}`,
    icon: 'none',
  });
  console.log('select:', item, index);
};

const onKeySelect = (item: any, index: number, value: any) => {
  uni.showToast({
    title: `name: ${item.name}, value: ${value}`,
    icon: 'none',
  });
  console.log('select key:', item, index, value);
};

const onCancel = () => {
  uni.showToast({
    title: '已取消',
    icon: 'none',
  });
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 12px;
  background: #f7f8fa;
  height: 100%;
  box-sizing: border-box;
}

.header {
  padding: 10px 10px 4px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
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
  overflow: hidden;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #111827;
}

.demo-list {
  border-radius: 12px;
  overflow: hidden;
}

.demo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #eef2f7;
}

.demo-row:last-child {
  border-bottom: none;
}

.demo-row:active {
  background: #f7f8fa;
}

.demo-row-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.demo-row-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--tsm-radius-l);
  margin-right: var(--tsm-spacing-m);
}

.demo-row-icon :deep(.icon) {
  font-size: 24px;
}

.demo-row-icon.default {
  background: var(--tsm-color-primary-light);
}

.demo-row-icon.default :deep(.icon) {
  color: var(--tsm-color-primary);
}

.demo-row-icon.success {
  background: var(--tsm-color-success-light);
}

.demo-row-icon.success :deep(.icon) {
  color: var(--tsm-color-success);
}

.demo-row-icon.warning {
  background: var(--tsm-color-warning-light);
}

.demo-row-icon.warning :deep(.icon) {
  color: var(--tsm-color-warning);
}

.demo-row-icon.danger {
  background: var(--tsm-color-danger-light);
}

.demo-row-icon.danger :deep(.icon) {
  color: var(--tsm-color-danger);
}

.demo-row-icon.info {
  background: var(--tsm-color-primary-light);
}

.demo-row-icon.info :deep(.icon) {
  color: var(--tsm-color-primary);
}

.demo-row-icon.primary {
  background: var(--tsm-color-primary-light);
}

.demo-row-icon.primary :deep(.icon) {
  color: var(--tsm-color-primary);
}

.demo-row-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.demo-row-title {
  font-size: 16px;
  font-weight: var(--tsm-font-weight-medium);
  color: var(--tsm-color-text-primary);
  margin-bottom: 4px;
}

.demo-row-subtitle {
  font-size: 14px;
  color: var(--tsm-color-text-secondary);
}

.demo-row-arrow {
  font-size: 24px;
  color: var(--tsm-color-text-placeholder);
  margin-left: var(--tsm-spacing-m);
}

.custom-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-action__icon {
  width: 18px;
  height: 18px;
}

.custom-action__text {
  font-size: 16px;
  color: #303133;
}

.custom-action--red .custom-action__text {
  color: #f04438;
}

.custom-grid-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  &--red {
    background-color: rgba(240, 68, 56, 0.1);
  }

  &--blue {
    background-color: rgba(97, 114, 243, 0.1);
  }

  &--green {
    background-color: rgba(23, 178, 106, 0.1);
  }
}
</style>
