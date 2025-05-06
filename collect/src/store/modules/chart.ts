import { defineStore } from 'pinia';

const useChartStore = defineStore('chartStore', {
  state: () => ({
    selectedCardDataIndex: null as number | null,
  }),
  getters: {
    getSelectedCardDataIndex(): number | null {
      return this.selectedCardDataIndex;
    },
  },
  actions: {
    setSelectedCardDataIndex(data: number) {
      this.selectedCardDataIndex = data === this.selectedCardDataIndex ? null : data;
    },
  },
});

export default useChartStore;
