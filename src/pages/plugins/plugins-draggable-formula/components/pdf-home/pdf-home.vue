<template>
  <div class="pdf-home">
    <!-- 条件组 -->
    <template v-if="draggableFormulaService.groupList.length !== 0">
      <pdf-condition-group
        v-for="(item, index) in draggableFormulaService.groupList"
        :groupInfo="item"
        @copy="draggableFormulaService.copyGroup(item, index)"
        @delete="draggableFormulaService.deleteGroup(index)"
      ></pdf-condition-group>
    </template>
    <div v-else>no-data</div>
  </div>
</template>
<script lang="ts" setup>
import PdfConditionGroup from '../pdf-condition-group/pdf-condition-group.vue';

import draggableFormulaService from '../../plugins-draggable-formula.service';

draggableFormulaService.queryGroup();
</script>
<style lang="less" scoped>
.pdf-home {
  width: 100%;
  height: 100%;
  padding: 0 16px 8px 26px;
  background-color: #fff;

  overflow-x: hidden;
  overflow-y: auto;
}
</style>
