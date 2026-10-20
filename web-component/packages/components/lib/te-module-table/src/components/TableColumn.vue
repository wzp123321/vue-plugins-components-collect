<!--
 * @Author: yanghui yanghui@tiansu-china.com
 * @Date: 2024-03-27 17:39:24
 * @LastEditors: yanghui yanghui@tiansu-china.com
 * @LastEditTime: 2024-04-19 09:53:35
 * @Description: 
-->
<template>
  <RenderTableColumn v-bind="column" />
</template>

<script setup lang="tsx" name="TableColumn">
import { useSlots } from 'vue';
import { formatValue, handleProp } from '../utils';
import FilterHeader from './FilterHeader.vue';
import { ColumnProps, RenderScope, HeaderRenderScope } from './../interface';

defineProps<{ column: ColumnProps }>();

const slots = useSlots();

// 渲染表格数据
const renderCellData = (item: ColumnProps, scope: RenderScope<any>) => {
  if (item.propFormat && typeof item.propFormat === 'function') {
    return item.propFormat(scope.row[item.prop]);
  } else {
    return formatValue(handleProp(scope.row, item.prop));
  }
};

/**
 * 1、有render函数、优先按照tsx语法渲染
 * 2、有slot，使用插槽渲染
 * 3、都没有，默认渲染
 * 4、表头如果有筛选项的话，目前是直接渲染，不支持插槽或tsx
 */
const RenderTableColumn = (item: ColumnProps) => {
  return (
    <>
      {
        <te-table-column
          {...item}
          align={item.align ?? 'left'}
          prop={item.prop}
          showOverflowTooltip={
            item.showOverflowTooltip ?? item.prop !== 'operation'
          }
        >
          {{
            default: (scope: RenderScope<any>) => {
              if (item._children) {
                return item._children.map(
                  (child) => child.checked && RenderTableColumn(child),
                );
              }
              if (item.render) {
                return item.render(scope);
              }
              {
                if (slots[`${item.prop}`]) {
                  return slots[`${item.prop}`]?.(scope);
                }
              }
              return renderCellData(item, scope);
            },
            header: (scope: HeaderRenderScope<any>) => {
              if (item.filterList) {
                return (
                  <FilterHeader
                    column={item}
                    filterList={item.filterList}
                  ></FilterHeader>
                );
              }
              if (item.headerRender) {
                return item.headerRender(scope);
              }
              if (slots[`${item.prop}Header`]) {
                return slots[`${item.prop}Header`]?.(scope);
              }
              return item.label;
            },
            titleSuffi: (scope: HeaderRenderScope<any>) => {
              if (slots[`${item.prop}-title-suffi`]) {
                return slots[`${item.prop}-title-suffi`]?.(scope);
              }
              return null;
            },
          }}
        </te-table-column>
      }
    </>
  );
};
</script>
