import { cloneDeep } from 'lodash-es';
import { defineStore } from 'pinia';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

const useTag = defineStore('tag', {
  state: () => ({
    tagsView: [] as Array<RouteLocationNormalizedLoaded>,
  }),
  actions: {
    addTag(tag: RouteLocationNormalizedLoaded) {
      if (this.tagsView.some((i) => i.name === tag.name)) return;
      const routeTag = cloneDeep(tag);
      routeTag.matched = [];
      this.tagsView.push(routeTag);
    },
  },
  persist: {
    key: `${import.meta.env.VITE_APP_ID || 'sec-web'}-tag`,
    paths: ['tagsView'],
    storage: localStorage,
  },
});
export default useTag;
