import type { ObjectDirective } from 'vue'

export const vDebounce: ObjectDirective<HTMLElement, () => void> = {
  mounted(el, binding) {
    let timer: ReturnType<typeof setTimeout> | null = null

    const handler = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value?.()
      }, 300)
    }

    el.addEventListener('click', handler)

    ;(el as any).__debounceCleanup = () => {
      if (timer) clearTimeout(timer)
      timer = null
      el.removeEventListener('click', handler)
    }
  },
  unmounted(el) {
    ;(el as any).__debounceCleanup?.()
  },
}