<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Avatar 头像</text>
      </view>

      <view class="demo-card">
        <view class="demo-grid">
          <view class="demo-item">
            <tsm-avatar type="picture" :src="pictureUrl" />
            <text class="demo-item__label">正常</text>
          </view>
          <view class="demo-item">
            <tsm-badge :offset="[-5, 5]" :is-dot="true">
              <tsm-avatar type="icon">
                <template #icon>
                  <icon-box />
                </template>
              </tsm-avatar>
            </tsm-badge>
            <text class="demo-item__label">结合徽标使用</text>
          </view>
          <view class="demo-item">
            <tsm-avatar type="icon">
              <template #icon>
                <icon-box />
              </template>
            </tsm-avatar>
            <text class="demo-item__label">icon</text>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">Size（picture）</text>
        <view class="demo-grid">
          <view v-for="size in sizes" :key="`pic-${size}`" class="demo-item">
            <tsm-avatar type="picture" :size="size" :src="pictureUrl" />
            <text class="demo-item__label">{{ size }}</text>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">Size（icon）</text>
        <view class="demo-grid">
          <view v-for="size in sizes" :key="`icon-${size}`" class="demo-item">
            <tsm-avatar type="icon" :size="size">
              <template #icon>
                <icon-box />
              </template>
            </tsm-avatar>
            <text class="demo-item__label">{{ size }}</text>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">Type：text</text>
        <view class="demo-grid">
          <view class="demo-item">
            <tsm-avatar type="text" size="xs" text="张三" />
            <text class="demo-item__label">xs（取 1）</text>
          </view>
          <view class="demo-item">
            <tsm-avatar type="text" text="张三" />
            <text class="demo-item__label">2 字（取 2）</text>
          </view>
          <view class="demo-item">
            <tsm-avatar type="text" text="司马相如" />
            <text class="demo-item__label">多字（取后 2）</text>
          </view>
          <view class="demo-item">
            <tsm-avatar type="text" text="李四" bgColor="#E0F2FE" color="#0369A1" borderColor="#0284c7" />
            <text class="demo-item__label">自定义色 + 边框</text>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">AvatarGroup</text>
        <view class="demo-grid demo-grid--wide">
          <view class="demo-item demo-item--wide">
            <tsm-avatar-group :urls="groupUrlsWithBroken" :maxCount="3" @click="onGroupMoreClick" />
            <text class="demo-item__label">maxCount</text>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">AvatarGroup（size）</text>
        <view class="demo-grid demo-grid--wide">
          <view v-for="size in sizes" :key="`group-${size}`" class="demo-item demo-item--wide">
            <tsm-avatar-group :size="size" :urls="groupUrls" />
            <text class="demo-item__label">{{ size }}</text>
          </view>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
const pictureUrl =
  'https://s1.aigei.com/src/img/png/3a/3a3643b6c7244fdcac81503ad91d5314.png?imageMogr2/auto-orient/thumbnail/!282x320r/crop/!282x320a0a0/quality/85/%7CimageView2/2/w/282&e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:edv9hg6dnIA8yyppPwrI9dEsWkM=';

const brokenUrl = 'http://192.168.50.176:10130/web/hlmsPortal/assets/img/header/not-exist.png';

const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;

const groupUrls = [pictureUrl, pictureUrl, pictureUrl, pictureUrl, pictureUrl];

const groupUrlsWithBroken = [pictureUrl, pictureUrl, pictureUrl, brokenUrl, `${brokenUrl}-1`];

const onGroupMoreClick = () => {
  uni.showToast({
    title: '触发 AvatarGroup click',
    icon: 'none',
    duration: 1500,
  });
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 16px;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  padding: 12px 12px 6px;
  margin-bottom: 12px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.subtitle {
  margin-top: 10px;
  font-size: 22px;
  color: #6b7280;
  text-align: center;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 18px 16px 14px;
  margin-bottom: 14px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 14px;
  color: #111827;
}

.demo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 18px;
}

.demo-grid--wide {
  gap: 12px 14px;
}

.demo-item {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.demo-item--wide {
  width: 100%;
  align-items: flex-start;
}

.demo-item__label {
  margin-top: 10px;
  font-size: 20px;
  color: #6b7280;
  line-height: 1.2;
}
</style>
