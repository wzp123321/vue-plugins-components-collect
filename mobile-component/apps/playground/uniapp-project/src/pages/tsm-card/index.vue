<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="general">
        <text>card 基本用法</text>
        <tsm-card
          title="标题"
          subTitle="副标题"
          @info="uni.showToast({ title: '点击了info按钮' })"
          @more="uni.showToast({ title: '点击了more按钮' })"
          @option="uni.showToast({ title: '点击了option按钮' })"
        >
          <view>
            <text>card内容</text>
          </view>
        </tsm-card>
      </view>
      <view class="general">
        <text>隐藏info icon</text>
        <tsm-card
          title="标题"
          subTitle="副标题"
          :showInfoIcon="false"
          @info="uni.showToast({ title: '点击了info按钮' })"
          @more="uni.showToast({ title: '点击了more按钮' })"
          @option="uni.showToast({ title: '点击了option按钮' })"
        >
          <view>
            <text>card内容</text>
          </view>
        </tsm-card>
      </view>
      <view class="general">
        <text>隐藏更多面板</text>
        <tsm-card
          title="标题"
          subTitle="副标题"
          :showMorePanel="false"
          @info="uni.showToast({ title: '点击了info按钮' })"
          @more="uni.showToast({ title: '点击了more按钮' })"
          @option="uni.showToast({ title: '点击了option按钮' })"
        >
          <view>
            <text>card内容</text>
          </view>
        </tsm-card>
      </view>
      <view class="general">
        <text>隐藏操作面板</text>
        <tsm-card
          title="标题"
          subTitle="副标题"
          :showOptionPanel="false"
          @info="uni.showToast({ title: '点击了info按钮' })"
          @more="uni.showToast({ title: '点击了more按钮' })"
          @option="uni.showToast({ title: '点击了option按钮' })"
        >
          <view>
            <text>card内容card内容card内容card内容card内容card内容card内容card内容card内容</text>
          </view>
        </tsm-card>
      </view>
      <view class="general">
        <text>嵌套卡片</text>
        <tsm-card
          title="外卡片"
          subTitle="副标题"
          @info="uni.showToast({ title: '点击了外卡片info按钮' })"
          @more="uni.showToast({ title: '点击了外卡片more按钮' })"
          @option="uni.showToast({ title: '点击了外卡片option按钮' })"
        >
          <view>
            <tsm-card
              title="内卡片"
              subTitle="副标题"
              @info="uni.showToast({ title: '点击了内卡片info按钮' })"
              @more="uni.showToast({ title: '点击了内卡片more按钮' })"
              @option="uni.showToast({ title: '点击了内卡片option按钮' })"
            >
              <view>
                <text>card内容</text>
              </view>
            </tsm-card>
          </view>
        </tsm-card>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.general {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
