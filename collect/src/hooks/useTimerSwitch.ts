import { ref, onUnmounted } from 'vue'

export interface TimerSwitchItem {
  duration: number
}

export interface UseTimerSwitchOptions<T extends TimerSwitchItem> {
  items: T[]
  onSwitch?: (item: T, index: number) => void
}

export function useTimerSwitch<T extends TimerSwitchItem>(options: UseTimerSwitchOptions<T>) {
  const currentIndex = ref(0)
  const remainingTime = ref(0)
  const paused = ref(false)

  let intervalId: ReturnType<typeof setInterval> | null = null

  function run(index: number) {
    if (intervalId) clearInterval(intervalId)

    const item = options.items[index]
    remainingTime.value = item.duration

    intervalId = setInterval(() => {
      if (paused.value) return

      remainingTime.value -= 1
      if (remainingTime.value <= 0) {
        currentIndex.value = (index + 1) % options.items.length
        options.onSwitch?.(options.items[currentIndex.value], currentIndex.value)
        run(currentIndex.value)
      }
    }, 1000)
  }

  function start(index = 0) {
    currentIndex.value = index
    run(index)
  }

  function pause() {
    paused.value = true
    if (intervalId) clearInterval(intervalId)
    intervalId = null
  }

  function resume() {
    if (!paused.value) return
    paused.value = false
    run(currentIndex.value)
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    remainingTime.value = 0
  }

  onUnmounted(() => {
    stop()
  })

  return {
    currentIndex,
    remainingTime,
    paused,
    start,
    pause,
    resume,
    stop,
  }
}