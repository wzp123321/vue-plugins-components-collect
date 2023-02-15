<template>
  <div class="jspreadsheet-ce-vue">
    <!-- https://codesandbox.io/embed/vue-default-template-p4hwn -->
    <!-- https://codesandbox.io/s/vue3-spreadsheet-with-actions-chx7dw?file=/src/components/Jspreadsheet.vue -->
    <div :id="jspreadsheetContainerId"></div>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import jspreadsheet from 'jspreadsheet-ce';

const jspreadsheetContainerId = computed(() => {
  return `jspreadsheetContainer_${(Math.random() * 10000000).toFixed(0)}`;
});

const data = [
  ['Mazda', 2001, '2023-01-01', '', 'New', 'red', 'true'],
  ['Mazda', 2001, '2023-01-01', '', 'New', 'red', 'true'],
  ['Mazda', 2001, '2023-01-01', '', 'New', 'red', 'true'],
  ['Mazda', 2001, '2023-01-01', '', 'New', 'red', 'true'],
  ['Mazda', 2001, '2023-01-01', '', 'New', 'red', 'true'],
  ['Mazda', 2001, '2023-01-01', '', 'New', 'red', 'true'],
];

onMounted(() => {
  jspreadsheet(document.getElementById(jspreadsheetContainerId.value) as HTMLTableElement, {
    data: data,
    columns: [
      { title: 'Model', width: 300, type: 'text' },
      { title: 'Price', width: 80, type: 'numeric' },
      { title: 'Date', width: 100, type: 'calendar', options: { format: 'DD/MM/YYYY' } },
      { title: 'Photo', width: 150, type: 'image' },
      { title: 'Condition', width: 150, type: 'dropdown', source: ['New', 'Used'] },
      { title: 'Color', width: 80, type: 'color' },
      { title: 'Available', width: 80, type: 'checkbox' },
    ],
  });
});
</script>
<style lang="less" scoped>
.jspreadsheet-ce-vue {
  width: 100%;
  height: 100%;

  overflow: hidden;
}
</style>
