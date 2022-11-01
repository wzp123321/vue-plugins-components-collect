import { CD_CostDetailVO } from './list.api'
import { defineComponent, onMounted, ref } from 'vue'
import { mock } from './utils'

export default defineComponent({
  name: 'VirtualCardLoad',

  setup() {
    const dataSource = ref<CD_CostDetailVO[]>(mock(300))
    const itemSize = ref<number>(140)
    const poolBuffer = ref<number>(20) // 可视区域内展示个数
    const insertLine = ref<number>(0)
    const insertStart = ref<number>(0)

    const root = ref<HTMLElement | null>(null)
    const pool = ref<CD_CostDetailVO[]>([])
    const scrollHeight = ref(dataSource.value.length * itemSize.value)

    let containerSize = 0
    const paddingTop = ref(0)
    let isScrollBusy = false

    /**
     * 滚动时需要优化算法
     * @returns
     */
    const handleScroll = () => {
      if (!root.value) return
      if (isScrollBusy) return
      isScrollBusy = true

      requestAnimationFrame(() => {
        isScrollBusy = false
        if (!root.value) return
        const range: number[] = []
        range[0] =
          Math.floor(root.value.scrollTop / itemSize.value) * 4 -
          Math.floor(poolBuffer.value / 2)
        range[0] = Math.max(range[0], 0)
        range[1] =
          range[0] +
          Math.floor(root.value.clientHeight / itemSize.value) +
          poolBuffer.value
        range[1] = Math.min(range[1], dataSource.value.length)
        /**
         * 需要渲染的列表
         */
        pool.value = dataSource.value.slice(range[0], range[1])
        paddingTop.value = range[0] * itemSize.value

        console.log(range[0], range[1])
      })
    }
    const handleInsert = () => {
      dataSource.value.splice(
        insertStart.value,
        0,
        ...mock(insertLine.value, true)
      )
      pool.value = []

      if (!root.value) return
      const range: number[] = []
      range[0] =
        Math.floor(root.value.scrollTop / itemSize.value) -
        Math.floor(poolBuffer.value / 2)
      range[0] = Math.max(range[0], 0)
      range[1] =
        range[0] +
        Math.floor(root.value.clientHeight / itemSize.value) +
        poolBuffer.value
      range[1] = Math.min(range[1], dataSource.value.length)
      /**
       * 需要渲染的列表
       */
      pool.value = dataSource.value
        .slice(range[0], range[1])
        .map((v, i) => ({ ...v, _index: range[0] + i }))
      paddingTop.value = range[0] * itemSize.value

      console.log(range, root.value.scrollTop, root.value.clientHeight)
    }

    const reset = () => {
      insertStart.value = 0
      insertLine.value = 0
    }

    const rowClick = (row: CD_CostDetailVO, index: number) => {
      console.log(row, index)
    }

    onMounted(() => {
      try {
        if (!root.value) return
        containerSize = root.value.clientHeight
        const contentLines = Math.ceil(containerSize / itemSize.value)
        const totalLines = contentLines + poolBuffer.value
        const range = [0, totalLines]
        pool.value = dataSource.value.slice(range[0], range[0] + range[1])
        console.log(pool.value.length)
      } catch (error) {
        console.log(error)
      }
    })

    return {
      insertLine,
      insertStart,
      itemSize,
      dataSource,
      pool,
      scrollHeight,
      root,
      paddingTop,
      reset,

      handleScroll,
      handleInsert,
      rowClick,
    }
  },
})
