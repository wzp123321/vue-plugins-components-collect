import { CD_CostDetailVO } from './list.api'

export function uuid() {
  let d = Date.now()
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    d += performance.now() //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function mock(
  length = 1000,
  editing: boolean = false
): CD_CostDetailVO[] {
  return Array.from({ length }, (item, index: number) => {
    return {
      index,
      abnormalDay: (Math.random() * 100).toFixed(0),
      abnormalNumber: (Math.random() * 100).toFixed(0),
      treeId: (Math.random() * 10000000).toFixed(0),
      treeName: `treeName/${(Math.random() * 100).toFixed(0)}`,
      treePath: `Path/${(Math.random() * 100).toFixed(0)}`,
    }
  })
}

function randomId() {
  return Math.random() * 100000000
}
