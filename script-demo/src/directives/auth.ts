/**
 * @description 示例：v-auth="1001"
 * 组件中定义permissionIds常量并返回 例如 const permissionIds = ref<number|string>[]
 * 权限控制
 * permissionIds需要是响应式的
 * <script lang="ts" setup> 要使用defineExpose暴露permissionIds 同等于setup() 函数返回要使用defineExpose暴露permissionIds
 */
import { DirectiveBinding, watch } from 'vue';

interface ExDirectiveBinding extends DirectiveBinding {
  instance: DirectiveBinding['instance'] & {
    permissionIds?: Array<number | string>;
  };
}
export default {
  mounted(el: HTMLElement, binding: ExDirectiveBinding) {
    console.dir(el);
    const currentInstance = binding.instance; // 当前组件实例,
    const nextSibling = el.nextSibling; // 上一个兄弟节点
    const parentNode = el.parentNode; // 节点
    watch(
      () => currentInstance?.permissionIds,
      (newVal) => {
        try {
          if (!newVal) {
            return;
          }
          if (!newVal?.includes(binding.value)) {
            el.parentNode?.removeChild(el);
          } else if (!nextSibling && parentNode) {
            parentNode.appendChild(el);
          } else if (parentNode && nextSibling) {
            parentNode.insertBefore(el, nextSibling);
          } else if (currentInstance) {
            currentInstance.$el.appendChild(el);
          }
        } catch (error) {
          throw new Error(
            'v-auth 指令操作失败，请检查当前组件是否返回permissionIds属性！',
          );
        }
      },
      {
        immediate: true,
      },
    );
  },
};
