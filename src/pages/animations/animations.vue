<template>
  <div class="animations-little">
    <h5>动画大全</h5>
    <a-row :gutter="20">
      <a-col :span="12">
        <a-card class="box-card">
          <CountDown></CountDown>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card class="box-card">
          <AnimationRollParallax></AnimationRollParallax>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card class="box-card">
          <AnimationRecharge></AnimationRecharge>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { CountDown, AnimationRollParallax, AnimationRecharge } from './components';

defineOptions({
  name: 'Animations',
});
</script>
<style lang="less" scoped>
.animations {
  width: 100%;
  height: 100%;
}
</style>
