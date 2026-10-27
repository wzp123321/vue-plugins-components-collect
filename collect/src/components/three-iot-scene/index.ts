import type { App, Plugin } from 'vue'
import ThreeIotScene from './src/three-iot-scene.vue'

ThreeIotScene.install = (app: App) => {
  app.component('ThreeIotScene', ThreeIotScene)
}

export default ThreeIotScene as typeof ThreeIotScene & Plugin
export { ThreeIotScene }
