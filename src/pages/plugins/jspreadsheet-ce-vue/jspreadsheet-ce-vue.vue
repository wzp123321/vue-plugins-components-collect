<template>
  <div class="jspreadsheet-ce-vue">
    <div>
      <button @click="getTableData">获取数据</button>
    </div>
    <div ref="jspreadsheetRef" :id="jspreadsheetContainerId" @load="handleDataLoad"></div>
  </div>
</template>
<script lang="ts">
import { computed, onMounted, ref, defineComponent } from 'vue';
import jspreadsheet from 'jspreadsheet-ce';

import { Jcv_ITableStore } from './jspreadsheet-ce-vue.api';

export default defineComponent({
  setup() {
    //#region
    const jspreadsheetRef = ref<any>(null);
    const jspreadsheetInstance = ref<any>(null);
    const jspreadsheetContainerId = computed(() => {
      return `jspreadsheetContainer_${(Math.random() * 10000000).toFixed(0)}`;
    });
    const pagination = ref({
      page: 1,
      pageSize: 30,
    });
    const tableStore = ref<Jcv_ITableStore>({
      rowIndex: 0,
      columnKey: '',
      originValue: '',
    });
    //#endregion

    const data = [
      ['Mazda', 2001, '2023-01-01', '', 'New', 'red', 'true'],
      ['Mazda1', 2001, '2023-01-01', '', 'New', 'red', 'true'],
      ['Mazda2', 2001, '2023-01-01', '', 'New', 'red', 'true'],
      ['Mazd3a', 2001, '2023-01-01', '', 'New', 'red', 'true'],
      ['Mazda4', 2001, '2023-01-01', '', 'New', 'red', 'true'],
      ['Maz5da', 2001, '2023-01-01', '', 'New', 'red', 'true'],
    ];

    function getTableData() {
      if (jspreadsheetInstance.value) {
        console.log(jspreadsheetInstance.value?.getData());
      }
    }

    // 右击
    function handleContextMenu(obj: any, x: any, y: any, e: any) {
      console.log(`----`, obj.options);
      var items = [];

      if (y == null) {
      } else {
        // Insert new row
        if (obj.options.allowInsertRow == true) {
          items.push({
            title: '在此前插入行',
            onclick: function () {
              obj.insertRow(1, parseInt(y), 1);
            },
          });

          items.push({
            title: '在此后插入行',
            onclick: function () {
              obj.insertRow(1, parseInt(y));
            },
          });
        }

        if (obj.options.allowDeleteRow == true) {
          items.push({
            title: '删除选中行',
            onclick: function () {
              obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
            },
          });
        }
      }
      // Line
      items.push({ type: 'line' });
      // About
      if (obj.options.about) {
        items.push({
          title: '关于',
          onclick: function () {
            alert(obj.options.about);
          },
        });
      }

      return items;
    }
    // 选择单元格
    function handleColumnSelect(instance: HTMLElement, x1: number, y1: number, x2: number, y2: number) {
      console.log('选择单元格------------------------', instance, x1, x2, y1, y2, jspreadsheetInstance.value);
    }
    // 插入行
    function handleInsertRow(instance: HTMLElement) {
      console.log('插入行------------------------', instance);
    }
    // 删除行
    function handleDeleteRow(instance: HTMLElement) {
      console.log('删除行------------------------', instance);
    }

    // Methods
    function handleDataLoad() {
      console.log(121);
    }

    onMounted(() => {
      jspreadsheetInstance.value = jspreadsheet(
        document.getElementById(jspreadsheetContainerId.value) as HTMLTableElement,
        {
          data: data,
          pagination: pagination.value.pageSize,
          allowInsertRow: true, // 启用插入行
          allowDeleteRow: true, // 启用删除
          editable: true, // 启用行内编辑
          copyCompatibility: true, // 启用复制粘贴
          tableOverflow: true, // 表格超过滚动
          columns: [
            { title: 'Model', width: 300, type: 'text' },
            { title: 'Price', width: 80, type: 'numeric' },
            { title: 'Date', width: 100, type: 'calendar', options: { format: 'DD/MM/YYYY' } },
            { title: 'Photo', width: 150, type: 'image' },
            { title: 'Condition', width: 150, type: 'dropdown', source: ['New', 'Used'] },
            { title: 'Color', width: 80, type: 'color' },
            { title: 'Available', width: 80, type: 'checkbox' },
          ],
          rowResize: true,
          contextMenu: handleContextMenu, // 右击事件
          onselection: handleColumnSelect, // 选择单元格
          oninsertrow: handleInsertRow, // 行插入触发函数
          ondeleterow: handleDeleteRow, // 行删除触发函数
        },
      );
    });

    return {
      jspreadsheetRef,
      jspreadsheetContainerId,

      handleDataLoad,
      getTableData,
    };
  },
});
</script>
<style lang="less" scoped>
.jspreadsheet-ce-vue {
  width: 100%;
  height: 100%;

  overflow: hidden;
}
</style>
