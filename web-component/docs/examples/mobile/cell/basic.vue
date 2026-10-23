<template>
  <view class="cell-container">
    <!-- 水平布局 -->
    <tem-cell
      titleText="标题文字"
      descriptionText="这是一段描述文字"
      showLeft
      showArrow
      showContent
    >
      <template #left><TemAvatar text="A" /> </template>
      <template #content>中间插槽</template>
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell>
    <!-- 垂直布局 -->
    <tem-cell
      titleText="标题文字"
      descriptionText="这是一段描述文字"
      showLeft
      showArrow
      showContent
      layout="vertical"
    >
      <template #left><TemAvatar text="A" /> </template>
      <template #content>中间插槽</template>
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell>
    <!-- 不显示左侧 -->
    <tem-cell
      titleText="标题文字"
      descriptionText="这是一段描述文字"
      showArrow
      showContent
      layout="vertical"
    >
      <template #content>中间插槽</template>
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell>
    <tem-cell titleText="标题文字" showLeft showContent showArrow require>
      <template #left>
        <TemAvatar text="M" />
      </template>
      <template #content>
        <TemAvatar text="A" />
      </template>
    </tem-cell>
    <tem-cell titleText="标题文字" showLeft>
      <template #left>
        <TemAvatar text="A" />
      </template>
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell>
    <!-- 垂直布局 -->
    <tem-cell
      titleText="标题文字标题文字标题文字标题文字标题文字标题文字标题文字标题文字"
      descriptionText="这是一段描述文字这是一段描述文字这是一段描述文字这是一段描述文字这是一段描述文字"
      showLeft
      showArrow
      showContent
      layout="vertical"
      :center-left="false"
    >
      <template #left><TemAvatar text="A" /> </template>
      <template #content>中间插槽</template>
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell>
    <!-- 置顶 -->
    <tem-cell
      titleText="标题文字标题文字标题文字标题文字标题文字标题文字标题文字"
      :centerLeft="false"
      showContent
      showLeft
    >
      <template #left>
        <TemAvatar text="A" />
      </template>
      <template #content
        >中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽</template
      >
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell>
    <tem-cell
      titleText="标题文字标题文字标题文字标题文字标题文字标题文字标题文字"
      showContent
      showLeft
    >
      <template #left>
        <TemAvatar text="A" />
      </template>
      <template #content
        >中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽中间插槽</template
      >
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell>
    <tem-cell titleText="标题文字" showLeft>
      <template #left>
        <TemAvatar text="A" />
      </template>
      <template #icon>
        <IconCircleCheck />
      </template>
    </tem-cell>
  </view>
</template>

<script>
// import { TemCell, TemAvatar } from '@zpackage/mobile-package';
// import {
//   IconWarning,
//   IconCircleCheck,
//   IconCircleClose,
//   IconLoadingWhite,
// } from '@arco-iconbox/vue-tem';
export default {
  components: {
    // IconWarning,
    // IconCircleCheck,
    // IconCircleClose,
    // IconLoadingWhite,
  },
  data() {
    return {
      selectValue: 'A',
    };
  },
  mounted() {
    setTimeout(() => {
      this.selectValue = 'B';
    }, 4000);
  },
  methods: {
    onClick(type) {
      console.log('clickType', type);
    },
  },
};
</script>

<style lang="scss">
.cell-container {
  .temicon--icon {
    width: 48rpx;
    height: 48rpx;
    color: var(--tem-color-primary);
  }
}
</style>
