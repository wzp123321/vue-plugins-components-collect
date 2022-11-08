/*
 * @Description: echarts-地球
 * @Author: zpwan
 * @Date: 2022-06-06 16:26:53
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-06-06 16:47:36
 */
import { defineComponent, onUnmounted, ref, onMounted } from 'vue'
import { interval, Subject, takeUntil, timer } from 'rxjs'
import ChartMapService from './chart-map.service'

export default defineComponent({
  name: 'ChartMap',
  setup() {
    const chartMapService = new ChartMapService()
    const _destroy$ = new Subject<void>()

    const showContainer = ref<boolean>(false)
    const showMap = ref<boolean>(false)
    const elLoopVideo = ref<HTMLVideoElement>()

    function startAnimation(event: Event) {
      timer(2000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => (showContainer.value = true))
      timer(4000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => {
          showMap.value = true
          chartMapService.initCharts()
          ;(event.target as HTMLVideoElement)?.remove()
          elLoopVideo.value?.classList.remove('ghost')
          elLoopVideo.value?.play()
        })
    }

    onMounted(() => {
      interval(60 * 60_000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => {
          console.log('定时器')
        })
    })

    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next()
      _destroy$.complete()
    })

    return {
      chartMapService,
      showContainer,
      showMap,
      elLoopVideo,

      startAnimation,
    }
  },
})
