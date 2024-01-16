<!--
 * @Author: yut
 * @Date: 2023-09-05 10:53:55
 * @LastEditors: yut
 * @LastEditTime: 2023-11-16 19:33:57
 * @Descripttion: 
-->
<template>
  <div class="cc-te-menu">
    <te-sidenav
      :menuList="menuArray"
      :iconList="iconList"
      :defaultActive="defaultActive"
      @onSelectItem="onSelectItem"
      @onMouseEnterFloatMenuItem="onMouseEnterFloatMenultem"
      @onMouseLeaveFloatMenuItem="onMouseLeaveFloatMenultem"
    >
    </te-sidenav>

    <ccQuickAccessVue
      :showPopverFlag="showPopverFlag"
      @changeDefaultActive="changeDefaultActive"
      @close="closePopover"
    />
  </div>
</template>
<script lang="ts" setup>
import { onUnmounted, ref, shallowRef } from 'vue';
import { TeSidenav } from '@tiansu/ts-web-package';
import ccQuickAccessVue from '../cc-quick-access/cc-quick-access.vue';
import { Subject, takeUntil } from 'rxjs';
import cqService from '../cc-quick-access/cc-quick-access.service';
import service from './cc-te-menu.service';
import { CC_MENU_EId, CC_MENU_IMenuItem } from './cc-te-menu.api';
import sFrame from '../services/cc-frame.service';
import {
  IconCoin,
  IconHosted,
  IconHomeFilled,
  IconMenu,
  IconDataLine,
  IconMedal,
  IconAlarm,
  IconDocumentChecked,
  IconEnergy,
  IconMoney,
  IconSetting,
  IconArithmetic,
  IconSuitcase,
  IconFolderOpened,
  IconTickets,
  IconShield,
} from '@arco-iconbox/vue-te';
let collapse = ref(false);

const menuArray = ref<CC_MENU_IMenuItem[]>([]);
const defaultActive = ref('');
const iconList = shallowRef<any[]>([]);
const _destroy$ = new Subject<void>();

onUnmounted(() => {
  // 销毁订阅
  _destroy$.next();
  _destroy$.complete();
});

const onSelectItem = (item: CC_MENU_IMenuItem) => {
  defaultActive.value = item.id;
  sFrame.loadFrame(item.path, item.flag);
};

const closePopover = () => {
  showPopverFlag.value = false;
};

/**
 *更改菜单选中
 */
const changeDefaultActive = (id: string) => {
  defaultActive.value = id;
};

window.addEventListener('message', (e) => {
  if (e?.data?.type === 'toc-router') {
    sFrame.loadFrame(e?.data?.url, e?.data?.flag);
    defaultActive.value = e?.data?.id;
  }
});

const mapIcon = (id: string) => {
  let icon = null;
  switch (id) {
    case CC_MENU_EId.工作指引:
      icon = IconHomeFilled;
      break;
    case CC_MENU_EId.快捷访问:
      icon = IconMenu;
      break;
    case CC_MENU_EId.能耗分析2x:
    case CC_MENU_EId.能耗分析3x:
      icon = IconDataLine;
      break;
    case CC_MENU_EId.节能考核:
      icon = IconMedal;
      break;
    case CC_MENU_EId.能源事件2x:
    case CC_MENU_EId.能源事件3x:
      icon = IconShield;
      break;
    case CC_MENU_EId.能源助手2x:
    case CC_MENU_EId.能源助手3x:
      icon = IconHosted;
      break;
    case CC_MENU_EId.告警管理2x:
    case CC_MENU_EId.告警管理3x:
      icon = IconAlarm;
      break;
    case CC_MENU_EId.工单分析:
      icon = IconDocumentChecked;
      break;
    case CC_MENU_EId.经营分析:
      icon = IconCoin;
      break;
    case CC_MENU_EId.能耗预核算分析:
      icon = IconEnergy;
      break;
    case CC_MENU_EId.项目预核算分析:
      icon = IconMoney;
      break;
    case CC_MENU_EId.能耗管控:
      icon = IconSetting;
      break;
    case CC_MENU_EId.能耗核算表:
      icon = IconArithmetic;
      break;
    case CC_MENU_EId.文件管理:
      icon = IconFolderOpened;
      break;
    case CC_MENU_EId.项目信息:
      icon = IconTickets;
      break;
    default:
      icon = IconTickets;
      break;
  }
  return icon;
};

service.refMenu$.pipe(takeUntil(_destroy$)).subscribe((v) => initMenu(v));
sFrame.refPath$.pipe(takeUntil(_destroy$)).subscribe((v) => {
  const item: CC_MENU_IMenuItem = sFrame.filterRoleBtn(v, menuArray.value);
  sFrame.loadFrame(item.path, item.flag);
  defaultActive.value = item.id;
});

function initMenu(tree: Array<CC_MENU_IMenuItem>): void {
  iconList.value = [];
  menuArray.value = tree;
  menuArray.value.forEach((item) => {
    iconList.value.push(mapIcon(item.id));
  });
  const target = window.location.pathname.match(/[^\/]+(?!.*\/)/)?.[0];
  if (!target) {
    return;
  }
  const checkTarget = (list: Array<CC_MENU_IMenuItem>): void => {
    list.some((item) => {
      if (item.tag === target) {
        defaultActive.value = item.id;
        sFrame.loadFrame(item.path, item.flag);
        return true;
      }
      if (service.checkByTag(item, target) && item.children) {
        checkTarget(item.children);
      }
    });
  };
  checkTarget(tree as Array<CC_MENU_IMenuItem>);
}

/**
 * 是否展示快捷访问
 */
const showPopverFlag = ref(false);

/**
 * 鼠标移入菜单
 * @param obj
 */
const onMouseEnterFloatMenultem = (obj: CC_MENU_IMenuItem) => {
  cqService.getUserRecentlyAccessedMenu();
  if (obj.id === CC_MENU_EId.快捷访问) {
    showPopverFlag.value = true;
  }
};
/**
 * 鼠标离开菜单
 * @param obj
 */
const onMouseLeaveFloatMenultem = (obj: CC_MENU_IMenuItem) => {
  if (obj.id === CC_MENU_EId.快捷访问) {
    showPopverFlag.value = false;
  }
};
</script>
<style lang="less" scoped>
.cc-te-menu {
  width: 100%;
  height: 100%;
  position: relative;
  :deep(.te-aside) {
    height: 100%;
    display: flex;
    flex-direction: column;
    .aside-con {
      flex: auto;
      height: 0;
    }
    .aside-btn {
      flex: none;
    }
  }
}
.cc-popover {
  position: absolute;
  height: 48px;
  top: 48px;
  left: 0;
}
.test {
  width: 100%;
  height: 40px;
  position: absolute;
  left: 0;
  background-color: aqua;
  bottom: 100px;
}
</style>
