<template>
  <div class="provide-inject-page">
    <h5>provide / inject — 跨层级通信</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      <code>provide</code>
      在祖先组件提供数据，
      <code>inject</code>
      在任意后代组件中获取， 无需逐层 props 传递。结合
      <code>readonly</code>
      可防止子组件意外修改。
    </el-alert>

    <el-row :gutter="20">
      <el-col :span="14">
        <el-card>
          <template #header>🌳 组件树结构演示</template>

          <!-- 祖先组件区域 -->
          <div class="ancestor-box">
            <div class="layer-label">🏠 祖先组件（提供数据）</div>
            <div class="provide-info">
              <span>主题颜色：</span>
              <el-color-picker v-model="themeColor" size="small" />
              <span style="margin-left: 8px">{{ themeColor }}</span>
            </div>
            <div class="provide-info">
              <span>用户信息：</span>
              <el-input v-model="userName" size="small" style="width: 120px" placeholder="姓名" />
              <span style="margin-left: 8px">等级 {{ userLevel }}</span>
              <el-button size="small" @click="userLevel++" style="margin-left: 8px">升级</el-button>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 8px">
              此处用
              <code>provide('theme', themeColor)</code>
              和
              <code>provide('user', user)</code>
              提供数据
            </p>

            <!-- 中间层（不关心数据） -->
            <div class="middle-box">
              <div class="layer-label">🧱 中间层组件（不传递任何 props，只是路过）</div>

              <!-- 深层子组件 -->
              <div class="child-box" :style="{ borderColor: themeColor }">
                <div class="layer-label">🌿 深层子组件（通过 inject 获取数据）</div>
                <DeepChild :themeColor="themeColor" :userName="userName" :userLevel="userLevel" />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card>
          <template #header>💻 核心代码</template>
          <pre class="code-block">{{ codeExample }}</pre>
        </el-card>

        <el-card style="margin-top: 16px">
          <template #header>⚠️ readonly 保护</template>
          <pre class="code-block">{{ readonlyCode }}</pre>
          <el-alert
            type="warning"
            :closable="false"
            style="margin-top: 12px"
            title="最佳实践：数据修改应通过祖先提供的方法来做，而不是直接修改 inject 的值"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, provide, defineComponent, inject, h } from 'vue';

defineOptions({ name: 'ProvideInjectDemo' });

const themeColor = ref('#409eff');
const userName = ref('张三');
const userLevel = ref(1);

// 提供数据到后代组件
provide('themeColor', themeColor);
provide('user', { name: userName, level: userLevel });

// 提供修改方法（推荐方式）
provide('updateTheme', (color: string) => {
  themeColor.value = color;
});

// 深层子组件（用 inject 消费）
const DeepChild = defineComponent({
  name: 'DeepChild',
  setup() {
    const themeColor = inject<typeof ref>('themeColor');
    const user = inject<{ name: any; level: any }>('user', { name: ref('未知'), level: ref(0) });

    return () =>
      h('div', { style: 'padding:12px' }, [
        h('p', [
          h('span', '主题色：'),
          h('span', {
            style: `display:inline-block;width:60px;height:20px;background:${(themeColor as any).value};border-radius:4px;vertical-align:middle`,
          }),
          h('code', { style: 'margin-left:8px' }, (themeColor as any).value),
        ]),
        h('p', `用户：${user.name.value}，等级 Lv.${user.level.value}`),
        h('p', { style: 'color:#999;font-size:12px' }, '👆 修改上方祖先组件的值，这里会实时响应'),
      ]);
  },
});

const codeExample = `// ====== 祖先组件 ======
import { provide, ref } from 'vue'
const theme = ref('#409eff')
provide('theme', theme)  // 提供响应式数据

// ====== 深层子组件 ======
import { inject } from 'vue'
// 第二个参数是默认值
const theme = inject('theme', ref('#000'))
// theme 是响应式的，直接用即可`;

const readonlyCode = `import { provide, readonly } from 'vue'
const count = ref(0)

// 提供只读版本，防止子组件修改
provide('count', readonly(count))

// 同时提供修改方法
provide('setCount', (val) => {
  count.value = val  // 在祖先组件内修改
})`;
</script>

<style lang="less" scoped>
.provide-inject-page {
  padding: 20px;
  overflow-y: auto;
}

.ancestor-box {
  background: #fdf6ec;
  border: 2px solid #e6a23c;
  border-radius: 10px;
  padding: 16px;

  .provide-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
  }
}

.middle-box {
  background: #f4f4f5;
  border: 2px solid #909399;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.child-box {
  background: #ecf5ff;
  border: 2px solid;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  transition: border-color 0.3s;
}

.layer-label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 16px;
  font-size: 12px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}
</style>
