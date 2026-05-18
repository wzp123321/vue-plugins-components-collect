<template>
  <div class="teleport-page">
    <h5>Teleport — 传送门</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      <code>Teleport</code> 可以将组件内容渲染到 DOM 树中指定的目标节点，
      常用于模态框、Toast 通知、全局遮罩等需要脱离父级 overflow 限制的场景。
    </el-alert>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>📦 无 Teleport — 被父级 overflow 裁切</template>
          <div class="overflow-container">
            <p style="color:#666;font-size:13px">此容器设置了 overflow:hidden</p>
            <el-button type="primary" @click="showNormal = true">打开普通弹窗</el-button>
            <!-- 没有 Teleport，弹窗被父级裁切 -->
            <div v-if="showNormal" class="inline-modal">
              <div class="inline-modal__box">
                <p>😵 被父级 overflow 裁切了！</p>
                <el-button @click="showNormal = false">关闭</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>🚀 有 Teleport — 渲染到 body 下</template>
          <div class="overflow-container">
            <p style="color:#666;font-size:13px">此容器设置了 overflow:hidden</p>
            <el-button type="success" @click="showTeleport = true">打开 Teleport 弹窗</el-button>
            <!-- Teleport 到 body，完全脱离父级约束 -->
            <Teleport to="body">
              <div v-if="showTeleport" class="teleport-overlay">
                <div class="teleport-modal">
                  <h3>🎉 Teleport 弹窗</h3>
                  <p>我被传送到了 <code>&lt;body&gt;</code> 下，不受任何父级约束！</p>
                  <p style="color:#999;font-size:13px">打开开发者工具可以看到，这个 DOM 节点在 body 的直接子级</p>
                  <el-button type="success" @click="showTeleport = false">关闭</el-button>
                </div>
              </div>
            </Teleport>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" style="margin-top:20px">
        <el-card>
          <template #header>📌 Teleport to 指定容器（自定义目标）</template>
          <div style="display:flex;gap:20px;align-items:flex-start">
            <div>
              <el-button type="warning" @click="showCustom = !showCustom">
                {{ showCustom ? '隐藏' : '传送到右侧容器' }}
              </el-button>
              <pre class="code-block">{{ teleportCode }}</pre>
            </div>
            <!-- 自定义目标容器 -->
            <div id="custom-teleport-target" class="custom-target">
              <p style="color:#999;font-size:12px">⬇ Teleport 目标容器 #custom-teleport-target</p>
              <Teleport to="#custom-teleport-target" :disabled="!showCustom">
                <div v-if="showCustom" class="custom-content">
                  🎯 我被传送到了指定容器里！
                </div>
              </Teleport>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

defineOptions({ name: 'TeleportDemo' });

const showNormal = ref(false);
const showTeleport = ref(false);
const showCustom = ref(false);

const teleportCode = `<!-- 传送到指定 id 的容器 -->
<Teleport to="#custom-teleport-target">
  <div v-if="show">我在目标容器里</div>
</Teleport>

<!-- 禁用传送（disabled 为 true 时，在原位渲染）-->
<Teleport to="body" :disabled="isMobile">
  <Dialog />
</Teleport>`;
</script>

<style lang="less" scoped>
.teleport-page {
  padding: 20px;
  overflow-y: auto;
}

.overflow-container {
  height: 120px;
  overflow: hidden;
  border: 2px dashed #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  position: relative;
}

.inline-modal {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;

  &__box {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }
}

.teleport-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.teleport-modal {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  max-width: 480px;
  text-align: center;

  h3 {
    margin-bottom: 12px;
  }
  p {
    margin-bottom: 16px;
    line-height: 1.6;
  }
}

.custom-target {
  flex: 1;
  min-height: 120px;
  border: 2px solid #409eff;
  border-radius: 8px;
  padding: 16px;
  background: #ecf5ff;
}

.custom-content {
  background: #409eff;
  color: #fff;
  padding: 12px 16px;
  border-radius: 6px;
  font-weight: 500;
  margin-top: 8px;
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 16px;
  font-size: 12px;
  line-height: 1.7;
  margin-top: 12px;
  white-space: pre;
}
</style>
