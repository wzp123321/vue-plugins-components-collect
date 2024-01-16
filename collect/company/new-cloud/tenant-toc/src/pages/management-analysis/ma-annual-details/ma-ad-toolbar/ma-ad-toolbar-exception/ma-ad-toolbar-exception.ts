import { defineComponent, Directive, PropType } from 'vue';
import { MA_AD_IExceptionItem } from '../../ma-annual-details.api';

export default defineComponent({
  props: {
    list: Object as PropType<Array<MA_AD_IExceptionItem>>,
  },
  directives: {
    resize: {
      mounted(element, binding) {
        const thead = element.getElementsByTagName('thead')[0];
        const tbody = element.getElementsByTagName('tbody')[0];

        element.onResize = new ResizeObserver((entries) => {
          if (entries[0]?.target.scrollHeight > entries[0]?.target.clientHeight) {
            thead.style.paddingRight = `${binding.arg ?? 8}px`;
          } else {
            thead.style.paddingRight = '0';
          }
        });
        element.onResize.observe(tbody);
      },
      beforeUnmount(element) {
        element.onResize.disconnect();
      },
    } as Directive<HTMLTableElement & { onResize: ResizeObserver }, void>,
  },
  computed: {
    show: function (): boolean {
      return !!this.list?.length;
    },
  },
  methods: {
    onClose: function (): void {
      this.$emit('update:close');
    },
  },
});
