/** * Empty 空状态组件 * @description 空状态组件，用于显示空数据提示 */
<template>
  <view class="tsm-empty" :class="bemClass" :style="customStyle">
    <!-- 图标 -->
    <view class="tsm-empty-icon" v-if="isIcon || scene === 'page'">
      <image
        :src="typeImage[(type + (scene === 'block' ? 'Block' : '')) as keyof typeof typeImage]"
        class="tsm-empty-icon-img"
      />
    </view>
    <!-- 标题 -->
    <view v-if="title && scene === 'page'" class="tsm-empty-title">{{ title }}</view>
    <!-- 描述 -->
    <view v-if="description" class="tsm-empty-description">{{ description }}</view>
    <!-- 按钮 -->
    <tsm-button type="primary" v-if="buttonText && scene === 'page'" class="tsm-empty-button" @tap="handleButtonClick">
      {{ buttonText }}
    </tsm-button>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { EmptyProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';
import picBlockNodata from '../../../assets/image/empty/pic-block-nodata.png';
import picBlockNoresult from '../../../assets/image/empty/pic-block-noresult.png';
import picBlockUnauthorized from '../../../assets/image/empty/pic-block-unauthorized.png';
import picPageLoadfailed from '../../../assets/image/empty/pic-page-loadfailed.png';
import picPageNoData from '../../../assets/image/empty/pic-page-nodata.png';
import picPageNointernet from '../../../assets/image/empty/pic-page-nointernet.png';
import picPageNomessage from '../../../assets/image/empty/pic-page-nomessage.png';
import picPageNoPicture from '../../../assets/image/empty/pic-page-nopicture.png';
import picPageNoresult from '../../../assets/image/empty/pic-page-noresult.png';
import picPageSuccessful from '../../../assets/image/empty/pic-page-successful.png';
import picPageUnauthorized from '../../../assets/image/empty/pic-page-unauthorized.png';

const props = withDefaults(defineProps<EmptyProps>(), defaultProps);
const emit = defineEmits(['btnClick']);
const typeImage = ref({
  noDataBlock: picBlockNodata,
  noSearchBlock: picBlockNoresult,
  noAuthorityBlock: picBlockUnauthorized,
  loadingError: picPageLoadfailed,
  noData: picPageNoData,
  noInternet: picPageNointernet,
  noMessage: picPageNomessage,
  noImage: picPageNoPicture,
  noSearch: picPageNoresult,
  successTips: picPageSuccessful,
  noAuthority: picPageUnauthorized,
});

const bemClass = computed(() => {
  return bem('empty', [props.scene], [], props.customClass);
});

const handleButtonClick = () => {
  emit('btnClick');
};
</script>

<style scoped lang="scss">
.tsm-empty {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--tsm-spacing-xl);

  .tsm-empty-icon {
    width: 100px;
    height: 100px;
    padding-right: 0.99px;
    display: flex;
    align-items: center;
    justify-content: center;

    .tsm-empty-icon-img {
      width: 100%;
      height: 100%;
    }
  }

  .tsm-empty-title {
    color: var(--tsm-color-text-primary);
    text-align: center;
    font-family: var(--tsm-font-family-regular);
    font-size: var(--tsm-font-size-text-l);
    font-style: normal;
    font-weight: var(-tsm-font-weight-regular);
    line-height: var(--tsm-line-height-text-l); /* 150% */
  }

  .tsm-empty-description {
    color: var(--tsm-color-text-secondary);
    text-align: center;
    font-family: var(--tsm-font-family-regular);
    font-size: var(--tsm-font-size-text-m);
    font-style: normal;
    font-weight: var(-tsm-font-weight-regular);
    line-height: var(--tsm-line-height-text-m); /* 157.143% */
  }
}
.tsm-empty--block {
  .tsm-empty-icon {
    width: 60px;
    height: 60px;
  }
}
</style>
