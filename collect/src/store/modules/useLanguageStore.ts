import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type Language = 'zh-CN' | 'en-US';

export const useLanguageStore = defineStore('language', () => {
  // 从本地存储读取语言设置
  const storedLang = localStorage.getItem('language') as Language | null;
  const language = ref<Language>(storedLang || 'zh-CN');

  // 语言映射
  const languageMap: Record<Language, string> = {
    'zh-CN': '中文',
    'en-US': 'EN',
  };

  // 切换语言
  const toggleLanguage = () => {
    language.value = language.value === 'zh-CN' ? 'en-US' : 'zh-CN';
  };

  // 设置指定语言
  const setLanguage = (lang: Language) => {
    language.value = lang;
  };

  // 获取当前语言显示文本
  const getLanguageText = () => {
    return languageMap[language.value];
  };

  // 监听语言变化，保存到本地存储
  watch(language, (lang) => {
    localStorage.setItem('language', lang);
  });

  return {
    language,
    languageMap,
    toggleLanguage,
    setLanguage,
    getLanguageText,
  };
});
