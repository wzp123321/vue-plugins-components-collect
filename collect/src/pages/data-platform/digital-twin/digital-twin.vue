<!--
  数字孪生（数据中台 · 空间态势）
  ============================================================================
  左右联动结构：
    - 左：3D 场景（TwinScene），点击设备 → 选中 id
    - 右上：选中设备的主指标与状态
    - 右中：该设备 24 点趋势（TwinTrendChart）
    - 右下：设备能耗占比（TwinShareChart），点条形 → 选中 id → 3D 高亮聚焦
  两条链路共用同一个 selectedId，颜色统一取 TWIN_STATUS_COLOR。
-->
<template>
  <div class="dt-page">
    <header class="dt-head">
      <div class="dt-head__text">
        <h5 class="dt-title">数字孪生</h5>
        <p class="dt-desc">
          设备台账复用 IoT 组态的设备定义（DEVICES / TAGS），3D 场景与图表共用同一份数据与状态色。
          点选 3D 设备联动右侧图表，点选占比图联动 3D 高亮与相机聚焦。
        </p>
      </div>
      <div class="dt-head__badges">
        <el-tag size="small" effect="plain" type="success">双向联动</el-tag>
        <el-tag size="small" effect="plain" type="warning">状态同源着色</el-tag>
      </div>
    </header>

    <div class="dt-body">
      <TwinScene class="dt-stage" :selected-id="selectedId" @select="selectDevice" />

      <aside class="dt-side">
        <section class="dt-selected">
          <header class="dt-selected__head">
            <span class="dt-selected__name">
              <i class="dt-dot" :style="{ background: activeStatusColor }"></i>
              {{ activeDevice.name }}
            </span>
            <span class="dt-selected__status" :style="{ color: activeStatusColor }">{{ statusLabel }}</span>
          </header>

          <div class="dt-selected__value">
            <span class="dt-selected__num">{{ activeValue }}</span>
            <span class="dt-selected__unit">{{ activeDevice.unit }}</span>
          </div>

          <footer class="dt-selected__meta">
            <span>{{ activeDevice.tagLabel }}</span>
            <span>占比 {{ activeDevice.share }}%</span>
            <span>数据点 {{ activeTagCount }} 个</span>
          </footer>
        </section>

        <TwinTrendChart :device="activeDevice" />
        <TwinShareChart :selected-id="selectedId" @select="selectDevice" />
      </aside>
    </div>

    <ul class="dt-alarms">
      <li v-for="item in alarmList" :key="item.id" class="dt-alarms__item" @click="selectDevice(item.id)">
        <i class="dt-dot" :style="{ background: TWIN_STATUS_COLOR[item.status] }"></i>
        <span class="dt-alarms__name">{{ item.name }}</span>
        <span class="dt-alarms__detail">
          {{ item.label }} {{ item.value }}{{ item.unit }} · 阈值 {{ item.limit }}{{ item.unit }}
        </span>
        <span class="dt-alarms__jump">定位 →</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import TwinScene from './components/TwinScene.vue';
import TwinTrendChart from './components/TwinTrendChart.vue';
import TwinShareChart from './components/TwinShareChart.vue';
import {
  TWIN_DEVICES,
  TWIN_STATUS_COLOR,
  TWIN_STATUS_LABEL,
  alarmList,
  deviceById,
  tagsOfDevice,
} from './twin-data';

defineOptions({ name: 'DigitalTwin' });

const selectedId = ref(TWIN_DEVICES[0].id);

const selectDevice = (id: string) => {
  selectedId.value = id;
};

const activeDevice = computed(() => deviceById(selectedId.value));
const activeStatusColor = computed(() => TWIN_STATUS_COLOR[activeDevice.value.status]);
const statusLabel = computed(() => TWIN_STATUS_LABEL[activeDevice.value.status]);
const activeValue = computed(() => activeDevice.value.value.toFixed(activeDevice.value.decimals));
const activeTagCount = computed(() => tagsOfDevice(activeDevice.value.id).length);
</script>

<style lang="less" scoped>
.dt-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  min-height: 100%;
  padding: 20px;
}

.dt-head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;

  &__text {
    min-width: 0;
  }

  &__badges {
    display: flex;
    flex: 0 0 auto;
    gap: 8px;
  }
}

.dt-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ai-text);
}

.dt-desc {
  max-width: 780px;
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ai-text-mute);
}

.dt-body {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr);
  gap: 14px;
  min-height: 520px;

  @media (max-width: 1180px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.dt-stage {
  min-height: 480px;
}

.dt-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dt-selected {
  padding: 14px 16px;
  border: 1px solid var(--ai-hairline);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__name {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-text);
  }

  &__status {
    font-size: 12px;
  }

  &__value {
    display: flex;
    gap: 6px;
    align-items: baseline;
    margin: 10px 0 8px;
  }

  &__num {
    font-family: var(--ai-font-mono);
    font-size: 28px;
    font-weight: 600;
    line-height: 1;
    color: var(--ai-text);
  }

  &__unit {
    font-size: 12px;
    color: var(--ai-text-mute);
  }

  &__meta {
    display: flex;
    gap: 14px;
    font-size: 11px;
    color: var(--ai-text-mute);
  }
}

.dt-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dt-alarms {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;

  &__item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 14px;
    font-size: 12px;
    cursor: pointer;
    background: var(--ai-surface-raised);
    border: 1px solid var(--ai-hairline);
    border-radius: 999px;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: var(--ai-border-strong);
    }
  }

  &__name {
    font-weight: 600;
    color: var(--ai-text);
  }

  &__detail {
    color: var(--ai-text-mute);
  }

  &__jump {
    color: var(--ai-accent);
  }
}
</style>
