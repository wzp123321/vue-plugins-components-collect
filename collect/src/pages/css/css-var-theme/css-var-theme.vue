<template>
  <div class="css-var-theme-page" :data-theme="currentTheme">
    <h5>CSS 变量 — 主题切换</h5>
    <el-alert type="info" :closable="false" style="margin-bottom:20px">
      通过 CSS 自定义属性（<code>--var-name</code>）实现运行时主题切换，
      无需重新加载样式表，性能极佳，是现代前端主题系统的主流方案。
    </el-alert>

    <!-- 主题切换器 -->
    <div class="theme-switcher">
      <span>选择主题：</span>
      <div
        v-for="theme in themes"
        :key="theme.name"
        class="theme-btn"
        :class="{ active: currentTheme === theme.name }"
        :style="{ '--preview-primary': theme.primary, '--preview-bg': theme.bg }"
        @click="switchTheme(theme.name)"
      >
        <div class="color-preview"></div>
        <span>{{ theme.label }}</span>
      </div>
    </div>

    <!-- 主题预览区 -->
    <div class="theme-preview">
      <div class="preview-card">
        <div class="preview-header">
          <span class="preview-title">📊 数据概览</span>
          <el-button class="preview-btn" size="small">操作</el-button>
        </div>
        <div class="preview-stats">
          <div class="stat-block" v-for="s in stats" :key="s.label">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
        <div class="preview-badge">
          <span class="badge success">成功</span>
          <span class="badge warning">警告</span>
          <span class="badge error">错误</span>
        </div>
      </div>
    </div>

    <el-row :gutter="16" style="margin-top:20px">
      <el-col :span="12">
        <el-card>
          <template #header>CSS 变量定义方式</template>
          <pre class="code-block">{{ cssVarCode }}</pre>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>JS 动态切换主题</template>
          <pre class="code-block">{{ jsThemeCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

defineOptions({ name: 'CssVarTheme' });

const currentTheme = ref('blue');

const themes = [
  { name: 'blue', label: '蓝色', primary: '#409eff', bg: '#ecf5ff' },
  { name: 'purple', label: '紫色', primary: '#722ed1', bg: '#f9f0ff' },
  { name: 'green', label: '绿色', primary: '#52c41a', bg: '#f6ffed' },
  { name: 'dark', label: '暗黑', primary: '#6c63ff', bg: '#1a1a2e' },
  { name: 'warm', label: '暖橙', primary: '#fa8c16', bg: '#fff7e6' },
];

const themeVars: Record<string, Record<string, string>> = {
  blue: { '--primary': '#409eff', '--primary-light': '#ecf5ff', '--bg': '#f0f2f5', '--card-bg': '#fff', '--text': '#303133', '--text-light': '#909399' },
  purple: { '--primary': '#722ed1', '--primary-light': '#f9f0ff', '--bg': '#f5f0ff', '--card-bg': '#fff', '--text': '#303133', '--text-light': '#909399' },
  green: { '--primary': '#52c41a', '--primary-light': '#f6ffed', '--bg': '#f0fff4', '--card-bg': '#fff', '--text': '#303133', '--text-light': '#909399' },
  dark: { '--primary': '#6c63ff', '--primary-light': '#2d2b55', '--bg': '#0f0e17', '--card-bg': '#1a1a2e', '--text': '#fffffe', '--text-light': '#a7a9be' },
  warm: { '--primary': '#fa8c16', '--primary-light': '#fff7e6', '--bg': '#fffcf5', '--card-bg': '#fff', '--text': '#303133', '--text-light': '#909399' },
};

const switchTheme = (name: string) => {
  currentTheme.value = name;
  const vars = themeVars[name];
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
  localStorage.setItem('app-theme', name);
};

onMounted(() => {
  const saved = localStorage.getItem('app-theme') || 'blue';
  switchTheme(saved);
});

const stats = [
  { value: '12,580', label: '总访问量' },
  { value: '1,234', label: '今日新增' },
  { value: '98.5%', label: '在线率' },
  { value: '0.12s', label: '响应时间' },
];

const cssVarCode = `/* :root 定义全局变量 */
:root {
  --primary: #409eff;
  --primary-light: #ecf5ff;
  --bg: #f0f2f5;
  --card-bg: #ffffff;
  --text: #303133;
  --radius: 8px;
  --shadow: 0 2px 12px rgba(0,0,0,0.1);
}

/* 使用变量 */
.card {
  background: var(--card-bg);
  color: var(--text);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.btn-primary {
  background: var(--primary);
  /* 带降级值 */
  color: var(--text-on-primary, #fff);
}

/* 组件级变量覆盖 */
.card-danger {
  --primary: #f56c6c;  /* 只影响此元素及子元素 */
}`;

const jsThemeCode = `// 方案一：修改 :root CSS 变量
const switchTheme = (theme: Record<string, string>) => {
  const root = document.documentElement
  Object.entries(theme).forEach(([key, val]) => {
    root.style.setProperty(key, val)
  })
}

// 方案二：切换 data-theme 属性（更推荐）
document.documentElement.setAttribute('data-theme', 'dark')

/* CSS 中按 data-theme 定义 */
[data-theme="dark"] {
  --bg: #1a1a2e;
  --card-bg: #16213e;
  --text: #fffffe;
}

// 方案三：动态加载不同 CSS 文件
const link = document.querySelector('#theme-link')
link.href = \`/themes/\${themeName}.css\``;
</script>

<style lang="less" scoped>
.css-var-theme-page {
  padding: 20px;
  overflow-y: auto;
  background: var(--bg, #f0f2f5);
  min-height: calc(100vh - 60px);
  transition: background 0.3s;
}

.theme-switcher {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  .theme-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    border: 2px solid transparent;
    background: var(--card-bg, #fff);
    transition: all 0.2s;

    &.active { border-color: var(--primary, #409eff); }
    &:hover { transform: translateY(-2px); }

    .color-preview {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--preview-primary);
    }

    span { font-size: 12px; color: var(--text, #303133); }
  }
}

.theme-preview {
  .preview-card {
    background: var(--card-bg, #fff);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    transition: all 0.3s;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .preview-title { font-size: 16px; font-weight: 600; color: var(--text, #303133); }
    .preview-btn {
      background: var(--primary, #409eff) !important;
      border-color: var(--primary, #409eff) !important;
      color: #fff !important;
    }
  }

  .preview-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;

    .stat-block {
      flex: 1;
      text-align: center;
      padding: 12px;
      background: var(--primary-light, #ecf5ff);
      border-radius: 8px;
      transition: all 0.3s;

      .stat-value { font-size: 20px; font-weight: 700; color: var(--primary, #409eff); }
      .stat-label { font-size: 12px; color: var(--text-light, #909399); margin-top: 4px; }
    }
  }

  .preview-badge {
    display: flex;
    gap: 8px;

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;

      &.success { background: #f0f9eb; color: #67c23a; }
      &.warning { background: #fdf6ec; color: #e6a23c; }
      &.error { background: #fef0f0; color: #f56c6c; }
    }
  }
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 14px;
  font-size: 11.5px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}
</style>
