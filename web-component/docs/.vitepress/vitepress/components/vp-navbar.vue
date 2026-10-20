<script setup lang="ts">
import { computed } from 'vue'
import { inBrowser, useData } from 'vitepress'

import VPNavbarSearch from './navbar/vp-search.vue'
import VPNavbarMenu from './navbar/vp-menu.vue'
import VPNavbarThemeToggler from './navbar/vp-theme-toggler.vue'
import VPNavbarTranslation from './navbar/vp-translation.vue'
import VPNavbarSocialLinks from './navbar/vp-social-links.vue'
import VPNavbarHamburger from './navbar/vp-hamburger.vue'

defineProps<{
  fullScreen: boolean
}>()

defineEmits(['toggle'])

const { theme, page } = useData()

const currentLink = computed(() => {
  if (!inBrowser) {
    return `/ts-package-document/${page.value?.frontmatter?.lang || ''}/`
  }
  const existLangIndex = theme.value.langs.findIndex((lang) =>
    window?.location?.pathname.startsWith(`/${lang}`)
  )
  return existLangIndex === -1 ? '/ts-package-document/zh-CN/' : `/ts-package-document/${theme.value.langs[existLangIndex]}/`
})
</script>

<template>
  <div class="navbar-wrapper">
    <div class="header-container">
      <div class="logo-container">
        <a :href="currentLink">
          <img
            class="logo"
            src="/images/logo1.png"
            alt="Element Plus Logo"
          />
        </a>
      </div>
      <div class="vp-content">
        <!-- <VPNavbarSearch class="search" :options="theme.agolia" multilang /> -->
        <VPNavbarMenu class="menu" />
        <VPNavbarThemeToggler class="theme-toggler" />
        <VPNavbarTranslation class="translation" />
        <VPNavbarSocialLinks class="social-links" />
        <!-- <VPNavbarHamburger
          :active="fullScreen"
          class="hamburger"
          @click="$emit('toggle')"
        /> -->
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.logo-container {
  display: flex;
  align-items: center;
  height: var(--header-height);
  > a {
    height: 28px;
    width: 128px;
  }
  .logo {
    position: relative;
    height: 100%;
  }
}
</style>
