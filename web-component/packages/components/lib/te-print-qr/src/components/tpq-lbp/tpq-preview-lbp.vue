<template>
  <div class="tpl-card">
    <div class="tpl-card-name">
      <span class="multiline-text"> {{ printItem.name }}</span>
    </div>
    <div class="tpl-card-code">
      <span class="multiline-text">{{ printItem.code }}</span>
    </div>
    <img class="tpl-card-qrcode" :src="printItem.qrCode" alt="图片错误" />
  </div>
</template>
<script setup lang="ts">
interface PrintItem {
  name: string;
  code: string;
  qrCode: string;
}

const props = withDefaults(
  defineProps<{
    printItem: PrintItem;
  }>(),
  {}
);
</script>
<style scoped lang="less">
.multiline-text {
  display: -webkit-box; /* 将容器设置为弹性盒子 */
  -webkit-box-orient: vertical; /* 设置盒子的排列方向为垂直方向 */
  overflow: hidden; /* 超出部分隐藏 */
  -webkit-line-clamp: 3; /* 显示的行数 */
  text-overflow: ellipsis; /* 显示省略号 */
  word-break: break-all; /* 英文超过一行强制换行 */
}
// 8cm * 5.5cm
.tpl-card {
  width: 5.5cm;
  height: 7.4cm;
  overflow: hidden;
  text-align: center;
  padding: 0 0.2cm 0 0.2cm;
}
.tpl-card-name {
  margin-top: 0.4cm;
  height: 54px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  line-height: 18px;
}
.tpl-card-code {
  margin-top: 0.2cm;
  height: 54px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  line-height: 18px;
}

.tpl-card-qrcode {
  margin-top: 0.2cm;
  width: 3.6cm;
}
</style>
