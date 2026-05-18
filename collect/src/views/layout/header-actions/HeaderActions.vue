<template>
  <div class="header-actions">
    <!-- 主题切换 -->
    <div class="action-item" @click="handleThemeToggle" :title="t('theme.switch')">
      <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <template v-if="themeStore.isDark">
          <!-- 太阳图标 - 切换到浅色 -->
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </template>
        <template v-else>
          <!-- 月亮图标 - 切换到深色 -->
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </template>
      </svg>
      <span class="action-text">{{ themeStore.isDark ? t('theme.light') : t('theme.dark') }}</span>
    </div>

    <!-- 语言切换 -->
    <el-dropdown trigger="click" @command="handleLanguageChange">
      <div class="action-item" :title="t('language.switch')">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span class="action-text">{{ langStore.getLanguageText() }}</span>
        <svg class="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :command="'zh-CN'" :class="{ 'is-active': langStore.language === 'zh-CN' }">
            <span class="lang-option">
              <span class="lang-flag">🇨🇳</span>
              <span>中文</span>
            </span>
          </el-dropdown-item>
          <el-dropdown-item :command="'en-US'" :class="{ 'is-active': langStore.language === 'en-US' }">
            <span class="lang-option">
              <span class="lang-flag">🇺🇸</span>
              <span>English</span>
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '@/store/modules/useThemeStore';
import { useLanguageStore } from '@/store/modules/useLanguageStore';

const { t, locale } = useI18n();
const themeStore = useThemeStore();
const langStore = useLanguageStore();

const handleThemeToggle = () => {
  themeStore.toggleTheme();
};

const handleLanguageChange = (lang: string) => {
  locale.value = lang;
  langStore.setLanguage(lang as 'zh-CN' | 'en-US');
};
</script>

<style lang="less" scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-primary);
  
  &:hover {
    background-color: var(--color-hover);
    color: var(--color-text);
  }
}

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.action-text {
  font-size: 13px;
  font-weight: 500;
}

.action-arrow {
  width: 14px;
  height: 14px;
  opacity: 0.6;
  margin-left: 2px;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-flag {
  font-size: 16px;
  line-height: 1;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  
  &.is-active {
    background-color: var(--color-hover);
    color: var(--color-primary);
  }
}
</style>
