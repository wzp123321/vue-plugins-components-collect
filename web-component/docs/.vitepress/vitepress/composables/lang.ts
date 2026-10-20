import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { defaultLang } from '../constant'

export const useLang = () => {
  const route = useRoute()
  return computed(() => {
    // the first part of the first slash
    const path = route.data?.relativePath
    let lang: string

    if (path?.includes('/')) {
      lang = path.split('/').shift()! || defaultLang
    } else {
      lang = defaultLang
    }
    return lang
  })
}

export const isMobile = () => {
  if (typeof window !== 'undefined') {
    // const route = useRoute()
    // const path = route.data?.relativePath
    return location.pathname.includes('mobile')
  } 
  return false

  // if (typeof useRoute === "function") {
  //   const route = useRoute()
  //   return computed(() => {
  //   // the first part of the first slash
  //   const path = route.data?.relativePath
  //   return path?.includes('mobile')
  //   })
  // }
  // return false
}
