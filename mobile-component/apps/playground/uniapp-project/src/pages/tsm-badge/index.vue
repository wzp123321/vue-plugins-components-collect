<template>
  <tsm-theme-provider>
    <view class="container">
      <text class="title">Badge 徽章组件</text>

      <view class="section">
        <text class="section-title">基础用法</text>
        <view class="badge-group">
          <view class="badge-group__item">
            <view class="badge-group__item-title">红点徽标</view>
            <view class="badge-wrapper is-special">
              <tsm-badge value="99" :is-dot="true"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">数字徽标</view>
            <view class="badge-wrapper is-special">
              <tsm-badge value="9" :is-dot="false" shape="circle"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">三角徽标</view>
            <view class="badge-wrapper">
              <tsm-badge value="label" :is-dot="false" shape="ribbon-right"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">圆角徽标</view>
            <view class="badge-wrapper">
              <tsm-badge value="label" :is-dot="false" shape="ribbon-round"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">气泡徽标</view>
            <view class="badge-wrapper">
              <tsm-badge value="label" :is-dot="false" shape="bubble"></tsm-badge>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">large尺寸</text>
        <view class="badge-group">
          <view class="badge-group__item">
            <view class="badge-group__item-title">红点徽标</view>
            <view class="badge-wrapper is-special">
              <tsm-badge size="large" value="99" :is-dot="true"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">数字徽标</view>
            <view class="badge-wrapper">
              <tsm-badge size="large" value="9" :is-dot="false" shape="circle"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">三角徽标</view>
            <view class="badge-wrapper">
              <tsm-badge size="large" value="label" :is-dot="false" shape="ribbon-right"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">圆角徽标</view>
            <view class="badge-wrapper">
              <tsm-badge size="large" value="label" :is-dot="false" shape="ribbon-round"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">气泡徽标</view>
            <view class="badge-wrapper">
              <tsm-badge size="large" value="label" :is-dot="false" shape="bubble"></tsm-badge>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">不同主题</text>
        <view class="badge-group">
          <view class="badge-group__item">
            <view class="badge-group__item-title">红点徽标</view>
            <view class="badge-wrapper is-special">
              <tsm-badge size="large" value="99" :is-dot="true"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">数字徽标</view>
            <view class="badge-wrapper is-special">
              <tsm-badge size="large" value="9" :is-dot="false" shape="circle"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">三角徽标</view>
            <view class="badge-wrapper">
              <tsm-badge size="large" mode="warning" value="label" :is-dot="false" shape="ribbon-right"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">圆角徽标</view>
            <view class="badge-wrapper">
              <tsm-badge size="large" mode="primary" value="label" :is-dot="false" shape="ribbon-round"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">气泡徽标</view>
            <view class="badge-wrapper">
              <tsm-badge size="large" mode="success" value="label" :is-dot="false" shape="bubble"></tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">气泡徽标</view>
            <view class="badge-wrapper">
              <tsm-badge size="large" mode="info" value="label" :is-dot="false" shape="bubble"></tsm-badge>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">数值的格式化处理</text>
        <view class="badge-group">
          <view class="badge-wrapper">
            <tsm-badge shape="circle" number-type="overflow" :max="99" value="999"></tsm-badge>
          </view>
          <view class="badge-wrapper">
            <tsm-badge shape="circle" number-type="ellipsis" value="99999"></tsm-badge>
          </view>
          <view class="badge-wrapper">
            <tsm-badge shape="circle" number-type="limit" value="990009"></tsm-badge>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">不同形状+主题+mode</text>
        <view v-for="s in shape" :key="s">
          <view class="shape-title">{{ s }}</view>
          <view class="badge-group">
            <view v-for="m in mode" :key="`${s}-${m}-default`" class="badge-wrapper">
              <tsm-badge
                size="medium"
                :mode="m"
                theme="default"
                :value="s === 'circle' ? 99 : 'label'"
                :is-dot="false"
                :shape="s"
              ></tsm-badge>
            </view>
            <view v-for="m in mode" :key="`${s}-${m}-light`" class="badge-wrapper">
              <tsm-badge
                size="medium"
                :mode="m"
                theme="light"
                :value="s === 'circle' ? 99 : 'label'"
                :is-dot="false"
                :shape="s"
              ></tsm-badge>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">绝对定位（absolute）</text>
        <view class="badge-group">
          <view class="badge-group__item">
            <view class="badge-group__item-title">红点徽标</view>
            <view class="badge-with-content">
              <tsm-badge value="99" :offset="[-1, -1]" :is-dot="true">
                <view class="badge-with-content__block"></view>
              </tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">数字徽标</view>
            <view class="badge-with-content">
              <tsm-badge value="9" :offset="[-3, -3]" :is-dot="false" shape="circle">
                <view class="badge-with-content__block"></view>
              </tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">三角徽标</view>
            <view class="badge-with-content">
              <tsm-badge mode="warning" value="label" :is-dot="false" shape="ribbon-right">
                <view class="badge-with-content__block"></view>
              </tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">圆角徽标</view>
            <view class="badge-with-content">
              <tsm-badge mode="primary" value="label" :is-dot="false" shape="ribbon-round">
                <view class="badge-with-content__block"></view>
              </tsm-badge>
            </view>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">气泡徽标</view>
            <view class="badge-with-content">
              <tsm-badge mode="success" value="label" :is-dot="false" shape="bubble">
                <view class="badge-with-content__block"></view>
              </tsm-badge>
            </view>
          </view>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script lang="ts" setup>
const mode = ['error', 'primary', 'success', 'warning', 'info'];
const shape = ['circle', 'ribbon-right', 'ribbon-round', 'bubble'];
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 12px;
  background: #f7f8fa;
  height: 100vh;
  box-sizing: border-box;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
  color: #111827;
}

.section {
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #111827;
}

.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.badge-group__item {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
}

.badge-group__item-block {
  width: 40px;
  height: 40px;
  background-color: #999;
}

.badge-group__item-title {
  color: #666;
  font-size: 12px;
}

.shape-title {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 12px;
  color: #111827;
}

.badge-wrapper {
  display: flex;
  position: relative;
  padding: 8px;
  border-radius: 4px;
}

.badge-wrapper.is-special {
  background: #adadad;
}

.badge-with-content {
  position: relative;
  display: flex;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.badge-with-content__block {
  width: 40px;
  height: 40px;
  background-color: #ccc;
  border-radius: 4px;
}
</style>
