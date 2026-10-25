<template>
  <div ref="container" class="iot-canvas"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { createIotScene, type IotSceneHandle } from './useIotScene'
import { startBus, stopBus, type Scenario } from '../dataBus'

const props = withDefaults(defineProps<{ autoRotate?: boolean }>(), { autoRotate: true })

const container = ref<HTMLDivElement>()
let handle: IotSceneHandle | null = null

onMounted(() => {
  if (!container.value) return
  handle = createIotScene(container.value)
  handle.setAutoRotate(props.autoRotate)
  startBus()
})

onBeforeUnmount(() => {
  stopBus()
  handle?.dispose()
  handle = null
})

defineExpose({
  setScenario: (s: Scenario) => handle?.setScenario(s),
  resetView: () => handle?.resetView(),
  setAutoRotate: (on: boolean) => handle?.setAutoRotate(on),
})
</script>

<style scoped>
.iot-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0b1020;
}
</style>
