<template>
  <TeAlarmAffix
    ref="teAlarmAffixRef"
    system-code="ims"
    :spaceCodeList="spaceCodeList"
    user-name="admin11"
    :axios-instance="axiosInstance"
    @config-saved="onAffixConfigSaved"
    @mute-saved="onAffixConfigSaved"
  />
  <!-- <HomeRealtimeAlarmNew></HomeRealtimeAlarmNew> -->
</template>
<script setup lang="ts">
// import HomeRealtimeAlarmNew from './homeRealtimeAlarmNew.vue';
import { TeAlarmAffix } from '@/components/lib';
import { ref } from 'vue';
import axios from 'axios';

const spaceCodeList = ref([
  'TZSZ07',
  'TZSZ01',
  'TZSZ02',
  'TZSZ03',
  'TZSZ08',
  'TZSZ10',
  'TZSZ12',
  'TZSZ13',
  'TZSZ14',
  'TZSZ15',
  'TZSZ16',
  'TZSZ19',
  'TZSZ20',
  'TZSZ21',
]);

const onAffixConfigSaved = () => {};

const getHeaders = () => {
  // 防重放攻击
  return {
    tenantCode: '700',
    'ts-token':
      '4b8fe705962c48428199a4ddd622dca0de4a53ea7715a2bb22e85291d7ae380f1784793527637',
    loginName: 'wanzhipeng',
    'ts-repeat': 'authorization',
    empId: '936899492619584',
    empName: '%E4%B8%87%E7%9B%B4%E9%B9%8F',
    userId: '936899492889920',
    userName: encodeURIComponent('万直鹏'),
  };
};

/**
 * demo 演示用 axios 实例
 * - 真实业务系统应注入统一 axios（带 baseURL / 拦截器 / token 等）
 * - demo 中 mock 默认开启，axios 不会被真正调用，但仍要求传一个合法实例
 */
const axiosInstance = axios.create({
  baseURL: '/',
  timeout: 30000,
  headers: getHeaders(),
});
</script>

<style scoped lang="less">
.wrap {
  display: flex;
  flex-direction: row;
  height: 500px;
}
.right-content {
  background: rgb(16, 142, 233);
  width: 100%;
  height: 100%;
}
</style>
