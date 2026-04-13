<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

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

const platformConfig: Record<Platform, { filePath: (name: string) => string; language: string }> = {
  uniapp: {
    filePath: name => `../../../../playground/uniapp-project/src/pages/${name}/index.vue`,
    language: 'vue'
  },
  'uniapp-x': {
    filePath: name => `../../../../playground/uniapp-x-project/pages/${name}/index.uvue`,
    language: 'uvue'
  }
}

const language = computed(() => (pageInfo.value ? platformConfig[pageInfo.value.platform].language : 'vue'))

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
</script>

<template>
  <div class="language-vue vp-adaptive-theme docs-example-source">
    <span class="lang">{{ language }}</span>
    <pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code>{{ loading ? '源码加载中...' : sourceCode }}</code></pre>
  </div>
</template>

<style scoped>
.docs-example-source :deep(pre) {
  margin: 16px 0;
}

.docs-example-source :deep(code) {
  white-space: pre;
}
</style>
