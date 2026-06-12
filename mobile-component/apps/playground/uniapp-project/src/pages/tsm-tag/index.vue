<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Tag 标签组件</text>
      </view>

      <view class="demo-card">
        <text class="section-title">基础用法</text>
        <view class="demo-row">
          <tsm-tag text="默认标签" />
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">类型</text>
        <view class="demo-row">
          <tsm-tag type="default" text="默认" />
          <tsm-tag type="primary" text="主要" />
          <tsm-tag type="success" text="成功" />
          <tsm-tag type="warning" text="警告" />
          <tsm-tag type="error" text="错误" />
        </view>
        <view class="demo-row">
          <tsm-tag type="default" :borderless="true" text="默认无边框" />
          <tsm-tag type="primary" :borderless="true" text="主要无边框" />
          <tsm-tag type="success" :borderless="true" text="成功无边框" />
          <tsm-tag type="warning" :borderless="true" text="警告无边框" />
          <tsm-tag type="error" :borderless="true" text="错误无边框" />
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">尺寸</text>
        <view class="demo-row">
          <tsm-tag size="small" text="小标签" />
          <tsm-tag size="medium" text="中标签" />
          <tsm-tag size="large" text="大标签" />
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">形状</text>
        <view class="demo-row">
          <tsm-tag shape="square" text="方形" />
          <tsm-tag shape="bubble" text="气泡形" />
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">带图标</text>
        <view class="demo-row">
          <tsm-tag text="带图标">
            <template #icon>
              <icon-setting />
            </template>
          </tsm-tag>
          <tsm-tag type="primary" text="主要标签">
            <template #icon>
              <icon-setting />
            </template>
          </tsm-tag>
          <tsm-tag type="success" text="成功标签">
            <template #icon>
              <icon-setting />
            </template>
          </tsm-tag>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">可关闭</text>
        <view class="demo-row">
          <tsm-tag :closable="true" text="可关闭标签" @close="onClose" />
        </view>
        <view class="demo-row">
          <tsm-tag type="primary" :closable="true" text="主要标签" @close="onClose" />
        </view>
        <view class="demo-row">
          <tsm-tag type="success" :closable="true" text="成功标签" @close="onClose" />
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">带图标 + 可关闭</text>
        <view class="demo-row">
          <tsm-tag :closable="true" text="完整配置" @close="onClose">
            <template #icon>
              <icon-setting />
            </template>
          </tsm-tag>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">可选中（select）</text>
        <view class="demo-row">
          <tsm-tag
            :selectable="true"
            select-type="select"
            value="city-beijing"
            label="北京"
            v-model:selected="beijingSelected"
            @change="onSelectableChange"
          />
          <tsm-tag
            :selectable="true"
            select-type="select"
            value="city-shanghai"
            label="上海"
            v-model:selected="shanghaiSelected"
            @change="onSelectableChange"
          />
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">可选中（input）</text>
        <view class="demo-row">
          <tsm-tag :selectable="true" select-type="input" v-model:value="inputTagValue1">
            <template #icon>
              <icon-setting />
            </template>
            <tsm-input v-model="inputTagValue1" placeholder="Placeholder" class="tag-input" />
          </tsm-tag>
          <tsm-tag :selectable="true" select-type="input" v-model:value="inputTagValue2">
            <tsm-input v-model="inputTagValue2" placeholder="Placeholder" class="tag-input" />
          </tsm-tag>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">可选中禁用态</text>
        <view class="demo-row">
          <tsm-tag :selectable="true" select-type="select" value="dis-a" label="未选中禁用" :disabled="true" />
          <tsm-tag
            :selectable="true"
            select-type="select"
            value="dis-b"
            label="选中禁用"
            :selected="true"
            :disabled="true"
          />
        </view>
        <view class="demo-row">
          <tsm-tag :selectable="true" select-type="input" v-model:value="inputTagDisabledValue1" :disabled="true">
            <tsm-input v-model="inputTagDisabledValue1" placeholder="Placeholder" class="tag-input" disabled />
          </tsm-tag>
          <tsm-tag :selectable="true" select-type="input" v-model:value="inputTagDisabledValue2" :disabled="true">
            <tsm-input v-model="inputTagDisabledValue2" placeholder="Placeholder" class="tag-input" disabled />
          </tsm-tag>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const beijingSelected = ref(false);
const shanghaiSelected = ref(true);
const inputTagValue1 = ref<string>('');
const inputTagValue2 = ref<string>('Changed Text');
const inputTagDisabledValue1 = ref<string>('');
const inputTagDisabledValue2 = ref<string>('Changed Text');

const onSelectableChange = (payload: {
  selected: boolean;
  value: string | number | null | undefined;
  label?: string;
  selectType: 'input' | 'select';
}) => {
  uni.showToast({
    title: `${payload.label || payload.value || 'tag'}:${payload.selected ? '选中' : '取消'}`,
    icon: 'none',
    duration: 1200,
  });
};

const onClose = () => {
  uni.showToast({
    title: '关闭标签',
    icon: 'none',
    duration: 1500,
  });
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

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #111827;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  margin-bottom: 10px;
}

.demo-row:last-child {
  margin-bottom: 0;
}

.input-slot-placeholder {
  color: #86909c;
}

.input-slot-value {
  color: #1d2129;
}

.tag-input {
  width: 100%;
}
</style>
