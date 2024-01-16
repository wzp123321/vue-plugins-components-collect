<template>
  <div class="pfv-formula-render">
    <span v-for="item in props.formulaList" :key="item.serialNumber">
      {{ mapIndexRender(item?.indexType, item?.indexName, item?.serialNumber) }}
    </span>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { PropType } from 'vue';
// api
import { PFE_ERequestIndexVO } from '@/pages/project-manage/pm-formula-editor/pm-formula-editor.api';
// 枚举
import { PFE_ESymbolType } from '@/pages/project-manage/pm-formula-editor/enums';
// props
const props = defineProps({
  formulaList: {
    type: Array as PropType<PFE_ERequestIndexVO[]>,
    default: [],
  },
});
/**
 * 处理符号指标渲染
 * @param {string} indexType
 * @param {string} indexName
 * @param {string} serialNumber
 * @returns {string}
 */
const mapIndexRender = (indexType: string, indexName: string, serialNumber: string): string => {
  return indexType !== PFE_ESymbolType.数字 || !serialNumber?.includes('%') ? indexName : `${indexName}${serialNumber}`;
};
</script>
<style lang="less" scoped>
.pfv-formula-render {
  width: fit-content;
  border: 1px dashed var(--te-border-color-light);
  padding: var(--te-space-12);
  border-radius: var(--te-space-4);
  color: var(--te-text-color-regular);
  font-size: var(--te-font-size-b14);

  white-space: no-wrap;

  display: flex;
  align-items: center;
  gap: var(--te-space-8);

  span {
    display: inline-block;
    line-height: 22px;
  }
}
</style>
