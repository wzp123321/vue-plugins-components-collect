<template>
  <div class="aside-box" :class="{ 'aside-box--collapsed': collapsed }">
    <el-menu mode="vertical" :router="false" :default-active="selectedMenu?.[0]" :collapse="collapsed">
      <template v-for="(item, index) in menuList" :key="'menu_' + index">
        <el-menu-item
          v-if="!item.children || item.children.length === 0"
          :index="item.path"
          :title="item.name"
          @click="handleMenuLinkTo(item.path)"
        >
          <template #icon v-if="item.hasIcon">
            <div class="menu-icon">
              <i :class="['ems-iconfont', item.icons]"></i>
            </div>
          </template>
          <template #title>
            <span class="menu-title-text">{{ item.meta.name }}</span>
          </template>
        </el-menu-item>
        <el-sub-menu v-else :index="item.path" :popper-options="{ offset: [2, item.hasIcon ? 8 : 0] }">
          <template #icon v-if="item.hasIcon">
            <div class="menu-icon">
              <i :class="['ems-iconfont', item.icons]"></i>
            </div>
          </template>
          <template #title>
            <span class="menu-title-text">{{ item.meta.name }}</span>
          </template>
          <el-menu-item
            v-for="(child, childIndex) in item.children"
            :key="'child_' + index + '_' + childIndex"
            :index="child.path"
            :title="child.name"
            @click="handleMenuLinkTo(child.path)"
          >
            <template #icon v-if="child.hasIcon">
              <div class="menu-icon">
                <i :class="['ems-iconfont', child.icons]"></i>
              </div>
            </template>
            <span class="menu-title-text">{{ child.meta.name }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { ElMenu } from 'element-plus';

export default defineComponent({
  name: 'Aside',
  props: {
    menuList: {
      type: Array as PropType<any[]>,
      default: [],
    },
    selectedMenu: {
      type: Array as PropType<string[]>,
      default: [],
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    'el-menu': ElMenu,
  },
  setup(props) {
    const router = useRouter();

    const handleMenuLinkTo = (path: string) => {
      router.push({ path });
    };

    return {
      menuList: props.menuList,
      selectedMenu: props.selectedMenu,
      collapsed: props.collapsed,
      handleMenuLinkTo,
    };
  },
});
</script>

<style lang="less" scoped>
.aside-box {
  width: 220px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease;

  &--collapsed {
    width: 64px;
  }
}
</style>
