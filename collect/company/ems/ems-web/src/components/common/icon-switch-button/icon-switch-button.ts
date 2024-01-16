import { defineComponent, PropType, computed } from 'vue';
import { useStore } from 'vuex';
export interface ItemCode {
  code: string | number;
  imgs: any[];
}
export default defineComponent({
  name: 'IconSwitchButton',
  props: {
    switchItems: {
      // 数据源
      type: Array as PropType<ItemCode[]>,
      default: []
    },
    modelValue: {
      // model值
      type: [String, Number] as PropType<string | number>,
      default: null
    }
  },
  setup(props, { emit }) {
    const store = useStore();
    const theme = computed(() => {
      return store.getters.theme || 'light';
    });
    const itemSelected = computed(() => {
      return props.modelValue;
    });
    /**
     * 按钮切换事件
     */
    const onSwitchItem = (item: ItemCode) => {
      if (item.code === itemSelected.value) {
        return;
      }
      emit('update:modelValue', item.code);
      emit('switch-icon-button-change', item.code);
    };
    return {
      itemSelected,
      theme,
      onSwitchItem
    };
  }
});
