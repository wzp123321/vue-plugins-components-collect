<template>
  <div id="demo">
    <input type="text" v-model="num" @focus="handleFocus" />
    <!-- <ElInputNumber
      v-model="num"
      class="mx-4"
      controls-position="right"
      @focus="handleFocus"
    /> -->
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { ElInputNumber } from 'element-plus'

const num = ref<number>(0)
const integral = 4
const decimal = 4

// 过滤连续.等特殊字符
function deduplicate(target: string, symbol: string): string {
  if (target.includes(symbol)) {
    const temp = target.split(symbol)
    let str = `${temp.shift() ?? ''}${symbol}`
    temp.filter((v) => v).forEach((v) => (str += v))
    return str
  }
  return target
}

function handleFocus(e: Event) {
  console.log(e.target)
  e?.target?.addEventListener('input', (ie: Event) => {
    const ele = ie.target as HTMLInputElement
    // 禁止头部连续输入0
    // if (
    //   ele.value.length > 1 &&
    //   ele.value.substring(0, 1) === '0' &&
    //   ele.value.substring(1, 2) !== '.'
    // ) {
    //   ele.value = ele.value.substring(1)
    // }
    if (ele.value.indexOf('.') !== ele.value.lastIndexOf('.')) {
      ele.value = deduplicate(ele.value, '.')
    }

    if (ele.value.indexOf('.') !== -1) {
      const valueArr = ele.value.split('.')
      ele.value = `${valueArr[0].substring(0, integral)}.${
        valueArr[1].substring(0, decimal) || ''
      }`
    } else {
      ele.value = ele.value.substring(0, integral)
    }
    ele.value = ele.value.trim()

    // 限制小数点后几位
    // ele.value = ele.value.replace(
    //   `/^(\-)*(\d+)\.(\d{0,${decimal}}).*$/`,
    //   '$1$2.$3'
    // )
  })
}
</script>
<style lang="less" scoped></style>
