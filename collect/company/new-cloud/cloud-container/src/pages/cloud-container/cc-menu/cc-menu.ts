import { TDeepReadonly } from '@/core/types';
import { Subject, takeUntil } from 'rxjs';
import { defineComponent, onUnmounted, provide, reactive } from 'vue';
import { CC_MENU_EId, CC_MENU_IMenuItem, CC_MENU_INJECTION } from './cc-menu.api';
import { MenuService } from './cc-menu.service';

import MenuChildrenComponent from './cc-menu-children/cc-menu-children.vue';
import sFrame from '../services/cc-frame.service';
import { IconDown } from '@arco-iconbox/vue-te';
export default defineComponent({
  name: 'MenuComponent',
  components: {
    'cc-menu-children': MenuChildrenComponent,
    IconDown,
  },
  setup() {
    //#region 生命周期
    const _destroy$ = new Subject<void>();

    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
    });
    //#endregion

    //#region 菜单组件私有服务
    const service = new MenuService();
    const oMenu = reactive({
      tree: [] as TDeepReadonly<Array<CC_MENU_IMenuItem>>,
      expands: [] as Array<string>,
      mapIcon: (id: string) => {
        let icon = '';
        switch (id) {
          case CC_MENU_EId.能耗分析2x:
          case CC_MENU_EId.能耗分析3x:
            icon = 'icon-toc-nenghaofenxi';
            break;
          case CC_MENU_EId.节能考核:
            icon = 'icon-toc-jienengkaohe';
            break;
          case CC_MENU_EId.能源事件2x:
          case CC_MENU_EId.能源事件2x:
            icon = 'icon-toc-nengyuanshijian';
            break;
          case CC_MENU_EId.能源助手2x:
          case CC_MENU_EId.能源助手3x:
            icon = 'icon-toc-gongzuojilu';
            break;
          case CC_MENU_EId.告警管理2x:
          case CC_MENU_EId.告警管理3x:
            icon = 'icon-toc-gaojing';
            break;
          case CC_MENU_EId.经营分析:
            icon = 'icon-toc-jingyingfenxi';
            break;
          case CC_MENU_EId.能耗预核算偏差:
            icon = 'icon-toc-nenghaoyuhesuanpiancha';
            break;
          case CC_MENU_EId.成本预核算偏差:
            icon = 'icon-toc-chengbenyuhesuanpiancha';
            break;
          case CC_MENU_EId.能耗管控:
            icon = 'icon-toc-nenghaoguankong';
            break;
          case CC_MENU_EId.能耗预算:
            icon = 'icon-toc-nenghaoyusuan';
            break;
          case CC_MENU_EId.文件管理:
            icon = 'icon-toc-wenjianguanli';
            break;
          case CC_MENU_EId.工单分析:
            icon = 'icon-toc-gongdanfenxi-morenzhuangtai';
            break;
          case CC_MENU_EId.项目信息:
            icon = 'icon-toc-xiangmuxinxi';
            break;
          default:
            icon = 'icon-toc-xiangmuxinxi';
            break;
        }
        return icon;
      },
      mapExpand: function (menu: CC_MENU_IMenuItem): boolean {
        return menu.id === this.expands[menu.deep];
      },
      toggleExpand: function (menu: CC_MENU_IMenuItem): void {
        this.expands.splice(menu.deep + 1);
        if (this.mapExpand(menu)) {
          this.expands.pop();
        } else {
          this.expands[menu.deep] = menu.id;
        }
      },
    });

    function initMenu(tree: TDeepReadonly<Array<CC_MENU_IMenuItem>>): void {
      oMenu.tree = tree;

      const target = window.location.pathname.match(/[^\/]+(?!.*\/)/)?.[0];
      if (!target) {
        return;
      }

      const checkTarget = (list: Array<CC_MENU_IMenuItem>): void => {
        list.some((item) => {
          if (item.tag === target) {
            sFrame.loadFrame(item.path, item.flag);
            return true;
          }
          if (service.checkByTag(item, target)) {
            oMenu.toggleExpand(item);
            checkTarget(item.children);
          }
        });
      };
      checkTarget(tree as Array<CC_MENU_IMenuItem>);
    }

    service.refMenu$.pipe(takeUntil(_destroy$)).subscribe((v) => initMenu(v));
    //#endregion

    //#region 框架服务
    const oFrame = reactive({
      tag: '',
      mapClassOfSelect: function (menu: CC_MENU_IMenuItem): 'selected' | 'active' | undefined {
        if (menu.tag === this.tag) {
          document.title = menu.name;
          return 'selected';
        }

        if (service.checkByTag(menu, this.tag)) {
          return 'active';
        }
      },
      loadFrame: (menu: CC_MENU_IMenuItem): Promise<void> => sFrame.loadFrame(menu.path, menu.flag),
    });

    sFrame.refTag$.pipe(takeUntil(_destroy$)).subscribe((v) => (oFrame.tag = v));
    //#endregion

    //#region 依赖注入-提供
    provide(CC_MENU_INJECTION.EXPANDS, oMenu.expands);
    provide(CC_MENU_INJECTION.FRAME, oFrame);
    //#endregion

    return { oMenu, oFrame };
  },
});
