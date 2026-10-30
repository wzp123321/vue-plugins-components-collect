<template>
  <svg
    class="ai-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="(d, index) in paths" :key="index" :d="d" />
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

/** 线条图标集：统一 24 栅格、2px 描边，随 currentColor 着色 */
const ICON_PATHS: Record<string, string[]> = {
  search: ['M20 20l-3.5-3.5', 'M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z'],
  components: ['M4 4h6.5v6.5H4z', 'M13.5 4H20v6.5h-6.5z', 'M4 13.5h6.5V20H4z', 'M13.5 13.5H20V20h-6.5z'],
  visual: ['M4 20h16', 'M4 20V4.5', 'M8 16.5v-4', 'M12.5 16.5V9', 'M17 16.5V6.5'],
  engineering: ['M12 3l8.5 4.7L12 12.4 3.5 7.7 12 3z', 'M3.5 12.3L12 17l8.5-4.7', 'M3.5 16.6L12 21.3l8.5-4.7'],
  database: [
    'M12 4c3.9 0 7 1.1 7 2.5S15.9 9 12 9 5 7.9 5 6.5 8.1 4 12 4z',
    'M5 6.5v11c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-11',
    'M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5',
  ],
  framework: ['M8.5 6.5L3 12l5.5 5.5', 'M15.5 6.5L21 12l-5.5 5.5', 'M13.5 4l-3 16'],
  style: [
    'M12 3.5l2.1 5.2 5.2 2.1-5.2 2.1L12 18.1l-2.1-5.2L4.7 10.8l5.2-2.1z',
    'M18.6 3.4l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z',
  ],
  lab: ['M9 3h6', 'M10 3v5.6L5.7 17a2.9 2.9 0 0 0 2.5 4.3h7.6a2.9 2.9 0 0 0 2.5-4.3L14 8.6V3', 'M8 15.5h8'],
  panel: ['M4 5h16v14H4z', 'M9.5 5v14'],
  sun: [
    'M12 4.5v-2',
    'M12 21.5v-2',
    'M4.5 12h-2',
    'M21.5 12h-2',
    'M6.3 6.3L4.9 4.9',
    'M19.1 19.1l-1.4-1.4',
    'M17.7 6.3l1.4-1.4',
    'M4.9 19.1l1.4-1.4',
    'M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z',
  ],
  moon: ['M20 14.6A8.6 8.6 0 1 1 9.4 4a6.8 6.8 0 0 0 10.6 10.6z'],
  chevron: ['M6 9.5l6 6 6-6'],
  arrow: ['M4.5 12h15', 'M13.5 6l6 6-6 6'],
  spark: [
    'M12 2.5l1.9 4.9 4.9 1.9-4.9 1.9L12 16.1l-1.9-4.9L5.2 9.3l4.9-1.9z',
    'M18.8 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z',
  ],
  close: ['M6 6l12 12', 'M18 6L6 18'],
};

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  strokeWidth: {
    type: [Number, String],
    default: 1.6,
  },
});

const paths = computed(() => ICON_PATHS[props.name] ?? ICON_PATHS.search);
</script>

<style lang="less" scoped>
.ai-icon {
  width: 1em;
  height: 1em;
  display: block;
  flex-shrink: 0;
}
</style>
