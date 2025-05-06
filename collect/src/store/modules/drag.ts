import { defineStore } from 'pinia';

const dragStore = defineStore('drag', {
  state: () => ({
    dragFlag: false,
  }),
  getters: {
    getDragFlag(): boolean {
      return this.dragFlag;
    },
  },
  actions: {
    setDragFlag(data: boolean) {
      this.dragFlag = data;
    },
  },
});

export default dragStore;
