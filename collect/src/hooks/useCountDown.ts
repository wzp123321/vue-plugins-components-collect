import { ref, onUnmounted } from 'vue'

export interface CountDownUnit {
  label: string
  value: number
}

export interface UseCountDownOptions {
  leftTime: number
  onFinish?: () => void
}

export const useCountDown = (options: UseCountDownOptions) => {
  const countDownData = ref<CountDownUnit[]>([])
  const finished = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null
  let remaining = options.leftTime

  const updateDisplay = () => {
    const seconds = Math.floor(remaining / 1000)
    const date = new Date()
    date.setHours(0, 0, seconds, 0)
    countDownData.value = [
      { label: '时', value: date.getHours() },
      { label: '分', value: date.getMinutes() },
      { label: '秒', value: date.getSeconds() },
    ]
  }

  const start = () => {
    if (timer) clearInterval(timer)
    remaining = options.leftTime
    finished.value = false
    updateDisplay()

    timer = setInterval(() => {
      remaining -= 1000
      if (remaining <= 0) {
        remaining = 0
        finished.value = true
        if (timer) clearInterval(timer)
        timer = null
        options.onFinish?.()
        updateDisplay()
        return
      }
      updateDisplay()
    }, 1000)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(() => {
    stop()
  })

  return {
    countDownData,
    finished,
    start,
    stop,
  }
}