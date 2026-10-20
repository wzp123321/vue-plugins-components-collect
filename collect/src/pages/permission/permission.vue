<template>
  <div class="perm-page">
    <header class="perm-page__head">
      <h3 class="perm-page__title">权限方案：v-permission 指令 + 权限码模型</h3>
      <p class="perm-page__desc">
        前端权限只做「体验层」：隐藏无权按钮、拦截越权路由；真正的防线永远在服务端接口。
      </p>
    </header>

    <section class="perm-page__panel">
      <div class="perm-page__role-bar">
        <span class="perm-page__label">模拟角色：</span>
        <el-radio-group v-model="role" size="small">
          <el-radio-button value="admin">admin（全部权限）</el-radio-button>
          <el-radio-button value="editor">editor（读 + 编辑）</el-radio-button>
          <el-radio-button value="viewer">viewer（只读）</el-radio-button>
        </el-radio-group>
        <span class="perm-page__codes">当前权限码：{{ roleCodes.join(' / ') }}</span>
      </div>

      <div :key="role" class="perm-page__demo-grid">
        <div class="perm-demo-card">
          <h4>按钮级：v-permission 指令</h4>
          <p class="perm-demo-card__tip">无权限时元素直接从 DOM 移除</p>
          <div class="perm-demo-card__row">
            <el-button v-permission="'doc:read'" size="small">查看文档</el-button>
            <el-button v-permission="'doc:edit'" type="primary" size="small">编辑文档</el-button>
            <el-button v-permission="'doc:delete'" type="danger" size="small">删除文档</el-button>
          </div>
        </div>

        <div class="perm-demo-card">
          <h4>按钮级（保留占位）：v-permission.disable</h4>
          <p class="perm-demo-card__tip">无权限时置灰而不是消失，让用户知道功能存在</p>
          <div class="perm-demo-card__row">
            <el-button v-permission.disable="'doc:edit'" size="small">编辑（置灰版）</el-button>
            <el-button v-permission.disable="'doc:export'" type="success" size="small">导出（置灰版）</el-button>
          </div>
        </div>

        <div class="perm-demo-card">
          <h4>菜单级：权限码过滤菜单树</h4>
          <p class="perm-demo-card__tip">与路由守卫共用同一份权限码，双注册一处更新</p>
          <ul class="perm-demo-card__menu">
            <li v-for="menu in visibleMenus" :key="menu.code">{{ menu.label }}</li>
          </ul>
        </div>

        <div class="perm-demo-card">
          <h4>路由守卫：越权访问的处理</h4>
          <p class="perm-demo-card__tip">beforeEach 里校验 meta.permission，不通过跳 403</p>
          <pre class="perm-demo-card__code">router.beforeEach((to) => {
  const need = to.meta?.permission as string | undefined;
  if (need && !authStore.has(need)) return '/403';
});</pre>
        </div>
      </div>
    </section>

    <section class="perm-page__impl">
      <h4>实现要点（可直接抄进业务工程）</h4>
      <pre class="perm-page__code">// 1. 权限 store（pinia），登录后由后端下发权限码集合
export const useAuthStore = defineStore('auth', {
  state: () => ({ codes: new Set&lt;string&gt;() }),
  actions: {
    setCodes(codes: string[]) { this.codes = new Set(codes); },
    has(code: string) { return this.codes.has(code); },
  },
});

// 2. 全局指令：v-permission="'doc:edit'" / v-permission.disable="'doc:edit'"
app.directive('permission', {
  mounted(el: HTMLElement, binding) {
    const auth = useAuthStore();
    const ok = auth.has(binding.value);
    if (binding.modifiers.disable) {
      (el as HTMLButtonElement).disabled = !ok;
      el.classList.toggle('is-permission-denied', !ok);
    } else if (!ok) {
      el.remove(); // 移除而非 v-show，避免被 DevTools 强行显示
    }
  },
});</pre>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, type Directive } from 'vue';

defineOptions({ name: 'PermissionDemo' });

/** 模拟后端下发的权限码 */
const ROLE_CODES: Record<string, string[]> = {
  admin: ['doc:read', 'doc:edit', 'doc:delete', 'doc:export', 'menu:audit', 'menu:setting'],
  editor: ['doc:read', 'doc:edit', 'doc:export', 'menu:audit'],
  viewer: ['doc:read'],
};

const role = ref<keyof typeof ROLE_CODES>('editor');
const roleCodes = computed(() => ROLE_CODES[role.value] ?? []);

const MENUS = [
  { code: 'doc:read', label: '📄 文档中心' },
  { code: 'doc:edit', label: '✏️ 内容编辑' },
  { code: 'menu:audit', label: '🧾 审计日志' },
  { code: 'menu:setting', label: '⚙️ 系统设置' },
];

const visibleMenus = computed(() => MENUS.filter((menu) => roleCodes.value.includes(menu.code)));

/**
 * 本页局部指令演示（script setup 中 vXxx 命名即注册为 v-xxx）。
 * 真实项目把这段注册为全局 app.directive，权限码从 pinia 里取。
 */
const vPermission: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const ok = roleCodes.value.includes(binding.value);
    if (binding.modifiers.disable) {
      (el as HTMLButtonElement).disabled = !ok;
      el.classList.toggle('is-permission-denied', !ok);
    } else if (!ok) {
      // 移除而不是 v-show，避免被 DevTools 强行显示
      el.remove();
    }
  },
};
</script>

<style lang="less" scoped>
.perm-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;

  &__title {
    margin: 0 0 6px;
    color: var(--ai-text);
    font-size: 18px;
  }

  &__desc {
    margin: 0;
    color: var(--ai-text-dim);
    font-size: 13px;
  }

  &__panel {
    padding: 16px;
    border: 1px solid var(--ai-border);
    border-radius: var(--ai-radius-md);
    background: var(--ai-surface-raised);
  }

  &__role-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__label {
    color: var(--ai-text-dim);
    font-size: 13px;
  }

  &__codes {
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 11px;
  }

  &__demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 12px;
  }

  &__impl h4,
  .perm-demo-card h4 {
    margin: 0 0 8px;
    color: var(--ai-text);
    font-size: 13.5px;
  }

  &__code,
  .perm-demo-card__code {
    margin: 0;
    padding: 12px;
    border-radius: var(--ai-radius-sm);
    background: var(--ai-surface);
    border: 1px solid var(--ai-hairline);
    color: var(--ai-text-dim);
    font-family: var(--ai-font-mono);
    font-size: 11.5px;
    line-height: 1.7;
    overflow: auto;
  }
}

.perm-demo-card {
  padding: 14px;
  border: 1px solid var(--ai-hairline);
  border-radius: var(--ai-radius-sm);
  background: var(--ai-surface);

  &__tip {
    margin: 0 0 10px;
    color: var(--ai-text-mute);
    font-size: 11.5px;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__menu {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--ai-text-dim);
    font-size: 12.5px;

    li {
      padding: 6px 10px;
      border: 1px solid var(--ai-hairline);
      border-radius: 7px;
    }
  }
}

.is-permission-denied {
  opacity: 0.45;
}
</style>
