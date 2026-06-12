<template>
  <tsm-theme-provider>
    <tsm-pull-refresh :loading="loading" @refresh="onRefresh">
      <view style="background: red">
        <view class="item" v-for="item in nums">{{ item }}</view>
      </view>
    </tsm-pull-refresh>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const nums = ref('21321111111111111111111111111111111111111111111111111111111111111111111');
const loading = ref(false);
const onRefresh = () => {
  console.log(21312);
  loading.value = true;
  setTimeout(() => {
    nums.value = '90909090239012930219302193021390129302139021930219302193021930219301293019301293019302193021';
    loading.value = false;
  }, 3000);
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';
.item {
  height: 30px;
  line-height: 30px;
  text-align: center;
  margin: 10px;
  background: yellow;
}
</style>
