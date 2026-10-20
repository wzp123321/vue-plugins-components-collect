<script setup lang="ts">
import { useRouter } from 'vitepress'
import { useTranslation } from '../../composables/translation'
import { isMobile } from '~/composables/lang';
import { ref } from 'vue';
import {
  ArrowDown,
} from '@element-plus/icons-vue'

const router = useRouter()
const { switchLang, languageMap, langs, lang, locale } = useTranslation()

// const toTranslation = () => {
//   router.go(`/${lang.value}/guide/translation`)
// }

const platforms = ['移动端', 'web端']
const selectText = ref(isMobile() ? platforms[0] : platforms[1])
const switchMode = (l: string) => {
  router.go(`/ts-package-document/${lang.value}/${l === '移动端' ? 'mobile/' : ''}component/button`)
  selectText.value = isMobile() ? platforms[0] : platforms[1]
}
</script>

<template>
  <div class="translation-container">
    <ClientOnly>
      <ElDropdown popper-class="translation-popup" role="navigation">
        <span>{{ selectText }}<el-icon ><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem
              v-for="l in platforms"
              :key="l"
              :class="{ language: true, selected: l === selectText }"
              @click="switchMode(l)"
            >
              {{ l }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins' as *;
.translation-container {
  display: flex;
  height: 24px;
  padding: 0 12px;
  align-items: center;

  span {
    color: var(--text-color);
    display: flex;
    align-items: center;
  }

  @include respond-to('md') {
    
  }
}
</style>

<style lang="scss">
.el-dropdown__popper.translation-popup {
  // --el-bg-color-overlay: var(--bg-color);
  // --el-popper-border-radius: 8px;
  // --el-border-color-light: transparent;

  // padding: 7px 0;
  // min-width: 192px;
  // transition: background-color 0.5s;

  // .el-popper__arrow {
    // display: none;
  // }
  

  .language {
    padding: 0 16px;
    line-height: 28px;
    &.selected {
      --el-text-color-regular: var(--brand-color);
    }
  }
}
</style>
