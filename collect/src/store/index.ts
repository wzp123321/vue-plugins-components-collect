import { defineStore } from 'pinia'

const useCounterStore = defineStore('counter', {
  // 数据源
  state: () => ({
    count: 0,
  }),
  // getters 类似于 computed，可对 state 的值进行二次计算
  getters: {
    // getter 中的 this 指向👉 state
    double(): number {
      return this.count * 2
    },
  },
  actions: {
    increment() {
      this.count += 1
    },
  },
})

export default useCounterStore
