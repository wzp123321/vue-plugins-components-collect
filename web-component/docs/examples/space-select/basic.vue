<template>
  <te-space-select :allowSelectAllLevels="allowSelectAllLevels" tenantId="" axios=""></te-space-select>
</template>

<script lang="ts" setup>
import { TeSpaceSelect } from '@ts-web-package/components/lib/te-space-select';
import { reactive } from 'vue';
const allowSelectAllLevels = reactive({
  campus: true,
  building: false,
  buildingPart: false,
  floor: true,
  floorPart: true,
  room: true,
  roomPart: true,
});
</script>
<script lang="ts">
export default {
  name: 'te-space-select',
};
</script>
<style scoped lang="scss"></style>
