<template>
  <view class="container">
    遮罩：
    <tem-loading
      :showIcon="true"
      loadingText="加载中..."
      :mask="true"
      layout="horizontal"
      type="circular"
      size="small"
      :loading="loading"
    >
    </tem-loading>
    <tem-loading
      :showIcon="true"
      :mask="true"
      layout="vertical"
      type="circular"
      size="small"
    >
    </tem-loading>
    垂直：
    <tem-loading
      :showIcon="true"
      loadingText="加载中..."
      layout="vertical"
      type="circular"
      size="medium"
    >
    </tem-loading>
    水平：
    <tem-loading
      :showIcon="true"
      loadingText="加载中..."
      layout="horizontal"
      type="circular"
      size="medium"
    >
    </tem-loading>
  </view>
</template>

<script>
// import { TemLoading } from '@tiansu/ts-mobile-package';
export default {
  // components: { TemLoading },
  data() {
    return {
      loading: false,
    };
  },
  mounted() {
    setTimeout(() => {
      console.log('🚀 ~ 开始加载 ~ 82行');
      this.loading = true;
      setTimeout(() => {
        console.log('🚀 ~ 加载结束 ~ 85行');
        this.loading = false;
      }, 2000);
    }, 2000);
  },
  onReady() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  display: grid;
  padding: 50px;
  gap: 10px;
  align-items: center;
  box-sizing: border-box;
  .text {
    height: 200rpx;
  }
}
</style>
