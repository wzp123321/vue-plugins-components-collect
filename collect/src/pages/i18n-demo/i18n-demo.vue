<template>
  <div class="i18n-page">
    <header class="i18n-page__head">
      <h3 class="i18n-page__title">国际化（vue-i18n）</h3>
      <p class="i18n-page__desc">
        词表按「业务域 + 功能键」两层组织；语言包懒加载可按 locale 动态 import，首包只带默认语言。
      </p>
    </header>

    <div class="i18n-page__toolbar">
      <el-radio-group v-model="locale" size="small">
        <el-radio-button value="zh-CN">简体中文</el-radio-button>
        <el-radio-button value="en-US">English</el-radio-button>
        <el-radio-button value="ja-JP">日本語</el-radio-button>
      </el-radio-group>
      <span class="i18n-page__fallback">未命中的 key 自动回退到 zh-CN</span>
    </div>

    <div class="i18n-page__grid">
      <section class="i18n-card">
        <h4>基础词条 / 插值 / 复数</h4>
        <div class="i18n-card__rows">
          <div class="i18n-card__row">
            <span class="i18n-card__key">common.confirm</span>
            <span class="i18n-card__val">{{ t('common.confirm') }}</span>
          </div>
          <div class="i18n-card__row">
            <span class="i18n-card__key">login.welcome（插值）</span>
            <span class="i18n-card__val">{{ t('login.welcome', { name: 'wanzp' }) }}</span>
          </div>
          <div class="i18n-card__row">
            <span class="i18n-card__key">doc.unread（复数 |n|）</span>
            <span class="i18n-card__val">{{ t('doc.unread', 0) }} / {{ t('doc.unread', 1) }} / {{ t('doc.unread', 5) }}</span>
          </div>
        </div>
      </section>

      <section class="i18n-card">
        <h4>当前语言包结构（zh-CN 摘录）</h4>
        <pre class="i18n-card__code">{
  common: { confirm: '确认', cancel: '取消' },
  login: { welcome: '欢迎回来，{name}！' },
  doc: {
    unread: '没有未读文档 | 1 条未读 | {n} 条未读',
  },
}</pre>
        <p class="i18n-card__tip">
          惰性加载写法：createI18n 时不放全量 messages，
          切语言时 `import(\`./locales/${locale}.json\`)` 后 setLocaleMessage。
        </p>
      </section>

      <section class="i18n-card i18n-card--wide">
        <h4>落地结论</h4>
        <ul class="i18n-card__list">
          <li>页面级组件用 useI18n()（需要 app.use(i18n)）；工具函数里用 i18n.global.t</li>
          <li>key 命名 = 业务域.功能.语义（如 form.rule.required），禁止中文拼音与截断词</li>
          <li>日期/数字格式化走 Intl.DateTimeFormat，与 vue-i18n 的 datetime/numberFormats 配合</li>
          <li>后端下发的错误文案不在 i18n 体系里时，约定 error code → 前端词表映射</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { createI18n } from 'vue-i18n';

defineOptions({ name: 'I18nDemo' });

/**
 * 演示页内创建独立 i18n 实例（useI18n 依赖 app 级安装，页内用 i18n.global 即可）。
 * 全局接入时在 main.ts：app.use(createI18n({ legacy: false, locale: 'zh-CN', messages: {...} }))
 */
const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': {
      common: { confirm: '确认', cancel: '取消' },
      login: { welcome: '欢迎回来，{name}！' },
      doc: { unread: '没有未读文档 | 1 条未读 | {n} 条未读' },
    },
    'en-US': {
      common: { confirm: 'Confirm', cancel: 'Cancel' },
      login: { welcome: 'Welcome back, {name}!' },
      doc: { unread: 'No unread docs | 1 unread doc | {n} unread docs' },
    },
    'ja-JP': {
      common: { confirm: '確認する', cancel: 'キャンセル' },
      login: { welcome: 'おかえりなさい、{name}！' },
      // ja 故意缺 doc.unread，演示 fallback
    },
  },
});

const t = i18n.global.t;
const locale = computed({
  get: () => i18n.global.locale.value,
  set: (value) => {
    i18n.global.locale.value = value;
  },
});
</script>

<style lang="less" scoped>
.i18n-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;

  &__title {
    margin: 0 0 6px;
    color: var(--ai-text);
    font-size: 18px;
  }

  &__desc {
    margin: 0;
    color: var(--ai-text-dim);
    font-size: 13px;
    line-height: 1.6;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__fallback {
    color: var(--ai-text-mute);
    font-size: 11.5px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 12px;
  }
}

.i18n-card {
  padding: 16px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface-raised);

  &--wide {
    grid-column: 1 / -1;
  }

  h4 {
    margin: 0 0 12px;
    color: var(--ai-text);
    font-size: 13.5px;
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 8px 10px;
    border: 1px solid var(--ai-hairline);
    border-radius: 8px;
    background: var(--ai-surface);
  }

  &__key {
    flex-shrink: 0;
    width: 190px;
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
  }

  &__val {
    color: var(--ai-text);
    font-size: 13px;
  }

  &__code {
    margin: 0 0 10px;
    padding: 12px;
    border-radius: var(--ai-radius-sm);
    background: var(--ai-surface);
    border: 1px solid var(--ai-hairline);
    color: var(--ai-text-dim);
    font-family: var(--ai-font-mono);
    font-size: 11px;
    line-height: 1.7;
    overflow: auto;
  }

  &__tip {
    margin: 0;
    color: var(--ai-text-mute);
    font-size: 11px;
    line-height: 1.7;
  }

  &__list {
    margin: 0;
    padding-left: 18px;
    color: var(--ai-text-dim);
    font-size: 12.5px;
    line-height: 1.9;
  }
}
</style>
