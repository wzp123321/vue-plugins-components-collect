import { computed, defineComponent, PropType } from 'vue';
export interface ItemCode {
  value: string | number;
  label: string;
}
export default defineComponent({
  name: 'RadioSelectButton',
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
    /**
     * 切换按钮事件
     */
    const onSwitchItem = (item: ItemCode) => {
      emit('update:modelValue', item.value);
      emit('switch-click', item);
    };
    /**
     * 重置数据源
     */
    const resetSwitchItem = (data: ItemCode[]) => {
      const itemArray = [];
      for (const item of data) {
        let { label } = item;
        const { value } = item;
        const title = label;
        if (item.label.length > 8) {
          label = item.label.slice(0, 8) + '...';
        }

        itemArray.push({
          value,
          label,
          title,
        });
      }
      return itemArray;
    };
    return {
      itemSelected,
      onSwitchItem,
      resetSwitchItem,
    };
  },
});
