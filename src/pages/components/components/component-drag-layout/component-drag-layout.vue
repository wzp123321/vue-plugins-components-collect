<template>
  <div class="component-drag-layout">
    <div class="cdl-left" :style="{ width: sidebarWidth + 'px' }">
      <!-- 左侧内容 -->
      <div class="cdl-left-content">
        <!-- 这里可以放置任何左侧内容 -->
        cdl-left Content
      </div>
      <!-- 拖拽手柄 -->
      <div class="resize-handle" @mousedown="startDragging">
        <div class="resize-handle-fold">
          <icon-caret-left />
        </div>
      </div>
    </div>
    <div class="cdl-main">
      <!-- 主内容区域 -->
      Main Content
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { IconCaretLeft } from '@arco-iconbox/vue-te';

const sidebarWidth = ref(200); // 初始宽度
const minWidth = 100; // 最小宽度
let isDragging = false;
let startX = 0;
let startWidth = 0;

const startDragging = (event: MouseEvent) => {
  isDragging = true;
  startX = event.clientX;
  startWidth = sidebarWidth.value;
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', stopDragging);
};

const doDrag = (event: MouseEvent) => {
  if (isDragging) {
    const newWidth = startWidth + (event.clientX - startX);
    sidebarWidth.value = Math.max(minWidth, newWidth);
  }
};

const stopDragging = () => {
  isDragging = false;
  document.removeEventListener('mousemove', doDrag);
  document.removeEventListener('mouseup', stopDragging);
};
</script>

<style lang="less" scoped>
.component-drag-layout {
  display: flex;
  height: 400px;

  .cdl-left {
    background-color: #f4f4f4;
    position: relative;
  }

  .cdl-left-content {
    padding: 20px;
    box-sizing: border-box;
  }

  .resize-handle {
    cursor: ew-resize;
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background-color: rgba(232, 232, 232, 1);

    > .resize-handle-fold {
      width: 12px;
      height: 48px;
      display: flex;
      align-items: center;
      border-radius: 0 4px 4px 0;
      box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);

      position: absolute;
      top: 160px;
      left: 0;
    }
  }

  .cdl-main {
    flex: 1;
    background-color: #fff;
    padding: 20px;
    box-sizing: border-box;
  }
}
</style>
