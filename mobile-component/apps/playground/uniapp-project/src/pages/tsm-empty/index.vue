<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="section">
        <text class="section-title">默认空状态</text>
        <tsm-empty />
      </view>

      <view class="section">
        <text class="section-title">带描述的空状态</text>
        <tsm-empty
          type="noInternet"
          title="无网络"
          description="请检查网络设置"
          buttonText="刷新"
          @btnClick="handleRefresh"
        />
      </view>

      <view class="section">
        <text class="section-title">区块场景的空状态</text>
        <tsm-empty type="noSearch" scene="block" description="请稍后再试" :button="false" />
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
const handleRefresh = () => {
  console.log('点击了刷新按钮');
  // 这里可以添加刷新逻辑
};
</script>

<style scoped>
.container {
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  align-self: flex-start;
}
</style>
