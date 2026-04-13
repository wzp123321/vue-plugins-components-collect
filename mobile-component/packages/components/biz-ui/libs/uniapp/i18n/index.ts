import zhHans from './locales/zh-Hans.json';
import zhHant from './locales/zh-Hant.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import ru from './locales/ru.json';
declare const uni: any;

type LocaleMap = Record<string, string>;
type LocaleDict = Record<string, LocaleMap>;

const settings: {
  lang: string;
  locales: LocaleDict;
} = {
  lang: uni.getLocale() as string,
  locales: {
    en,
    es,
    fr,
    de,
    ko,
    ja,
    ru,
    'zh-Hant': zhHant,
    'zh-Hans': zhHans,
  },
};

uni.onLocaleChange((locale: { locale: string } | string) => {
  settings.lang = typeof locale === 'string' ? locale : locale?.locale || settings.lang;
});

/**
 * 多语言方法
 */
export function t(value: string, params: Record<string, string | number> = {}) {
  // console.log(settings.locales[settings.lang])
  if (value != '' && value != null) {
    value = value.replaceAll('.', '_');
    let lang = settings.lang;
    if (!settings.locales[settings.lang]) {
      lang = 'zh-Hans';
    }
    const localeTable = settings.locales[lang] || settings.locales['zh-Hans'] || {};
    let result = localeTable[value] || value;
    // 替换{xxx}格式的变量
    Object.keys(params).forEach(key => {
      const reg = new RegExp(`{${key}}`, 'g');
      result = result.replace(reg, String(params[key]));
    });
    return result;
  } else {
    return value;
  }
}

export default {
  settings: settings,
};
