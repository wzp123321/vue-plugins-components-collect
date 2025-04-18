<template>
  <div class="vue3-virtual-list-container" ref="root" @scroll.passive="handleScroll">
    <div class="vue3-virtual-list-scroll" :style="`height: ${scrollHeight}px;padding-top: ${paddingTop}px`">
      <div
        class="vue3-virtual-list-item-container"
        v-for="item in pool"
        :key="item.id"
        :style="`height: ${itemSize}px`"
      >
        <slot :item="item" :index="item._index"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, toRefs, defineComponent, onMounted } from 'vue';

interface Props {
  data: any[];
  itemSize: number;
  poolBuffer: number;
}

export default defineComponent({
  name: 'TableList',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    itemSize: {
      type: Number,
      default: () => 40,
    },
    poolBuffer: {
      type: Number,
      default: () => 50,
    },
  },
  setup(props: Props): any {
    const { data, poolBuffer, itemSize } = toRefs(props);
    const root = ref<HTMLElement | null>(null);
    const pool = ref<any[]>([]);
    const scrollHeight = ref(data.value.length * itemSize.value);

    let containerSize = 0;
    const paddingTop = ref(0);
    let isScrollBusy = false;

    const handleScroll = () => {
      if (!root.value) return;
      if (isScrollBusy) return;
      isScrollBusy = true;

      requestAnimationFrame(() => {
        isScrollBusy = false;
        if (!root.value) return;
        const range: number[] = [];
        range[0] = Math.floor(root.value.scrollTop / itemSize.value) - Math.floor(poolBuffer.value / 2);
        range[0] = Math.max(range[0], 0);
        range[1] = range[0] + Math.floor(root.value.clientHeight / itemSize.value) + poolBuffer.value;
        range[1] = Math.min(range[1], data.value.length);
        /**
         * 需要渲染的列表
         */
        pool.value = data.value.slice(range[0], range[1]).map((v, i) => ({ ...v, _index: range[0] + i }));
        paddingTop.value = range[0] * itemSize.value;
      });
    };

    onMounted(() => {
      if (!root.value) return;
      containerSize = root.value.clientHeight;
      const contentLines = Math.ceil(containerSize / itemSize.value);
      const totalLines = contentLines + poolBuffer.value;
      const range = [0, totalLines];
      pool.value = data.value.slice(range[0], range[0] + range[1]).map((v, i) => ({ ...v, _index: range[0] + i }));
    });

    return { pool, scrollHeight, root, handleScroll, paddingTop };
  },
});
</script>

<style scoped>
.vue3-virtual-list-container {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  overflow: auto;
}
.vue3-virtual-list-scroll {
  box-sizing: border-box;
}
.vue3-virtual-list-item-container {
  overflow: hidden;
}
</style>
