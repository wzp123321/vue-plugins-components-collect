<template>
  1------ {{ dragFlag }}
  <draggable
    v-model="expressionList"
    :class="['pdf-expression-container', dragFlag ? 'is-dragging' : '']"
    item-key="serialNumber"
    :group="{ name: 'people' }"
    :sort="true"
    animation="300"
    @add="addFormula"
  >
    <template #item="{ element }">
      <span>{{ element.name }}</span>
    </template>
  </draggable>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import draggable from 'vuedraggable';
import dragStore from '../../../../../store/modules/drag';
import { PDF_IFieldVO } from '../../plugins-draggable-formula.api';

const store = storeToRefs(dragStore());
const expressionList = ref<PDF_IFieldVO[]>([]);

const dragFlag = computed(() => {
  return store.dragFlag.value;
});

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
  min-width: 100px;
  gap: 8px;

  padding: 8px 12px;
  border: 1px dashed rgba(228, 231, 237, 1);

  &.is-dragging:active {
    border-color: aqua;
  }

  span {
    cursor: pointer;
    padding: 5px 12px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }
}
</style>
