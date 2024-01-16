<template>
  <div class="ecc-energy-data" id="ecc-energy-data">
    <sub-title title="能耗数据"></sub-title>
    <section>
      <div class="ecc-ed-card">
        <div class="ecc-ec-item actual">
          <div class="left-wrapper">
            <div class="title">实际能耗{{ energyUnit }}</div>
            <div class="count" :title="thousandSeparation(energyCardData.actualValue)">
              <strong>{{ thousandSeparation(energyCardData.actualValue) }}</strong>
            </div>
          </div>
          <div class="right-wrapper">
            <div class="title">
              <span>采集偏差量{{ energyUnit }}</span>
              <div class="ecc-ec-item-tooltip">
                <img src="../../../../assets/images/project-manage/pm-question-mark.svg" alt="描述" />
                <div>（实际能耗量-采集值）/实际能耗量</div>
              </div>
            </div>
            <div class="count">
              <strong :title="thousandSeparation(energyCardData.actualDiffValue)">
                {{ thousandSeparation(energyCardData.actualDiffValue) }}
              </strong>
              <sub :title="energyCardData.actualDiffRatio !== '' ? `${energyCardData.actualDiffRatio}%` : ''">
                {{
                  energyCardData.actualDiffRatio !== ''
                    ? `${Number(energyCardData.actualDiffRatio) > 0 ? '+' : ''}${energyCardData.actualDiffRatio}%`
                    : ''
                }}
              </sub>
            </div>
          </div>
        </div>

        <div class="ecc-ec-item ratio">
          <div class="left-wrapper">
            <div class="title">同比能耗{{ energyUnit }}</div>
            <div class="count" :title="thousandSeparation(energyCardData.yearOnYearValue)">
              <strong>{{ thousandSeparation(energyCardData.yearOnYearValue) }}</strong>
            </div>
          </div>
          <div class="right-wrapper">
            <div class="title">
              <span>同比偏差量{{ energyUnit }}</span>
              <div class="ecc-ec-item-tooltip">
                <img src="../../../../assets/images/project-manage/pm-question-mark.svg" alt="描述" />
                <div>（实际能耗量-同比能耗量）/同比能耗量</div>
              </div>
            </div>
            <div class="count">
              <strong
                :class="['num', mapYearClass(energyCardData.yearOnYearDiffValue)]"
                :title="thousandSeparation(energyCardData.yearOnYearDiffValue)"
              >
                {{ thousandSeparation(energyCardData.yearOnYearDiffValue) }}
              </strong>
              <sub
                :class="['percent', mapYearClass(energyCardData.yearOnYearDiffRatio)]"
                :title="energyCardData.yearOnYearDiffRatio !== '' ? `${energyCardData.yearOnYearDiffRatio}%` : ''"
              >
                {{
                  energyCardData.yearOnYearDiffRatio !== ''
                    ? `${Number(energyCardData.yearOnYearDiffRatio) > 0 ? '+' : ''}${
                        energyCardData.yearOnYearDiffRatio
                      }%`
                    : ''
                }}
              </sub>
            </div>
          </div>
        </div>

        <div class="ecc-ec-item budget">
          <div class="left-wrapper">
            <div class="title">预算能耗{{ energyUnit }}</div>
            <div class="count" :title="thousandSeparation(energyCardData.budgetValue)">
              <strong>{{ thousandSeparation(energyCardData.budgetValue) }}</strong>
            </div>
          </div>
          <div class="right-wrapper">
            <div class="title">
              <span>预核算偏差量{{ energyUnit }}</span>
              <div class="ecc-ec-item-tooltip">
                <img src="../../../../assets/images/project-manage/pm-question-mark.svg" alt="描述" />
                <div>（实际能耗量-预算能耗值）/预算能耗值</div>
              </div>
            </div>
            <div class="count">
              <strong
                :class="['num', mapDownOrUpClass(energyCardData.budgetDiffValue)]"
                :title="thousandSeparation(energyCardData.budgetDiffValue)"
              >
                {{ thousandSeparation(energyCardData.budgetDiffValue) }}
              </strong>
              <sub
                :class="['percent', mapDownOrUpClass(energyCardData.budgetDiffRatio)]"
                :title="energyCardData.budgetDiffRatio !== '' ? `${energyCardData.budgetDiffRatio}%` : ''"
              >
                {{
                  energyCardData.budgetDiffRatio !== ''
                    ? `${energyCardData.budgetDiffRatio && Number(energyCardData.budgetDiffRatio) > 0 ? '+' : ''}${
                        energyCardData.budgetDiffRatio
                      }%`
                    : ''
                }}
              </sub>
            </div>
          </div>
        </div>
      </div>
      <slot></slot>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed } from 'vue';
import { ECC_DOWNLOAD_COLOR, ECC_UP_COLOR, ECC_IEnergyDataVO } from '../../energy-consumption-control.api';

import { thousandSeparation } from '../../../../utils/index';

const props = defineProps({
  energyCardData: {
    type: Object as PropType<ECC_IEnergyDataVO>,
    default: {},
  },
});
const energyCardData = computed(() => {
  return props.energyCardData;
});
const energyUnit = computed(() => {
  return props?.energyCardData?.unit ? `（${props?.energyCardData?.unit}）` : '';
});

function mapYearClass(value: number | string | null) {
  return value !== null && value !== '' && value !== 0 ? (Number(value) < 0 ? 'up' : 'down') : '';
}
function mapDownOrUpClass(value: number | string | null) {
  return value !== null && value !== '' && value !== 0 ? (Number(value) < 0 ? 'up' : 'down') : '';
}
</script>
<style lang="less" scoped>
#ecc-energy-data {
  section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .ecc-ed-card {
    display: flex;
    flex-direction: column;

    .ecc-ec-item {
      width: 560px;
      padding: 23px 16px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: row;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
      border-left: 3px solid;

      &.actual {
        background: linear-gradient(90deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0) 100%);
        border-left-color: rgba(24, 144, 255, 1);
      }

      &.ratio {
        background: linear-gradient(90deg, rgba(151, 164, 197, 0.1) 0%, rgba(151, 164, 197, 0) 100%);
        border-left-color: rgba(151, 164, 197, 1);
      }

      &.budget {
        background: linear-gradient(90deg, rgba(250, 173, 20, 0.1) 0%, rgba(250, 173, 20, 0) 100%);
        border-left-color: rgba(250, 173, 20, 1);
      }
    }

    .left-wrapper,
    .right-wrapper {
      max-width: 50%;
      flex: auto;

      div.title {
        color: var(--color-text-primary);
        font-family: PingFang SC;
        font-size: 14px;
        line-height: 22px;
        letter-spacing: 0px;

        display: flex;
        align-items: center;

        img {
          width: 14px;
          height: 14px;

          margin-left: 5px;
        }
      }

      div.count {
        display: flex;
        flex-direction: row;
        align-items: flex-end;

        margin-top: 8px;

        strong {
          color: var(--color-text-title);
          font-size: 24px;
          line-height: 24px;

          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        strong.down,
        sub.down {
          color: v-bind(ECC_DOWNLOAD_COLOR);
        }

        strong.up,
        sub.up {
          color: v-bind(ECC_UP_COLOR);
        }

        sub {
          font-family: PingFang SC;
          font-size: 12px;
          letter-spacing: 0px;

          bottom: 10px;
          left: 8px;
        }
      }

      .ecc-ec-item-tooltip {
        position: relative;

        &:hover > div {
          z-index: 999;
          display: inline-block;
        }

        > div {
          padding: 6px 12px;
          background-color: #303133;
          color: #fff;
          border-radius: 4px;
          font-size: 14px;
          display: none;
          line-height: 22px;
          font-family: PingFangSC-Regular;

          position: absolute;
          top: -40px;
          left: -12px;

          &::before {
            content: '';
            width: 10px;
            height: 10px;
            background-color: #303133;

            position: absolute;
            top: 28px;
            left: 20px;
            transform: rotate(45deg);
          }
        }
      }
    }

    .left-wrapper {
      padding-right: 16px;

      > div.count {
        max-width: 240px;
        overflow: hidden;
        display: inline-block;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .right-wrapper {
      padding-left: 16px;

      border-left: 1px solid rgba(217, 217, 217, 1);
    }

    .ecc-ec-item.ratio strong.up {
      color: var(--color-text-title) !important;
    }
  }
}
</style>
