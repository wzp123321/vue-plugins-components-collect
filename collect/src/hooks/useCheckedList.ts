import { ref } from 'vue'

export function useCheckedList<T = Record<string, any>>() {
  const checkedList = ref<T[]>([])
  const filterText = ref<string>('')

  const initCheckedList = (list: T[]) => {
    checkedList.value = [...list]
  }

  const removeCheckedItem = (index: number) => {
    checkedList.value.splice(index, 1)
  }

  const addCheckedItem = (item: T) => {
    const exists = checkedList.value.some(
      (existing) => JSON.stringify(existing) === JSON.stringify(item),
    )
    if (!exists) {
      checkedList.value.push(item)
    }
  }

  const clearChecked = () => {
    checkedList.value = []
  }

  return {
    checkedList,
    filterText,
    initCheckedList,
    removeCheckedItem,
    addCheckedItem,
    clearChecked,
  }
}