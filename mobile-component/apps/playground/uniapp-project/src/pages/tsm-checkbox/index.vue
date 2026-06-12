<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Checkbox 复选框</text>
        <text class="subtitle">用于在多个选项中选择多个</text>
      </view>

      <!-- 三种状态展示 -->
      <view class="demo-card">
        <text class="section-title">三种状态</text>
        <view class="demo-row">
          <view class="state-item">
            <tsm-checkbox label="未选中" :checked="false" />
          </view>
          <view class="state-item">
            <tsm-checkbox label="半选" :indeterminate="true" />
          </view>
          <view class="state-item">
            <tsm-checkbox label="全选" :checked="true" />
          </view>
        </view>
        <view class="demo-row" style="margin-top: 16px">
          <view class="state-item">
            <tsm-checkbox label="未选中禁用" :checked="false" disabled />
          </view>
          <view class="state-item">
            <tsm-checkbox label="半选禁用" :indeterminate="true" disabled />
          </view>
          <view class="state-item">
            <tsm-checkbox label="全选禁用" :checked="true" disabled />
          </view>
        </view>
      </view>

      <!-- 基础用法 -->
      <view class="demo-card">
        <text class="section-title">基础用法（使用 value 属性）</text>
        <view class="demo-row">
          <tsm-checkbox label="选项1" value="option1" v-model:checked="checked1" />
          <tsm-checkbox label="选项2" value="option2" v-model:checked="checked2" />
        </view>
      </view>

      <!-- 禁用状态 -->
      <view class="demo-card">
        <text class="section-title">禁用状态</text>
        <view class="demo-row">
          <tsm-checkbox label="未选中禁用" :checked="false" disabled />
          <tsm-checkbox label="选中禁用" :checked="true" disabled />
        </view>
      </view>

      <!-- 复选框组 -->
      <view class="demo-card">
        <text class="section-title">复选框组 (CheckboxGroup)</text>
        <text class="section-desc">当前选中: {{ groupValue.join(', ') || '无' }}</text>
        <text class="section-desc">@change 事件返回: { value: {{ JSON.stringify(changeValue.value) }} }</text>
        <tsm-checkbox-group v-model="groupValue" @change="onGroupChange">
          <tsm-checkbox value="a" label="选项 A" />
          <tsm-checkbox value="b" label="选项 B" />
          <tsm-checkbox value="c" label="选项 C" />
        </tsm-checkbox-group>
      </view>

      <!-- 排列方向 -->
      <view class="demo-card">
        <text class="section-title">排列方向 (placement)</text>

        <text class="subsection-title">水平排列 (placement="row")</text>
        <tsm-checkbox-group v-model="groupValue2" placement="row">
          <tsm-checkbox value="1" label="选项1" />
          <tsm-checkbox value="2" label="选项2" />
          <tsm-checkbox value="3" label="选项3" />
        </tsm-checkbox-group>

        <text class="subsection-title" style="margin-top: 12px">竖直排列 (placement="column")</text>
        <tsm-checkbox-group v-model="groupValue2" placement="column">
          <tsm-checkbox value="1" label="选项1" />
          <tsm-checkbox value="2" label="选项2" />
          <tsm-checkbox value="3" label="选项3" />
        </tsm-checkbox-group>
      </view>

      <!-- 禁用整组 -->
      <view class="demo-card">
        <text class="section-title">禁用整组</text>
        <tsm-checkbox-group v-model="groupValue3" disabled>
          <tsm-checkbox value="x" label="选项 X" />
          <tsm-checkbox value="y" label="选项 Y" />
          <tsm-checkbox value="z" label="选项 Z" />
        </tsm-checkbox-group>
      </view>

      <!-- 全选/半选示例 -->
      <view class="demo-card">
        <text class="section-title">全选/半选控制示例</text>
        <view class="select-all-row">
          <tsm-checkbox
            label="全选"
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="handleSelectAll"
          />
        </view>
        <view class="divider"></view>
        <tsm-checkbox-group v-model="selectedFruits" @change="onFruitsChange">
          <tsm-checkbox value="apple" label="苹果" />
          <tsm-checkbox value="banana" label="香蕉" />
          <tsm-checkbox value="orange" label="橙子" />
          <tsm-checkbox value="grape" label="葡萄" />
        </tsm-checkbox-group>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 基础用法
const checked1 = ref(false);
const checked2 = ref(true);

// 复选框组
const groupValue = ref<string[]>(['a']);
const groupValue2 = ref<string[]>(['1', '3']);
const groupValue3 = ref<string[]>(['x']);
const changeValue = ref<string[]>([]);

const onGroupChange = (detail: { value: string[] }) => {
  console.log('CheckboxGroup change:', detail);
  changeValue.value = detail.value;
};

// 全选/半选示例
const allFruits = ['apple', 'banana', 'orange', 'grape'];
const selectedFruits = ref<string[]>(['apple', 'banana']);

const isAllSelected = computed(() => {
  return selectedFruits.value.length === allFruits.length && allFruits.length > 0;
});

const isIndeterminate = computed(() => {
  const len = selectedFruits.value.length;
  return len > 0 && len < allFruits.length;
});

// 处理全选复选框的 change 事件
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    // 全选
    selectedFruits.value = [...allFruits];
  } else {
    // 取消全选
    selectedFruits.value = [];
  }
};

const onFruitsChange = (detail: { value: string[] }) => {
  console.log('Fruits change:', detail);
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
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.subsection-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  display: block;
}

.demo-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.state-item {
  display: flex;
  align-items: center;
}

.select-all-row {
  padding: 8px 0;
  margin-bottom: 8px;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 12px 0;
}
</style>
