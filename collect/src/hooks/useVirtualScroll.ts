import { ref, type Ref } from 'vue'

export interface UseVirtualScrollOptions<T> {
  dataSource: Ref<T[]>
  itemSize: Ref<number>
  poolBuffer: Ref<number>
  rootRef: Ref<HTMLElement | null>
  itemsPerRow?: number
}

export function useVirtualScroll<T = any>(options: UseVirtualScrollOptions<T>) {
  const { dataSource, itemSize, poolBuffer, rootRef, itemsPerRow = 1 } = options

  const pool = ref<T[]>([])
  const paddingTop = ref(0)
  const scrollHeight = ref(dataSource.value.length * itemSize.value)

  let isScrollBusy = false

  interface RangeCalculator {
    getStartIndex: (scrollTop: number, itemSizeVal: number, bufferVal: number) => number
  }

  const calculator: RangeCalculator = {
    getStartIndex(scrollTop, itemSizeVal, bufferVal) {
      const rowIndex = Math.floor(scrollTop / itemSizeVal)
      return rowIndex * itemsPerRow - Math.floor(bufferVal / 2)
    },
  }

  interface RangeResult {
    pool: T[]
    paddingTop: number
  }

  function calcPoolRange(): RangeResult {
    if (!rootRef.value) return { pool: [], paddingTop: 0 }

    const range: number[] = []
    range[0] = calculator.getStartIndex(
      rootRef.value.scrollTop,
      itemSize.value,
      poolBuffer.value,
    )
    range[0] = Math.max(range[0], 0)
    range[1] =
      range[0] +
      Math.floor(rootRef.value.clientHeight / itemSize.value) * itemsPerRow +
      poolBuffer.value
    range[1] = Math.min(range[1], dataSource.value.length)

    return {
      pool: dataSource.value.slice(range[0], range[1]),
      paddingTop: range[0] * itemSize.value,
    }
  }

  function updatePool() {
    const result = calcPoolRange()
    pool.value = result.pool
    paddingTop.value = result.paddingTop
  }

  function handleScroll() {
    if (!rootRef.value) return
    if (isScrollBusy) return
    isScrollBusy = true

    requestAnimationFrame(() => {
      isScrollBusy = false
      updatePool()
    })
  }

  function initPool() {
    try {
      if (!rootRef.value) return
      const containerSize = rootRef.value.clientHeight
      const contentLines = Math.ceil(containerSize / itemSize.value)
      const totalLines = contentLines * itemsPerRow + poolBuffer.value
      pool.value = dataSource.value.slice(0, totalLines)
    } catch (error) {
      console.log(error)
    }
  }

  function refreshScrollHeight() {
    scrollHeight.value = dataSource.value.length * itemSize.value
  }

  return {
    pool,
    paddingTop,
    scrollHeight,
    handleScroll,
    updatePool,
    initPool,
    refreshScrollHeight,
  }
}