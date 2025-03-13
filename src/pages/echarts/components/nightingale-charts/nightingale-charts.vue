<template>
  <div class="nightingale-charts">
    <header class="nc-header">
      <a-button :disabled="imgExporting" link @click="handleExportCombinedImage">
        导出图片
        <icon-export />
      </a-button>
    </header>
    <section class="nc-body">
      <div class="nc-container">
        <div ref="chartRef"></div>
      </div>
      <div class="nc-cards" ref="cardsRef">
        <div
          v-for="(item, index) in nightingaleChartsDataList.childrenBarInfo"
          :key="index"
          class="erm-item-card"
          :style="{ background: mapBackground(item.treeId, index) }"
          @click="handleCheck(item.treeId, item.treeName, index)"
        >
          <section class="eic-header">
            <em :style="{ backgroundColor: mapCardColor(index) }"></em>
            <span class="eic-header-name" :title="item.treeName ?? '-'">{{ item.treeName ?? '-' }}</span>
          </section>
          <section class="eic-content">
            <div class="eic-content-data">
              <span class="data-value" :title="item.valueSum !== null ? thousandSeparation(item.valueSum) : ''">
                {{ item.valueSum !== null ? thousandSeparation(item.valueSum) : '-' }}
              </span>
              <span class="data-unit" v-if="item.valueSum !== null">kWh</span>
            </div>
            <div class="eic-content-data">
              <span class="data-value" :title="item.percentSum !== null ? String(item.percentSum) : '-'">
                {{ item.percentSum ?? '-' }}
              </span>
              <span class="data-unit" v-if="item.percentSum !== null">%</span>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import useChartStore from '@/store/modules/chart';
import { useEChartsInit } from '@/hooks';
import { IconExport } from '@arco-iconbox/vue-te';
import { nightingaleChartsDataList, roseMinMaxRate } from '../model';
import { EChartsOption, EChartsType } from 'echarts';
import { cloneDeep } from 'lodash';
import { handleElementToImage } from '@/utils/file';
import { cardLinearBackgroundColors, pieColors } from '@/config/echarts/newConstant';
import { floatMultiply, thousandSeparation } from '@/utils';
import { CommonObject } from '@/services/common.api';

defineOptions({
  name: 'NightingaleCharts',
});

const { chartRef, initCharts } = useEChartsInit();
const chartStore = useChartStore();
// 当前高亮卡片id
const checkedCardId = ref<number | null>(null);
let originName = '';
let chartInstance: EChartsType | undefined;
/**
 * 卡片背景
 */
const mapBackground = (treeId: number | null, index?: number) =>
  checkedCardId.value !== null && treeId !== null && checkedCardId.value === treeId
    ? cardLinearBackgroundColors[(index as number) % cardLinearBackgroundColors.length]
    : 'transparent';

/**
 * 卡片颜色
 * @param {number} index
 */
const mapCardColor = (index: number) => pieColors[index % pieColors.length];

/**
 * 卡片选中
 * @param {number | null} id
 * @param {string} name
 * @param {number} index
 */
const handleCheck = (id: number | null, name: string, index: number) => {
  chartStore.setSelectedCardDataIndex(index);
  if (chartInstance) {
    if (originName) {
      chartInstance.dispatchAction({
        type: 'downplay',
        // 图例名称
        name: originName,
      });
    }
    checkedCardId.value = id === checkedCardId.value ? null : id;
    originName = cloneDeep(name);
    chartInstance.dispatchAction({
      type: checkedCardId.value === null ? 'downplay' : 'highlight',
      // 图例名称
      name,
    });
  }
};

const mapChartOptions = (): EChartsOption => {
  // 拿到所有的value值
  const values = nightingaleChartsDataList?.childrenBarInfo
    ?.map((item) => item.valueSum)
    ?.filter((item) => item !== null);
  // 最大值
  const maxValue = values?.[0] as number;
  // 临界值：最大值的roseMinMaxRate
  const criticalValue = maxValue !== null ? floatMultiply(maxValue, roseMinMaxRate) : 0;

  const newColors = nightingaleChartsDataList?.childrenBarInfo?.map(
    (_, index) => pieColors?.[(index as number) % pieColors.length],
  );

  return {
    color: newColors,
    legend: {
      show: false,
    },
    grid: {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    series: [
      {
        name: 'Nightingale Chart',
        type: 'pie',
        radius: [30, 90],
        center: ['50%', '50%'],
        roseType: 'radius',
        minAngle: 20,
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        data:
          (nightingaleChartsDataList?.childrenBarInfo?.map((item, index) => ({
            id: item?.treeId,
            name: item?.treeName,
            // 找到最小能看得见的一个临界值，比如最大值的十分之一，所有比这个临界值小的都赋值成这个临界值(0除外)
            value:
              item?.valueSum !== null && criticalValue !== null && item.valueSum !== 0 && item.valueSum < criticalValue
                ? criticalValue
                : item?.valueSum,
            // value: item?.valueSum !== null ? Math.pow(item?.valueSum, 0.099) : item?.valueSum,
            percentSum: item?.percentSum,
            dataIndex: index,
          })) as any) ?? [],
      },
    ],
  };
};

const cardsRef = ref<InstanceType<typeof HTMLElement>>();
// 导出图片中
const imgExporting = ref(false);
/**
 * 导出饼图和卡片的合并图片
 */
const handleExportCombinedImage = async () => {
  imgExporting.value = true;
  if (chartRef.value && cardsRef.value) {
    const parentEle = document.querySelector('.nightingale-charts') as HTMLElement;
    const width = parentEle.clientWidth;
    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = `${width}px`;
    tempContainer.style.display = 'flex';
    tempContainer.style.flexDirection = 'column';
    // 获取图表的图片数据 URL
    const imgData = chartInstance!.getDataURL({
      type: 'jpeg', // 图片类型，支持 'png' 和 'jpeg'
      pixelRatio: 2, // 分辨率比例，默认为 1
      backgroundColor: '#fff', // 背景颜色，默认为图表背景色
    });
    // 复制元素到临时容器
    const imageEle = document.createElement('img');
    imageEle.src = imgData;
    imageEle.style.width = '378px';
    imageEle.style.height = 'auto';

    const imgContainer = document.createElement('div');
    // imgContainer.style.height = '192px';
    imgContainer.style.textAlign = 'center';
    imgContainer.appendChild(imageEle);
    tempContainer.appendChild(imgContainer);
    if (cardsRef.value) {
      const cardsClone = cardsRef.value.cloneNode(true) as HTMLElement;
      // 移除特殊样式
      for (let i = 0; i < cardsClone.children?.length; i++) {
        (cardsClone.children[i] as HTMLElement).style.background = 'transparent';
      }
      tempContainer.appendChild(cardsClone);
    }
    // 将临时容器添加到文档中
    document.body.appendChild(tempContainer);
    handleElementToImage(tempContainer, '能耗玫瑰图', width);
    imgExporting.value = false;
  } else {
    imgExporting.value = false;
  }
};

onMounted(() => {
  checkedCardId.value = null;
  originName = '';
  if (chartRef.value) {
    const option = mapChartOptions();
    chartInstance = initCharts(option);
    if (chartInstance) {
      chartInstance.on('click', (params: CommonObject) => {
        if (params && params.componentType === 'series') {
          const id = params.data.id === checkedCardId.value ? null : params.data.id;
          const name = params.data.name;
          const dataIndex = params.data.dataIndex;
          handleCheck(id, name, dataIndex);
        }
      });
    }
  }
});
</script>
<style lang="less" scoped>
.nightingale-charts {
  width: 100%;
  flex: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;

  > .nc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    > span {
      font-size: var(--te-font-size-b14);
      color: var(--te-text-color-primary);
      font-weight: 600;
      line-height: 22px;
    }
  }

  > .nc-body {
    display: flex;
    flex: auto;
    overflow: hidden;

    > .nc-container {
      flex: 1;
      height: 100%;

      > div:first-child,
      canvas {
        width: 100%;
        height: 100%;
      }
    }

    > .nc-cards {
      flex: 1;
      overflow-y: auto;
      width: 100%;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;

      .erm-item-card {
        width: 100%;
        height: 69px;
        min-height: 69px;
        padding: 8px 16px 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 9px;
        cursor: pointer;

        > .eic-header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          line-height: 20px;
          gap: var(--te-space-4);
          overflow: hidden;

          > em {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
          }

          > span {
            display: block;
            flex: auto;
            font-size: var(--te-font-size-b12);
            color: var(--te-text-color-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        > .eic-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-left: 16px;
          line-height: 24px;

          > .eic-content-data {
            display: flex;
            align-items: center;
            gap: var(--te-space-4);

            > .data-value {
              color: var(--te-text-color-primary);
              font-size: var(--te-font-size-h16);
              font-family: D-DIN;
              font-weight: 700;
              line-height: 16px;
            }

            > .data-unit {
              color: var(--te-text-color-primary);
              font-size: var(--te-font-size-b12);
              font-weight: 400;
              line-height: 20px;
            }
          }
        }
      }
    }
  }
}
</style>
