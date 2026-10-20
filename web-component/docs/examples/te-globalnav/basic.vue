<template>
  <te-globalnav 
    logo="" 
    navTitle="运营平台" 
    :leftMenuConfig="data.leftConfig" 
    :rightMenuConfig="rightMenuConfig" 
    :hospitalConfig="data.hospitalConfig"
    :userinfoConfig="data.userinfoConfig" 
    @menuChanged=""
    @hospitalChanged="hospitalChanged">
  </te-globalnav>
</template>

<script lang="ts" setup>
  import { TeGlobalnav, globalnavMenuItem } from '@ts-web-package/components/lib/te-globalnav';
  import {
  IconAlarm,
  IconMission,
  IconMessage,
  IconOperation,
  IconSwitchButton,
  IconOfficeBuilding,
  IconYuanqu,
  IconService,
  IconWorkBench
} from '@arco-iconbox/vue-te/esm';
import { reactive } from 'vue';
  
const hospitalChanged = (hospitalList: []) => {
  
}
  const rightMenuConfig: globalnavMenuItem[] = [{
    type: "alarm",
    icon: IconAlarm,
    count: 100,
    list: [
      {
        type: "critical",
        title: "严重告警",
        count: 80
      },
      {
        type: "major",
        title: "重要告警",
        count: 70
      }
    ]
  }
  ]

  const data = reactive({
    leftConfig: [
      {
        type: "zhongshan1",
        title: "服务",
        icon: IconService,
        checked: true
      },
      {
        type: "zhongshan2",
        title: "工作台",
        icon: IconWorkBench
      }
    ],
    hospitalConfig: {
    type: "hospital",
    icon: IconYuanqu,
    title: "院区",
    count: 100,
    chooseMode: "single",
    list: [
    {
        type: "zhongshan1",
        title: "服务",
        icon: IconService,
        checked: true
      },
      {
        type: "zhongshan2",
        title: "工作台",
        icon: IconWorkBench
      }
    ]
  },
  userinfoConfig: {
    nickname: "超级管理员",
    avatar: "",
    organizationList: [
      {
        type: "zhongshan1",
        title: "中山医院组织1",
        icon: IconOfficeBuilding,
        checked: true
      },
      {
        type: "zhongshan2",
        title: "中山医院组织2",
        icon: IconOfficeBuilding
      }
    ],
    configList: [
      {
        type: "zhongshan",
        divided: true,
        title: "偏好设置",
        icon: IconOperation,
      },
      {
        type: "zhongshan",
        title: "退出登录",
        icon: IconSwitchButton,
      }
    ]
  }
  })

</script>

<style scoped lang="scss"></style>
