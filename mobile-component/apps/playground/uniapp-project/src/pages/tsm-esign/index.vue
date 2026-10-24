<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Esign 电子签名</text>
        <text class="subtitle">区域占位 → 全屏横排签名 → 回显签名图</text>
      </view>

      <view class="demo-card">
        <text class="section-title">基础用法（点击签名）</text>
        <view class="demo-block">
          <tsm-esign
            v-model="sig1"
            @confirm="onConfirm"
            @cancel="onCancel"
            @esign-landscape-change="onLandscapeChange"
          />
        </view>
        <text class="demo-tip">当前值：{{ sig1 ? sig1.slice(0, 60) + '…' : '（未签名）' }}</text>
        <text class="demo-tip">横屏签字态：{{ isLandscape ? '是（旋转横屏编辑中）' : '否' }}</text>
      </view>

      <view class="demo-card">
        <text class="section-title">外部传入 base64 可重签</text>
        <view class="demo-block">
          <tsm-esign v-model="sigRe" @confirm="onConfirm" />
        </view>
        <text class="demo-tip"
          >非 readonly 时，已回显的签名可再次点击进入覆盖重签（当前：{{ sigRe ? '已重签/有值' : '（空）' }}）</text
        >
      </view>

      <view class="demo-card">
        <text class="section-title">只读且未签名（展示 -）</text>
        <view class="demo-block">
          <tsm-esign :model-value="''" readonly />
        </view>
        <text class="demo-tip">只读态无值时只渲染中性占位符 -，不铺底色也不撑高度</text>
      </view>

      <view class="demo-card">
        <text class="section-title">回显 base64 图片（外部传入，只读）</text>
        <view class="demo-block">
          <tsm-esign :model-value="sigB64" readonly />
        </view>
        <text class="demo-tip">外部传入的裸 base64，无需 data: 前缀也能自动回显</text>
      </view>

      <view class="demo-card">
        <text class="section-title">回显远程/本地图片 URL（只读）</text>
        <view class="demo-block">
          <tsm-esign model-value="https://dummyimage.com/260x110/ffffff/181d27&text=SIGN" readonly />
        </view>
        <text class="demo-tip">model-value 传 URL 也能直接展示</text>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const sig1 = ref('');
// 一份带“笔迹”的透明 PNG 的裸 base64（用于验证 base64 回显）
const sigB64 =
  'iVBORw0KGgoAAAANSUhEUgAAAQQAAABuCAYAAADBEG2CAAAEDElEQVR4nO3dwW7bOBQFUNWYj9Bm1l31/z9kVl1347+YwgsDRhIpkiWRl+Q5QFAgTWKJfLqinhRnmgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADo2vzvz/8fH7W3A9Ldps69BoFQgHU/po4tBcD9z++u97vVuTEv9XW/QgC26zYQXB7Afl0GgjCA93QXCMIgn/5Bru4CAXhfV4FgdQDHdBMIwgCO6yYQ+MwTmgwZCB5AWh8TqyeGCQTF/nk8vhoT40T3gbBW5CM+BuugZ+hAWCIMcnkGIdut977BV+FQ+kz6XMZf8boah+2YG/g1/CYDIX1QSxVFy+Mwsjk4GJoLhNb6Bkvbe7QoUguKtueruUDoIQw+fs2eYtny9YljMbJ55aQwhflnakhLzxvsnezn16/tiyBozxx40HexQmhpYI900t99jiAxFEc3b1whTkGaWiG0cCCshcHz37MLJW0Mlox0y3EOO9C7CoRWLhW2FvyeYFiTtv+teB33K8ZwXqmD9KCID4T0ATxy9jtSJMLg2Nx89X/3g+Hw7onr8X0p8xkdCC3cYjxj9bI3GFL2vbeTyLyhsbv3NVubq+hAWJIyyGcXwXfBkLLfva8e552rhj2rw8fnl5rGCfMbGwjpB8WVDbLXYHgWUMp+j3YpOX8TDr01SiMDIb1vUKoIPt6d4PhYfrT3obDpm5XclrlaWiUkiAuE9L5Bb2eEFm05mLbOyTuN3fmi1WvCSjAuEJbUHqgHYZA9dkd+3uv3zgPf9Yl6UjG5byAMsp1ZI/c/v388P6567TMuYbpeIdQeiBZDakSl6+Q+2J2fiEBI7RuMUgTsv6S4n1ADic3F6pcMqWFAO0rXyf3i16sZEtUDITUMrA7ypJ1Ne1Q1EFIPOoVHKWnNxWqB0OJBVzuoWlXiqU4aDoTkvkHqqmV0LZ5AtkqqreKBIAwgNwRjmoq1U7LnM1CvatdMj24jLMeP/LEWRcdIzcVigZB8BtY3yJZcO70pEggt9g2gtNrHQpFASA6DNcnbxljzMxc8ad1GnlCXCnXGeM/cW8GVdWkgOOCgrebiZYHQarInrFxYZ44aCwR9A66uo57dK54UTn8/BGGQwVm0P3OB91ws1lRUoKijfKcGQqtNxPTtG9Golwu1m4u30SdQGOTdcmy1lnpwWiAsvUutA44RelBX+Li/e94JOqaH8LrRSRP4ui2J2ze6RxC0esl5tRJB8DT0QJNxyXDmX2Kig7dhZ0yCII9AoDjvRZHLMozLvHu3wOVBPTFvoQYPwqAuKwQiVgeCIIMeAlUJgiwuGahGGOSxQqA4QZDLCoGiB70wgMH5ZSUAAIAunPlg0q8Tfxbwvv/e/UZ3GQAAAAAAAAAAAAAAAICphr80VK4TH6TV0wAAAABJRU5ErkJggg==';
// 演示“外部传入已有值，仍可点击重签”
const sigRe = ref(sigB64);

const onConfirm = (value: string) => {
  console.log('esign confirm, len =', value.length, value.slice(0, 40));
};
const onCancel = () => {
  console.log('esign cancel');
};
// 横屏签字态：进入旋转横屏签名时为 true，退出（确定/取消）为 false
const isLandscape = ref(false);
const onLandscapeChange = (val: boolean) => {
  isLandscape.value = val;
  console.log('esign-landscape-change:', val);
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@zpackage/mobile-package/ui/libs/scss/platform-style.scss';

.container {
  padding: 16px;
}

.header {
  margin-bottom: 24px;
}

.title {
  display: block;
  margin-bottom: 8px;
  color: var(--var-tsm-color-text-primary, rgba(24, 29, 39, 1));
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  display: block;
  color: var(--var-tsm-color-text-secondary, rgba(113, 118, 128, 1));
  font-size: 14px;
}

.demo-card {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--var-tsm-color-bg-white, #fff);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.section-title {
  display: block;
  margin-bottom: 16px;
  color: var(--var-tsm-color-text-primary, rgba(24, 29, 39, 1));
  font-size: 16px;
  font-weight: 500;
}

.demo-block {
  padding: 12px 0;
}

.demo-tip {
  display: block;
  margin-top: 8px;
  color: var(--var-tsm-color-text-secondary, rgba(113, 118, 128, 1));
  font-size: 13px;
  word-break: break-all;
}
</style>
