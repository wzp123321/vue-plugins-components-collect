<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { getServerTime } from '@/core/service';
export default defineComponent({
  name: 'App',
  setup(props) {
    // const querySystemTime = async () => {
    //   try {
    //     const serverTime: any = await getServerTime();
    //     if (serverTime.code === 200 && serverTime.data) {
    //       const dTimeValue = String(new Date(serverTime.data).getTime() - new Date().getTime());
    //       sessionStorage.setItem('dTimeValue', dTimeValue);
    //     } else {
    //       sessionStorage.setItem('dTimeValue', '');
    //     }
    //   } catch (error) {
    //     sessionStorage.setItem('dTimeValue', '');
    //   }
    // };
    // onMounted(async () => {
    //   await querySystemTime();
    // });
  },
});
</script>

<template>
  <router-view></router-view>
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  overflow: hidden;
}
</style>
