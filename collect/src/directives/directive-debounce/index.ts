import type { ObjectDirective } from 'vue'

export const vDebounce: ObjectDirective<HTMLElement, () => void> = {
  mounted(el, binding) {
    let timer: ReturnType<typeof setTimeout> | null = null
    el.addEventListener('click', () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value?.()
      }, 300)
    })
  },
}