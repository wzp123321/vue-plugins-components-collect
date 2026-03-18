import { defineStore } from 'pinia';

const useAccess = defineStore('access', {
  state: () => ({
    initialized: false,
  }),
  persist: {
    key: `${import.meta.env.VITE_APP_ID || 'sec-web'}-access`,
    paths: ['initialized'],
    storage: localStorage,
  },
});
export default useAccess;
