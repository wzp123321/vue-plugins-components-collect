<template>
  <div id="btnBar">
    <button primary @click="savelayout">保存布局</button>
    <button primary @click="addNewcom">新增组件</button>
    <!-- <button primary @click="resetlayout">重置布局</button> -->
  </div>
</template>
<script lang="ts">
import {
  onBeforeMount,
  onMounted,
  defineComponent,
  reactive,
  toRefs,
} from 'vue';
import emitter from '@/utils/use-common-controller';

interface testType {
  order: number;
  enabled: boolean;
  list: any;
}
export default defineComponent({
  setup() {
    const data = reactive<testType>({
      order: 0,
      enabled: true,
      list: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
    });
    onBeforeMount(() => {});
    onMounted(async () => {});
    const savelayout = async () => {
      emitter.emit('saveLayout');
    };
    const addNewcom = async () => {
      console.log('新增组件');
      emitter.emit('addNewcomponent');
    };
    // const resetlayout = async () => {
    //   emitter.emit('onReset');
    // };
    return {
      ...toRefs(data),
      savelayout,
     // resetlayout,
      addNewcom,
    };
  },
  components: {},
});
</script>
<style>
#btnBar {
  /* margin: 10px 0; */
  display: inline-block;
}
</style>
