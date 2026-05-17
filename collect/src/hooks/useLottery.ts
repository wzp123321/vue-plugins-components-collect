import { ref, onUnmounted } from 'vue'

export interface UseLotteryOptions<T = string> {
  prizes: T[]
  totalRounds?: number
  initialSpeed?: number
  speedIncrement?: number
  getRandomTarget: (prizes: T[]) => number
}

export function useLottery<T = string>(options: UseLotteryOptions<T>) {
  const {
    prizes,
    totalRounds = 2,
    initialSpeed = 100,
    speedIncrement = 20,
    getRandomTarget,
  } = options

  const activeIndex = ref(-1)
  const resultIndex = ref(-1)
  const running = ref(false)
  const result = ref<T | null>(null)

  let timer: ReturnType<typeof setTimeout> | null = null
  let speed = initialSpeed
  let round = 0

  function start() {
    if (running.value) return
    running.value = true
    result.value = null
    resultIndex.value = -1
    round = 0
    speed = initialSpeed

    const targetIndex = getRandomTarget(prizes as unknown as T[])
    animate(targetIndex)
  }

  function animate(targetIndex: number) {
    activeIndex.value = (activeIndex.value + 1) % (prizes as unknown as T[]).length

    if (round < totalRounds || activeIndex.value !== targetIndex) {
      if (activeIndex.value === (prizes as unknown as T[]).length - 1) {
        round++
        if (round >= totalRounds - 1) {
          speed += speedIncrement
        }
      }

      timer = setTimeout(() => animate(targetIndex), speed)
    } else {
      if (timer) clearTimeout(timer)
      running.value = false
      resultIndex.value = targetIndex
      result.value = (prizes as unknown as T[])[targetIndex]
    }
  }

  function stop() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onUnmounted(() => {
    stop()
  })

  return {
    activeIndex,
    resultIndex,
    running,
    result,
    start,
    stop,
  }
}