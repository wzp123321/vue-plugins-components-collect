// switch对象类定义
export interface ItemCode {
  code: string | number;
  name: string;
}
import { defineComponent, PropType, computed } from 'vue';
export default defineComponent({
  name: 'SwitchCheck',
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
    let itemSelected = computed(() => {
      return props.modelValue;
    });
    /**
     * 切换事件
     */
    const onSwitchItem = (item: ItemCode) => {
      emit('update:modelValue', item.code);
      emit('switch-check-change', item.code);
    };
    /**
     * 重置数据源
     */
    const resetSwitchItem = (data: ItemCode[]) => {
      const itemArray = [];
      for (const item of data) {
        let { code, name } = item;
        const title = name;
        if (item.name && item.name.length > 8) {
          name = item.name.slice(0, 8) + '...';
        }

        itemArray.push({
          code,
          name,
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
