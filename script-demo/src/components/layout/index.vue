<template>
  <te-layout-one
    ref="layoutOneRef"
    v-model:tags="tagsView"
    :navTitle="data.platformName"
    :sideNavName="getEnvValue('VITE_APP_TITLE')"
    :sideNavLogo="logoUrl"
    :menuList="menuList"
    :logo="data.tenantLogo"
    :iconList="iconList"
    :defaultActive="defaultActive"
    :userinfoConfig="data.userinfoConfig"
    @onSelectItem="selectMenu($event)"
    @menuChanged="menuChanged"
    :keep-alives="['RoomStatusGraph']"
    :immediateShowContent="false"
    :isShowContent="isShowContent"
    @tag-change="selectMenu($event)"
  >
    <template #globalnav-project-custom>
      <te-project-select
        v-model="commonStore.selectRegion"
        appInstanceId="elderlyCare"
        :axiosInstance="request"
        :tenantId="userStore.tenantInfo.tenantId"
        :need-all-projects="false"
        @change="handleProjectChange"
      />
    </template>
  </te-layout-one>
</template>
<script lang="ts" setup>
import useTag from '@/store/tag';
import { useCommonStore } from '@/store/common';
import { request } from '@/utils/request';
import { storeToRefs } from 'pinia';
import { TeLayoutOne } from '@tiansu/ts-web-package';
import useAside from './hooks/useAside';
import useHeader from './hooks/useHeader';
import logoUrl from '@/assets/img/logo.png';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import { getEnvValue, traverseTree } from '@/utils/common';
import { TeProjectSelect } from '@tiansu/hlms-portal-web-package';
import { useUserStore } from '@/store/user';

defineOptions({
  name: 'Layout',
});

const userStore = useUserStore();
const commonStore = useCommonStore();
const router = useRouter();
const route = useRoute();
const tagStore = useTag();
const layoutOneRef = ref<InstanceType<typeof TeLayoutOne>>();

const { tagsView } = storeToRefs(tagStore);
const defaultActive = computed(() => route.meta.key ?? route.name);
const { menuList, iconList, initLayoutData, selectMenu, getButtonAuthority } =
  useAside(router);
const { data, isShowContent, menuChanged, handleProjectChange, getUser } =
  useHeader(layoutOneRef);
// 过滤没有权限的菜单，并从tag的缓存中删除
const filterNoAuth = () => {
  const hasAuthMenuNames = traverseTree(menuList.value);
  tagsView.value = tagsView.value.filter((item) =>
    hasAuthMenuNames.includes(item.name as string),
  );
};

onBeforeRouteUpdate((to) => {
  if (to.name) {
    getButtonAuthority({
      menuCode: to.meta.key || to.name.toString(),
    });
  }
});
onMounted(async () => {
  initLayoutData();
  filterNoAuth();
  getUser();
  if (route.name) {
    getButtonAuthority({
      menuCode: route.meta.key || route.name.toString(),
    });
  }
});
</script>

<style lang="scss" scoped>
.main-layout {
  width: 100%;
  height: 100%;

  &-top {
    padding: 0;
    height: 56px;
  }

  &-container {
    width: inherit;
    height: calc(100% - 56px);

    &-aside {
      background: #fff;
      box-shadow: 2px 0px 8px 0px rgba(0, 0, 0, 0.15);
      transition: width 0.5s;
      -moz-transition: width 0.5s;
      /* Firefox 4 */
      -webkit-transition: width 0.5s;
      /* Safari and Chrome */
      -o-transition: width 0.5s;
      /* Opera */
      overflow-x: hidden;
    }

    &-main {
      background: #f2f3f5;
      overflow: hidden;
      box-sizing: border-box;
      box-shadow: 2px 0px 8px 0px rgba(0, 0, 0, 0.15);
      transition: width 0.5s;
      padding: 0;
      -moz-transition: width 0.5s;
      /* Firefox 4 */
      -webkit-transition: width 0.5s;
      /* Safari and Chrome */
      -o-transition: width 0.5s;
      /* Opera */
    }
  }

  .spread {
    width: 224px;
  }

  .fold {
    width: 50px;
  }
}
</style>
