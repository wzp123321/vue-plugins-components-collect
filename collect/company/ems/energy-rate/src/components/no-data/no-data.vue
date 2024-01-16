<template>
  <div class="no-data">
    <img :src="imgUrl" alt="" :style="{ width: `${width}px`, height: `${height}px` }" />
    <span v-if="!hasSlot" :style="{ fontSize: `${fontSize}px`, marginTop: `${marginTop}px` }">{{ title }}</span>
    <span v-else :style="{ fontSize: `${fontSize}px`, marginTop: `${marginTop}px` }">
      <slot></slot>
    </span>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'NoData',
  props: {
    width: {
      type: Number,
      default: 200,
    },
    height: {
      type: Number,
      default: 200,
    },
    title: {
      type: String,
      default: '暂无数据',
    },
    imgUrl: {
      type: String,
      default: require('../../assets/images/common/common-empty.svg'),
    },
    fontSize: {
      type: Number,
      default: 14,
    },
    marginTop: {
      type: Number,
      default: 16,
    },
    // 是否有插槽
    hasSlot: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const hasSlot = computed(() => {
      return props.hasSlot;
    });
    const title = computed(() => {
      return props.title;
    });
    const { imgUrl } = props;

    return { title, imgUrl, hasSlot };
  },
});
</script>
<style lang="less" scoped>
.no-data {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--te-fill-color-blank);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  span {
    color: var(--te-text-color-placeholder);
  }
}
</style>
