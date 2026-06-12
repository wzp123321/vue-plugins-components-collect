<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="demo-card">
        <view class="demo-grid">
          <tsm-list
            type="default"
            @switch-change="handleSwitchChange"
            @item-click="handleItemClicked"
            v-model:list="data"
          ></tsm-list>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { markRaw, ref } from 'vue';
import IconBuiltUpArea from '@/uni_modules/@tiansu/ts-icon/mobile/vue/icon-built-up-area';

const handleItemClicked = (item: any, index: number) => {
  console.log('Item clicked:', item, index);
};
const handleSwitchChange = (item: any, index: number) => {
  console.log('Switch changed:', item, index);
};

const pictureUrl =
  'https://s1.aigei.com/src/img/png/3a/3a3643b6c7244fdcac81503ad91d5314.png?imageMogr2/auto-orient/thumbnail/!282x320r/crop/!282x320a0a0/quality/85/%7CimageView2/2/w/282&e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:edv9hg6dnIA8yyppPwrI9dEsWkM=';
const data = ref([
  {
    title: '这是标题',
    main: '列表项 1',
    checked: true,
    tag: '标签',
    description: '描述：这是列表项 1 的描述信息',
    prefixicon: markRaw(IconBuiltUpArea),
    avatar: pictureUrl,
    disabled: true,
    extra: '额外信息',
  },
  {
    title: '这是标题',
    main: '列表项 2',
    checked: false,
    tag: '标签',
    description: '描述：这是列表项 2 的描述信息',
    prefixicon: markRaw(IconBuiltUpArea),
    avatar: pictureUrl,
    extra: '额外信息',
  },
  {
    title: '这是标题',
    main: '列表项 3',
    checked: false,
    tag: '标签',
    description: '描述：这是列表项 3 的描述信息',
    avatar: pictureUrl,
    prefixicon: markRaw(IconBuiltUpArea),
  },
]);
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  background: #f7f8fa;
  height: 100vh;
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
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #111827;
}

.demo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
}

.demo-item {
  width: 104px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.demo-item--wide {
  width: 100%;
  align-items: flex-start;
}

.demo-item__label {
  margin-top: 6px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.2;
}
</style>
