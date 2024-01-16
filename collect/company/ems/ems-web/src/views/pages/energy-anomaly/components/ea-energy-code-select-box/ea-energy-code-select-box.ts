import { defineComponent, PropType, computed, ref, onMounted } from 'vue';
export default defineComponent({
  name: 'EnergyCodeSelectBox',
  props: {
    // 列表
    energyCodeList: {
      type: Array as PropType<EnergyAnomalyModule.EnergyCodeInfo[]>,
      default: [],
    },
    // 选中
    checkedKey: {
      type: String,
      default: 0,
    },
  },
  emits: ['update:checkedKey', 'change'],
  setup(props, { emit }) {
    const translateX = ref(0);
    // 列表
    const list = computed(() => {
      return props.energyCodeList;
    });
    // 选中项
    const selectId = computed(() => {
      return props.checkedKey;
    });
    // 两级容器宽度
    const scrollWidth = ref(0);
    const containerWidth = ref(0);
    // 是否展示按钮
    const isMoreBtnShow = computed(() => {
      return containerWidth.value > scrollWidth.value;
    });
    // 点击
    const onSelectBoxItemClick = (index: number, id: string) => {
      if (selectId.value === id) {
        return;
      }
      const scrollwidth = document.querySelector('.ea-energy-code-select-box__scroll')
        ? (document.querySelector('.ea-energy-code-select-box__scroll') as Element).clientWidth
        : 0;
      // emit
      emit('update:checkedKey', id);
      emit('change');
      // 获取dom宽度
      let totalWidth = 0;
      for (let key = 0; key <= index; key++) {
        const domWidth = (document.querySelector(`.list>span:nth-child(${key + 1})`) as Element).scrollWidth;
        totalWidth += domWidth;
      }
      if (totalWidth > scrollwidth) {
        translateX.value = scrollwidth - totalWidth + (index !== list.value?.length - 1 ? -40 : 0);
      } else {
        translateX.value = 0;
      }
    };
    // 初始化
    onMounted(() => {
      scrollWidth.value = document.querySelector('.ea-energy-code-select-box__scroll')
        ? (document.querySelector('.ea-energy-code-select-box__scroll') as Element).clientWidth
        : 0;
      containerWidth.value = document.querySelector('.ea-energy-code-select-box__scroll>.list')
        ? (document.querySelector('.ea-energy-code-select-box__scroll>.list') as Element).clientWidth
        : 0;
    });

    return {
      list,
      selectId,
      translateX,
      isMoreBtnShow,
      onSelectBoxItemClick,
    };
  },
});
