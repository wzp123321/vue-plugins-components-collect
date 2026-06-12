<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Picker 选择器</text>
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">基础用法</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showBasic = true">打开选择器</tsm-button>
          </view>
          <text class="event-log">选中结果：{{ resultBasic || '未选择' }}</text>
        </view>
        <tsm-picker
          v-model:show="showBasic"
          title="请选择"
          :options="options1"
          @confirm="onConfirmBasic"
          @cancel="showBasic = false"
        />
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">指定初始值（default-value）</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showDefaultValue = true">默认广州市</tsm-button>
          </view>
          <text class="event-log">选中结果：{{ resultDefaultValue || '未选择' }}</text>
        </view>
        <tsm-picker
          v-model:show="showDefaultValue"
          title="请选择城市"
          :options="options2"
          default-value="guangzhou"
          @confirm="onConfirmDefaultValue"
          @cancel="showDefaultValue = false"
        />
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">受控模式（v-model:value）</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showControlled = true">
              当前：{{ getLabelByValue(controlledValue) }}
            </tsm-button>
          </view>
          <text class="event-log">绑定值：{{ controlledValue }}</text>
        </view>
        <tsm-picker
          v-model:show="showControlled"
          v-model:value="controlledValue"
          title="选择性别"
          :options="options3"
          @confirm="showControlled = false"
        />
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">自定义确认按钮</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showCustomTitle = true">自定义按钮文字</tsm-button>
          </view>
        </view>
        <tsm-picker
          v-model:show="showCustomTitle"
          title="选择性别"
          :options="options3"
          confirm-text="好的"
          @confirm="showCustomTitle = false"
        />
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showBasic = ref(false);
const showDefaultValue = ref(false);
const showControlled = ref(false);
const showCustomTitle = ref(false);

const resultBasic = ref('');
const resultDefaultValue = ref('');
const controlledValue = ref<string | number>('male');

const options1 = [
  { label: '星期一', value: 1 },
  { label: '星期二', value: 2 },
  { label: '星期三', value: 3 },
  { label: '星期四', value: 4 },
  { label: '星期五', value: 5 },
  { label: '星期六', value: 6 },
  { label: '星期日', value: 7 },
];

const options2 = [
  { label: '北京市', value: 'beijing' },
  { label: '上海市', value: 'shanghai' },
  { label: '广州市', value: 'guangzhou' },
  { label: '深圳市', value: 'shenzhen' },
  { label: '杭州市', value: 'hangzhou' },
];

const options3 = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '保密', value: 'secret' },
];

const getLabelByValue = (value: string | number) => {
  const option = options3.find(opt => opt.value === value);
  return option?.label ?? value;
};

const onConfirmBasic = (value: string | number) => {
  const option = options1.find(opt => opt.value === value);
  resultBasic.value = option?.label ?? String(value);
};

const onConfirmDefaultValue = (value: string | number) => {
  const option = options2.find(opt => opt.value === value);
  resultDefaultValue.value = option?.label ?? String(value);
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 12px;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  padding: 10px 10px 4px;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 12px 12px;
  margin-bottom: 10px;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: block;
}

.event-log {
  font-size: 14px;
  color: #6b7280;
  display: block;
}
</style>
