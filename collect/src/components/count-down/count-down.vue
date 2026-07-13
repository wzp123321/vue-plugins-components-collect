<template>
  <div class="count-down column center-center" :style="{ width: countDownWidth }">
    <div class="count-down-container column">
      <div class="count-down-content row center-center">
        <div
          class="count-down-item row center-center relative"
          v-for="(item, index) in countDownData"
          :key="item.label"
        >
          <div class="count-down-item-bg row center-center">
            <span class="count-down-item-number">{{ item.value }}</span>
          </div>
          <span class="count-down-item-label">{{ index === countDownData.length - 1 ? '' : ':' }}</span>
          <i class="count-down-item-tag">{{ item.label }}</i>
        </div>
      </div>
      <div class="count-down-footer row center-center">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'CountDown',

  props: {
    countDownWidth: {
      type: String,
    },
    leftTime: {
      type: Number,
    },
  },

  setup(props, context) {
    const countDownData = ref<Array<{ label: string; value: number }>>([]);
    const timer = ref<NodeJS.Timeout | null>(null);

    let leftTime: any = props.leftTime;
    const startCountDown = () => {
      timer.value = setInterval(() => {
        leftTime -= 1000;
        if (leftTime <= 0) {
          leftTime = 0;
          timer.value && clearInterval(timer.value);
          context.emit('finish');
        }
        const seconds = Math.floor(leftTime / 1000);
        const date = new Date();
        date.setHours(0, 0, seconds, 0);
        countDownData.value = [
          {
            label: '时',
            value: date.getHours(),
          },
          {
            label: '分',
            value: date.getMinutes(),
          },
          {
            label: '秒',
            value: date.getSeconds(),
          },
        ];
      }, 1000);
    };

    onMounted(() => {
      startCountDown();
    });

    onUnmounted(() => {
      timer.value && clearInterval(timer.value);
    });

    return {
      countDownData,
    };
  },
});
</script>

<style lang="less" scoped>
.count-down {
  width: 300px;

  &-container {
    align-items: center;
  }

  &-content {
    margin-bottom: 55px;
  }

  &-item {
    margin: 0 16px;

    &-bg {
      width: 64px;
      height: 100%;
      padding: 25px 0;
      background-color: var(--color-default);
      color: var(--color-primary);
      font-size: 48px;
      border-radius: 4px;
    }

    &-label {
      position: absolute;
      right: -26px;
      margin-left: 7px;
      font-size: 30px;
      color: var(--color-text-primary);
      font-weight: bold;
    }

    &:last-child &-bg {
      color: orange;
    }

    &-tag {
      position: absolute;
      bottom: -38px;
      font-size: 18px;
      text-align: center;
      width: 100%;
      color: var(--color-text-primary);
      font-style: normal;
    }
  }

  &-footer {
    width: 100%;
    font-size: 30px;
    font-weight: bold;

    &-empty {
      width: 140px;
      height: 4px;
      opacity: 0.3;
      background-color: var(--color-text-primary);
    }
  }

  @keyframes shark {
    0% {
      opacity: 1;
      transform: scale(1);
    }

    20% {
      opacity: 0;
      transform: scale(0.4);
    }
  }
}
</style>
