<template>
  <div class="animation-lottery">
    <div class="al-container">
      <div
        v-for="(item, index) in prizes"
        :key="index"
        class="al-item"
        :class="{ active: activeIndex === index, highlighted: resultIndex === index }"
        @click="startLottery"
      >
        <div class="al-item-content">
          <div class="prize-icon">{{ item.icon }}</div>
          <div class="prize-name">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <el-button class="al-btn" :disabled="isLotteryFlag" @click="startLottery">
      {{ isLotteryFlag ? '抽奖中...' : '开始抽奖' }}
    </el-button>
    <div v-if="result" class="result-modal">
      <div class="modal-content">
        <h3>恭喜您!</h3>
        <p>获得: {{ result }}</p>
        <button @click="result = ''">确定</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'AnimationLottery',
});
import { ref, onUnmounted } from 'vue';

const prizes = ref([
  { name: 'iPhone', icon: '📱' },
  { name: '红包', icon: '🧧' },
  { name: '谢谢', icon: '🙏' },
  { name: '优惠券', icon: '🎫' },
  { name: '开始', icon: '🎮' },
  { name: '积分', icon: '⭐' },
  { name: '耳机', icon: '🎧' },
  { name: '再来', icon: '🔄' },
  { name: '电脑', icon: '💻' },
]);

const activeIndex = ref(-1);
const resultIndex = ref(-1);
const isLotteryFlag = ref(false);
const result = ref('');
let timer: any = null;
let speed = 100;
let round = 0;
const totalRound = 2; // 旋转轮数

const startLottery = () => {
  if (isLotteryFlag.value) return;

  isLotteryFlag.value = true;
  result.value = '';
  resultIndex.value = -1;
  round = 0;
  speed = 100;

  // 模拟从后端获取中奖结果 (实际项目应该用API)
  const prizeIndex = Math.floor(Math.random() * prizes.value.length);

  animate(prizeIndex);
};

const animate = (targetIndex: number) => {
  activeIndex.value = (activeIndex.value + 1) % prizes.value.length;

  if (round < totalRound || activeIndex.value !== targetIndex) {
    if (activeIndex.value === prizes.value.length - 1) {
      round++;
      if (round >= totalRound - 1) {
        speed += 20; // 最后阶段减速
      }
    }

    timer = setTimeout(() => animate(targetIndex), speed);
  } else {
    clearTimeout(timer);
    isLotteryFlag.value = false;
    resultIndex.value = targetIndex;
    result.value = prizes.value[targetIndex].name;
  }
};

onUnmounted(() => {
  clearTimeout(timer);
});
</script>
<style lang="less" scoped>
.animation-lottery {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 36px;

  .al-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    width: 400px;
    height: 400px;

    .al-item {
      width: 120px;
      height: 120px;
      aspect-ratio: 1/1;
      background: #f8f8f8;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;

      &:hover {
        opacity: 0.8;
        transition: all 233ms;
      }

      .al-item-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .prize-icon {
        font-size: 40px;
        margin-bottom: 5px;
      }

      .prize-name {
        font-size: 14px;
        color: #333;
      }
    }

    .al-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 235, 59, 0.3);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .al-item.active::before {
      opacity: 1;
    }

    .al-item.highlighted {
      animation: bounce 0.5s 3;
      background: #fff9c4;
    }
  }

  .al-btn {
    background: #ff5722;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .al-btn:disabled {
    background: #bdbdbd;
    cursor: not-allowed;
  }

  .al-btn:hover:not(:disabled) {
    background: #e64a19;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  animation: zoomIn 0.3s;
}

.modal-content h3 {
  color: #e91e63;
  margin-bottom: 15px;
}

.modal-content p {
  font-size: 20px;
  margin-bottom: 20px;
}

.modal-content button {
  padding: 8px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
