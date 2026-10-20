<template>
  <te-space-select :show-all-levels="false" tenantId="" axios=""></te-space-select>
</template>

<script lang="ts" setup>
import { TeSpaceSelect } from '@ts-web-package/components/lib/te-space-select';
import { TeButton } from '@tiansu/element-plus';
import { ref } from 'vue';
</script>
<script lang="ts">
export default {
  name: 'te-space-select',
};
</script>
<style scoped lang="scss"></style>
