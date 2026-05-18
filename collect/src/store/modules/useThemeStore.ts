import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type ThemeMode = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  // 从本地存储读取主题
  const storedTheme = localStorage.getItem('theme') as ThemeMode | null;
  const isDark = ref<boolean>(storedTheme ? storedTheme === 'dark' : false);

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  // 设置指定主题
  const setTheme = (theme: ThemeMode) => {
    isDark.value = theme === 'dark';
  };

  // 监听主题变化，应用到 document
  watch(isDark, (dark) => {
    const theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    
    // 更新 HTML 类名
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, { immediate: true });

  return {
    isDark,
    toggleTheme,
    setTheme,
  };
});
