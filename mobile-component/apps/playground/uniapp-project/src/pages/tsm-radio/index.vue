<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Radio 单选框</text>
        <text class="subtitle">用于在多个选项中选择一个</text>
      </view>

      <!-- 基础用法 -->
      <view class="demo-card">
        <text class="section-title">基础用法</text>
        <text class="section-desc">Radio 必须配合 RadioGroup 使用</text>
        <tsm-radio-group :value="value1" @change="onChange1">
          <tsm-radio value="a">选项 A</tsm-radio>
          <tsm-radio value="b">选项 B</tsm-radio>
          <tsm-radio value="c">选项 C</tsm-radio>
        </tsm-radio-group>
        <text class="result">当前选中: {{ value1 }}</text>
      </view>

      <!-- 竖直排列 -->
      <view class="demo-card">
        <text class="section-title">竖直排列</text>
        <tsm-radio-group :value="value2" vertical @change="onChange2">
          <tsm-radio value="1">选项 1</tsm-radio>
          <tsm-radio value="2">选项 2</tsm-radio>
          <tsm-radio value="3">选项 3</tsm-radio>
        </tsm-radio-group>
        <text class="result">当前选中: {{ value2 }}</text>
      </view>

      <!-- 禁用状态 -->
      <view class="demo-card">
        <text class="section-title">禁用状态</text>
        <text class="section-desc">禁用整个 RadioGroup</text>
        <tsm-radio-group :value="value3" disabled>
          <tsm-radio value="wechat">微信支付</tsm-radio>
          <tsm-radio value="alipay">支付宝</tsm-radio>
          <tsm-radio value="card">银行卡</tsm-radio>
        </tsm-radio-group>
      </view>

      <!-- 单个 Radio 禁用 -->
      <view class="demo-card">
        <text class="section-title">单个禁用</text>
        <text class="section-desc">只禁用部分选项</text>
        <tsm-radio-group :value="value4" @change="onChange4">
          <tsm-radio value="apple">苹果</tsm-radio>
          <tsm-radio value="banana" disabled>香蕉（禁用）</tsm-radio>
          <tsm-radio value="orange">橙子</tsm-radio>
        </tsm-radio-group>
        <text class="result">当前选中: {{ value4 }}</text>
      </view>

      <!-- 动态数据 -->
      <view class="demo-card">
        <text class="section-title">动态数据</text>
        <tsm-radio-group :value="selectedCity" @change="onCityChange">
          <tsm-radio v-for="city in cities" :key="city.code" :value="city.code">
            {{ city.name }}
          </tsm-radio>
        </tsm-radio-group>
        <text class="result">选中城市: {{ selectedCity }}</text>
      </view>

      <!-- line 样式 -->
      <view class="demo-card">
        <text class="section-title">Line 样式</text>
        <text class="section-desc">未选中时完全空白，选中时显示对号</text>
        <tsm-radio-group :value="value5" @change="onChange5">
          <tsm-radio value="x" fillStyle="line">选项 X</tsm-radio>
          <tsm-radio value="y" fillStyle="line">选项 Y</tsm-radio>
          <tsm-radio value="z" fillStyle="line">选项 Z</tsm-radio>
        </tsm-radio-group>
        <text class="result">当前选中: {{ value5 }}</text>
      </view>

      <!-- line 样式 + 竖直排列 -->
      <view class="demo-card">
        <text class="section-title">Line 样式 + 竖直排列</text>
        <tsm-radio-group :value="value6" vertical @change="onChange6">
          <tsm-radio value="1" fillStyle="line">选项 1</tsm-radio>
          <tsm-radio value="2" fillStyle="line">选项 2</tsm-radio>
          <tsm-radio value="3" fillStyle="line" disabled>选项 3（禁用）</tsm-radio>
        </tsm-radio-group>
        <text class="result">当前选中: {{ value6 }}</text>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 基础用法
const value1 = ref<string>('a');
const onChange1 = (e: { value: string }) => {
  value1.value = e.value;
  console.log('选中:', e.value);
};

// 竖直排列
const value2 = ref<string>('1');
const onChange2 = (e: { value: string }) => {
  value2.value = e.value;
};

// 禁用状态
const value3 = ref<string>('wechat');

// 单个禁用
const value4 = ref<string>('apple');
const onChange4 = (e: { value: string }) => {
  value4.value = e.value;
};

// 动态数据
const cities = ref([
  { code: 'bj', name: '北京' },
  { code: 'sh', name: '上海' },
  { code: 'gz', name: '广州' },
  { code: 'sz', name: '深圳' },
]);
const selectedCity = ref<string>('sh');
const onCityChange = (e: { value: string }) => {
  selectedCity.value = e.value;
};

// line 样式
const value5 = ref<string>('x');
const onChange5 = (e: { value: string }) => {
  value5.value = e.value;
};

// line 样式 + 竖直排列
const value6 = ref<string>('1');
const onChange6 = (e: { value: string }) => {
  value6.value = e.value;
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 12px;
  background: #f7f8fa;
  height: 100%;
  box-sizing: border-box;
}

.header {
  padding: 10px 10px 4px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.subtitle {
  margin-top: 10px;
  font-size: 18px;
  color: #6b7280;
  text-align: center;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 12px 12px;
  margin-bottom: 10px;
  overflow: hidden;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #111827;
}

.section-desc {
  font-size: 11px;
  color: #999;
  margin-bottom: 10px;
  display: block;
}

.result {
  font-size: 12px;
  color: #666;
  margin-top: 10px;
  display: block;
}
</style>
