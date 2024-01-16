<template>
  <view class="es-energy-switch">
    <view
      v-for="item in props.energyCodeList"
      :class="['ees-section-energy-item', item.code === props.energyCode ? 'ees-section-energy-item-selected' : '']"
      :key="item.code"
      @click="handleEnergyChange(item.code)"
    >
      {{ item.name }}
    </view>
  </view>
</template>
<script lang="ts" setup>
// 公共库
import type { PropType } from 'vue';
// api
import type { Common_ICodeName } from '../../../../api/model';
// props
const props = defineProps({
  energyCodeList: {
    type: Array as PropType<Common_ICodeName<string>[]>,
    default: [],
  },
  energyCode: {
    type: String,
    default: '',
  },
});
// emits
const emits = defineEmits(['change']);
/**
 * 切换能源类型
 * @param value
 */
const handleEnergyChange = (value: string) => {
  emits('change', value);
};
</script>
<style lang="scss" scoped>
.es-energy-switch {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200rpx, 1fr));
  grid-auto-rows: minmax(80rpx, auto);
  gap: 16rpx;
  margin-bottom: 32rpx;

  .ees-section-energy-item {
    background-color: var(--tem-fill-color);
    border-radius: 8rpx;
    text-align: center;
    line-height: 80rpx;
    overflow: hidden;
    text-overflow: ellipsis;

    font-size: var(--tem-font-size-b14);
    color: var(--tem-text-color-regular);
  }

  .ees-section-energy-item.ees-section-energy-item-selected {
    background-color: var(--tem-color-primary-light-9);
    color: rgb(14, 109, 250);
  }
}
</style>
