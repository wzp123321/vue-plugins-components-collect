<template>
  <div class="nightingale-charts">
    <header class="nc-header">
      <span>能耗玫瑰图</span>
      <te-button :disabled="imgExporting" link @click="handleExportCombinedImage">
        <icon-export />
      </te-button>
    </header>
    <section class="nc-body">
      <div class="nc-container">
        <div ref="chartRef"></div>
      </div>
      <te-scrollbar
        v-if="nightingaleChartsDataList.rightChildrenBarInfo?.length > 0"
        class="nc-cards"
        max-height="420px"
      >
        <div ref="cardsRef">
          <nc-item-card
            v-for="(item, index) in nightingaleChartsDataList.rightChildrenBarInfo"
            :unit="nightingaleChartsDataList.unit"
            :data="item"
            :index="item.dataIndex"
            :color="mapCardColor(Number(item.dataIndex))"
            v-model:checkedCardId="checkedCardId"
            @check="handleCheck"
          ></nc-item-card>
        </div>
      </te-scrollbar>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useECharts } from '@/hooks';
import { IconExport } from '@arco-iconbox/vue-te';
import { nightingaleChartsDataList } from './model';
import { EChartsOption, EChartsType } from 'echarts';
import { handleElementToImage } from '@/utils';
import { cloneDeep } from 'lodash';

defineOptions({
  name: 'NightingaleCharts',
});

const { chartRef, initCharts, resize } = useECharts();

/**
 * 卡片颜色
 * @param {number} index
 */
const mapCardColor = (index: number) => {
  return pieColors[index % pieColors.length];
};

// 当前高亮卡片id
const checkedCardId = ref<number | null>(null);
let originName = '';
/**
 * 卡片选中
 * @param {number | null} id
 * @param {string} name
 */
const handleCheck = (id: number | null, name: string) => {
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
  const values = nightingaleChartsDataList?.rightChildrenBarInfo
    ?.map((item) => item.valueSum)
    ?.filter((item) => item !== null);
  // 最大值
  const maxValue = values?.[0];
  // 临界值：最大值的roseMinMaxRate
  const criticalValue = maxValue !== null ? floatMultiply(maxValue, roseMinMaxRate) : 0;

  const newColors = nightingaleChartsDataList?.rightChildrenBarInfo?.map((item) => pieColors?.[item.dataIndex]);

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
          (props?.stackChartInfo?.rightChildrenBarInfo?.map((item) => ({
            id: item?.treeId,
            name: item?.treeName,
            // 找到最小能看得见的一个临界值，比如最大值的十分之一，所有比这个临界值小的都赋值成这个临界值(0除外)
            value:
              item?.valueSum !== null && criticalValue !== null
                ? item.valueSum !== 0 && item.valueSum < criticalValue
                  ? criticalValue
                  : item.valueSum
                : item?.valueSum,
            // value: item?.valueSum !== null ? Math.pow(item?.valueSum, 0.099) : item?.valueSum,
            percentSum: item?.percentSum,
          })) as any) ?? [],
      },
    ],
  };
};

let chartInstance: EChartsType | undefined = undefined;
const cardsRef = ref<InstanceType<typeof HTMLElement>>();
const dataRef = ref<InstanceType<typeof HTMLElement>>();
// 导出图片中
const imgExporting = ref(false);
/**
 * 导出饼图和卡片的合并图片
 */
const handleExportCombinedImage = async () => {
  imgExporting.value = true;
  if (chartRef.value && dataRef.value) {
    const parentEle = document.querySelector('.nightingale-charts') as HTMLElement;
    const width = parentEle.clientWidth;
    // 等待 ECharts 图表渲染完成
    // await new Promise<void>((resolve) => {
    //   chartInstance?.on('finished', () => {
    //     resolve();
    //   });
    //   chartInstance?.dispatchAction({ type: 'refresh' });
    // });
    //
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
    imageEle.style.width = '192px';
    imageEle.style.height = 'auto';
    const dataClone = dataRef.value.cloneNode(true) as HTMLElement;

    const imgContainer = document.createElement('div');
    // imgContainer.style.height = '192px';
    imgContainer.style.textAlign = 'center';
    imgContainer.appendChild(imageEle);
    tempContainer.appendChild(dataClone);
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
    const { energyCodeName } = nightingaleChartsDataList;
    const { startTime, endTime, timeUnit } = props.dateParams;
    handleElementToImage(
      tempContainer,
      mapExportFileName(props.treeName, energyCodeName, startTime, endTime, timeUnit, '能耗玫瑰图'),
      width,
    );
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

    chartInstance &&
      chartInstance.on('click', (params: CommonObject) => {
        if (params && params.componentType === 'series') {
          const id = params.data.id === checkedCardId.value ? null : params.data.id;
          const name = params.data.name;
          handleCheck(id, name);
        }
      });

    handleChartResize(resize);
  }
});
</script>
<style lang="less" scoped>
.nightingale-charts {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--te-space-16);

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

  > .nc-container {
    width: 100%;
    height: 192px;

    > div:first-child,
    canvas {
      width: 100%;
      height: 100%;
    }
  }

  > .nc-cards :deep(.te-scrollbar__view) {
    > div {
      width: 100%;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
