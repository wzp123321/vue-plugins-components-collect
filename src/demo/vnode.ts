import { defineComponent, computed } from 'vue';

export const VNode = defineComponent({
  props: {
    content: {
      type: Object,
    },
  },
  setup(this, props, ctx) {
    const computedCon = computed(() => {
      return props.content;
    });

    return {
      computedCon,
    };
  },
  render(): any {
    return this.computedCon;
  },
});
