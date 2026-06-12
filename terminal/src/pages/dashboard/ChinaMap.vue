<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useInterval } from '../../hooks/useInterval';

/**
 * 中国主要城市坐标（1000×700 视图）
 * 仅用于演示，相对位置大致符合实际地理
 */
interface City {
  name: string;
  x: number;
  y: number;
  /** 该城市权重（订单量），用于点位大小 */
  weight: number;
}

const CITIES: City[] = [
  { name: '北京',   x: 660, y: 200, weight: 9 },
  { name: '上海',   x: 800, y: 360, weight: 10 },
  { name: '广州',   x: 660, y: 540, weight: 9 },
  { name: '深圳',   x: 670, y: 560, weight: 8 },
  { name: '杭州',   x: 770, y: 380, weight: 7 },
  { name: '成都',   x: 440, y: 410, weight: 6 },
  { name: '武汉',   x: 650, y: 400, weight: 6 },
  { name: '西安',   x: 520, y: 320, weight: 5 },
  { name: '南京',   x: 750, y: 350, weight: 5 },
  { name: '重庆',   x: 510, y: 420, weight: 5 },
  { name: '天津',   x: 690, y: 220, weight: 4 },
  { name: '青岛',   x: 760, y: 270, weight: 4 },
  { name: '厦门',   x: 760, y: 510, weight: 4 },
  { name: '昆明',   x: 400, y: 510, weight: 3 },
  { name: '哈尔滨', x: 830, y: 110, weight: 3 },
  { name: '乌鲁木齐', x: 180, y: 200, weight: 3 },
  { name: '拉萨',   x: 220, y: 400, weight: 2 },
  { name: '海口',   x: 620, y: 640, weight: 2 },
];

/** 简化的中国轮廓 path（基于手写坐标） */
const CHINA_PATH = `
  M 180 200
  C 220 150, 320 130, 450 130
  L 700 110
  C 800 110, 880 130, 920 170
  L 870 220
  C 850 240, 820 250, 800 270
  L 830 320
  C 840 350, 830 380, 800 400
  L 770 460
  C 760 500, 720 530, 680 560
  L 660 600
  C 640 630, 600 640, 560 630
  L 530 580
  C 510 540, 480 510, 430 500
  L 360 460
  C 320 430, 280 410, 240 380
  L 210 320
  C 200 280, 190 240, 180 200
  Z
`;

/** 主要飞线（从北京/上海/广州三个枢纽出发） */
const FLY_LINES = [
  { from: '北京', to: '上海' },
  { from: '北京', to: '广州' },
  { from: '上海', to: '成都' },
  { from: '上海', to: '武汉' },
  { from: '广州', to: '昆明' },
  { from: '北京', to: '乌鲁木齐' },
];

const cityMap = new Map(CITIES.map((c) => [c.name, c]));

/** 计算贝塞尔飞线路径 */
const buildCurve = (from: City, to: City) => {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - Math.abs(from.x - to.x) * 0.18;
  return `M ${from.x} ${from.y} Q ${mx} ${my}, ${to.x} ${to.y}`;
};

const flyPaths = computed(() =>
  FLY_LINES.map((line, i) => {
    const from = cityMap.get(line.from)!;
    const to = cityMap.get(line.to)!;
    return {
      id: i,
      d: buildCurve(from, to),
      fromX: from.x,
      fromY: from.y,
      toX: to.x,
      toY: to.y,
    };
  }),
);

/** 随机滚动数据：当前订单流向 + 各省销量 */
const activeFlow = ref(0);
useInterval(() => {
  activeFlow.value = (activeFlow.value + 1) % FLY_LINES.length;
}, 1500);

const stats = ref([
  { name: '实时订单', value: 8420, unit: '单' },
  { name: '在线用户', value: 12.6, unit: '万' },
  { name: '今日 GMV', value: 1280, unit: '万' },
]);
useInterval(() => {
  stats.value = [
    { name: '实时订单', value: 8420 + Math.floor(Math.random() * 60), unit: '单' },
    { name: '在线用户', value: +(12 + Math.random() * 2).toFixed(1), unit: '万' },
    { name: '今日 GMV', value: 1280 + Math.floor(Math.random() * 40), unit: '万' },
  ];
}, 4000);
</script>

<template>
  <div class="china-map">
    <!-- 顶部核心数据 -->
    <div class="china-map__stats">
      <div v-for="(s, i) in stats" :key="i" class="china-map__stat">
        <span class="china-map__stat-name">{{ s.name }}</span>
        <span class="china-map__stat-value">
          <span class="china-map__stat-num">{{ s.value }}</span>
          <span class="china-map__stat-unit">{{ s.unit }}</span>
        </span>
      </div>
    </div>

    <div class="china-map__svg-wrap">
      <svg
        class="china-map__svg"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <!-- 地图填充渐变 -->
          <linearGradient id="mapFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4cf3ff" stop-opacity="0.32" />
            <stop offset="100%" stop-color="#409eff" stop-opacity="0.08" />
          </linearGradient>

          <!-- 地图描边渐变 -->
          <linearGradient id="mapStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4cf3ff" />
            <stop offset="100%" stop-color="#409eff" />
          </linearGradient>

          <!-- 飞线发光 -->
          <filter id="flyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- 飞线径向渐变 -->
          <radialGradient id="flyGrad">
            <stop offset="0%" stop-color="#ff5c5c" />
            <stop offset="100%" stop-color="#ff9a3c" />
          </radialGradient>

          <!-- 城市点径向渐变 -->
          <radialGradient id="cityGrad">
            <stop offset="0%" stop-color="#fff" stop-opacity="1" />
            <stop offset="40%" stop-color="#4cf3ff" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#4cf3ff" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- 背景扫描同心圆 -->
        <g class="china-map__rings">
          <circle cx="600" cy="380" r="120" fill="none" stroke="rgba(76,243,255,0.15)" />
          <circle cx="600" cy="380" r="200" fill="none" stroke="rgba(76,243,255,0.1)" />
          <circle cx="600" cy="380" r="280" fill="none" stroke="rgba(76,243,255,0.06)" />
          <circle cx="600" cy="380" r="360" fill="none" stroke="rgba(76,243,255,0.04)" />
        </g>

        <!-- 旋转光圈 -->
        <g class="china-map__orbit" style="transform-origin: 600px 380px;">
          <ellipse
            cx="600" cy="380" rx="300" ry="100"
            fill="none" stroke="rgba(76,243,255,0.25)" stroke-dasharray="3 6"
          />
        </g>

        <!-- 地图主体 -->
        <path
          :d="CHINA_PATH"
          fill="url(#mapFill)"
          stroke="url(#mapStroke)"
          stroke-width="1.5"
          stroke-linejoin="round"
        />

        <!-- 内部装饰网格（科技感分区） -->
        <g stroke="rgba(76,243,255,0.12)" fill="none">
          <line x1="200" y1="200" x2="900" y2="200" />
          <line x1="180" y1="320" x2="850" y2="320" />
          <line x1="200" y1="440" x2="850" y2="440" />
          <line x1="350" y1="150" x2="350" y2="600" />
          <line x1="550" y1="130" x2="550" y2="620" />
          <line x1="750" y1="130" x2="750" y2="600" />
        </g>

        <!-- 飞线（贝塞尔） -->
        <g filter="url(#flyGlow)">
          <path
            v-for="(line, i) in flyPaths"
            :key="`fly-${i}`"
            :d="line.d"
            fill="none"
            stroke="url(#flyGrad)"
            stroke-width="1.2"
            stroke-linecap="round"
            :class="['china-map__fly', { 'china-map__fly--active': i === activeFlow }]"
          />
        </g>

        <!-- 飞线上的流动光点 -->
        <g v-for="(line, i) in flyPaths" :key="`dot-${i}`">
          <circle r="3" fill="#ff9a3c" :class="['china-map__flydot', { 'china-map__flydot--active': i === activeFlow }]">
            <animateMotion
              :dur="`${3 + i * 0.3}s`"
              repeatCount="indefinite"
              rotate="auto"
              :path="line.d"
            />
          </circle>
        </g>

        <!-- 城市点位 + 标签 -->
        <g v-for="(c, i) in CITIES" :key="c.name">
          <!-- 外层脉冲 -->
          <circle
            :cx="c.x" :cy="c.y" :r="6 + c.weight * 0.6"
            fill="url(#cityGrad)"
            opacity="0.6"
            class="china-map__pulse"
            :style="{ animationDelay: `${i * 0.2}s` }"
          />
          <!-- 内核点 -->
          <circle
            :cx="c.x" :cy="c.y" r="2.5"
            fill="#fff"
            stroke="#4cf3ff"
            stroke-width="1.5"
          />
          <!-- 标签 -->
          <text
            :x="c.x + 8" :y="c.y + 4"
            font-size="14"
            fill="rgba(230, 241, 255, 0.85)"
            style="text-shadow: 0 0 4px rgba(0,0,0,0.6);"
          >{{ c.name }}</text>
        </g>
      </svg>

      <!-- 角标：当前活跃城市 -->
      <div class="china-map__active">
        <div class="china-map__active-label">实时流向</div>
        <div class="china-map__active-text">
          <span class="text-primary">{{ FLY_LINES[activeFlow].from }}</span>
          <span class="china-map__active-arrow">→</span>
          <span class="text-warning">{{ FLY_LINES[activeFlow].to }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.china-map {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.1rem 0.16rem 0.16rem;
  overflow: hidden;

  &__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.16rem;
    margin-bottom: 0.08rem;
  }
  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.06rem 0;
    background: linear-gradient(180deg, rgba(64,158,255,0.15), transparent);
    border: 1px solid rgba(64, 158, 255, 0.2);
    position: relative;

    &::before, &::after {
      content: '';
      position: absolute;
      width: 6px; height: 6px;
      border: 1px solid #4cf3ff;
    }
    &::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
    &::after  { bottom: -1px; right: -1px; border-left: none; border-top: none; }
  }
  &__stat-name {
    font-size: 0.12rem;
    color: rgba(230, 241, 255, 0.6);
    margin-bottom: 0.04rem;
  }
  &__stat-value { display: flex; align-items: baseline; gap: 0.04rem; }
  &__stat-num {
    font-family: 'DIN', 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.26rem;
    font-weight: 700;
    color: #4cf3ff;
    text-shadow: 0 0 6px rgba(76, 243, 255, 0.5);
  }
  &__stat-unit { font-size: 0.12rem; color: rgba(230, 241, 255, 0.7); }

  &__svg-wrap {
    position: relative;
    flex: 1;
    min-height: 0;
  }

  &__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  &__orbit {
    animation: spin 30s linear infinite;
  }

  &__fly {
    opacity: 0.35;
    transition: opacity 0.4s;

    &--active {
      opacity: 1;
      stroke-width: 2;
    }
  }

  &__flydot {
    opacity: 0;

    &--active { opacity: 1; }
  }

  &__pulse {
    transform-origin: center;
    transform-box: fill-box;
    animation: pulse 2.4s ease-out infinite;
  }

  &__active {
    position: absolute;
    top: 0.1rem;
    right: 0.16rem;
    padding: 0.06rem 0.12rem;
    background: rgba(8, 22, 48, 0.6);
    border: 1px solid rgba(76, 243, 255, 0.3);
    backdrop-filter: blur(4px);
  }
  &__active-label {
    font-size: 0.11rem;
    color: rgba(230, 241, 255, 0.5);
    margin-bottom: 0.04rem;
  }
  &__active-text {
    font-size: 0.16rem;
    font-weight: 600;
  }
  &__active-arrow {
    margin: 0 0.06rem;
    color: #4cf3ff;
  }
}

@keyframes pulse {
  0%   { transform: scale(0.5); opacity: 0.9; }
  100% { transform: scale(2.5); opacity: 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
