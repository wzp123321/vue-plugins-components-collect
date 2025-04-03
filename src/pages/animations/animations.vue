<template>
  <div class="animations-little">
    <h5>动画大全</h5>
    <a-row :gutter="20">
      <a-col v-for="item in customComponents" :span="12">
        <a-card class="box-card">
          <h5>{{ item.description }}</h5>
          <component :is="item.component"></component>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { customComponents } from './components/model';

defineOptions({
  name: 'AnimationsLittle',
});
</script>
<style lang="less" scoped>
.animations-little {
  width: 100%;

  .ant-row {
    row-gap: 20px;

    .ant-card {
      height: 100%;
    }
  }
}
</style>
