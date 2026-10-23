<template>
  <te-radio-group v-model="size">
    <te-radio label="large">Large</el-radio>
    <el-radio>Default</el-radio>
    <te-radio label="small">Small</el-radio>
  </el-radio-group>

  <te-descriptions
    class="margin-top"
    title="With border"
    :column="3"
    :size="size"
    border
  >
    <template #extra>
      <te-button type="primary">Operation</el-button>
    </template>
    <te-descriptions-item>
      <template #label>
        <div class="cell-item">
          <te-icon :style="iconStyle">
            <user />
          </el-icon>
          Username
        </div>
      </template>
      kooriookami
    </te-descriptions-item>
    <te-descriptions-item>
      <template #label>
        <div class="cell-item">
          <te-icon :style="iconStyle">
            <iphone />
          </el-icon>
          Telephone
        </div>
      </template>
      18100000000
    </te-descriptions-item>
    <te-descriptions-item>
      <template #label>
        <div class="cell-item">
          <te-icon :style="iconStyle">
            <location />
          </el-icon>
          Place
        </div>
      </template>
      Suzhou
    </te-descriptions-item>
    <te-descriptions-item>
      <template #label>
        <div class="cell-item">
          <te-icon :style="iconStyle">
            <tickets />
          </el-icon>
          Remarks
        </div>
      </template>
      <te-tag size="small">School</el-tag>
    </te-descriptions-item>
    <te-descriptions-item>
      <template #label>
        <div class="cell-item">
          <te-icon :style="iconStyle">
            <office-building />
          </el-icon>
          Address
        </div>
      </template>
      No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province
    </te-descriptions-item>
  </te-descriptions>

  <te-descriptions
    class="margin-top"
    title="Without border"
    :column="3"
    :size="size"
    :style="blockMargin"
  >
    <template #extra>
      <te-button type="primary">Operation</el-button>
    </template>
    <te-descriptions-item label="Username">kooriookami</te-descriptions-item>
    <te-descriptions-item label="Telephone">18100000000</te-descriptions-item>
    <te-descriptions-item label="Place">Suzhou</te-descriptions-item>
    <te-descriptions-item label="Remarks">
      <te-tag size="small">School</el-tag>
    </te-descriptions-item>
    <te-descriptions-item label="Address"
      >No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province
    </te-descriptions-item>
  </te-descriptions>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  User,
} from '@element-plus/icons-vue'

const size = ref('')
const iconStyle = computed(() => {
  const marginMap = {
    large: '8px',
    default: '6px',
    small: '4px',
  }
  return {
    marginRight: marginMap[size.value] || marginMap.default,
  }
})
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
.cell-item {
  display: flex;
  align-items: center;
}
.margin-top {
  margin-top: 20px;
}
</style>
