<template>
  <te-space-select v-model="selectedArr" tenantId="" axios="" :multiple="true"></te-space-select>
</template>

<script lang="ts" setup>
import { TeSpaceSelect } from '@ts-web-package/components/lib/te-space-select';
import { ref, onMounted } from 'vue';

const selectedArr = ref<string[]>([]);

onMounted(async () => {
  selectedArr.value = ['rrhh2'];
});
</script>
<script lang="ts">
export default {
  name: 'te-space-select',
};
</script>
<style scoped lang="scss"></style>
