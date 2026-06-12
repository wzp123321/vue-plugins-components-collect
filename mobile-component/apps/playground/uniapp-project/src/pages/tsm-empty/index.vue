<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="section">
        <text class="section-title">默认空状态(noData)</text>
        <tsm-empty title="暂无数据" />
      </view>

      <view class="section">
        <text class="section-title">无网络(noInternet)</text>
        <tsm-empty
          type="noInternet"
          title="无网络"
          description="请检查网络设置"
          buttonText="刷新"
          @btnClick="handleRefresh"
        />
      </view>

      <view class="section">
        <text class="section-title">无搜索结果(noSearch)</text>
        <tsm-empty
          type="noSearch"
          title="无搜索结果"
          description="换个关键词试试"
          buttonText="重新搜索"
          @btnClick="handleRefresh"
        />
      </view>

      <view class="section">
        <text class="section-title">无权限(noAuthority)</text>
        <tsm-empty
          type="noAuthority"
          title="无权限"
          description="您暂无权限访问该内容"
          buttonText="联系管理员"
          @btnClick="handleRefresh"
        />
      </view>

      <view class="section">
        <text class="section-title">加载失败(loadingError)</text>
        <tsm-empty
          type="loadingError"
          title="加载失败"
          description="网络不给力，请稍后再试"
          buttonText="重新加载"
          @btnClick="handleRefresh"
        />
      </view>

      <view class="section">
        <text class="section-title">无消息(noMessage)</text>
        <tsm-empty type="noMessage" title="暂无消息" description="暂时没有新消息" />
      </view>

      <view class="section">
        <text class="section-title">无图片(noImage)</text>
        <tsm-empty type="noImage" title="暂无图片" description="还没有上传图片" />
      </view>

      <view class="section">
        <text class="section-title">成功提示(successTips)</text>
        <tsm-empty type="successTips" title="提交成功" description="您的信息已提交成功" />
      </view>

      <!-- 区块场景 -->
      <view class="section">
        <text class="section-title">区块场景-noData(block)</text>
        <tsm-empty type="noData" scene="block" description="暂无数据" />
      </view>

      <view class="section">
        <text class="section-title">区块场景-noSearch(block)</text>
        <tsm-empty type="noSearch" scene="block" description="暂无搜索结果" />
      </view>

      <view class="section">
        <text class="section-title">区块场景-noAuthority(block)</text>
        <tsm-empty type="noAuthority" scene="block" description="无权访问" />
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
const handleRefresh = () => {
  console.log('点击了刷新按钮');
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
