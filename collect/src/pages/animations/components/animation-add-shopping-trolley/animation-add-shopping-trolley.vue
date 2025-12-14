<template>
  <div class="rolling-ball-container">
    <div class="item-list">
      <div class="item" v-for="item in 10" :key="item">
        <div class="product-card">
          <div class="product-tag">秒杀</div>
          <div class="product-image">
            <img src="../../../../assets/images/css/css-friut-1.jpg" alt="商品图片" />
          </div>
          <div class="product-info">
            <div class="product-title">大疆 DJI Osmo Pocket 3 一英寸口袋云台相机</div>
            <div class="product-features">
              <span class="feature-tag">三轴防抖</span>
              <span class="feature-tag">防抖稳定</span>
              <span class="feature-tag">高清画质</span>
            </div>
            <div class="product-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">4788</span>
              <span class="price-original">¥4899</span>
            </div>
            <div class="product-meta">
              <span class="delivery-time">24分钟达</span>
              <span class="rating">好评率96%</span>
            </div>
            <div class="product-shop">京东之家-凯德汇新店</div>
          </div>
          <div class="add-to-cart" @click="startRolling($event)">+</div>
        </div>
      </div>
    </div>
    <div class="point end-point">
      <div style="position: relative">
        <!-- <img src="/cart.png" /> -->
        <svg
          t="1746963514844"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="5133"
          width="32"
          height="32"
        >
          <path
            d="M354.778212 821.104987c-34.091446 0-61.703317 27.611871-61.703317 61.703317 0 34.091446 27.611871 61.703317 61.703317 61.703317s61.703317-27.611871 61.703317-61.703317C416.48153 848.716858 388.868635 821.104987 354.778212 821.104987L354.778212 821.104987zM786.701432 821.104987c-34.091446 0-61.703317 27.611871-61.703317 61.703317 0 34.091446 27.611871 61.703317 61.703317 61.703317s61.703317-27.611871 61.703317-61.703317C848.40475 848.716858 820.792878 821.104987 786.701432 821.104987L786.701432 821.104987zM847.911516 790.253328l-501.123278 0c-44.457538 0-83.546811-35.171034-88.976474-80.060407l-52.324716-368.368742-29.772071-172.151825c-1.851161-15.025205-15.549138-27.303856-28.939099-27.303856l-39.305191 0c-17.029862 0-30.851659-13.821797-30.851659-30.851659s13.821797-30.851659 30.851659-30.851659l39.305191 0c45.01217 0 84.533278 35.171034 89.994664 80.060407l29.709649 171.504072 52.540633 369.942587c1.727341 14.31503 14.685467 26.377764 27.76639 26.377764l501.123278 0c17.060561 0 30.851659 13.791098 30.851659 30.851659C878.763175 776.462231 864.972077 790.253328 847.911516 790.253328zM385.351532 666.846694c-16.011672 0-29.556153-12.341073-30.727839-28.599362-1.264806-16.999163 11.508102-31.776727 28.476565-33.010835l418.533258-30.851659c15.363919-0.092098 28.322046-12.155854 30.018687-25.88453l48.591695-278.035364c1.234107-10.366092-1.635243-21.719674-7.836479-28.753881-3.979638-4.504594-8.977465-6.78759-14.809287-6.78759l-534.165836 0c-17.029862 0-30.851659-13.821797-30.851659-30.851659s13.821797-30.851659 30.851659-30.851659l534.165836 0c23.570835 0 45.228087 9.779737 60.994166 27.581172 18.017352 20.331048 26.285666 48.992831 22.676465 78.70248l-48.622394 278.066063c-5.244444 43.25413-44.303019 78.425164-88.760556 78.425164l-416.250262 30.759561C386.863978 666.815995 386.092405 666.846694 385.351532 666.846694z"
            fill="#272636"
            p-id="5134"
          ></path>
        </svg>
        <div class="cart-count">{{ totalCount }}</div>
      </div>
    </div>

    <!-- 小球 -->
    <div v-for="(ball, index) in balls" :key="index" class="ball" v-show="ball.show" :style="getBallStyle(ball)"></div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const totalCount = ref(0);

// 创建小球数组
const balls = reactive(
  Array(3)
    .fill(0)
    .map(() => ({
      show: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      pathX: 0, // 路径偏移量
      progress: 0, // 动画进度
    })),
);

// 开始滚动动画
const startRolling = (event: MouseEvent) => {
  // 获取起点和终点元素
  const startPoint = event.currentTarget as HTMLElement;
  const endPoint = document.querySelector('.end-point') as HTMLElement;

  if (startPoint && endPoint) {
    // 找到一个可用的小球
    const ball = balls.find((ball) => !ball.show) as any;
    if (ball) {
      // 获取起点位置
      const startRect = startPoint.getBoundingClientRect();
      ball.startX = startRect.left + startRect.width / 2;
      ball.startY = startRect.top + startRect.height / 2;

      // 获取终点位置
      const endRect = endPoint.getBoundingClientRect();
      const endX = endRect.left + endRect.width / 2;
      const endY = endRect.top + endRect.height / 2;
      //微调
      ball.endX = endX - 4;
      ball.endY = endY - 7;

      // 设置路径偏移量（向下偏移100px而不是向右）
      ball.pathX = 0;
      ball.pathY = 100;

      // 显示小球
      ball.show = true;
      ball.progress = 0;

      // 使用requestAnimationFrame实现曲线动画
      let startTime = Date.now();
      const duration = 400; // 动画持续时间

      function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        ball.progress = Math.min(elapsed / duration, 1);

        if (ball.progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 动画结束后隐藏小球
          setTimeout(() => {
            ball.show = false;
          }, 100);
        }
      }

      requestAnimationFrame(animate);

      // 增加总数量
      totalCount.value++;
    }
  }
};

// 获取小球样式
const getBallStyle = (ball: any) => {
  if (!ball.show) return {};

  // 使用二次贝塞尔曲线计算路径
  const t = ball.progress;
  const mt = 1 - t;

  // 计算起点和终点是否在同一垂直线上
  const isVertical = Math.abs(ball.startX - ball.endX) < 20;

  // 计算控制点（确保有弧度）
  let controlX, controlY;

  if (isVertical) {
    // 如果在同一垂直线上，向左偏移一定距离
    controlX = ball.startX - 100; // 向左偏移100px
    controlY = (ball.startY + ball.endY) / 2; // 垂直中点
  } else {
    // 否则使用向左偏移
    controlX = (ball.startX + ball.endX) / 2 - 100; // 向左偏移100px
    controlY = (ball.startY + ball.endY) / 2 + (ball.pathY || 100);
  }

  // 二次贝塞尔曲线公式
  const x = mt * mt * ball.startX + 2 * mt * t * controlX + t * t * ball.endX;
  const y = mt * mt * ball.startY + 2 * mt * t * controlY + t * t * ball.endY;

  return {
    left: `${x}px`,
    top: `${y}px`,
    transform: `rotate(${ball.progress * 360}deg)`, // 添加旋转效果
  };
};
</script>

<style scoped>
.rolling-ball-container {
  position: relative;
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 16px;
  box-sizing: border-box;
  overflow-x: hidden; /* 防止横向滚动 */
}

.item-list {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr; /* 移动端单列显示 */
  gap: 12px;
  max-width: 100%;
}

.item {
  display: flex;
  align-items: center;
  width: 100%;
}

.product-card {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  position: relative;
  width: 100%;
  box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.product-tag {
  position: absolute;
  top: 4px;
  left: 4px;
  background-color: #ff4e4e;
  color: white;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
}

.product-image {
  width: 120px;
  min-width: 120px;
  height: 120px;
  margin-right: 16px;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; /* 防止内容溢出 */
}

.product-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  word-break: break-word; /* 允许在单词内换行 */
}

.product-features {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.feature-tag {
  background-color: #f5f5f5;
  color: #666;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.product-price {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
}

.price-symbol {
  color: #e4393c;
  font-size: 14px;
}

.price-value {
  color: #e4393c;
  font-size: 16px;
  font-weight: bold;
}

.price-original {
  color: #999;
  font-size: 16px;
  text-decoration: line-through;
  margin-left: 8px;
}

.product-meta {
  display: flex;
  font-size: 14px;
  color: #666;
  gap: 4px;
  flex-wrap: wrap;
}

.delivery-time {
  color: #666;
}

.product-shop {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-to-cart {
  width: 24px;
  height: 24px;
  background-color: #e4393c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  align-self: flex-end;

  flex-shrink: 0;
}

.point {
  position: fixed;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  bottom: 10%;
  right: 0.9375rem;
  background-color: white;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.2);
  z-index: 99;
}

.cart-count {
  position: absolute;
  right: -8px;
  top: -8px;
  background-color: #e4393c;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

/* 小球样式 */
.ball {
  position: fixed;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #e93b3d;
  box-shadow: 0 0.125rem 0.5rem rgba(233, 59, 61, 0.6);
  z-index: 100;
  pointer-events: none;
}
</style>
