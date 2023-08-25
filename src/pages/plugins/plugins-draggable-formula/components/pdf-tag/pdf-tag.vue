<template>
  <a-dropdown :trigger="['contextmenu']" placement="bottom">
    <div class="pdf-tag" :style="style">
      <span>{{ name }}</span>
      <i class="ems-iconfont icon-fork" title="删除" @click="handleDelete"></i>
    </div>
    <template #overlay>
      <a-menu>
        <a-menu-item key="1" @click="handleDelete">删除</a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import { PDF_EFieldType } from '../../plugins-draggable-formula.api';
import { mapTagStyle } from '../pdf-index-list/pdf-index-list.api';

interface Props {
  indexType: PDF_EFieldType;
  name: string;
  id: string;
}
const props = withDefaults(defineProps<Props>(), {
  indexType: PDF_EFieldType.数字,
  name: '',
  id: '',
});
const emits = defineEmits(['deleteItem']);

const style = computed(() => {
  return mapTagStyle(props.indexType);
});

/**
 * 删除
 */
const handleDelete = () => {
  emits('deleteItem', props.id);
};
</script>
<style lang="less" scoped>
.pdf-tag {
  cursor: pointer;
  padding: 3px 12px;
  border-radius: 4px;
  box-sizing: border-box;

  span {
    line-height: 22px;
    display: inline-block;
  }

  .ems-iconfont {
    cursor: pointer;
    font-size: 14px;
    margin-left: 8px;

    display: none;
  }

  &:hover {
    .ems-iconfont {
      display: inline-block;
      transition: none;
    }
  }
}
</style>
