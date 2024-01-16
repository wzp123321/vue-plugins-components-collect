// switch对象类定义
export interface ItemCode {
  code: string | number;
  name: string;
}
import { defineComponent, ref, PropType, watch, computed, nextTick } from 'vue';
export default defineComponent({
  name: 'CheckSelect',
  props: {
    switchItems: {
      // 数据源
      type: Array as PropType<ItemCode[]>,
      default: [],
    },
    modelValue: {
      // model值
      type: [String, Number] as PropType<string | number>,
      default: null,
    },
  },
  setup(props, { emit }) {
    const itemSelected = computed(() => {
      return props.modelValue;
    });
    const isShow = ref(false);
    const translateStyle = ref({});
    const checkSelect = ref();
    watch(
      () => props.switchItems,
      () => {
        nextTick(() => {
          const width = checkSelect.value.offsetWidth;
          if (width > 274) {
            isShow.value = true;
          }
        });
      },
      {
        immediate: true,
      },
    );
    /**
     * 切换按钮事件
     */
    const onSwitchItem = (
      item: ItemCode,
      index: number,
      event: any,
      order: number,
    ) => {
      let itemOffsetLeft = 0;
      let itemWidth = 0;
      if (isShow.value) {
        if (order === 1) {
          itemOffsetLeft = event.target.offsetLeft;
          itemWidth = event.target.offsetWidth;
        } else {
          const itemSlectNow: any = document.querySelectorAll(
            '.check-select-item',
          )[index];
          itemOffsetLeft = itemSlectNow.offsetLeft;
          itemWidth = itemSlectNow.offsetWidth;
        }
        if (itemOffsetLeft + itemWidth > 235) {
          if (index === props.switchItems.length - 1) {
            translateStyle.value = {
              transform: `translateX(-${itemOffsetLeft + itemWidth - 235}px)`,
              transition: 'transform 0.5s',
            };
          } else {
            translateStyle.value = {
              transform: `translateX(-${itemOffsetLeft +
                itemWidth -
                235 +
                40}px)`,
              transition: 'transform 0.5s',
            };
          }
        } else {
          translateStyle.value = {
            transform: 'translateX(0px)',
            transition: 'transform 0.5s',
          };
        }
      }
      emit('update:modelValue', item.code);
      emit('check-select', item.code);
    };
    return {
      isShow,
      translateStyle,
      checkSelect,
      itemSelected,
      onSwitchItem,
    };
  },
});
