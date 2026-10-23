<template>
  <div class="common-layout">
    <el-container>
      <te-header class="header"></el-header>
      <te-container class="inner-container">
          <te-sidenav
          sideNavLogo=""
          sideNavName="医疗设备管理"
          :menuList="menuArray" 
          :iconList="[IconMission, IconEquipment, IconTask, IconStandard, IconEquipment]"
          defaultActive="test"
          @collapse="(val) => (collapse = val)">
          </te-sidenav>
        <te-main class="main">
          <div>内容区域</div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
  import { TeSidenav } from '@ts-web-package/components/lib/te-sidenav';
  import { reactive, ref } from 'vue';
  import { ElContainer, ElHeader, ElMain } from 'element-plus';
  import '@ts-web-package/components/styles/index.scss'
  import { IconMission, IconTask, IconEquipment, IconStandard } from "@arco-iconbox/vue-te-side";
  
  export default {
    name:'te-layouts-aside-demo',
    components: {
      TeSidenav,
      ElContainer,
      ElHeader,
      ElMain,
    },
    setup() {
      let collapse = ref(false)

      const menuArray = reactive(
        [
    {
      path: '/modules/home-page',
      name: 'homePage',
      parentName: '',
      meta: {
        hidden: false,
        icon: 'mission',
        title: '首页'
      },
      children: null
    },
    {
      path: '',
      name: 'taskManage',
      parentName: '',
      meta: {
        hidden: false,
        icon: 'task',
        title: '任务管理'
      },
      children: [
        {
          path: '/modules/task-manage/list',
          name: 'taskManageList',
          parentName: 'taskManage',
          component: null,
          meta: {
            hidden: false,
            title: '任务列表'
          },
          children: [
            {
              path: '/modules/task-manage/list111',
              name: 'taskManageList111',
              parentName: 'taskManageList',
              component: null,
              meta: {
                hidden: false,
                title: '任务列表111'
              }
          }
          ]
        }
      ]
    },
    {
      path: '',
      name: 'mapManage',
      parentName: '',
      meta: {
        hidden: false,
        icon: 'run_analysis',
        title: '地图管理'
      },
      children: [
        {
          path: '/modules/map-manage/list',
          name: 'mapManageList',
          parentName: 'mapManage',
          component: null,
          meta: {
            hidden: false,
            title: '地图列表',
            requiresAuth: true
          },
          children: null
        }
      ]
    },
    {
      path: '',
      name: 'equipmentManage',
      parentName: '',
      meta: {
        hidden: false,
        icon: 'equipment',
        title: '设备管理'
      },
      children: [
        {
          path: '/modules/equipment-manage/list',
          name: 'equipmentManageList',
          parentName: 'equipmentManage',
          meta: {
            hidden: false,
            title: '设备列表',
            requiresAuth: true
          },
          children: null
        },
        {
          path: '/modules/equipment-manage/model',
          name: 'equipmentManageModel',
          parentName: 'equipmentManage',
          component: null,
          meta: {
            hidden: false,
            title: '设备模型'
          },
          children: null
        },
        {
          path: '/modules/equipment-manage/action',
          name: 'equipmentManageAction',
          parentName: 'equipmentManage',
          meta: {
            hidden: false,
            title: '动作定义'
          },
          children: null
        },
        {
          path: '/modules/equipment-manage/action-set',
          name: 'equipmentManageActionSet',
          parentName: 'equipmentManage',
          component: null,
          meta: {
            hidden: false,
            title: '动作集定义'
          },
          children: null
        }
      ]
    },
    {
      path: '',
      name: 'dispatchConfig',
      meta: {
        hidden: false,
        icon: 'standard',
        title: '调度配置'
      },
      children: [
        {
          path: '/modules/configure-manage/system-config',
          name: 'configureManageSystem',
          parentName: 'dispatchConfig',
          meta: {
            hidden: false,
            title: '系统配置',
            requiresAuth: true
          },
          children: null
        },
        {
          path: '/modules/configure-manage/park-config',
          name: 'configureManageStop',
          parentName: 'dispatchConfig',
          meta: {
            hidden: false,
            title: '停靠配置',
            requiresAuth: true
          },
          children: null
        },
        {
          path: '/modules/configure-manage/charge-config',
          name: 'configureManageCharge',
          parentName: 'dispatchConfig',
          meta: {
            hidden: false,
            title: '充电配置',
            requiresAuth: true
          },
          children: null
        },
        {
          path: '/modules/configure-manage/dispatch-config',
          name: 'configureManageDispatch',
          parentName: 'dispatchConfig',
          meta: {
            hidden: false,
            title: '分配配置',
            requiresAuth: true
          },
          children: null
        },
        {
          path: '/modules/configure-manage/trffic-config',
          name: 'configureManageTraffic',
          parentName: 'dispatchConfig',
          meta: {
            hidden: false,
            title: '交管配置',
            requiresAuth: true
          },
          children: null
        },
        {
          path: '/modules/configure-manage/route-config',
          name: 'configureManageRoute',
          parentName: 'dispatchConfig',
          meta: {
            hidden: false,
            title: '路由配置',
            requiresAuth: true
          },
          children: null
        }
      ]
    }
  ]

      )
      return {
        collapse,
        menuArray,
        IconEquipment,
        IconMission,
        IconTask, 
        IconStandard
      }
    },
  };
</script>

<style scoped lang="scss">
.common-layout {
  height: 500px;
  display: flex;
}

.header {
  height: 56px;
  padding: 0;
}

.inner-container {
  height: calc(100% - 56px);
  position: relative;
  overflow: hidden;

//   .aside-logo {
//   width: 100%;
//   height: 64px;
//   line-height: 64px;
//   text-align: center;
//   box-sizing: border-box;
//   padding: 0 10px;

//   div {
//     width: 204px;
//     height: calc(100% - 1px);
//     border-bottom: 1px solid #d8d8d8;

//     img {
//       position: relative;
//       top: -2px;
//       left: 0;
//     }
//   }
// }
}

.main {
  // background: #e5ebf0;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: 2px 0px 8px 0px rgba(0, 0, 0, 0.15);
  padding: 22px 20px 0 20px;
  height: 100%;
  transition: width 0.5s;
  -moz-transition: width 0.5s; /* Firefox 4 */
  -webkit-transition: width 0.5s; /* Safari and Chrome */
  -o-transition: width 0.5s; /* Opera */
}
</style>
