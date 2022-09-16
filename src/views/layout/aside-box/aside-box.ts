import { defineComponent, computed, ref, PropType, watch } from 'vue'
// components
import AsideMenuItem from '../aside-menu-item/aside-menu-item.vue'
import { Menu } from 'ant-design-vue'

import { menuList } from './constant'

export default defineComponent({
  name: 'Aside',
  props: {
    selectedMenu: {
      type: Array as PropType<string[]>,
      defualt: [],
    },
  },
  components: {
    'a-menu': Menu,
    AsideMenuItem,
  },
  setup(props) {
    const isCollapse = ref(false) // 菜单是否收起
    // 当前选中的菜单
    const selectedMenu = ref(props.selectedMenu)
    // 鼠标进入菜单状态 0-未进入  1-进入菜单  2-进入子菜单
    const menuStatus = ref(0)
    // 展开的二级菜单
    const openSubMenuKeys = ref<string[]>([])

    // 是否在悬浮
    const isHover = ref<boolean>(false)

    // 是否展开
    const onCollapseChange = () => {
      isCollapse.value = !isCollapse.value
      if (isCollapse.value) {
        ;(document.querySelector('.menu-list') as HTMLElement).style.width =
          '50px'
      } else {
        ;(document.querySelector('.menu-list') as HTMLElement).style.width =
          '208px'
      }
    }
    /**
     * 判断是否处于收起状态 ---- 鼠标进入
     * 当非收起状态或者收起时未悬浮菜单内容时 悬浮不展开
     */
    const onMouseOver = (e: MouseEvent) => {
      if (
        !isCollapse.value ||
        (e.target as any).className ===
          'ant-menu ant-menu-root ant-menu-vertical ant-menu-light' ||
        (e.target as any).className === 'collapse-btn operate-btn' ||
        (e.target as any).className === 'collapse-btn-img'
      ) {
        return
      }
      menuStatus.value = 1
      isHover.value = true
      if (
        (document.querySelector('.menu-list') as HTMLElement).style.width &&
        (document.querySelector('.menu-list') as HTMLElement).style.width ===
          '50px'
      ) {
        ;(document.querySelector('.menu-list') as HTMLElement).style.width =
          '208px'
      }
    }
    /**
     * 展开二级菜单事件
     * @param keys
     */
    const onSubMenuOpen = (keys: string[]) => {
      if (!isCollapse.value) {
        return
      }
      openSubMenuKeys.value = keys
      // 如果展开二级菜单
      if (keys?.length) {
        console.log(keys, menuStatus.value)
        ;(document.querySelector('.menu-list') as HTMLElement).style.width =
          '208px'
      } else {
        setTimeout(() => {
          console.warn(
            '移除------------',
            openSubMenuKeys.value,
            menuStatus.value
          )
          if (openSubMenuKeys.value.length === 0 && menuStatus.value === 0) {
            ;(document.querySelector('.menu-list') as HTMLElement).style.width =
              '50px'
          }
        }, 120)
      }
    }
    // 鼠标移出
    const onMouseOut = () => {
      if (!isCollapse.value) {
        return
      }
      menuStatus.value = 0
      setTimeout(() => {
        isHover.value = false
        console.warn(
          '移除------------',
          openSubMenuKeys.value,
          menuStatus.value
        )
        if (openSubMenuKeys.value.length === 0 && menuStatus.value === 0) {
          ;(document.querySelector('.menu-list') as HTMLElement).style.width =
            '50px'
        }
      }, 120)
    }

    watch(
      () => props.selectedMenu,
      () => {
        selectedMenu.value = props.selectedMenu
      },
      {
        immediate: true,
      }
    )

    return {
      selectedMenu,
      menuList,
      openSubMenuKeys,
      isCollapse,
      isHover,

      onMouseOver,
      onMouseOut,
      onCollapseChange,
      onSubMenuOpen,
    }
  },
})
