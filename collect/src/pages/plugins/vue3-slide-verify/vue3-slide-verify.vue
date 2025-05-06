<template>
  <div id="vue3-slide-verify" class="vue3-slide-verify">
    <slide-verify
      ref="block"
      :slider-text="text"
      :accuracy="accuracy"
      :w="w"
      :h="h"
      @again="onAgain"
      @success="onSuccess"
      @fail="onFail"
      @refresh="onRefresh"
    ></slide-verify>
    <div>{{ msg }}</div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import SlideVerify, { SlideVerifyInstance } from 'vue3-slide-verify'
import 'vue3-slide-verify/dist/style.css'

const msg = ref('')
const block = ref<SlideVerifyInstance>()
const accuracy = 5
const w = 500
const h = 300
const text = '向右滑动->'

const onAgain = () => {
  msg.value = '检测到非人为操作的哦！ try again'
  // 刷新
  block.value?.refresh()
}

const onSuccess = (times: number) => {
  msg.value = `login success, 耗时${(times / 1000).toFixed(1)}s`
}

const onFail = () => {
  msg.value = '验证不通过'
}

const onRefresh = () => {
  msg.value = '点击了刷新小图标'
}
</script>
<style lang="less" scoped></style>
