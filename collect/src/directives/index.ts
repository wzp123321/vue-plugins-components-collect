import type { App } from 'vue'
import registerInputFilter from './directive-filter'
import { vRepeatClick } from './directive-repeatClick'
import { vDebounce } from './directive-debounce'

export function registerDirectives(app: App) {
  app.use(registerInputFilter)
  app.directive('repeat-click', vRepeatClick)
  app.directive('debounce', vDebounce)
}