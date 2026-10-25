import type { App, Plugin } from 'vue'
import ThreeModelViewer from './src/three-model-viewer.vue'

ThreeModelViewer.install = (app: App) => {
  app.component('ThreeModelViewer', ThreeModelViewer)
}

export default ThreeModelViewer as typeof ThreeModelViewer & Plugin
export { ThreeModelViewer }
