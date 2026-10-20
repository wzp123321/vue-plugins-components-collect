<template>
  <te-container class="layout-one-container">
    <te-header
      class="layout-one-header"
      key="topNav"
      v-if="includesComs.includes('topNav')"
    >
      <TeGlobalnav :="($attrs as unknown as navProps)">
        <template v-for="(_, key, index) in $slots" :key="index" v-slot:[key]>
          <slot :name="key"></slot>
        </template>
      </TeGlobalnav>
    </te-header>
    <te-container
      class="layout-one-bottom-container"
      :class="{ resetHeight: includesComs.includes('topNav') }"
    >
      <te-sidenav
        class="layout-one-bottom-container-aside"
        :="($attrs as any)"
        v-if="includesComs.includes('menu')"
      >
        <template #head>
          <slot name="head"></slot>
        </template>
      </te-sidenav>
      <te-container>
        <te-header
          key="tagsView"
          class="layout-one-header"
          v-if="includesComs.includes('tagsView')"
        >
          <TeTagsView
            :="($attrs as any)"
            :activeName="route?.meta?.key ?? route?.name"
            @refresh="refresh"
            @tag-change="tagChange"
          >
          </TeTagsView>
        </te-header>
        <te-main class="layout-one-main">
          <template v-if="isShowContent">
            <layoutContent
              :="($attrs as LayoutContentProps)"
              ref="layoutContentRef"
            >
              <slot></slot>
            </layoutContent>
          </template>
        </te-main>
      </te-container>
    </te-container>
  </te-container>
</template>
<script lang="ts">
import { defineComponent, computed, provide, ref } from 'vue';
import {
  TeContainer,
  TeAside,
  TeHeader,
  TeMain,
  TeScrollbar,
} from '@tiansu/element-plus';
import { TeGlobalnav } from '../../te-globalnav';
import { TeTagsView } from '../../te-tags-view';
import { TeSidenav } from '../../te-sidenav';
import { navProps } from '../../te-globalnav/src/constants';
import layoutContent from './content.vue';
import type { LayoutContentProps } from './types';
import { useTagsView } from './hooks/useTagsView';
import { useRoute } from 'vue-router';
import { DELAYER_KEY } from '../../constant';

export default defineComponent({
  name: 'TeLayoutOne',
  props: {
    components: {
      type: String,
      default: 'menu|tagsView|topNav',
    },
    isShowContent: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    TeContainer,
    TeAside,
    TeHeader,
    TeMain,
    TeGlobalnav,
    TeTagsView,
    TeSidenav,
    layoutContent,
    TeScrollbar,
  },
  setup(props) {
    provide(DELAYER_KEY, ref(null));
    const layoutContentRef = ref<InstanceType<typeof layoutContent>>();
    const { refresh, tagChange } = useTagsView(layoutContentRef);
    const route = useRoute();
    const includesComs = computed(() => props.components.split('|'));
    return {
      refresh,
      tagChange,
      route,
      includesComs,
      layoutContentRef,
    };
  },
});
</script>

<style lang="scss" scoped>
.layout-one {
  &-container {
    width: 100%;
    height: 100%;
  }

  &-bottom-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    &.resetHeight {
      height: 0;
    }
    &-aside {
      float: left;
      z-index: 99;
    }
  }

  &-header {
    padding: 0;
    margin: 0;
    height: auto;
  }

  &-aside {
    width: auto;
    height: 100%;
  }

  &-main {
    background: var(--te-bg-color-page);
    // overflow: hidden;
  }

  &-wrap {
    background: var(--te-bg-color);
    box-sizing: border-box;
  }
}
</style>
