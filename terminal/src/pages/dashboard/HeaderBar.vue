<script lang="ts" setup>
import { ref } from 'vue';
import { formatDate, formatNow } from '../../utils/format';
import { useInterval } from '../../hooks/useInterval';

const time = ref(formatNow());
const date = ref(formatDate());
useInterval(() => {
  time.value = formatNow();
  date.value = formatDate();
}, 1000);

const weather = ref({ city: '杭州', temp: 24, desc: '晴' });
useInterval(() => {
  weather.value = {
    city: ['杭州', '上海', '北京', '深圳'][Math.floor(Math.random() * 4)],
    temp: 20 + Math.floor(Math.random() * 10),
    desc: ['晴', '多云', '阴'][Math.floor(Math.random() * 3)],
  };
}, 8000);
</script>

<template>
  <header class="header-bar">
    <!-- 顶部流光 + 底部 V 切角 -->
    <div class="header-bar__shine" />
    <div class="header-bar__bottom-v" />

    <!-- 左侧：天气切角面板 -->
    <div class="header-bar__panel header-bar__panel--left">
      <div class="header-bar__icon-ring">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="#4cf3ff"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </svg>
      </div>
      <div class="header-bar__info">
        <div class="header-bar__city">
          <span class="dot" />
          {{ weather.city }}
          <span class="label">LOCATION</span>
        </div>
        <div class="header-bar__weather">
          <span class="header-bar__temp">{{ weather.temp }}℃</span>
          <span class="header-bar__desc">{{ weather.desc }}</span>
        </div>
      </div>
    </div>

    <!-- 中央：标题（带左右翅膀） -->
    <div class="header-bar__center">
      <div class="header-bar__wing header-bar__wing--left">
        <span class="wing-line" />
        <span class="wing-glow" />
        <svg class="wing-arrow" viewBox="0 0 40 12" fill="none">
          <path
            d="M0 6 L34 6 L30 2 M34 6 L30 10"
            stroke="#4cf3ff"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <h1 class="header-bar__title">
        <span class="header-bar__title-zh">通用运营数据驾驶舱</span>
        <span class="header-bar__title-en"
          >OPERATION&nbsp;&nbsp;DATA&nbsp;&nbsp;COCKPIT</span
        >
      </h1>

      <div class="header-bar__wing header-bar__wing--right">
        <span class="wing-line" />
        <span class="wing-glow" />
        <svg class="wing-arrow" viewBox="0 0 40 12" fill="none">
          <path
            d="M40 6 L6 6 L10 2 M6 6 L10 10"
            stroke="#4cf3ff"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </div>

    <!-- 标题下方分隔 -->
    <div class="header-bar__divider">
      <span class="header-bar__divider-line" />
      <span class="header-bar__divider-diamond" />
      <span class="header-bar__divider-diamond" />
      <span class="header-bar__divider-diamond" />
      <span class="header-bar__divider-line" />
    </div>

    <!-- 右侧：时间切角面板 -->
    <div class="header-bar__panel header-bar__panel--right">
      <div class="header-bar__info header-bar__info--right">
        <div class="header-bar__city">
          <span class="label">SYSTEM TIME</span>
          <span class="dot" />
        </div>
        <div class="header-bar__time">{{ time }}</div>
        <div class="header-bar__date">{{ date }}</div>
      </div>
      <div class="header-bar__icon-ring">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="#4cf3ff"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </div>
    </div>
  </header>
</template>

<style lang="less" scoped>
.header-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 0.9rem;
  padding: 0 0.2rem 0.12rem;
  overflow: hidden;
  background:
    radial-gradient(
      ellipse 60% 100% at 50% 0%,
      rgba(64, 158, 255, 0.25) 0%,
      transparent 70%
    ),
    linear-gradient(180deg, rgba(8, 22, 48, 0.85) 0%, rgba(8, 22, 48, 0) 100%);

  // 顶部流光
  &__shine {
    position: absolute;
    top: 0;
    left: -50%;
    width: 200%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(76, 243, 255, 0) 20%,
      rgba(76, 243, 255, 0.9) 50%,
      rgba(76, 243, 255, 0) 80%,
      transparent 100%
    );
    animation: shine 4s linear infinite;
  }

  // 底部 V 切角
  &__bottom-v {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 0.18rem;
    background: linear-gradient(180deg, transparent, rgba(76, 243, 255, 0.12));
    clip-path: polygon(0 0, 100% 0, 100% 30%, 52% 100%, 48% 100%, 0 30%);
  }

  // 切角面板（左右）
  &__panel {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    height: 0.6rem;
    padding: 0 0.2rem;
    color: rgba(230, 241, 255, 0.85);
    background: linear-gradient(
      180deg,
      rgba(64, 158, 255, 0.18) 0%,
      rgba(64, 158, 255, 0.04) 100%
    );
    border: 1px solid rgba(76, 243, 255, 0.35);
    box-shadow:
      inset 0 0 12px rgba(76, 243, 255, 0.15),
      0 0 16px rgba(76, 243, 255, 0.15);

    &--left {
      clip-path: polygon(0 0, 100% 0, 96% 100%, 0 100%);
      padding-left: 0.2rem;
    }
    &--right {
      clip-path: polygon(4% 0, 100% 0, 100% 100%, 0 100%);
      padding-right: 0.2rem;
    }
  }

  &__icon-ring {
    width: 0.44rem;
    height: 0.44rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(76, 243, 255, 0.25),
      transparent 70%
    );
    border: 1px solid rgba(76, 243, 255, 0.5);
    box-shadow:
      0 0 10px rgba(76, 243, 255, 0.4),
      inset 0 0 8px rgba(76, 243, 255, 0.3);
    flex-shrink: 0;
    animation: iconSpin 8s linear infinite;
  }
  &__panel--left .header-bar__icon-ring {
    margin-right: 0.16rem;
  }
  &__panel--right .header-bar__icon-ring {
    margin-left: 0.16rem;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.04rem;
    min-width: 1.4rem;

    &--right {
      align-items: flex-end;
    }
  }

  &__city {
    display: flex;
    align-items: center;
    gap: 0.08rem;
    font-size: 0.16rem;
    color: #4cf3ff;
    font-weight: 600;
    text-shadow: 0 0 6px rgba(76, 243, 255, 0.4);

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4cf3ff;
      box-shadow:
        0 0 6px #4cf3ff,
        0 0 10px rgba(76, 243, 255, 0.6);
      animation: dotBlink 1.4s ease-in-out infinite;
    }
    .label {
      font-size: 0.1rem;
      letter-spacing: 0.15rem;
      color: rgba(76, 243, 255, 0.5);
      font-weight: 500;
    }
  }

  &__weather {
    display: flex;
    align-items: baseline;
    gap: 0.1rem;
    font-size: 0.13rem;
  }
  &__temp {
    color: #ff9a3c;
    font-weight: 700;
    font-size: 0.18rem;
    text-shadow: 0 0 6px rgba(255, 154, 60, 0.5);
  }
  &__desc {
    color: rgba(230, 241, 255, 0.6);
  }

  &__time {
    font-family: 'DIN', 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.26rem;
    font-weight: 700;
    color: #4cf3ff;
    letter-spacing: 0.02rem;
    text-shadow: 0 0 10px rgba(76, 243, 255, 0.6);
    line-height: 1;
  }
  &__date {
    font-size: 0.12rem;
    color: rgba(230, 241, 255, 0.55);
  }

  // 中央标题
  &__center {
    position: relative;
    z-index: 2;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.24rem;
    height: 100%;
    padding-top: 0.06rem;
  }

  &__title {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
  }
  &__title-zh {
    font-size: 0.36rem;
    font-weight: 800;
    letter-spacing: 0.08rem;
    background: linear-gradient(180deg, #ffffff 0%, #4cf3ff 50%, #409eff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 20px rgba(76, 243, 255, 0.5);
    filter: drop-shadow(0 0 6px rgba(76, 243, 255, 0.4));
  }
  &__title-en {
    margin-top: 0.06rem;
    font-size: 0.11rem;
    font-weight: 500;
    letter-spacing: 0.3rem;
    color: rgba(76, 243, 255, 0.65);
    text-shadow: 0 0 4px rgba(76, 243, 255, 0.3);
  }

  // 翅膀（左右装饰）
  &__wing {
    position: relative;
    display: flex;
    align-items: center;
    height: 0.04rem;
    flex: 0 0 1.6rem;
    opacity: 0.85;
  }
  &__wing--right {
    transform: scaleX(-1);
  }
  .wing-line {
    width: 100%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      #4cf3ff 50%,
      #4cf3ff 100%
    );
  }
  .wing-glow {
    position: absolute;
    left: 0;
    top: -0.04rem;
    width: 0.3rem;
    height: 0.12rem;
    background: radial-gradient(
      ellipse,
      rgba(76, 243, 255, 0.7),
      transparent 70%
    );
    animation: wingGlow 2s ease-in-out infinite;
  }
  &__wing--right .wing-glow {
    left: auto;
    right: 0;
  }
  .wing-arrow {
    position: absolute;
    right: 0;
    width: 0.4rem;
    height: 0.12rem;
    filter: drop-shadow(0 0 3px #4cf3ff);
  }
  &__wing--right .wing-arrow {
    right: 0;
  }

  // 分隔
  &__divider {
    position: absolute;
    bottom: 0.18rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.06rem;
    z-index: 2;
  }
  &__divider-line {
    width: 0.8rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, #4cf3ff, transparent);
  }
  &__divider-diamond {
    width: 6px;
    height: 6px;
    background: #4cf3ff;
    transform: rotate(45deg);
    box-shadow: 0 0 4px #4cf3ff;
    opacity: 0.6;
    &:nth-child(2) {
      opacity: 0.4;
    }
    &:nth-child(3) {
      opacity: 0.8;
    }
  }
}

@keyframes shine {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%);
  }
}
@keyframes iconSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes dotBlink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.7);
  }
}
@keyframes wingGlow {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
