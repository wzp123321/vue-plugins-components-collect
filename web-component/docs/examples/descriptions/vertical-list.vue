<template>
  <te-radio-group v-model="size">
    <te-radio label="large">Large</te-radio>
    <te-radio>Default</te-radio>
    <te-radio label="small">Small</te-radio>
  </te-radio-group>

  <te-descriptions
    title="Vertical list with border"
    direction="vertical"
    :column="4"
    :size="size"
    border
  >
    <te-descriptions-item label="Username">kooriookami</te-descriptions-item>
    <te-descriptions-item label="Telephone">18100000000</te-descriptions-item>
    <te-descriptions-item label="Place" :span="2">Suzhou</te-descriptions-item>
    <te-descriptions-item label="Remarks">
      <te-tag size="small">School</te-tag>
    </te-descriptions-item>
    <te-descriptions-item label="Address"
      >No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province
    </te-descriptions-item>
  </te-descriptions>

  <te-descriptions
    title="Vertical list without border"
    :column="4"
    :size="size"
    direction="vertical"
    :style="blockMargin"
  >
    <te-descriptions-item label="Username">kooriookami</te-descriptions-item>
    <te-descriptions-item label="Telephone">18100000000</te-descriptions-item>
    <te-descriptions-item label="Place" :span="2">Suzhou</te-descriptions-item>
    <te-descriptions-item label="Remarks">
      <te-tag size="small">School</te-tag>
    </te-descriptions-item>
    <te-descriptions-item label="Address"
      >No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province
    </te-descriptions-item>
  </te-descriptions>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const size = ref('')
const blockMargin = computed(() => {
  const marginMap = {
    large: '32px',
    default: '28px',
    small: '24px',
  }
  return {
    marginTop: marginMap[size.value] || marginMap.default,
  }
})
</script>

<style scoped>
.te-descriptions {
  margin-top: 20px;
}
</style>
