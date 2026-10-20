// based on rc-resize-observer 1.0.0
import ResizeObserver from 'resize-observer-polyfill';
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  onUpdated,
  reactive,
  watch,
} from 'vue';
import type { PropType } from 'vue';

const findDOMNode = (instance: any) => {
  let node = instance?.vnode?.el || (instance && (instance.$el || instance));
  while (node && !node.tagName) {
    node = node.nextSibling;
  }
  return node;
};

interface ResizeObserverState {
  height: number;
  width: number;
  offsetHeight: number;
  offsetWidth: number;
}

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ResizeObserver',
  props: {
    disabled: Boolean,
    onResize: Function as PropType<
      (
        _size: {
          width: number;
          offsetWidth: number;
        },
        _element: HTMLElement,
      ) => void
    >,
  },
  emits: ['resize'],
  setup(props, { slots }) {
    const state = reactive<ResizeObserverState>({
      width: 0,
      height: 0,
      offsetHeight: 0,
      offsetWidth: 0,
    });
    let currentElement: Element | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const destroyObserver = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    };
    /*
     * 监听元素的变化
     */
    const onResizeHandle: any = (entries: ResizeObserverEntry[]) => {
      const { onResize } = props;

      const target = entries[0].target as HTMLElement;

      const { width, height } = target.getBoundingClientRect();
      const { offsetWidth, offsetHeight } = target;
      const fixedWidth = Math.floor(width);
      const fixedHeight = Math.floor(height);

      if (
        state.width !== fixedWidth ||
        state.height !== fixedHeight ||
        state.offsetWidth !== offsetWidth ||
        state.offsetHeight !== offsetHeight
      ) {
        const size = {
          width: fixedWidth,
          height: fixedHeight,
          offsetWidth,
          offsetHeight,
        };

        Object.assign(state, size);
        if (onResize) {
          Promise.resolve().then(() => {
            onResize(
              {
                ...size,
                offsetWidth,
                offsetHeight,
              },
              target,
            );
          });
        }
      }
    };
    const instance = getCurrentInstance();
    const registerObserver = () => {
      const { disabled } = props;
      if (disabled) {
        destroyObserver();
        return;
      }
      const element = findDOMNode(instance) as Element;
      const elementChanged = element !== currentElement;
      if (elementChanged) {
        destroyObserver();
        currentElement = element;
      }

      if (!resizeObserver && element) {
        resizeObserver = new ResizeObserver(onResizeHandle);
        resizeObserver.observe(element);
      }
    };
    onMounted(() => {
      registerObserver();
    });
    onUpdated(() => {
      registerObserver();
    });
    onUnmounted(() => {
      destroyObserver();
    });
    watch(
      () => props.disabled,
      () => {
        registerObserver();
      },
      { flush: 'post' },
    );
    return () => slots.default?.()[0];
  },
});
