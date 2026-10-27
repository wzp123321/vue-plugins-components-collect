import type { App, Plugin } from 'vue'
import IotConfigEditor from './src/iot-config-editor.vue'

IotConfigEditor.install = (app: App) => {
  app.component('IotConfigEditor', IotConfigEditor)
}

export default IotConfigEditor as typeof IotConfigEditor & Plugin
export { IotConfigEditor }
