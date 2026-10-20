<template>
  <div style="height: 500px">
    <TeLayoutOne
      v-model:tags="tags"
      navTitle="智慧运营平台"
      sideNavName="天溯布局组件"
      :logo="logoUrl"
      components="menu|tagsView|topNav"
      :hospitalConfig="data.hospitalConfig"
      :userinfoConfig="data.userinfoConfig"
      :menuList="menu"
      :iconList="iconList"
      @onSelectItem="onSelectItem"
    >
    </TeLayoutOne>
  </div>
</template>

<script lang="ts" setup>
import { TeLayoutOne } from "@ts-web-package/components/lib/te-layout-one";
import logoUrl from "./tsLogo.png";
import {
  IconAlarm,
  IconOperation,
  IconSwitchButton,
  IconOfficeBuilding,
  IconYuanqu,
  IconService,
  IconWorkBench,
  IconMapLocation,
} from "@arco-iconbox/vue-te/esm";
import { reactive, markRaw, ref, Component, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const iconList: Array<Component> = [IconMapLocation];
const onSelectItem = (val: any) => {
  // router.push({
  //   name: val.name,
  // });
};

const hospitalChanged = (hospitalList: []) => {};

const rightMenuConfig = [
  {
    type: "alarm",
    icon: IconAlarm,
    count: 100,
    list: [
      {
        type: "critical",
        title: "严重告警",
        count: 80,
      },
      {
        type: "major",
        title: "重要告警",
        count: 70,
      },
    ],
  },
];

const data = reactive({
  leftConfig: [
    {
      type: "zhongshan1",
      title: "服务",
      icon: markRaw(IconService),
      checked: true,
    },
    {
      type: "zhongshan2",
      title: "工作台",
      icon: markRaw(IconWorkBench),
    },
  ],
  hospitalConfig: {
    type: "hospital",
    icon: markRaw(IconYuanqu),
    title: "院区",
    count: 100,
    list: [
      {
        title: "中山院区",
        checked: true,
      },
      {
        title: "中山院区22",
      },
    ],
  },
  userinfoConfig: {
    nickname: "超级管理员",
    avatar: "",
    organizationList: [
      {
        type: "zhongshan1",
        title: "中山医院组织1",
        icon: markRaw(IconOfficeBuilding),
        checked: true,
      },
      {
        type: "zhongshan2",
        title: "中山医院组织2",
        icon: markRaw(IconOfficeBuilding),
      },
    ],
    configList: [
      {
        type: "zhongshan",
        divided: true,
        title: "偏好设置",
        icon: markRaw(IconOperation),
      },
      {
        type: "zhongshan",
        title: "退出登录",
        icon: markRaw(IconSwitchButton),
      },
    ],
  },
});

const tags = ref([
  {
    fullPath: "/tag1",
    path: "/tag1",
    query: {},
    hash: "",
    name: "Tag1",
    params: {},
    matched: [],
    meta: {
      hidden: false,
      title: "页签1",
    },
    href: "/tag1",
  },
  {
    fullPath: "/tag2",
    path: "/tag2",
    query: {},
    hash: "",
    name: "Tag2",
    params: {},
    matched: [],
    meta: {
      hidden: false,
      title: "页签2",
    },
    href: "/tag1",
  },
]);

const menu = [
  {
    id: "922042371948576",
    path: "/modules/diagnosis-path-manage",
    name: "TagMana",
    parentName: "",
    component: "",
    meta: {
      hidden: false,
      icon: "map-location",
      title: "页签管理",
    },
    index: 1,
    children: [
      {
        id: "922042371948577",
        path: "tag1",
        name: "Tag1",
        parentName: "TagMana",
        component: "",
        meta: {
          hidden: false,
          icon: null,
          title: "页签1",
        },
        index: 2,
        children: [],
      },
      {
        id: "922042371944480",
        path: "tag2",
        name: "Tag2",
        parentName: "TagMana",
        component: "",
        meta: {
          hidden: false,
          icon: null,
          title: "页签2",
        },
        index: 3,
        children: [],
      },
    ],
  },
];

watch(
  () => tags.value,
  () => {}
);
</script>

<style>
.doc-content {
  position: static !important;
}
</style>
