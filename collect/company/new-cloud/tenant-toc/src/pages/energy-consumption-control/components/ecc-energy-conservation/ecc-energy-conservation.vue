<template>
  <div class="ecc-energy-conservation">
    <sub-title title="节能数据"></sub-title>
    <section class="eec-container">
      <!-- 两个卡片 -->
      <div class="eec-container-cards">
        <div class="eec-container-cards-item eec-container-cards-item-manage">
          <p class="eec-container-cards-item-title">管理节能率</p>
          <p class="eec-container-cards-item-percent">
            {{
              props?.energySavingData?.manageSavingRatio !== ''
                ? `${floatMultiply(Number(props?.energySavingData?.manageSavingRatio), 100)}%`
                : '-'
            }}
          </p>
        </div>
        <div class="eec-container-cards-item eec-container-cards-item-skill">
          <p class="eec-container-cards-item-title">技术节能率</p>
          <p class="eec-container-cards-item-percent">
            {{
              props?.energySavingData?.technicalSavingRatio !== ''
                ? `${floatMultiply(Number(props?.energySavingData?.technicalSavingRatio), 100)}%`
                : '-'
            }}
          </p>
        </div>
      </div>
      <!-- 图表 -->
      <slot></slot>
    </section>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { PropType } from 'vue';
// api
import { Ecc_ISavingCardDataVO } from '../../energy-consumption-control.api';
import { floatMultiply } from '@/utils';

const props = defineProps({
  energySavingData: {
    type: Object as PropType<Ecc_ISavingCardDataVO>,
  },
});
</script>
<style lang="less" scoped>
.ecc-energy-conservation {
  width: 100%;
  height: 305px;
  display: flex;
  flex-direction: column;
  margin-top: var(--te-space-8);

  :deep(.sub-title) {
    span {
      line-height: var(--te-space-24);
    }
  }

  .eec-container {
    flex: auto;
    display: flex;

    .eec-container-cards {
      width: 560px;
      height: 100%;
      display: flex;
      gap: var(--te-space-16);

      .eec-container-cards-item {
        width: 272px;
        height: 100%;
      }

      .eec-container-cards-item.eec-container-cards-item-manage {
        background: linear-gradient(180deg, rgba(24, 144, 255, 0.01) 0%, rgba(24, 144, 255, 0.1) 100%);
        background-image: url('../../../../assets/images/energy-consumption-control/ecc-manage-bg.png');
        background-size: contain;
      }

      .eec-container-cards-item.eec-container-cards-item-skill {
        background: linear-gradient(180deg, rgba(26, 212, 78, 0.01) 0%, rgba(26, 212, 78, 0.1) 100%);
        background-image: url('../../../../assets/images/energy-consumption-control/ecc-skill-bg.png');
        background-size: contain;
      }

      .eec-container-cards-item p {
        margin-top: var(--te-space-24);
        margin-left: var(--te-space-16);
        color: rgba(0, 0, 0, 0.65);
      }

      .eec-container-cards-item > .eec-container-cards-item-percent {
        color: var(--te-text-color-primary);
        font-size: 28px;
        line-height: 36px;
        margin-top: var(--te-space-8);
        font-weight: 700;
      }
    }
  }
}
</style>
