<template>
  <div class="te-drag-design-demo">
    <header class="tdd-demo-header">
      <h3>te-drag-design — 移动端拖拽设计器</h3>
      <p>左侧为组件库，中间为 iPhone 6.1 寸画布，右侧为属性面板。支持组件拖拽、选中、删除。</p>
    </header>
    <div class="tdd-demo-stage">
      <te-drag-design />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TeDragDesign } from '../../../components/te-drag-design';

defineOptions({ name: 'TeDragDesignDemo' });
</script>

<style lang="less" scoped>
.te-drag-design-demo {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;

  .tdd-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;

    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
  }

  .tdd-demo-stage {
    flex: 1;
    overflow: auto;
  }
}
</style>
