<template>
  <div class="virtual-card-load" ref="root" @scroll.passive="handleScroll">
    <div class="virtual-card-load-scroll" :style="`height: ${scrollHeight}px;padding-top: ${paddingTop}px`">
      <div class="vcl-datalist">
        <div class="vcl-card-item" v-for="(item, index) in pool" :key="'card_' + index">
          <h6>{{ item.treeName }}</h6>
          <p>{{ item.index }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CD_CostDetailVO } from './list.api';
import { defineComponent, onMounted, ref } from 'vue';
import { mock } from './utils';
import { useVirtualScroll } from '@/hooks';

export default defineComponent({
  name: 'VirtualCardLoad',

  setup() {
    const dataSource = ref<CD_CostDetailVO[]>(mock(300));
    const itemSize = ref<number>(140);
    const poolBuffer = ref<number>(20);
    const insertLine = ref<number>(0);
    const insertStart = ref<number>(0);

    const root = ref<HTMLElement | null>(null);

    const { pool, scrollHeight, paddingTop, handleScroll, updatePool, initPool, refreshScrollHeight } =
      useVirtualScroll<CD_CostDetailVO>({
        dataSource,
        itemSize,
        poolBuffer,
        rootRef: root,
        itemsPerRow: 4,
      });

    const handleInsert = () => {
      dataSource.value.splice(insertStart.value, 0, ...mock(insertLine.value, true));
      pool.value = [];
      refreshScrollHeight();
      updatePool();
    };

    const reset = () => {
      insertStart.value = 0;
      insertLine.value = 0;
    };

    const rowClick = (row: CD_CostDetailVO, index: number) => {
      console.log(row, index);
    };

    onMounted(() => {
      initPool();
    });

    return {
      insertLine,
      insertStart,
      itemSize,
      dataSource,
      pool,
      scrollHeight,
      root,
      paddingTop,
      reset,

      handleScroll,
      handleInsert,
      rowClick,
    };
  },
});
</script>

<style lang="less" scoped>
.virtual-card-load {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  overflow: auto;

  .virtual-card-load-scroll {
    box-sizing: border-box;
  }

  .vcl-datalist {
    display: flex;
    flex-wrap: wrap;
  }

  .vcl-card-item {
    width: 386px;
    box-sizing: border-box !important;
    height: 141px;
    padding: 24px;
    border-radius: 4px;
    border: 1px solid #dce8ff;
    margin-right: 12px;
    margin-bottom: 24px;
    background-color: hsla(0, 0%, 100%, 0) !important;
    -webkit-backdrop-filter: blur(10px) grayscale(30%);
    backdrop-filter: blur(10px) grayscale(30%);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    position: relative;
    cursor: pointer;
  }
}
</style>
