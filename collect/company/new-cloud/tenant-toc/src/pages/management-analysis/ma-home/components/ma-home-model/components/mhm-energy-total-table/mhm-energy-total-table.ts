/*
 * @Description: 经营分析弹框table表公共组件
 * @Autor: kongx
 * @Date: 2022-05-30 9:10:11
 * @LastEditors: kongx
 * @LastEditTime: 2022-06-13 19:14:11
 */
import { defineComponent, ref, onMounted } from 'vue';
export default defineComponent({
  name: 'MhmEnergyTotalTable',
  emits: ['changeTab', 'back'],
  props: ['showComponentId', 'tableData', 'tableDataName', 'treeList', 'loadingStatus'],
  setup(props, ctx) {
    //tab标识id
    const activeTab = ref<string>(props.treeList.length ? props.treeList[0].code : '');
    //tab切换
    const handleClick = () => {
      ctx.emit('changeTab', activeTab.value);
    };
    //返回到节能总收益操作
    const back = () => {
      ctx.emit('back');
    };
    onMounted(() => {
      if (props.showComponentId === '5') {
        ctx.emit('changeTab', activeTab.value);
      }
    });
    return {
      activeTab,
      handleClick,
      back,
    };
  },
});
