<template>
  <div id="demo">
    <span :style="{ fontSize: fontSize, fontWeight: fontWeight }">{{ text }}</span>
  </div>
</template>
<script lang="ts" setup>
const text = '我在测试()%!^#jiq我发货哦';
const fontSize = '14px';
const fontWeight = '700';

function getTextWidth(str: string, fontSize: string, fontWeight: string) {
  var width = 0;
  var html = document.createElement('span');
  html.innerText = str;
  html.className = 'getTextWidth';
  html.style.fontSize = fontSize;
  html.style.fontWeight = fontWeight;
  document.querySelector('body')?.appendChild(html);
  width = (document.querySelector('.getTextWidth') as HTMLElement).offsetWidth;
  document.querySelector('.getTextWidth')?.remove();
  return width;
}

</script>
<style lang="less" scoped>
.demo {
  width: 100%;
  height: 100%;
}
</style>
