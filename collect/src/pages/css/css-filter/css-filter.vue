<template>
  <div class="css-filter" id="css-filter">
    <h1>backdrop-filter</h1>
    <div class="css-filter-backdrop">
      <img class="params-card-icon" src="../../../assets/images/css/css-filter-demo.png" alt="ico" />
      <div
        class="params-card-content"
        :style="{
          '--contentBgColor': styleConstant.CARD_BACKGROUND_COLOR,
          '--descBgColor': styleConstant.DESCRIPTION_BACKGROUND_COLOR,
          backgroundColor: 'rgb(255, 255, 255)',
          boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.07)',
        }"
      >
        <!-- 标题 -->
        <h5 class="params-card-content-title font30" :title="paramInfo.paramName">
          {{ paramInfo.paramName }}
        </h5>
        <!--  -->
        <div class="flex mt16">
          <div class="params-card-content-data font14">
            <!-- 数据 -->
            <div class="flex-row-justify-center" style="position: relative">
              <span class="font14 data-span">-1</span>
              <span
                class="font14 data-span value-span"
                :style="{
                  left: relaTimeValueLeft + 'px',
                  background: styleConstant.UNFILL_BACKGROUND_COLOR,
                  color: styleConstant.FILL_BACKGROUND_COLOR,
                }"
              >
                {{ paramInfo.coefficient }}
              </span>
              <span class="font14 data-span">+1</span>
            </div>
            <div class="flex-row-justify-center params-card-content-data-scale mt6">
              <span
                class="scale-item mr8"
                v-for="(item, index) in scaleList"
                :key="'scale_' + index"
                :style="{
                  width: '8px',
                  height: item.height + 'px',
                  background: item.isFilled
                    ? styleConstant.FILL_BACKGROUND_COLOR
                    : styleConstant.UNFILL_BACKGROUND_COLOR,
                }"
              ></span>
            </div>
            <div class="flex-row-justify-center mt6">
              <span class="font14 data-span">负相关</span>
              <span class="font14 data-span">正相关</span>
            </div>
          </div>
          <div class="params-card-content-text">
            <div class="params-card-content-text-summary flex-row-start-center font18">
              <img v-if="paramInfo.isRed" src="../../../assets/images/css/ra-red-flag.svg" alt="" />
              <div class="reset-html ml15 mr46" :title="paramInfo.advise" v-html="resetHtml(paramInfo.advise)"></div>
            </div>
            <div
              class="params-card-content-text-desc font16 mt16 text-overflow"
              :title="paramInfo.remark"
              :style="{ background: 'rgba(250, 250, 250, 1)' }"
            >
              {{ paramInfo.remark }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

const coefficient = 0.77;
const paramInfo = {
  paramName: '测试测试',
  coefficient: 0.65,
  isRed: true,
  advise: '区域树顶级的电能耗受3123123影响极大。',
  remark: '当3123123增大或升高时,区域树顶级的电能耗随之减少。',
};
// 样式
const styleConstant = {
  CARD_BACKGROUND_COLOR: 'rgba(24, 144, 255, 0.06)', // 卡片背景色
  DESCRIPTION_BACKGROUND_COLOR: ' rgba(215, 237, 255, 1)', // 描述背景色
  UNFILL_BACKGROUND_COLOR: 'rgba(235, 234, 255, 1)',
  FILL_BACKGROUND_COLOR: 'rgba(70, 61, 255, 1)',
  ICON_IMG: require('../../../assets/images/css/css-filter-demo.png'),
};

// 计算实时值位置
const relaTimeValueLeft = computed(() => {
  let value = coefficient || 0;
  value += 1;
  const index = Number((value / 0.1).toFixed(0));
  const count = 16 * index;
  return count > 296 ? 280 : count < 16 ? 16 : count;
});
// 计算标度数组
const scaleList = computed(() => {
  const value = coefficient || 0;
  const list = [];
  let count = 50;
  for (let i = -1; i <= 1; i += 0.1) {
    const num = Number(i.toFixed(1));
    list.push({
      height: count,
      isFilled: (num < 0 && num >= value) || num === 0 || (num > 0 && num <= value),
    });
    count = num < -0 ? (count -= num === -1 || num === -0.9 ? 3 : 4) : (count += num === 0.8 || num === 0.9 ? 3 : 4);
  }
  return list;
});

// 重置文本
const resetHtml = (text: string) => {
  return text
    .replace('影响较大', '<em style="color: var(--iot-color-active-red)">影响较大</em>')
    .replace('影响极大', '<em style="color: var(--iot-color-active-red)">影响极大</em>');
};
</script>
<style lang="less" scoped>
.css-filter {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  &-backdrop {
    position: relative;

    .params-card-icon {
      position: absolute;
      top: 50%;
      left: 12px;
      transform: translateY(-50%);
      width: 100px;
      height: 100px;
    }
    .params-card-content {
      position: relative;
      padding: 15px 103px 15px 58px;
      margin-left: 99px;
      overflow: hidden;

      &-title {
        font-weight: 600;
        line-height: 42px;
        height: 42px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &-data {
        margin-right: 91px;

        .data-span {
          height: 20px;
          line-height: 20px;
          border-radius: 2px;
        }

        .data-span.value-span {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          padding: 0 6px;
        }

        &-scale {
          .scale-item {
            display: inline-block;
            border-radius: 13px;
          }

          .scale-item:last-child {
            margin-right: 0;
          }
        }
      }

      &-text {
        flex: 1;
        overflow: hidden;

        &-summary {
          font-weight: 400 !important;
          height: 25px;
          line-height: 25px;
          color: rgba(0, 0, 0, 1);
          font-family: PingFangSC-Regular;

          .reset-html {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .view-data {
            cursor: pointer;
            line-height: 20px;
            height: 20px;
            color: var(--iot-color-active);
            font-weight: 400;

            .ems-iconfont {
              position: relative;
              top: 1px;
            }
          }

          .view-data:hover {
            font-weight: 500;
            transition: all 200ms;
          }
        }

        &-desc {
          font-weight: 400 !important;
          border-radius: 2px;
          line-height: 22px;
          padding: 17px 0 17px 26px;
          color: rgba(0, 0, 0, 1);
          font-family: PingFangSC-Regular;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .params-card-content.checked {
      cursor: pointer;
      background-color: var(--contentBgColor) !important;
      transition: all 200ms;

      .params-card-content-text-desc {
        background-color: var(--descBgColor) !important;
        transition: all 200ms;
      }
    }

    .params-card-content:hover {
      cursor: pointer;
      background-color: var(--contentBgColor) !important;
      transition: all 200ms;

      .params-card-content-text-desc {
        background-color: var(--descBgColor) !important;
        transition: all 200ms;
      }
    }

    .params-card-content::before {
      content: '';
      width: 100px;
      height: 97px;
      background-size: cover;
      position: absolute;
      top: 52%;
      left: -84px;
      transform: translateY(-50%);
      -webkit-filter: blur(20px);
      -moz-filter: blur(20px);
      -ms-filter: blur(20px);
      -o-filter: blur(20px);
      background-image: url('../../../assets/images/css/css-filter-demo.png');
      background-size: 100px 97px;
      filter: blur(10px);
    }
  }
}
</style>
