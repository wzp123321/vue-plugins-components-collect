<template>
  <div class="pdf-home">
    <pdf-condition-group
      v-for="item in draggableFormulaService.groupList.value"
      :groupInfo="item"
    ></pdf-condition-group>
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

  overflow: auto;
}
</style>
