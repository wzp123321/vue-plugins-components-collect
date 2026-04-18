<template>
  <tsm-theme-provider>
    <view class="container">
      <text class="title">Tabs 标签页</text>

      <view class="section">
        <text class="section-title">默认用法 - Large 尺寸（均分宽度，最多5个）</text>
        <tsm-tabs :list="largeList" size="large" @change="onLargeChange"></tsm-tabs>
        <text class="event-log">当前选中：{{ largeIndex }}</text>
      </view>

      <view class="section">
        <text class="section-title">默认用法 - Small 尺寸（紧凑排列，用于子分类）</text>
        <tsm-tabs :list="smallList" size="small" @change="onSmallChange"></tsm-tabs>
        <text class="event-log">当前选中：{{ smallIndex }}</text>
      </view>

      <view class="section">
        <text class="section-title">等距选项卡 - 可横向滑动 + 列表弹出层</text>
        <tsm-tabs
          :list="scrollableList"
          scrollable
          show-list-icon
          @change="onScrollableChange"
          @list-click="onListClick"
        ></tsm-tabs>
        <text class="event-log">当前选中：{{ scrollableIndex }}</text>

        <tsm-popup mode="bottom" :show="showListPopup" @close="showListPopup = false">
          <view class="list-popup">
            <view class="list-popup__header">
              <text class="list-popup__title">选择标签</text>
              <icon-close class="list-popup__close" @tap="showListPopup = false" />
            </view>
            <view class="list-popup__body">
              <view
                v-for="(item, index) in scrollableList"
                :key="index"
                class="list-popup__item"
                :class="{ 'list-popup__item--active': scrollableIndex === index }"
                @tap="selectFromList(index)"
              >
                <text class="list-popup__item-text">{{ item.name }}</text>
                <icon-check v-if="scrollableIndex === index" class="list-popup__item-icon" />
              </view>
            </view>
          </view>
        </tsm-popup>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const largeList = [{ name: '标签1' }, { name: '标签2' }, { name: '标签3' }];

const smallList = [{ name: '全部' }, { name: '进行中' }, { name: '已完成' }, { name: '已取消' }];

const scrollableList = [
  { name: '推荐' },
  { name: '热门资讯' },
  { name: '科技前沿' },
  { name: '财经动态' },
  { name: '体育赛事' },
  { name: '娱乐八卦' },
  { name: '生活百科' },
];

const largeIndex = ref(0);
const smallIndex = ref(0);
const scrollableIndex = ref(0);
const showListPopup = ref(false);

const onLargeChange = (index: number) => {
  largeIndex.value = index;
};

const onSmallChange = (index: number) => {
  smallIndex.value = index;
};

const onScrollableChange = (index: number) => {
  scrollableIndex.value = index;
};

const onListClick = () => {
  showListPopup.value = true;
};

const selectFromList = (index: number) => {
  scrollableIndex.value = index;
  showListPopup.value = false;
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #666;
}

.event-log {
  margin-top: 16px;
  font-size: 20px;
  color: #999;
}

.list-popup {
  background-color: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding-bottom: env(safe-area-inset-bottom);
}

.list-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #ebedf0;
}

.list-popup__title {
  font-size: 28px;
  font-weight: bold;
  color: #323233;
}

.list-popup__close {
  font-size: 32px;
  color: #969799;
}

.list-popup__body {
  max-height: 600px;
  overflow-y: auto;
}

.list-popup__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px;
  border-bottom: 1px solid #f7f8fa;
}

.list-popup__item--active {
  background-color: #f7f8fa;
}

.list-popup__item-text {
  font-size: 28px;
  color: #323233;
}

.list-popup__item-icon {
  font-size: 32px;
  color: var(--tsm-color-primary);
}
</style>
