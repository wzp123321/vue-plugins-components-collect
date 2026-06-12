<script lang="ts" setup>
import { ref } from 'vue';
import { useInterval } from '../../hooks/useInterval';
import { getActivityStream } from '../../utils/mockData';
import { formatNow } from '../../utils/format';

interface LogItem {
  time: string;
  text: string;
}

const logs = ref<LogItem[]>([]);
const MAX = 8;

const push = () => {
  logs.value = [
    { time: formatNow(), text: getActivityStream() },
    ...logs.value,
  ].slice(0, MAX);
};

push();
useInterval(push, 3000);
</script>

<template>
  <div class="activity-stream">
    <transition-group name="slide" tag="ul">
      <li
        v-for="(log, idx) in logs"
        :key="`${log.time}-${idx}`"
        class="activity-stream__item"
      >
        <span class="activity-stream__time">{{ log.time }}</span>
        <span class="activity-stream__dot" />
        <span class="activity-stream__text ellipsis">{{ log.text }}</span>
      </li>
    </transition-group>
  </div>
</template>

<style lang="less" scoped>
.activity-stream {
  height: 100%;
  overflow: hidden;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    height: 0.32rem;
    font-size: 0.13rem;
    color: rgba(230, 241, 255, 0.85);
    border-bottom: 1px dashed rgba(64, 158, 255, 0.1);
  }

  &__time {
    color: rgba(76, 243, 255, 0.7);
    margin-right: 0.12rem;
    font-family: 'DIN', 'Helvetica Neue', Arial, sans-serif;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4cf3ff;
    box-shadow: 0 0 6px #4cf3ff;
    margin-right: 0.12rem;
  }

  &__text {
    flex: 1;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
.slide-leave-to {
  opacity: 0;
}
</style>
