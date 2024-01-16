<template>
  <te-drawer :size="formulaView.size" :title="title" v-model="visible" direction="btt">
    <template #default>
      <div class="pv-formula-view" v-loading="formulaView.loading">
        <pfv-service-data
          v-if="formulaView.serviceDataIndexList?.length"
          :serviceDataList="formulaView.serviceDataIndexList"
        ></pfv-service-data>
        <pfv-condition-group
          v-if="formulaView.groupList?.length"
          :groupList="formulaView.groupList"
        ></pfv-condition-group>
        <!-- 缺省 -->
        <no-data v-if="!formulaView.serviceDataIndexList?.length && !formulaView.groupList?.length"></no-data>
      </div>
    </template>
  </te-drawer>
</template>
<script lang="ts" setup>
// 公共库
import { ref } from 'vue';
import { useStore } from 'vuex';
// 组件
import PfvConditionGroup from './components/pfv-condition-group/pfv-condition-group.vue';
import PfvServiceData from './components/pfv-service-data/pfv-service-data.vue';
import { PM_EGrainSharingObject, PM_EGrainSharingType } from '@/pages/project-manage/constant/enum';
// 服务
import formulaView from './pv-formula-view.service';
// store
const store = useStore();
// 开关
const visible = ref<boolean>(false);
// 标题
const title = ref<string>('');
/**
 * 打开抽屉
 * @param {PM_EGrainSharingObject} mode 收益分享模式
 * @param {PM_EGrainSharingType} type 收益分享类型
 * @returns {void}
 */
const handleShow = (mode: PM_EGrainSharingObject, type: PM_EGrainSharingType): void => {
  console.log('%c✨✨公式查看✨✨', 'font-size: 24px', mode, type);
  visible.value = true;
  store.dispatch('setGrainSharingMode', mode);
  const map = new Map([
    [PM_EGrainSharingObject['国网/资方'], '国网/资方'],
    [PM_EGrainSharingObject.院方, '院方'],
    [PM_EGrainSharingObject.天溯, '天溯'],
  ]);
  title.value = `查看收益分享(${map.get(mode) ?? '天溯'})`;
  formulaView.queryGroup();
};

defineExpose({
  handleShow,
});
</script>
<style lang="less" scoped></style>
