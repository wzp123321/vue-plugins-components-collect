<template>
  <te-tablebar placeholder="Please input" v-model="input" :hiddenMoreSearch="false" @onReset="input = ''">
      <template #header> header </template>
      <template #suffix>
        <el-button>suffix</el-button>
      </template>
      <template #searchList>
        <div>searchForm1</div>
        <div>searchForm2</div>
      </template>
      <template #footer>
        <div>footer</div>
      </template>
    </te-tablebar>
</template>

<script lang="ts" setup>
  import { TeTablebar } from '@ts-web-package/components/lib/te-tablebar';
  import { ElButton } from "element-plus"
  import { ref } from "vue";

  const input = ref("")

</script>
<script lang="ts">
export default {
  name:'te-tablebar-demo',
};
</script>
<style scoped lang="scss"></style>
