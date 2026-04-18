<template>
  <tsm-theme-provider>
    <view class="container">
      <text class="title">Badge 徽章组件</text>

      <view class="section">
        <text class="section-title">基础用法</text>
        <view class="badge-group">
          <view class="badge-group__item">
            <view class="badge-group__item-title">红点徽标</view>
            <tsm-badge value="99" :is-dot="true"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">数字徽标</view>
            <tsm-badge value="99" :is-dot="false" shape="circle"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">三角徽标</view>
            <tsm-badge value="label" :is-dot="false" shape="ribbon-right"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">圆角徽标</view>
            <tsm-badge value="label" :is-dot="false" shape="ribbon-round"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">气泡徽标</view>
            <tsm-badge value="label" :is-dot="false" shape="bubble"> </tsm-badge>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">large尺寸</text>
        <view class="badge-group">
          <view class="badge-group__item">
            <view class="badge-group__item-title">红点徽标</view>
            <tsm-badge size="large" value="99" :is-dot="true"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">数字徽标</view>
            <tsm-badge size="large" value="99" :is-dot="false" shape="circle"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">三角徽标</view>
            <tsm-badge size="large" value="label" :is-dot="false" shape="ribbon-right"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">圆角徽标</view>
            <tsm-badge size="large" value="label" :is-dot="false" shape="ribbon-round"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">气泡徽标</view>
            <tsm-badge size="large" value="label" :is-dot="false" shape="bubble"> </tsm-badge>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">不同主题</text>
        <view class="badge-group">
          <view class="badge-group__item">
            <view class="badge-group__item-title">红点徽标</view>
            <tsm-badge size="large" value="99" :is-dot="true"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">数字徽标</view>
            <tsm-badge size="large" value="9" :is-dot="false" shape="circle"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">三角徽标</view>
            <tsm-badge size="large" theme="warning" value="label" :is-dot="false" shape="ribbon-right"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">圆角徽标</view>
            <tsm-badge size="large" theme="primary" value="label" :is-dot="false" shape="ribbon-round"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">气泡徽标</view>
            <tsm-badge size="large" theme="success" value="label" :is-dot="false" shape="bubble"> </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">气泡徽标</view>
            <tsm-badge size="large" theme="info" value="label" :is-dot="false" shape="bubble"> </tsm-badge>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">数值的格式化处理</text>
        <view class="badge-group">
          <view class="badge-group__item">
            <tsm-badge shape="circle" number-type="overflow" :max="99" value="999"> </tsm-badge>
            <tsm-badge shape="circle" number-type="ellipsis" value="99999"> </tsm-badge>
            <tsm-badge shape="circle" number-type="limit" value="990009"> </tsm-badge>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">不同形状+主题+mode</text>
        <view v-for="s in shape" :key="s">
          <view class="shape-title">{{ s }}</view>
          <view class="badge-group">
            <view v-for="t in theme" :key="t" class="badge-group__item">
              <view class="badge-group__item-title">{{ t }}</view>
              <view class="badge-size-group">
                <tsm-badge
                  size="medium"
                  :theme="t"
                  mode="default"
                  :value="s === 'circle' ? 99 : 'label'"
                  :is-dot="false"
                  :shape="s"
                ></tsm-badge>
                <tsm-badge
                  size="medium"
                  :theme="t"
                  mode="light"
                  :value="s === 'circle' ? 99 : 'label'"
                  :is-dot="false"
                  :shape="s"
                ></tsm-badge>
                <tsm-badge
                  size="large"
                  :theme="t"
                  mode="default"
                  :value="s === 'circle' ? 99 : 'label'"
                  :is-dot="false"
                  :shape="s"
                ></tsm-badge>
                <tsm-badge
                  size="large"
                  :theme="t"
                  mode="light"
                  :value="s === 'circle' ? 99 : 'label'"
                  :is-dot="false"
                  :shape="s"
                ></tsm-badge>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">不同主题</text>
        <view class="badge-group">
          <view class="badge-group__item">
            <view class="badge-group__item-title">红点徽标</view>
            <tsm-badge value="99" :is-dot="true">
              <view class="badge-group__item-block"></view>
            </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">数字徽标</view>
            <tsm-badge value="9" :is-dot="false" shape="circle">
              <view class="badge-group__item-block"></view>
            </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">三角徽标</view>
            <tsm-badge theme="warning" value="label" :offset="[-10, 10]" :is-dot="false" shape="ribbon-right">
              <view class="badge-group__item-block"></view>
            </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">圆角徽标</view>
            <tsm-badge theme="primary" value="label" :is-dot="false" shape="ribbon-round">
              <view class="badge-group__item-block"></view>
            </tsm-badge>
          </view>
          <view class="badge-group__item">
            <view class="badge-group__item-title">气泡徽标</view>
            <tsm-badge theme="success" value="label" :is-dot="false" shape="bubble">
              <view class="badge-group__item-block"></view>
            </tsm-badge>
          </view>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script lang="ts" setup>
const theme = ['', 'primary', 'success', 'warning', 'info'];
const shape = ['circle', 'ribbon-right', 'ribbon-round', 'bubble'];
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #666;
}

.badge-group {
  @include tsm-flex-wrap-gap-container(15px);
}

.badge-group__item {
  @include tsm-flex-wrap-gap-item(15px);
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;
}

.badge-group__item-block {
  width: 40px;
  height: 40px;
  background-color: #999;
}
.badge-group__item-title {
  color: var(--Text---tem-text-color-primary, rgba(0, 0, 0, 0.85));

  /* Body/m */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-m);
  font-style: normal;
  font-weight: var(-tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m); /* 157.143% */
}
.shape-title {
  font-size: 18px;
  font-weight: bold;
  margin: 16px 0 8px;
  color: #333;
}

.badge-size-group {
  display: flex;
  gap: 8px;
}

.event-log {
  margin-top: 20px;
  font-size: 20px;
  color: #999;
}
</style>
