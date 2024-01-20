<template>
  <div id="demo">
    <p>{{md5}}</p>
    <button @click="handleMd5">获取文件MD5</button>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { FUploadHandler, mapFileMD5 } from '../utils/file';

const md5 = ref<string | null>('')

const handleMd5 = async ()=>{
  const file = await FUploadHandler()
  md5.value = await mapFileMD5(file)
}

</script>
<style lang="less" scoped>
.demo {
  width: 100%;
  height: 100%;
}
</style>
