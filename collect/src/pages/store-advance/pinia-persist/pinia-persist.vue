<template>
  <div class="pinia-persist-page">
    <h5>Pinia 持久化存储</h5>
    <el-alert type="info" :closable="false" style="margin-bottom:20px">
      使用 <code>pinia-plugin-persistedstate</code> 实现 Pinia store 的持久化，
      支持 localStorage、sessionStorage、Cookie 等多种存储方式，支持自定义序列化。
    </el-alert>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header>① 持久化 Store 演示（手动实现）</template>
          <div class="demo-section">
            <div class="stat-item">
              <span>主题：</span>
              <el-radio-group v-model="persistedData.theme" size="small" @change="save">
                <el-radio-button label="light">浅色</el-radio-button>
                <el-radio-button label="dark">深色</el-radio-button>
                <el-radio-button label="system">跟随系统</el-radio-button>
              </el-radio-group>
            </div>
            <div class="stat-item">
              <span>语言：</span>
              <el-select v-model="persistedData.locale" size="small" @change="save">
                <el-option label="中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </div>
            <div class="stat-item">
              <span>字体大小：</span>
              <el-slider v-model="persistedData.fontSize" :min="12" :max="20" style="width:140px" @change="save" />
              <span>{{ persistedData.fontSize }}px</span>
            </div>
            <el-divider />
            <el-button size="small" @click="clearStorage">清除持久化数据</el-button>
            <el-button size="small" type="info" @click="showRaw = !showRaw">查看存储内容</el-button>
            <p style="font-size:12px;color:#999;margin-top:8px">✅ 刷新页面后，上方设置会自动恢复</p>
            <div v-if="showRaw" class="raw-data">{{ rawStorageData }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>② pinia-plugin-persistedstate 使用</template>
          <pre class="code-block">{{ installCode }}</pre>
        </el-card>
      </el-col>

      <el-col :span="12" style="margin-top:16px">
        <el-card>
          <template #header>③ 基础持久化配置</template>
          <pre class="code-block">{{ basicPersistCode }}</pre>
        </el-card>
      </el-col>

      <el-col :span="12" style="margin-top:16px">
        <el-card>
          <template #header>④ 高级配置（部分持久化、加密）</template>
          <pre class="code-block">{{ advancedPersistCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';

defineOptions({ name: 'PiniaPersist' });

const STORAGE_KEY = 'app-settings';

interface AppSettings {
  theme: string;
  locale: string;
  fontSize: number;
}

const defaultSettings: AppSettings = { theme: 'light', locale: 'zh-CN', fontSize: 14 };

const persistedData = reactive<AppSettings>({ ...defaultSettings });
const showRaw = ref(false);
const rawStorageData = ref('');

const save = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData));
  rawStorageData.value = localStorage.getItem(STORAGE_KEY) || '';
};

const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(persistedData, defaultSettings);
  rawStorageData.value = '';
};

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { Object.assign(persistedData, JSON.parse(saved)); } catch {}
  }
  rawStorageData.value = localStorage.getItem(STORAGE_KEY) || '(空)';
});

const installCode = `# 安装
pnpm add pinia-plugin-persistedstate

// main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)`;

const basicPersistCode = `// stores/settings.ts
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    locale: 'zh-CN',
    fontSize: 14,
    token: '',
  }),
  // 开启持久化（默认存到 localStorage）
  persist: true,
})

// 使用 Setup Store 写法
export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref('light')
    const locale = ref('zh-CN')
    return { theme, locale }
  },
  { persist: true }
)`;

const advancedPersistCode = `// 高级配置
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null,
    preferences: {},
  }),
  persist: {
    // 指定存储 key
    key: 'my-user-store',

    // 指定存储方式（sessionStorage）
    storage: sessionStorage,

    // 只持久化部分 state（推荐：不持久化敏感数据）
    paths: ['token', 'preferences'],

    // 自定义序列化（可用于加密）
    serializer: {
      serialize: (state) => encrypt(JSON.stringify(state)),
      deserialize: (str) => JSON.parse(decrypt(str)),
    },

    // 恢复 state 前的钩子
    beforeRestore: (ctx) => {
      console.log(\`即将恢复 \${ctx.store.$id}\`)
    },

    // 恢复 state 后的钩子
    afterRestore: (ctx) => {
      console.log(\`已恢复 \${ctx.store.$id}\`)
    },
  }
})`;
</script>

<style lang="less" scoped>
.pinia-persist-page { padding: 20px; overflow-y: auto; }
.demo-section { display: flex; flex-direction: column; gap: 12px; }
.stat-item { display: flex; align-items: center; gap: 12px; font-size: 14px; }
.raw-data {
  background: #1e1e2e; color: #cdd6f4; border-radius: 6px;
  padding: 12px; font-size: 12px; word-break: break-all; margin-top: 8px;
}
.code-block {
  background: #1e1e2e; color: #cdd6f4; border-radius: 8px;
  padding: 14px; font-size: 11px; line-height: 1.7; overflow-x: auto; white-space: pre;
}
</style>
