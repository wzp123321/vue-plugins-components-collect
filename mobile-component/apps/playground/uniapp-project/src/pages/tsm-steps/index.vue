<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="section">
        <text class="section-title">横向非简洁风格</text>
        <tsm-steps :current="currentIndex" direction="horizontal" :simple="false">
          <tsm-steps-item
            v-for="item in data"
            :title="item.title"
            :description="item.description"
            :status="item.status || undefined"
          />
        </tsm-steps>
      </view>
      <view class="section">
        <text class="section-title">横向简洁风格</text>
        <tsm-steps :current="currentIndex" direction="horizontal" :simple="true">
          <tsm-steps-item
            v-for="item in data"
            :title="item.title"
            :description="item.description"
            :status="item.status || undefined"
          />
        </tsm-steps>
      </view>
      <view class="section">
        <text class="section-title">竖向非简洁风格</text>
        <tsm-steps :current="currentIndex" direction="vertical" :simple="false" style="height: 300px">
          <tsm-steps-item
            v-for="item in data"
            :title="item.title"
            :description="item.description"
            :status="item.status || undefined"
          />
        </tsm-steps>
      </view>
      <view class="section">
        <text class="section-title">竖向简洁风格</text>
        <tsm-steps :current="currentIndex" direction="vertical" :simple="true" style="height: 300px">
          <tsm-steps-item
            v-for="item in data"
            :title="item.title"
            :description="item.description"
            :status="item.status || undefined"
          />
        </tsm-steps>
      </view>

      <view class="section">
        <text class="section-title">当前步骤: {{ currentIndex }}</text>
        <button @tap="prevStep" class="btn">上一步</button>
        <button @tap="nextStep" class="btn">下一步</button>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const data = ref<{ title: string; description: string; status?: 'error' | undefined }[]>([
  { title: '填写信息', description: '填写订单基本信息' },
  {
    title: '身份认证',
    description:
      '完成实名认证完成实名认证完成实名认证完成实名认证完成实名认证完成实名认证完成实名认证完成实名认证完成实名认证完成实名认证完成实名认证完成实名认证完成实名认证',
  },
  { title: '额度评估', description: '评估信用额度', status: 'error' },
  { title: '开通成功', description: '贷款开通成功' },
]);
const currentIndex = ref(2);

const prevStep = () => {
  if (currentIndex.value > 1) {
    currentIndex.value--;
  }
};

const nextStep = () => {
  if (currentIndex.value < 4) {
    currentIndex.value++;
  }
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.btn {
  padding: 10px 20px;
  background-color: #6172f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}
</style>
