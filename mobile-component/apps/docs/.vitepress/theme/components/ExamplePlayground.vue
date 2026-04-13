<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

type Platform = 'uniapp' | 'uniapp-x'

declare const __UNIAPP_DEMO_URL__: string
declare const __UNIAPP_X_DEMO_URL__: string

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
    componentName: match[2],
    pagePath: `/pages/${match[2]}/index`
  }
})

const selectedPlatform = ref<Platform>('uniapp')

const platformConfig: Record<Platform, { baseUrl: string; filePath: (name: string) => string }> = {
  uniapp: {
    baseUrl: __UNIAPP_DEMO_URL__,
    filePath: name => `../../../../playground/uniapp-project/src/pages/${name}/index.vue`
  },
  'uniapp-x': {
    baseUrl: __UNIAPP_X_DEMO_URL__,
    filePath: name => `../../../../playground/uniapp-x-project/pages/${name}/index.uvue`
  }
}

const availablePlatforms = computed<Platform[]>(() => {
  if (!pageInfo.value) return []
  const name = pageInfo.value.componentName
  const platforms: Platform[] = []
  if (platformConfig.uniapp.filePath(name) in uniappModules) platforms.push('uniapp')
  if (platformConfig['uniapp-x'].filePath(name) in uniappXModules) platforms.push('uniapp-x')
  return platforms
})

const hasExample = computed(() => availablePlatforms.value.length > 0)
const preferredPlatform = computed<Platform>(() => {
  if (!pageInfo.value) return 'uniapp'
  return availablePlatforms.value.includes(pageInfo.value.platform)
    ? pageInfo.value.platform
    : (availablePlatforms.value[0] || 'uniapp')
})

const iframeUrl = computed(() => {
  if (!pageInfo.value) return ''
  const baseUrl = platformConfig[selectedPlatform.value].baseUrl.replace(/\/$/, '')
  return `${baseUrl}/#${pageInfo.value.pagePath}`
})

function switchPlatform(platform: Platform) {
  selectedPlatform.value = platform
}

watch(
  () => pageInfo.value,
  value => {
    if (!value) return
    selectedPlatform.value = preferredPlatform.value
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="pageInfo && hasExample" class="example-playground">
    <div class="phone-simulator">
      <div class="phone-frame">
        <div class="phone-status-bar">
          <span class="time">9:41</span>
          <div class="status-icons">
            <svg class="icon signal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M12 20v-4M17 20v-8M22 20V4M7 20v-2" />
            </svg>
            <svg class="icon wifi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            <svg class="icon battery" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
              <rect x="4" y="9" width="10" height="6" fill="currentColor" stroke="none" />
              <line x1="22" y1="11" x2="22" y2="13" />
            </svg>
          </div>
        </div>
        <div class="phone-content">
          <iframe :src="iframeUrl" frameborder="0"></iframe>
        </div>
        <div class="phone-home-indicator"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.example-playground {
  margin-top: 32px;
}
</style>
