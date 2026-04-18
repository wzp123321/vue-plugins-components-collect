<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="section">
        <text class="section-title">默认样式</text>
        <tsm-tabbar v-model="activeIndex1" :fixed="false" @change="onChange1">
          <tsm-tabbar-item text="首页东动" :icon="IconAlarmFill" @click="onClick1" />
          <tsm-tabbar-item text="分类商品" :icon="IconCollection" :badge="5" />
          <tsm-tabbar-item text="购物车子" :icon="IconArithmetic" :badge="5" badgeType="circle" />
          <tsm-tabbar-item text="我的详情" :icon="IconBuiltUpArea" :badge="256" badgeType="circle" />
        </tsm-tabbar>
      </view>

      <view class="section">
        <text class="section-title">胶囊样式</text>
        <tsm-tabbar v-model="activeIndex2" :fixed="false" bgColor="capsule" @change="onChange2">
          <tsm-tabbar-item text="首页" :icon="IconArithmetic" />
          <tsm-tabbar-item text="分类" :icon="IconCollection" />
          <tsm-tabbar-item text="购物车" :icon="IconArithmetic" badge="100" />
          <tsm-tabbar-item text="消息" :icon="IconArithmetic" />
        </tsm-tabbar>
      </view>

      <view class="section">
        <text class="section-title">固定底部</text>
        <tsm-tabbar v-model="activeIndex3" @change="onChange3">
          <tsm-tabbar-item text="首页" :icon="IconAlarmFill" />
          <tsm-tabbar-item text="分类" :icon="IconCollection" />
          <tsm-tabbar-item text="购物车" :icon="IconArithmetic" />
          <tsm-tabbar-item text="我的" :icon="IconBuiltUpArea" />
        </tsm-tabbar>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IconCollection from '@/uni_modules/@tiansu/ts-icon/mobile/vue/icon-collection';
import IconAlarmFill from '@/uni_modules/@tiansu/ts-icon/mobile/vue/icon-alarm-fill';
import IconArithmetic from '@/uni_modules/@tiansu/ts-icon/mobile/vue/icon-arithmetic';
import IconBuiltUpArea from '@/uni_modules/@tiansu/ts-icon/mobile/vue/icon-built-up-area';
const activeIndex1 = ref(0);
const activeIndex2 = ref(1);
const activeIndex3 = ref(2);

const onClick1 = () => {
  console.log('点击了首页东动');
};

const onChange1 = (index: number) => {
  console.log('默认样式 tabbar 切换到:', index);
};

const onChange2 = (index: number) => {
  console.log('胶囊样式 tabbar 切换到:', index);
};

const onChange3 = (index: number) => {
  console.log('非固定样式 tabbar 切换到:', index);
};
</script>

<style scoped>
.container {
  padding: 20px;
  padding-bottom: 100px;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}
</style>
