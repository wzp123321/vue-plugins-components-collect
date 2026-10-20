<template>
  <view class="container">
    <uni-card is-full :is-shadow="false">
      <text class="uni-h6"
        >评分组件多用于商品评价打分、服务态度评价、用户满意度等场景。</text
      >
    </uni-card>
    <uni-section title="基本用法" type="line" padding>
      <tem-rate v-model="rateValue" @change="onChange" />
    </uni-section>
    <uni-section
      title="不支持滑动手势选择评分"
      subTitle="设置 touchable 属性控制是否开启手势选择"
      type="line"
      padding
    >
      <tem-rate :touchable="false" :value="5" @change="onChange" />
    </uni-section>
    <uni-section
      title="设置尺寸大小"
      subTitle="设置 size 属性控制组件大小"
      type="line"
      padding
    >
      <tem-rate size="18" :value="5" />
    </uni-section>
    <uni-section
      title="设置评分数"
      subTitle="设置 max 属性控制组件最大星星数量"
      type="line"
      padding
    >
      <tem-rate :max="10" :value="5" />
    </uni-section>
    <uni-section
      title="设置星星间隔"
      subTitle="设置 margin 属性控制星星间隔"
      type="line"
      padding
    >
      <tem-rate :value="4" margin="20" />
    </uni-section>
    <uni-section
      title="设置颜色"
      subTitle="使用 color 属性设置星星颜色"
      type="line"
      padding
    >
      <tem-rate :value="3" color="#bbb" active-color="red" />
    </uni-section>
    <uni-section
      title="半星"
      subTitle="使用 allow-half 属性设置是否显示半星"
      type="line"
      padding
    >
      <tem-rate allow-half :value="3.5" />
    </uni-section>
    <uni-section
      title="只读状态"
      subTitle="使用 readonly 属性设置组件只读"
      type="line"
      padding
    >
      <tem-rate :readonly="true" :value="2" />
    </uni-section>
    <uni-section
      title="禁用状态"
      subTitle="使用 disabled 属性设置组件禁用"
      type="line"
      padding
    >
      <tem-rate :disabled="true" disabledColor="#ccc" :value="3" />
    </uni-section>
    <uni-section
      title="未选中的星星为镂空状态"
      subTitle="使用 is-fill 属性设置星星镂空"
      type="line"
      padding
    >
      <tem-rate :value="3" :is-fill="false" />
    </uni-section>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import { TemRate } from '@tiansu/ts-mobile-package';
// import UniSection from '@tiansu/ts-mobile-package/uni-section/components/uni-section/uni-section.vue';
// import UniCard from '@tiansu/ts-mobile-package/uni-card/components/uni-card/uni-card.vue';
// import { onLoad } from '@dcloudio/uni-app';

const rateValue = ref(0);
// onLoad(() => {
//   // 模拟动态赋值
//   setTimeout(() => {
//     rateValue.value = 3;
//   }, 1000);
// });
const onChange = (e) => {
  console.log('rate发生改变:' + JSON.stringify(e));
};
</script>

<style lang="scss"></style>
