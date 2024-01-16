/*
 * @Author: yut
 * @Date: 2023-06-28 14:12:16
 * @LastEditors: yut
 * @LastEditTime: 2023-08-22 09:27:55
 * @Descripttion:
 */
import { TDeepReadonly } from '@/core/types';
import { defineComponent, inject, PropType, reactive } from 'vue';
import { CC_MENU_IMenuItem, CC_MENU_INJECTION } from '../cc-menu.api';

export default defineComponent({
  name: 'MenuChildrenComponent',
  props: {
    menu: { type: Array as PropType<TDeepReadonly<Array<CC_MENU_IMenuItem>>>, required: true },
  },
  setup() {
    //#region 依赖注入-注入
    const oInject = reactive({
      expands: inject(CC_MENU_INJECTION.EXPANDS, []),
      frame: inject(CC_MENU_INJECTION.FRAME),
    });
    //#endregion

    //#region 框架服务
    if (!oInject.frame) {
      throw 'MenuChildrenComponent 注入 CC_MENU_INJECTION.FRAME 失败';
    }
    const oFrame = reactive(oInject.frame);
    //#endregion

    return { oInject, oFrame };
  },
  methods: {
    /**
     * 获取当前菜单等级边距
     * @param deep 菜单层级深度
     * @returns 菜单等级边距
     */
    mapLevelPadding: function (deep: number): string {
      return `padding-left: ${24 + deep * 20}px`;
    },
    /**
     * 获取当前菜单展开/折叠状态
     * @param menu 菜单条目
     * @returns 菜单是否展开
     */
    mapExpand: function (menu: CC_MENU_IMenuItem): boolean {
      return menu.id === this.oInject.expands[menu.deep];
    },
    /**
     * 展开/折叠菜单
     * @param menu 菜单条目
     */
    toggleExpand: function (menu: CC_MENU_IMenuItem): void {
      this.oInject.expands.slice(menu.deep + 1);
      if (this.mapExpand(menu)) {
        this.oInject.expands.pop();
      } else {
        this.oInject.expands[menu.deep] = menu.id;
      }
    },
  },
});
