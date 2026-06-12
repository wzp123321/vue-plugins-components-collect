<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Button 按钮</text>
        <text class="subtitle">按钮用于触发操作，支持多种类型和状态</text>
      </view>

      <!-- ==================== SOLID ==================== -->
      <view class="demo-card">
        <text class="section-title">Type: solid（只有 primary/danger）</text>

        <view class="subsection">
          <text class="subsection-title">Theme: primary</text>
          <view class="button-row">
            <tsm-button type="solid" theme="primary" label="normal" />
            <tsm-button type="solid" theme="primary" class="simulate-hover" label="hover" />
            <tsm-button type="solid" theme="primary" class="simulate-active" label="active" />
            <tsm-button type="solid" theme="primary" disabled label="disabled" />
            <tsm-button type="solid" theme="primary" loading label="loading" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Theme: danger</text>
          <view class="button-row">
            <tsm-button type="solid" theme="danger" label="normal" />
            <tsm-button type="solid" theme="danger" class="simulate-hover" label="hover" />
            <tsm-button type="solid" theme="danger" class="simulate-active" label="active" />
            <tsm-button type="solid" theme="danger" disabled label="disabled" />
            <tsm-button type="solid" theme="danger" loading label="loading" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Size 组合 (primary)</text>
          <view class="button-row">
            <tsm-button type="solid" theme="primary" size="xs" label="xs" />
            <tsm-button type="solid" theme="primary" size="s" label="s" />
            <tsm-button type="solid" theme="primary" size="m" label="m" />
            <tsm-button type="solid" theme="primary" size="l" label="l" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Shape 组合 (primary)</text>
          <view class="button-row">
            <tsm-button type="solid" theme="primary" shape="rectangle" label="rectangle" />
            <tsm-button type="solid" theme="primary" shape="round" label="round" />
            <tsm-button type="solid" theme="primary" shape="circle" :prefixIcon="true">
              <template #prefix-icon><icon-setting /></template>
            </tsm-button>
          </view>
        </view>
      </view>

      <!-- ==================== OUTLINE ==================== -->
      <view class="demo-card">
        <text class="section-title">Type: outline（default/primary/danger）</text>

        <view class="subsection">
          <text class="subsection-title">Theme: default</text>
          <view class="button-row">
            <tsm-button type="outline" theme="default" label="normal" />
            <tsm-button type="outline" theme="default" class="simulate-hover" label="hover" />
            <tsm-button type="outline" theme="default" class="simulate-active" label="active" />
            <tsm-button type="outline" theme="default" disabled label="disabled" />
            <tsm-button type="outline" theme="default" loading label="loading" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Theme: primary</text>
          <view class="button-row">
            <tsm-button type="outline" theme="primary" label="normal" />
            <tsm-button type="outline" theme="primary" class="simulate-hover" label="hover" />
            <tsm-button type="outline" theme="primary" class="simulate-active" label="active" />
            <tsm-button type="outline" theme="primary" disabled label="disabled" />
            <tsm-button type="outline" theme="primary" loading label="loading" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Theme: danger</text>
          <view class="button-row">
            <tsm-button type="outline" theme="danger" label="normal" />
            <tsm-button type="outline" theme="danger" class="simulate-hover" label="hover" />
            <tsm-button type="outline" theme="danger" class="simulate-active" label="active" />
            <tsm-button type="outline" theme="danger" disabled label="disabled" />
            <tsm-button type="outline" theme="danger" loading label="loading" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Size x Shape (primary)</text>
          <view class="button-row">
            <tsm-button type="outline" theme="primary" size="xs" shape="rectangle" label="xs-rect" />
            <tsm-button type="outline" theme="primary" size="s" shape="round" label="s-round" />
            <tsm-button type="outline" theme="primary" size="m" shape="rectangle" label="m-rect" />
            <tsm-button type="outline" theme="primary" size="l" shape="round" label="l-round" />
          </view>
        </view>
      </view>

      <!-- ==================== TEXT ==================== -->
      <view class="demo-card">
        <text class="section-title">Type: text（default/primary/danger）</text>

        <view class="subsection">
          <text class="subsection-title">Theme: default</text>
          <view class="button-row">
            <tsm-button type="text" theme="default" label="normal" />
            <tsm-button type="text" theme="default" class="simulate-hover" label="hover" />
            <tsm-button type="text" theme="default" class="simulate-active" label="active" />
            <tsm-button type="text" theme="default" disabled label="disabled" />
            <tsm-button type="text" theme="default" loading label="loading" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Theme: primary</text>
          <view class="button-row">
            <tsm-button type="text" theme="primary" label="normal" />
            <tsm-button type="text" theme="primary" class="simulate-hover" label="hover" />
            <tsm-button type="text" theme="primary" class="simulate-active" label="active" />
            <tsm-button type="text" theme="primary" disabled label="disabled" />
            <tsm-button type="text" theme="primary" loading label="loading" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Theme: danger</text>
          <view class="button-row">
            <tsm-button type="text" theme="danger" label="normal" />
            <tsm-button type="text" theme="danger" class="simulate-hover" label="hover" />
            <tsm-button type="text" theme="danger" class="simulate-active" label="active" />
            <tsm-button type="text" theme="danger" disabled label="disabled" />
            <tsm-button type="text" theme="danger" loading label="loading" />
          </view>
        </view>
      </view>

      <!-- ==================== LINK ==================== -->
      <view class="demo-card">
        <text class="section-title">Type: link（default/primary/danger，只支持 s/m）</text>

        <view class="subsection">
          <text class="subsection-title">Theme: default (s)</text>
          <view class="button-row">
            <tsm-button type="link" theme="default" size="s" label="normal" />
            <tsm-button type="link" theme="default" size="s" class="simulate-hover" label="hover" />
            <tsm-button type="link" theme="default" size="s" class="simulate-active" label="active" />
            <tsm-button type="link" theme="default" size="s" disabled label="disabled" />
            <tsm-button type="link" theme="default" size="s" loading label="loading" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Theme: primary (m)</text>
          <view class="button-row">
            <tsm-button type="link" theme="primary" size="m" label="normal" />
            <tsm-button type="link" theme="primary" size="m" class="simulate-hover" label="hover" />
            <tsm-button type="link" theme="primary" size="m" class="simulate-active" label="active" />
            <tsm-button type="link" theme="primary" size="m" disabled label="disabled" />
            <tsm-button type="link" theme="primary" size="m" loading label="loading" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Theme: danger (s)</text>
          <view class="button-row">
            <tsm-button type="link" theme="danger" size="s" label="normal" />
            <tsm-button type="link" theme="danger" size="s" class="simulate-hover" label="hover" />
            <tsm-button type="link" theme="danger" size="s" class="simulate-active" label="active" />
            <tsm-button type="link" theme="danger" size="s" disabled label="disabled" />
            <tsm-button type="link" theme="danger" size="s" loading label="loading" />
          </view>
        </view>
      </view>

      <!-- ==================== DASH ==================== -->
      <view class="demo-card">
        <text class="section-title">Type: dash（只有 default 主题）</text>

        <view class="subsection">
          <text class="subsection-title">Theme: default（所有尺寸）</text>
          <view class="button-row">
            <tsm-button type="dash" theme="default" size="xs" label="xs" />
            <tsm-button type="dash" theme="default" size="s" label="s" />
            <tsm-button type="dash" theme="default" size="m" label="m" />
            <tsm-button type="dash" theme="default" size="l" label="l" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Theme: default（所有状态）</text>
          <view class="button-row">
            <tsm-button type="dash" theme="default" label="normal" />
            <tsm-button type="dash" theme="default" class="simulate-hover" label="hover" />
            <tsm-button type="dash" theme="default" class="simulate-active" label="active" />
            <tsm-button type="dash" theme="default" disabled label="disabled" />
          </view>
        </view>
      </view>

      <!-- ==================== GHOST ==================== -->
      <view class="demo-card">
        <text class="section-title">Type: ghost（主题：primary、danger，用于深色背景）</text>

        <view class="subsection">
          <text class="subsection-title">Theme: primary（所有尺寸）</text>
          <view class="dark-bg">
            <view class="button-row">
              <tsm-button type="ghost" theme="primary" size="xs" label="xs" />
              <tsm-button type="ghost" theme="primary" size="s" label="s" />
              <tsm-button type="ghost" theme="primary" size="m" label="m" />
              <tsm-button type="ghost" theme="primary" size="l" label="l" />
            </view>
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Theme: primary（所有状态）</text>
          <view class="dark-bg">
            <view class="button-row">
              <tsm-button type="ghost" theme="primary" label="normal" />
              <tsm-button type="ghost" theme="primary" class="simulate-hover" label="hover" />
              <tsm-button type="ghost" theme="primary" class="simulate-active" label="active" />
              <tsm-button type="ghost" theme="primary" disabled label="disabled" />
              <tsm-button type="ghost" theme="primary" loading label="loading" />
            </view>
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Theme: danger（所有状态）</text>
          <view class="dark-bg">
            <view class="button-row">
              <tsm-button type="ghost" theme="danger" label="normal" />
              <tsm-button type="ghost" theme="danger" class="simulate-hover" label="hover" />
              <tsm-button type="ghost" theme="danger" class="simulate-active" label="active" />
              <tsm-button type="ghost" theme="danger" disabled label="disabled" />
              <tsm-button type="ghost" theme="danger" loading label="loading" />
            </view>
          </view>
        </view>
      </view>

      <!-- ==================== ICONTEXT ==================== -->
      <view class="demo-card">
        <text class="section-title">Type: iconText（default/primary/danger）</text>

        <view class="subsection">
          <text class="subsection-title">Theme: primary</text>
          <view class="button-row">
            <tsm-button type="iconText" theme="primary" label="normal" />
            <tsm-button type="iconText" theme="primary" class="simulate-hover" label="hover" />
            <tsm-button type="iconText" theme="primary" disabled label="disabled" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">With Icon Slot (primary)</text>
          <view class="button-row">
            <tsm-button type="iconText" theme="primary" :prefixIcon="true" label="前缀图标">
              <template #prefix-icon><icon-search /></template>
            </tsm-button>
            <tsm-button type="iconText" theme="primary" label="后缀图标">
              <template #suffix-icon><icon-d-arrow-right /></template>
            </tsm-button>
          </view>
        </view>
      </view>

      <!-- ==================== LONG 长按测试==================== -->
      <view class="demo-card">
        <text class="section-title">Long 长按钮（宽度100%）</text>
        <view class="button-col">
          <tsm-button type="solid" theme="primary" long label="solid primary long" />
          <tsm-button type="outline" theme="primary" long label="outline primary long" />
          <tsm-button type="solid" theme="danger" long label="solid danger long" />
        </view>
      </view>

      <!-- ==================== 复杂组合 ==================== -->
      <view class="demo-card">
        <text class="section-title">复杂组合示例</text>

        <view class="subsection">
          <text class="subsection-title">outline + danger + s + round + loading</text>
          <view class="button-row">
            <tsm-button type="outline" theme="danger" size="s" shape="round" loading label="加载中..." />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">solid + primary + l + circle + prefixIcon</text>
          <view class="button-row">
            <tsm-button type="solid" theme="primary" size="l" shape="circle" :prefixIcon="true">
              <template #prefix-icon><icon-add /></template>
            </tsm-button>
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">text + danger + m + disabled</text>
          <view class="button-row">
            <tsm-button type="text" theme="danger" size="m" disabled label="禁用文本" />
          </view>
        </view>
      </view>

      <!-- ==================== 事件测试 ==================== -->
      <view class="demo-card">
        <text class="section-title">事件测试</text>
        <view class="button-row">
          <tsm-button type="solid" theme="primary" @click="handleClick" label="点击我" />
          <text class="click-count" v-if="clickCount > 0">点击次数：{{ clickCount }}</text>
        </view>
      </view>

      <!-- ==================== 动态状态切换==================== -->
      <view class="demo-card">
        <text class="section-title">动态状态切换</text>

        <view class="subsection">
          <text class="subsection-title">Loading 状态切换（模拟异步操作）</text>
          <view class="button-row">
            <tsm-button
              type="solid"
              theme="primary"
              :loading="isLoading"
              :text="isLoading ? '提交中...' : '提交表单'"
              @click="simulateSubmit"
            />
            <tsm-button
              type="outline"
              theme="primary"
              :loading="isLoading2"
              :text="isLoading2 ? '加载中...' : '加载数据'"
              @click="simulateLoad"
            />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">Disabled 状态切换</text>
          <view class="button-row">
            <tsm-button type="solid" theme="danger" :disabled="!canDelete" label="删除" @click="handleDelete" />
            <tsm-button
              type="outline"
              theme="default"
              size="s"
              :text="canDelete ? '锁定' : '解锁'"
              @click="canDelete = !canDelete"
            />
          </view>
          <text class="status-text">删除按钮状态：{{ canDelete ? '可用' : '禁用' }}</text>
        </view>
      </view>

      <!-- ==================== 快速点击测试（防抖）==================== -->
      <view class="demo-card">
        <text class="section-title">快速点击测试（防重复提交）</text>
        <view class="subsection">
          <text class="subsection-title">快速点击以下按钮，观察计数</text>
          <view class="button-row">
            <tsm-button
              type="solid"
              theme="primary"
              :loading="isSubmitting"
              label="提交订单"
              @click="handleSubmitOrder"
            />
          </view>
          <text class="status-text">提交次数：{{ submitCount }}（loading 时点击无效）</text>
        </view>
      </view>

      <!-- ==================== 文字长度测试 ==================== -->
      <view class="demo-card">
        <text class="section-title">文字长度测试</text>

        <view class="subsection">
          <text class="subsection-title">短文本</text>
          <view class="button-row">
            <tsm-button type="solid" theme="primary" size="xs" label="OK" />
            <tsm-button type="solid" theme="primary" size="s" label="是" />
            <tsm-button type="outline" theme="primary" size="m" label="X" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">长文本</text>
          <view class="button-row wrap">
            <tsm-button type="solid" theme="primary" label="这是一个很长的按钮文字" />
            <tsm-button type="outline" theme="danger" label="警告：此操作不可逆，请谨慎操作" />
            <tsm-button type="text" theme="default" label="查看更多详情信息 >" />
          </view>
        </view>
      </view>

      <!-- ==================== 图标按钮状态测试==================== -->
      <view class="demo-card">
        <text class="section-title">图标按钮全状态测试</text>

        <view class="subsection">
          <text class="subsection-title">Circle + Icon（各种状态）</text>
          <view class="button-row">
            <tsm-button type="solid" theme="primary" shape="circle" :prefixIcon="true">
              <template #prefix-icon><icon-add /></template>
            </tsm-button>
            <tsm-button type="solid" theme="primary" shape="circle" :prefixIcon="true" class="simulate-hover">
              <template #prefix-icon><icon-add /></template>
            </tsm-button>
            <tsm-button type="solid" theme="primary" shape="circle" :prefixIcon="true" disabled>
              <template #prefix-icon><icon-add /></template>
            </tsm-button>
            <tsm-button type="solid" theme="primary" shape="circle" :prefixIcon="true" loading>
              <template #prefix-icon><icon-add /></template>
            </tsm-button>
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">不同尺寸的图标按钮</text>
          <view class="button-row">
            <tsm-button type="solid" theme="danger" size="xs" shape="circle" :prefixIcon="true">
              <template #prefix-icon><icon-close /></template>
            </tsm-button>
            <tsm-button type="solid" theme="danger" size="s" shape="circle" :prefixIcon="true">
              <template #prefix-icon><icon-close /></template>
            </tsm-button>
            <tsm-button type="solid" theme="danger" size="m" shape="circle" :prefixIcon="true">
              <template #prefix-icon><icon-close /></template>
            </tsm-button>
            <tsm-button type="solid" theme="danger" size="l" shape="circle" :prefixIcon="true">
              <template #prefix-icon><icon-close /></template>
            </tsm-button>
          </view>
        </view>
      </view>

      <!-- ==================== 实际业务场景 ==================== -->
      <view class="demo-card">
        <text class="section-title">实际业务场景</text>

        <view class="subsection">
          <text class="subsection-title">表单操作</text>
          <view class="form-actions">
            <tsm-button type="text" theme="default" label="取消" @click="cancelForm" />
            <tsm-button type="solid" theme="primary" label="保存" :loading="isSaving" @click="saveForm" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">删除确认</text>
          <view class="button-row">
            <tsm-button type="outline" theme="default" size="s" label="取消" />
            <tsm-button type="solid" theme="danger" size="s" label="确认删除" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">登录/注册</text>
          <view class="button-col">
            <tsm-button type="solid" theme="primary" long label="登录" :loading="isLogining" @click="login" />
            <tsm-button type="outline" theme="primary" long label="注册账号" />
          </view>
        </view>

        <view class="subsection">
          <text class="subsection-title">空状态操作</text>
          <view class="empty-state">
            <text class="empty-text">暂无数据</text>
            <tsm-button type="outline" theme="primary" label="刷新" :loading="isRefreshing" @click="refresh" />
          </view>
        </view>
      </view>

      <!-- ==================== 深色背景 Ghost 场景 ==================== -->
      <view class="demo-card dark-section">
        <text class="section-title" style="color: #fff">深色背景场景（Ghost 按钮）</text>

        <view class="dark-card">
          <text class="card-title">确认操作</text>
          <text class="card-desc">您确定要执行此操作吗？</text>
          <view class="card-actions">
            <tsm-button type="ghost" theme="primary" label="确认" />
            <tsm-button type="ghost" theme="danger" label="取消" />
          </view>
        </view>

        <view class="dark-card">
          <text class="card-title">加载状态</text>
          <view class="card-actions">
            <tsm-button type="ghost" theme="primary" loading label="处理中" />
            <tsm-button type="ghost" theme="primary" disabled label="禁用" />
          </view>
        </view>
      </view>

      <!-- ==================== 按钮组==================== -->
      <view class="demo-card">
        <text class="section-title">按钮组(tsm-button-group)</text>
        <text class="section-desc">group 外边框 + 按钮右边框（最后一个无右边框）</text>

        <view class="subsection">
          <text class="subsection-title">基础按钮组 - 实心按钮</text>
          <tsm-button-group>
            <tsm-button type="solid" theme="primary" label="Button" />
            <tsm-button type="solid" theme="primary" label="Button" />
            <tsm-button type="solid" theme="primary" label="Button" />
          </tsm-button-group>
        </view>

        <view class="subsection">
          <text class="subsection-title">描边按钮组</text>
          <tsm-button-group>
            <tsm-button type="outline" theme="default" label="Button1" />
            <tsm-button type="outline" theme="default" label="..." />
          </tsm-button-group>
        </view>

        <view class="subsection">
          <text class="subsection-title">图标按钮组</text>
          <tsm-button-group>
            <tsm-button type="outline" theme="default" :prefixIcon="true">
              <template #prefix-icon><icon-home /></template>
            </tsm-button>
            <tsm-button type="outline" theme="default" :prefixIcon="true">
              <template #prefix-icon><icon-edit-pen /></template>
            </tsm-button>
            <tsm-button type="outline" theme="default" :prefixIcon="true">
              <template #prefix-icon><icon-setting /></template>
            </tsm-button>
          </tsm-button-group>
        </view>

        <view class="subsection">
          <text class="subsection-title">混合类型按钮组</text>
          <tsm-button-group>
            <tsm-button type="outline" theme="primary" label="取消" />
            <tsm-button type="solid" theme="primary" label="确认" />
          </tsm-button-group>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// ========== 基础事件测试 ==========
const clickCount = ref(0);

function handleClick() {
  clickCount.value++;
  uni.showToast({
    title: '按钮被点击了！',
    duration: 1500,
  });
}

// ========== 动态状态切换==========
const isLoading = ref(false);
const isLoading2 = ref(false);
const canDelete = ref(false);

function simulateSubmit() {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    uni.showToast({ title: '提交成功！', icon: 'success' });
  }, 2000);
}

function simulateLoad() {
  isLoading2.value = true;
  setTimeout(() => {
    isLoading2.value = false;
    uni.showToast({ title: '加载完成' });
  }, 1500);
}

function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除吗？',
    success: res => {
      if (res.confirm) {
        uni.showToast({ title: '已删除', icon: 'success' });
      }
    },
  });
}

// ========== 快速点击测试==========
const isSubmitting = ref(false);
const submitCount = ref(0);

function handleSubmitOrder() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  submitCount.value++;
  setTimeout(() => {
    isSubmitting.value = false;
  }, 2000);
}

// ========== 表单场景 ==========
const isSaving = ref(false);
const isLogining = ref(false);
const isRefreshing = ref(false);

function cancelForm() {
  uni.showToast({ title: '已取消' });
}

function saveForm() {
  isSaving.value = true;
  setTimeout(() => {
    isSaving.value = false;
    uni.showToast({ title: '保存成功！', icon: 'success' });
  }, 1500);
}

function login() {
  isLogining.value = true;
  setTimeout(() => {
    isLogining.value = false;
    uni.showToast({ title: '登录成功', icon: 'success' });
  }, 2000);
}

function refresh() {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    uni.showToast({ title: '刷新完成' });
  }, 1000);
}
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

.section-desc {
  font-size: 11px;
  color: #999;
  margin-bottom: 10px;
}

.subsection {
  margin-bottom: 12px;
}

.subsection-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 600;
}

.button-row {
  @include tsm-flex-wrap-gap-container(12px);
  align-items: center;
}

.button-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dark-bg {
  background-color: #1a1a2e;
  padding: 12px;
  border-radius: 8px;
}

.click-count {
  font-size: 16px;
  color: #6172f3;
  font-weight: 600;
}

// 模拟状态样式（用于展示）
// 按照 themecolor.css 规范设置颜色
:deep(.simulate-hover) {
  // Solid：背景变深，文字保持白色
  &.tsm-button--solid {
    background-color: var(--button-bg-active) !important;
  }

  // Outline：背景变浅，文字变 active 色（primary/danger）
  &.tsm-button--outline {
    background-color: rgba(0, 0, 0, 0.04) !important;
    // Primary/Danger：hover 文字变 active 色
    &.tsm-button--primary,
    &.tsm-button--danger {
      color: var(--button-bg-active) !important;
    }
  }

  // Text：背景变浅，文字变 active 色（primary/danger）或下划线
  &.tsm-button--text {
    background-color: var(--button-bg-hover) !important;
    text-decoration: underline !important;
    // Primary/Danger：hover 文字变 active 色
    &.tsm-button--primary,
    &.tsm-button--danger {
      color: var(--button-bg-active) !important;
    }
  }

  // Link：文字变 active 色（primary/danger），default 变蓝色
  &.tsm-button--link {
    text-decoration: underline !important;
    // Primary/Danger
    &.tsm-button--primary,
    &.tsm-button--danger {
      color: var(--button-bg-active) !important;
    }
    // Default 特殊：hover 变 primary-active（蓝色）
    &.tsm-button--default {
      color: var(--tsm-color-primary-active) !important;
    }
  }

  // Dash：背景变浅
  &.tsm-button--dash {
    background-color: rgba(0, 0, 0, 0.04) !important;
    // Primary/Danger：hover 文字变 active 色
    &.tsm-button--primary,
    &.tsm-button--danger {
      color: var(--button-bg-active) !important;
    }
  }

  // Ghost：背景变浅（overlay-scrim），边框和文字变 active 色
  &.tsm-button--ghost {
    background-color: var(--tsm-color-overlay-scrim) !important;
    &.tsm-button--primary {
      border-color: var(--tsm-color-primary-active) !important;
      color: var(--tsm-color-primary-active) !important;
    }
    &.tsm-button--danger {
      border-color: var(--tsm-color-danger) !important;
      color: var(--tsm-color-danger-active) !important;
    }
  }

  // IconText：背景变浅
  &.tsm-button--iconText {
    background-color: var(--button-bg-active) !important;
  }
}

:deep(.simulate-active) {
  // Solid：保持白色，有焦点环
  &.tsm-button--solid {
    box-shadow:
      0 0 0 1px rgba(10, 13, 18, 0.18) inset,
      0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
      0 1px 2px 0 rgba(10, 13, 18, 0.05),
      0 0 0 2px #fff,
      0 0 0 4px var(--button-border-color) !important;
  }

  // Outline：文字恢复 theme 色，有焦点环
  &.tsm-button--outline {
    box-shadow:
      0 0 0 1px rgba(10, 13, 18, 0.18) inset,
      0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
      0 1px 2px 0 rgba(10, 13, 18, 0.05),
      0 0 0 2px #fff,
      0 0 0 4px var(--button-border-color) !important;
  }

  // Text/Link：有边框和焦点环
  &.tsm-button--text,
  &.tsm-button--link {
    border-color: var(--button-border-color) !important;
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 4px var(--button-border-color) !important;
  }

  // Ghost：蓝色/红色焦点环
  &.tsm-button--ghost {
    &.tsm-button--primary {
      box-shadow:
        0 0 0 1px rgba(10, 13, 18, 0.18) inset,
        0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
        0 1px 2px 0 rgba(10, 13, 18, 0.05),
        0 0 0 2px #fff,
        0 0 0 4px #6172f3 !important;
    }
    &.tsm-button--danger {
      box-shadow:
        0 0 0 1px rgba(10, 13, 18, 0.18) inset,
        0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
        0 1px 2px 0 rgba(10, 13, 18, 0.05),
        0 0 0 2px #fff,
        0 0 0 4px #f04438 !important;
    }
  }
}

// ========== 新增场景的样式==========

// 状态文本
.status-text {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

// 换行布局
.button-row.wrap {
  flex-wrap: wrap;
}

// 表单操作
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

// 深色区域
.dark-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

// 深色卡片
.dark-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
}

.card-actions {
  display: flex;
  gap: 12px;
}

// 按钮组
.button-group {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;

  :deep(.tsm-button) {
    border-radius: 0;
    border: none;
    border-right: 1px solid #e0e0e0;

    &:last-child {
      border-right: none;
    }
  }
}

// 工具类
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.divider {
  width: 1px;
  height: 16px;
  background-color: #e0e0e0;
  margin: 0 4px;
}
</style>
