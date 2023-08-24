<template>
  <draggable
    v-model="expressionList"
    class="pdf-expression-container"
    item-key="serialNumber"
    :group="{ name: 'people', put: true }"
    :sort="false"
    animation="300"
    @add="addFormula"
    @change="changeInfo"
  >
    <template #item="{ element }">
      <span>{{ element.name }}</span>
    </template>
  </draggable>
</template>
<script lang="ts" setup>
import draggable from 'vuedraggable';
import { ref } from 'vue';
import { PDF_IFieldVO } from '../../plugins-draggable-formula.api';
import { cloneDeep } from 'lodash';

const expressionList = ref<PDF_IFieldVO[]>([]);

const addFormula = () => {
  expressionList.value = expressionList.value.map(
    (item, index): PDF_IFieldVO => {
      let res = cloneDeep(item);
      res.id = `front${index}`;
      return res;
    },
  );
};
const changeInfo = () => {
  console.log(changeInfo);
};
</script>
<style lang="less" scoped>
.pdf-expression-container {
  width: fit-content;
  display: flex;
  flex-wrap: wrap;

  min-height: 48px;

  padding: 8px 12px;
  border: 1px dashed rgba(228, 231, 237, 1);
}
</style>
