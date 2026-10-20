<script setup lang="ts">
import { TeConfigProvider } from '@tiansu/element-plus';
import { TeDateSwitch } from '@ts-web-package/components/lib/te-date-switch';
// import "@/components/styles/index.scss";
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { ref, onMounted, watch } from 'vue';

const dateSwitchRef = ref();
const yearValue = ref('2024');

// 接收日期变更事件参数
const handleDateChange = (date: string) => {
  console.log('🚀 ~ handleDateChange ~ date:', date);
};

// 向前
const handleForward = (date: string) => {
  console.log('🚀 ~ handleForward ~ date:', date);
};

// 向后
const handleBackward = (date: string) => {
  console.log('🚀 ~ handleBackward ~ date:', date);
};

onMounted(() => {
  console.log(
    '🚀 ~ onMounted ~ dateSwitchRef.value.currentDate: 这是日期选择器里默认的日期',
    dateSwitchRef.value.currentDate,
  );
});

watch(yearValue, (value) => {
  console.log('value', value);
});
</script>

<template>
  <section class="edit-table">
    <te-config-provider :locale="zhCn">
      <te-date-switch
        v-model="yearValue"
        ref="dateSwitchRef"
        type="year"
        format="YYYY"
        valueFormat="YYYY"
        :forwardLimit="false"
        @forward="handleForward"
        @backward="handleBackward"
        @dateChange="handleDateChange"
      >
      </te-date-switch>
    </te-config-provider>
  </section>
</template>
<style lang="scss" scoped>
.edit-table {
  width: 100%;

  .submit-button {
    width: 100%;
    text-align: center;
    margin-top: var(--te-space-20);
  }
}
</style>
