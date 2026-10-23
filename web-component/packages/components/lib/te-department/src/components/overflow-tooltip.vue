<script lang="ts">
import { defineComponent, ref, h } from 'vue';
import { ElTooltip } from 'element-plus';

// 文字溢出时，鼠标悬浮显示tooltip
export default defineComponent({
  setup(_, { slots, attrs }) {
    const tooltipDisabled = ref(true);

    return () => {
      const defaultSlot = slots.default?.();

      if (!defaultSlot) {
        return null;
      }

      if (defaultSlot.length > 1) {
        console.warn('[only-child] requires exact only one valid child.');
        return null;
      }

      const child = h(defaultSlot[0], {
        style: {
          overflow: 'hidden',
          'white-space': 'nowrap',
          'text-overflow': 'ellipsis',
        },
        onMouseenter: (event: MouseEvent) => {
          const el = event.target as HTMLElement;
          if (el.scrollWidth > el.clientWidth) {
            tooltipDisabled.value = false;
          } else {
            tooltipDisabled.value = true;
          }
        },
      });

      return h(ElTooltip, { disabled: tooltipDisabled.value, placement: 'top', ...attrs }, () => child);
    };
  },
});
</script>

<style lang="less"></style>
