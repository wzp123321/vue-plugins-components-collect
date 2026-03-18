<template>
  <te-config-provider :locale="zhCn">
    <router-view v-slot="{ Component }">
      <transition name="te-fade-in-linear">
        <component :is="Component" />
      </transition>
    </router-view>
  </te-config-provider>
</template>

<script lang="ts" setup>
// @ts-ignore
import zhCn from '@tiansu/element-plus/dist/locale/zh-cn.mjs';

defineOptions({
  name: 'App',
});
</script>
