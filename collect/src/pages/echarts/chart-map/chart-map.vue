<template>
  <div class="chart-map">
    <div class="cm-header">
      <div class="cm-header-title"><span class="cm-header-title-text">地球大屏</span></div>
      <div class="cm-header-light"></div>
      <img class="cm-header-rect-left" src="../../../assets/images/echarts/echarts-map-header-rect-left.png" alt="" />
      <img class="cm-header-rect-right" src="../../../assets/images/echarts/echarts-map-header-rect-right.png" alt="" />
    </div>
    <div class="cm-container">
      <div class="cm-container-item left-top">
        <cm-bar></cm-bar>
      </div>
      <div class="cm-container-item left-bottom">
        <cm-line></cm-line>
      </div>
      <div class="cm-container-item middle-center">
        <div class="cm-container-map" :id="chartMapService.customChartId"></div>
      </div>
      <div class="cm-container-item right-top">
        <cm-water></cm-water>
      </div>
      <div class="cm-container-item right-bottom">
        <cm-gauge></cm-gauge>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import CmBar from './components/cm-bar.vue';
import CmLine from './components/cm-line.vue';
import CmWater from './components/cm-water.vue';
import CmGauge from './components/cm-gauge.vue';
import ChartMapService from './chart-map.service';

export default defineComponent({
  name: 'ChartMap',
  components: {
    CmBar,
    CmLine,
    CmWater,
    CmGauge,
  },
  setup() {
    const chartMapService = new ChartMapService();

    const startAnimation = () => {
      chartMapService.initCharts();
    };

    onMounted(() => {
      startAnimation();

      window.addEventListener('resize', () => {
        chartMapService.resize();
      });
    });
    onUnmounted(() => {
      window.removeEventListener('resize', () => {
        chartMapService.resize();
      });
    });

    return {
      chartMapService,
      startAnimation,
    };
  },
});
</script>

<style lang="less" scoped>
.chart-map {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  background-image: url('../../../assets/images/echarts/echarts-map-bg.png');
  background-repeat: no-repeat;
  background-size: cover;
  padding: 20px;

  .cm-header {
    position: relative;
    top: 0.2rem;
    width: 100%;
    height: 60px;
    min-height: 60px;
    background-image: url('../../../assets/images/echarts/echarts-map-header-bg.png');
    background-repeat: no-repeat;

    display: flex;
    align-items: center;
    justify-content: center;

    .cm-header-title {
      position: relative;
      text-align: center;
      background-size: cover;
      color: transparent;
      height: 60px;
      line-height: 60px;

      .cm-header-title-text {
        position: relative;
        top: 4px;
        font-size: 38px;
        font-weight: 900;
        letter-spacing: 6px;
        width: 100%;
        background: linear-gradient(92deg, #0072ff 0%, #00eaff 48.8525390625%, #01aaff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .cm-header-light {
      position: absolute;
      bottom: -26px;
      background-image: url('../../../assets/images/echarts/echarts-map-header-light.png');
      background-position: 80px center;
      width: 100%;
      height: 56px;
    }

    .cm-header-rect-left {
      position: absolute;
      top: -2px;
      left: 11%;
    }

    .cm-header-rect-right {
      position: absolute;
      top: -2px;
      right: 11%;
    }
  }

  > .cm-container {
    position: relative;
    flex: auto;
    z-index: 10;
    overflow: hidden;
    backface-visibility: hidden;

    .cm-container-item {
      position: absolute;
      width: 5rem;
      height: 3.6rem;
      padding: 0.1rem;
      box-sizing: border-box;

      &:not(.middle-center) {
        background-image: linear-gradient(to right, rgba(170, 184, 206, 0.1), rgba(122, 150, 251, 0.1));
        border-radius: 0.04rem;
        backdrop-filter: blur(0.2rem);
      }

      &.left-top {
        top: 0.6rem;
        left: 0;
      }

      &.left-bottom {
        top: 4.4rem;
        left: 0;
      }

      &.middle-center {
        width: 9rem;
        height: 7.4rem;
        top: 0.6rem;
        left: 5.1rem;

        > .cm-container-map {
          width: 100%;
          height: 100%;
        }
      }

      &.right-top {
        top: 0.6rem;
        right: 0;
      }

      &.right-bottom {
        top: 4.4rem;
        right: 0;
      }
    }
  }
}
</style>
