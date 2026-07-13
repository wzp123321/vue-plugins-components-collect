<template>
  <div
    class="tptv-item tptv-item-table"
    :style="{
      left: `${item.x}mm`,
      top: `${item.y}mm`,
      width: `${item.width}mm`,
      height: `${item.height}mm`,
    }"
  >
    <table>
      <thead v-if="(item as any).header?.length">
        <tr>
          <th v-for="(h, i) in (item as any).header" :key="i" :style="{ width: `${colWidths[i]}%` }">
            {{ h }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in (item as any).rows || []" :key="ri">
          <td v-for="(c, ci) in row" :key="ci" :style="{ width: `${colWidths[ci]}%` }">
            {{ c }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{ item: any }>();
const colWidths = computed(() => {
  const cols = (props.item.header as string[])?.length || 1;
  return new Array(cols).fill(100 / cols);
});
</script>

<style lang="less" scoped>
.tptv-item-table {
  position: absolute;
  font-size: 3mm;
  overflow: hidden;

  table {
    width: 100%;
    height: 100%;
    border-collapse: collapse;

    th, td {
      border: 0.2mm solid #333;
      padding: 0.5mm 1mm;
      text-align: left;
    }
    th { background: #f0f0f0; font-weight: bold; }
  }
}
</style>
