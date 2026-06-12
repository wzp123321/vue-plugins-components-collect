<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vitepress'
// @ts-ignore
import hljs from 'highlight.js/lib/core'
// @ts-ignore
import vue from 'highlight.js/lib/languages/xml'
// @ts-ignore
import typescript from 'highlight.js/lib/languages/typescript'
// @ts-ignore
import css from 'highlight.js/lib/languages/css'
// @ts-ignore
import javascript from 'highlight.js/lib/languages/javascript'
// @ts-ignore
import json from 'highlight.js/lib/languages/json'
// @ts-ignore
import bash from 'highlight.js/lib/languages/bash'
// @ts-ignore
import less from 'highlight.js/lib/languages/less'
// @ts-ignore
import scss from 'highlight.js/lib/languages/scss'

hljs.registerLanguage('vue', vue as any)
hljs.registerLanguage('xml', vue as any)
hljs.registerLanguage('html', vue as any)
hljs.registerLanguage('typescript', typescript as any)
hljs.registerLanguage('ts', typescript as any)
hljs.registerLanguage('javascript', javascript as any)
hljs.registerLanguage('js', javascript as any)
hljs.registerLanguage('css', css as any)
hljs.registerLanguage('json', json as any)
hljs.registerLanguage('bash', bash as any)
hljs.registerLanguage('sh', bash as any)
hljs.registerLanguage('less', less as any)
hljs.registerLanguage('scss', scss as any)

type Platform = 'uniapp' | 'uniapp-x'

const route = useRoute()

const normalizedRoutePath = computed(() => {
  const rawPath = route.path || (typeof window !== 'undefined' ? window.location.pathname : '')
  return rawPath.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '')
})

const uniappModules = (import.meta as any).glob('../../../../playground/uniapp-project/src/pages/**/index.vue', {
  query: '?raw',
  import: 'default'
})

const uniappXModules = (import.meta as any).glob('../../../../playground/uniapp-x-project/pages/**/index.uvue', {
  query: '?raw',
  import: 'default'
})

const pageInfo = computed(() => {
  const match = normalizedRoutePath.value.match(/^\/components\/(uniapp|uniapp-x)\/(tsm-[^/]+)$/)
  if (!match) return null

  return {
    platform: match[1] as Platform,
    componentName: match[2]
  }
})

const sourceCode = ref('')
const loading = ref(false)
const expanded = ref(false)
const MAX_LINES = 150

const totalLines = computed(() => sourceCode.value ? sourceCode.value.split('\n').length : 0)

const isTruncated = computed(() => totalLines.value > MAX_LINES)

const displayCode = computed(() => {
  if (!sourceCode.value) return ''
  if (!isTruncated.value || expanded.value) return sourceCode.value
  return sourceCode.value.split('\n').slice(0, MAX_LINES).join('\n')
})

const displayHighlighted = computed(() => highlightCode(displayCode.value, language.value))

const codeMaxHeight = computed(() => isTruncated.value && !expanded.value ? 'calc(150 * 1.6em + 2em)' : 'none')
const gradientOpacity = computed(() => isTruncated.value && !expanded.value ? '1' : '0')

const platformConfig: Record<Platform, { filePath: (name: string) => string; language: string }> = {
  uniapp: {
    filePath: name => `../../../../playground/uniapp-project/src/pages/${name}/index.vue`,
    language: 'vue'
  },
  'uniapp-x': {
    filePath: name => `../../../../playground/uniapp-x-project/pages/${name}/index.uvue`,
    language: 'xml'
  }
}

const language = computed(() => (pageInfo.value ? platformConfig[pageInfo.value.platform].language : 'vue'))

function highlightCode(code: string, lang: string) {
  try {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  } catch {
    return code
  }
}

async function loadSource() {
  if (!pageInfo.value) {
    sourceCode.value = ''
    return
  }

  const platform = pageInfo.value.platform
  const key = platformConfig[platform].filePath(pageInfo.value.componentName)
  const loader = platform === 'uniapp' ? uniappModules[key] : uniappXModules[key]

  if (!loader) {
    sourceCode.value = '未找到对应示例源码'
    return
  }

  loading.value = true
  try {
    sourceCode.value = String(await loader())
    expanded.value = false
  } finally {
    loading.value = false
  }
}

const hotContext = (import.meta as any).hot

if (hotContext) {
  const hmrDeps = [...Object.keys(uniappModules), ...Object.keys(uniappXModules)]
  hotContext.accept(hmrDeps, async () => {
    await loadSource()
  })
}

watch(
  () => [route.path, pageInfo.value?.platform, pageInfo.value?.componentName],
  () => {
    loadSource()
  },
  { immediate: true }
)

onMounted(() => {
})
</script>

<template>
  <div class="language-vue vp-adaptive-theme docs-example-source">
    <span class="lang">{{ language }}</span>
      <pre class="hljs shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code v-html="loading ? '源码加载中...' : displayHighlighted"></code></pre>
      <button v-if="isTruncated && !loading" class="code-expand-btn" @click="expanded = !expanded">
        {{ expanded ? `收起 ${totalLines - MAX_LINES} 行` : `展开全部 ${totalLines} 行` }}
      </button>
  </div>
</template>

<style scoped>
.docs-example-source :deep(pre) {
  margin: 16px 0;
  overflow-x: auto;
}

.docs-example-source :deep(code) {
  white-space: pre;
  font-family: var(--vp-code-font-family);
  line-height: 1.6;
}

/* highlight.js styles */
.docs-example-source :deep(.hljs-keyword) {
  color: #8b5cf6;
}

.docs-example-source :deep(.hljs-string) {
  color: #10b981;
}

.docs-example-source :deep(.hljs-number) {
  color: #f59e0b;
}

.docs-example-source :deep(.hljs-comment) {
  color: #6b7280;
  font-style: italic;
}

.docs-example-source :deep(.hljs-tag) {
  color: #8b5cf6;
}

.docs-example-source :deep(.hljs-name) {
  color: #8b5cf6;
}

.docs-example-source :deep(.hljs-attr) {
  color: #f59e0b;
}

.docs-example-source :deep(.hljs-title) {
  color: #3b82f6;
}

.docs-example-source :deep(.hljs-built_in) {
  color: #3b82f6;
}

.docs-example-source :deep(.hljs-type) {
  color: #ec4899;
}

.docs-example-source :deep(.hljs-params) {
  color: #f59e0b;
}

.docs-example-source :deep(.hljs-selector-class) {
  color: #ec4899;
}

.docs-example-source :deep(.hljs-selector-tag) {
  color: #8b5cf6;
}

.docs-example-source {
  position: relative;
}

.docs-example-source .vp-code {
  max-height: v-bind(codeMaxHeight);
  overflow-x: auto;
  overflow-y: hidden;
  transition: max-height 0.3s ease;
  position: relative;
}

.docs-example-source .vp-code::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, var(--vp-code-block-bg));
  pointer-events: none;
  opacity: v-bind(gradientOpacity);
  transition: opacity 0.3s ease;
}

.code-expand-btn {
  display: block;
  width: 100%;
  padding: 8px 16px 12px;
  border: none;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  transition: color 0.2s;
  margin-top: -4px;
  position: relative;
  z-index: 1;
}

.code-expand-btn:hover {
  color: var(--vp-c-brand-2);
}
</style>
