<template>
  <div class="css-animation-page">
    <h5>CSS 纯动画 @keyframes 大全</h5>
    <el-row :gutter="16">
      <el-col v-for="anim in animations" :key="anim.name" :span="6">
        <el-card class="anim-card" shadow="hover">
          <div class="demo-area">
            <div :class="['anim-box', anim.class]" :style="anim.style">
              <span>{{ anim.emoji }}</span>
            </div>
          </div>
          <div class="anim-info">
            <div class="anim-name">{{ anim.name }}</div>
            <div class="anim-desc">{{ anim.desc }}</div>
          </div>
          <pre class="mini-code">{{ anim.code }}</pre>
        </el-card>
      </el-col>
    </el-row>

    <!-- 复杂动画 -->
    <el-row :gutter="16" style="margin-top:20px">
      <el-col :span="12">
        <el-card>
          <template #header>🌊 波浪加载效果</template>
          <div class="wave-demo">
            <div v-for="i in 5" :key="i" class="wave-bar" :style="{ animationDelay: (i * 0.1) + 's' }"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>⭕ 打字机效果</template>
          <div class="typewriter-demo">
            <span class="typewriter-text">Hello, 我是打字机效果！</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" style="margin-top:16px">
        <el-card>
          <template #header>✨ 粒子爆炸（纯CSS）</template>
          <div class="particles-demo" @click="triggerExplosion" :class="{ exploding: exploding }">
            <div v-for="i in 12" :key="i" class="particle" :style="{ '--i': i }"></div>
            <span>点击爆炸！</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" style="margin-top:16px">
        <el-card>
          <template #header>🃏 3D 翻转卡片</template>
          <div class="flip-card">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <p>🎴 正面</p>
                <p style="font-size:12px;color:#666;margin-top:8px">hover 查看背面</p>
              </div>
              <div class="flip-card-back">
                <p>🎭 背面</p>
                <p style="font-size:12px;margin-top:8px">使用 transform: rotateY(180deg)</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

defineOptions({ name: 'CssKeyframeAnimation' });

const exploding = ref(false);
const triggerExplosion = () => {
  exploding.value = false;
  setTimeout(() => { exploding.value = true; }, 10);
  setTimeout(() => { exploding.value = false; }, 1000);
};

const animations = [
  { name: 'fadeIn 淡入', emoji: '✨', class: 'anim-fade-in', style: {}, desc: '透明度 0→1', code: `animation: fadeIn 1s ease infinite alternate` },
  { name: 'slideUp 上滑', emoji: '⬆️', class: 'anim-slide-up', style: {}, desc: 'translateY 向上', code: `animation: slideUp 1s ease infinite` },
  { name: 'bounce 弹跳', emoji: '⚽', class: 'anim-bounce', style: {}, desc: '弹性缩放', code: `animation: bounce 0.8s infinite` },
  { name: 'spin 旋转', emoji: '🌀', class: 'anim-spin', style: {}, desc: 'rotate 360deg', code: `animation: spin 1.5s linear infinite` },
  { name: 'pulse 脉冲', emoji: '❤️', class: 'anim-pulse', style: {}, desc: 'scale 缩放', code: `animation: pulse 1s ease infinite` },
  { name: 'shake 抖动', emoji: '📳', class: 'anim-shake', style: {}, desc: 'translateX 左右', code: `animation: shake 0.5s infinite` },
  { name: 'flip 翻转', emoji: '🪙', class: 'anim-flip', style: {}, desc: 'rotateY 3D翻转', code: `animation: flip 2s ease infinite` },
  { name: 'swing 摆动', emoji: '🎪', class: 'anim-swing', style: {}, desc: 'rotate 钟摆', code: `animation: swing 1s ease infinite` },
];
</script>

<style lang="less" scoped>
.css-animation-page { padding: 20px; overflow-y: auto; }

.anim-card { text-align: center; }
.demo-area { height: 80px; display: flex; align-items: center; justify-content: center; }
.anim-box { font-size: 32px; display: inline-block; }
.anim-info { .anim-name { font-weight: 600; font-size: 13px; } .anim-desc { font-size: 11px; color: #999; margin-top: 2px; } }
.mini-code {
  background: #1e1e2e; color: #7c7; border-radius: 4px; padding: 6px;
  font-size: 10px; line-height: 1.5; overflow-x: auto; white-space: pre; margin-top: 8px;
}

// ===== 动画关键帧 =====
@keyframes fadeIn { from { opacity: 0.1; } to { opacity: 1; } }
@keyframes slideUp { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
@keyframes bounce { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.7) scaleX(1.2); } }
@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
@keyframes flip { 0%,100% { transform: rotateY(0); } 50% { transform: rotateY(180deg); } }
@keyframes swing { 0%,100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }

.anim-fade-in { animation: fadeIn 1s ease infinite alternate; }
.anim-slide-up { animation: slideUp 1s ease infinite; }
.anim-bounce { animation: bounce 0.8s ease infinite; }
.anim-spin { animation: spin 1.5s linear infinite; }
.anim-pulse { animation: pulse 1s ease-in-out infinite; }
.anim-shake { animation: shake 0.5s ease infinite; }
.anim-flip { animation: flip 2s ease infinite; }
.anim-swing { transform-origin: top center; animation: swing 1s ease-in-out infinite; }

// ===== 波浪加载 =====
.wave-demo {
  display: flex; align-items: flex-end; justify-content: center;
  height: 60px; gap: 6px; padding: 0 20px;
  
  .wave-bar {
    width: 8px; height: 40px; background: #409eff; border-radius: 4px;
    animation: wave 1s ease-in-out infinite;
    @keyframes wave { 0%,100% { height: 16px; } 50% { height: 48px; } }
  }
}

// ===== 打字机 =====
.typewriter-demo { padding: 20px; display: flex; align-items: center; justify-content: center; }
.typewriter-text {
  font-size: 16px; font-weight: 500; color: #409eff;
  overflow: hidden; white-space: nowrap; border-right: 2px solid #409eff;
  width: 0; animation: typing 2.5s steps(14, end) infinite, cursor-blink 0.6s step-end infinite alternate;
  
  @keyframes typing { 0% { width: 0; } 50%,90% { width: 16em; } 100% { width: 0; } }
  @keyframes cursor-blink { from { border-color: #409eff; } to { border-color: transparent; } }
}

// ===== 粒子爆炸 =====
@keyframes explode {
  0% { transform: rotate(calc(var(--i) * 30deg)) translateY(0) scale(1); opacity: 1; }
  100% { transform: rotate(calc(var(--i) * 30deg)) translateY(-60px) scale(0); opacity: 0; }
}

.particles-demo {
  position: relative; height: 100px; display: flex; align-items: center;
  justify-content: center; cursor: pointer; user-select: none; font-weight: 500;

  .particle {
    position: absolute; width: 10px; height: 10px; border-radius: 50%;
    background: hsl(calc(var(--i) * 30deg), 80%, 60%);
    opacity: 0;
  }

  &.exploding .particle { animation: explode 0.8s ease-out forwards; }
}

// ===== 3D 翻转卡片 =====
.flip-card {
  height: 120px; perspective: 800px;
  display: flex; align-items: center; justify-content: center;

  &:hover .flip-card-inner { transform: rotateY(180deg); }
}

.flip-card-inner {
  width: 200px; height: 100px; position: relative;
  transform-style: preserve-3d; transition: transform 0.6s;
}

.flip-card-front, .flip-card-back {
  position: absolute; width: 100%; height: 100%;
  backface-visibility: hidden; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 500;
}

.flip-card-front { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }
.flip-card-back { background: linear-gradient(135deg, #f093fb, #f5576c); color: #fff; transform: rotateY(180deg); }
</style>
