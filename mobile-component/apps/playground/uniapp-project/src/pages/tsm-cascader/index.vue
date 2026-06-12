<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Cascader 级联选择器</text>
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">基础用法（三级省市区）</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showBasic = true">打开选择器</tsm-button>
          </view>
          <text class="event-log">选中结果：{{ basicLabels || '未选择' }}</text>
        </view>
        <tsm-cascader
          :show="showBasic"
          title="选择地区"
          :options="areaOptions"
          placeholder="请选择"
          @change="onChangeBasic"
          @update:show="showBasic = $event"
        />
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">受控模式（v-model:value）</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showControlled = true">选择地区</tsm-button>
          </view>
          <text class="event-log">绑定值：{{ controlledValue || '未选择' }}</text>
          <text class="event-log">显示值：{{ controlledLabels || '未选择' }}</text>
        </view>
        <tsm-cascader
          :show="showControlled"
          v-model:value="controlledValue"
          title="选择地区"
          :options="areaOptions"
          placeholder="请选择"
          @change="onChangeControlled"
          @update:show="showControlled = $event"
        />
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">初始值回显（default-value）</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showDefaultValue = true">默认选中西湖区</tsm-button>
          </view>
          <text class="event-log">当前值：{{ defaultValueLabels }}</text>
        </view>
        <tsm-cascader
          :show="showDefaultValue"
          v-model:value="defaultValueResult"
          title="选择地区"
          :options="areaOptions"
          default-value="330105"
          placeholder="请选择"
          @change="onChangeDefaultValue"
          @update:show="showDefaultValue = $event"
        />
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">checkStrictly 模式（任意级别）</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showCheckStrictly = true">可选省/市/区任意级别</tsm-button>
          </view>
          <text class="event-log">选中结果：{{ checkStrictlyLabels || '未选择' }}</text>
        </view>
        <tsm-cascader
          :show="showCheckStrictly"
          v-model:value="checkStrictlyValue"
          title="选择地区"
          :options="areaOptions"
          placeholder="请选择"
          :check-strictly="true"
          confirm-text="确定"
          @change="onChangeCheckStrictly"
          @update:show="showCheckStrictly = $event"
        />
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">禁用状态</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showDisabled = true">包含禁用选项</tsm-button>
          </view>
          <text class="event-log">选中结果：{{ disabledLabels || '未选择' }}</text>
        </view>
        <tsm-cascader
          :show="showDisabled"
          v-model:value="disabledValue"
          title="选择地区"
          :options="areaOptionsWithDisabled"
          placeholder="请选择"
          @change="onChangeDisabled"
          @update:show="showDisabled = $event"
        />
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">自定义字段映射（keys）</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showKeys = true">使用 name/id/items</tsm-button>
          </view>
          <text class="event-log">选中结果：{{ keysLabels || '未选择' }}</text>
        </view>
        <tsm-cascader
          :show="showKeys"
          v-model:value="keysValue"
          title="选择地区"
          :options="customKeyOptions as any"
          :keys="{ label: 'name', value: 'id', children: 'items' }"
          placeholder="请选择"
          @change="onChangeKeys"
          @update:show="showKeys = $event"
        />
      </view>

      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">大数据量测试</text>
          <view class="demo-actions">
            <tsm-button theme="primary" size="s" @click="showLargeData = true">100省 × 80市 × 60区</tsm-button>
          </view>
          <text class="event-log">选中结果：{{ largeDataLabels || '未选择' }}</text>
        </view>
        <tsm-cascader
          :show="showLargeData"
          v-model:value="largeDataValue"
          title="选择地区（大数据量）"
          :options="largeDataOptions"
          placeholder="请选择"
          @change="onChangeLargeData"
          @update:show="showLargeData = $event"
        />
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showBasic = ref(false);
const showControlled = ref(false);
const showDefaultValue = ref(false);
const showCheckStrictly = ref(false);
const showDisabled = ref(false);
const showKeys = ref(false);
const showLargeData = ref(false);

const basicLabels = ref('');
const controlledValue = ref<string | number>();
const controlledLabels = ref('');
const defaultValueResult = ref<string | number>('330105');
const defaultValueLabels = ref('浙江省/杭州市/西湖区');
const checkStrictlyValue = ref<string | number>();
const checkStrictlyLabels = ref('');
const disabledValue = ref<string | number>();
const disabledLabels = ref('');
const keysValue = ref<string | number>();
const keysLabels = ref('');
const largeDataValue = ref<string | number>();
const largeDataLabels = ref('');

const getLabelsPath = (selectedOptions: any[], labelKey = 'label') => {
  return selectedOptions.map(o => o[labelKey]).join('/');
};

const areaOptions = [
  {
    label: '浙江省',
    value: '330000',
    children: [
      {
        label: '杭州市',
        value: '330100',
        children: [
          { label: '西湖区', value: '330105' },
          { label: '余杭区', value: '330110' },
          { label: '萧山区', value: '330109' },
        ],
      },
      {
        label: '宁波市',
        value: '330200',
        children: [
          { label: '海曙区', value: '330203' },
          { label: '江北区', value: '330205' },
        ],
      },
    ],
  },
  {
    label: '广东省',
    value: '440000',
    children: [
      {
        label: '广州市',
        value: '440100',
        children: [
          { label: '天河区', value: '440106' },
          { label: '越秀区', value: '440104' },
        ],
      },
      {
        label: '深圳市',
        value: '440300',
        children: [
          { label: '南山区', value: '440305' },
          { label: '福田区', value: '440304' },
        ],
      },
    ],
  },
];

const areaOptionsWithDisabled = [
  {
    label: '浙江省',
    value: '330000',
    children: [
      {
        label: '杭州市',
        value: '330100',
        disabled: true,
        children: [
          { label: '西湖区', value: '330105' },
          { label: '余杭区', value: '330110' },
        ],
      },
      {
        label: '宁波市',
        value: '330200',
        children: [
          { label: '海曙区', value: '330203' },
          { label: '江北区', value: '330205' },
        ],
      },
    ],
  },
  {
    label: '广东省',
    value: '440000',
    children: [
      {
        label: '广州市',
        value: '440100',
        children: [
          { label: '天河区', value: '440106' },
          { label: '越秀区', value: '440104' },
        ],
      },
    ],
  },
];

const customKeyOptions = [
  {
    name: '浙江省',
    id: '330000',
    items: [
      {
        name: '杭州市',
        id: '330100',
        items: [
          { name: '西湖区', id: '330105' },
          { name: '余杭区', id: '330110' },
        ],
      },
    ],
  },
  {
    name: '广东省',
    id: '440000',
    items: [
      {
        name: '广州市',
        id: '440100',
        items: [{ name: '天河区', id: '440106' }],
      },
    ],
  },
];

const generateLargeData = () => {
  const provinces: any[] = [];
  for (let p = 0; p < 100; p++) {
    const provinceCode = `P${String(p).padStart(3, '0')}`;
    const cities: any[] = [];
    for (let c = 0; c < 80; c++) {
      const cityCode = `${provinceCode}C${String(c).padStart(2, '0')}`;
      const districts: any[] = [];
      for (let d = 0; d < 60; d++) {
        districts.push({
          label: `区${d + 1}`,
          value: `${cityCode}D${String(d).padStart(2, '0')}`,
        });
      }
      cities.push({
        label: `城市${c + 1}`,
        value: cityCode,
        children: districts,
      });
    }
    provinces.push({
      label: `省份${p + 1}`,
      value: provinceCode,
      children: cities,
    });
  }
  return provinces;
};

const largeDataOptions = generateLargeData();

const onChangeBasic = (result: { value: string | number; selectedOptions: any[] }) => {
  basicLabels.value = getLabelsPath(result.selectedOptions);
};

const onChangeControlled = (result: { value: string | number; selectedOptions: any[] }) => {
  controlledValue.value = result.value;
  controlledLabels.value = getLabelsPath(result.selectedOptions);
};

const onChangeDefaultValue = (result: { value: string | number; selectedOptions: any[] }) => {
  defaultValueResult.value = result.value;
  defaultValueLabels.value = getLabelsPath(result.selectedOptions);
};

const onChangeCheckStrictly = (result: { value: string | number; selectedOptions: any[] }) => {
  checkStrictlyValue.value = result.value;
  checkStrictlyLabels.value = getLabelsPath(result.selectedOptions);
};

const onChangeDisabled = (result: { value: string | number; selectedOptions: any[] }) => {
  disabledValue.value = result.value;
  disabledLabels.value = getLabelsPath(result.selectedOptions);
};

const onChangeKeys = (result: { value: string | number; selectedOptions: any[] }) => {
  keysValue.value = result.value;
  keysLabels.value = getLabelsPath(result.selectedOptions, 'name');
};

const onChangeLargeData = (result: { value: string | number; selectedOptions: any[] }) => {
  largeDataValue.value = result.value;
  largeDataLabels.value = getLabelsPath(result.selectedOptions);
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
  display: block;
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
