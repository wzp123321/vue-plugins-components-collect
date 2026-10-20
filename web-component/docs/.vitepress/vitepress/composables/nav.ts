import { computed } from 'vue'
import { useData } from 'vitepress'
import { ensureLang } from '../../utils/lang'
import { useLang, isMobile } from './lang'

export const useNav = () => {
  const { theme } = useData()
  const lang = useLang()

  return computed(() => {
    return theme.value.nav[lang.value].map((item) => ({
      ...item,
      link: `/ts-package-document/${lang.value}${isMobile() ? '/mobile' : ''}${item.link}`,
    }))
  })
}
