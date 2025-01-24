<template>
  <div class="demo">
    <iframe :src="pageSrc"></iframe>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const pageSrc = ref('');

onMounted(() => {
  pageSrc.value = `http://localhost:8080${route.path}?tenantCode=777&loginName=admin`;
});
</script>
<style lang="less" scoped>
.demo {
  height: 100%;

  iframe {
    width: 100%;
    height: 100%;
  }
}
</style>
