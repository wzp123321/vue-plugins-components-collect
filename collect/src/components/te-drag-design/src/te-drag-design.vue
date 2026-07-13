<template>
  <div class="te-drag-design">
    <!-- 左: 组件库 -->
    <div class="tdd-left">
      <h4>组件库</h4>
      <draggable
        class="tdd-left-list"
        :list="componentLib"
        :group="{ name: 'formItem', pull: 'clone', put: false }"
        :clone="cloneItem"
        :sort="false"
        item-key="type"
      >
        <template #item="{ element }">
          <div class="tdd-lib-item">
            <span class="tdd-lib-icon">{{ element.icon }}</span>
            <span>{{ element.label }}</span>
          </div>
        </template>
      </draggable>
    </div>

    <!-- 中: 移动端画布 -->
    <div class="tdd-center">
      <div class="tdd-phone-frame" :style="phoneFrameStyle">
        <div class="tdd-phone-notch"></div>
        <div class="tdd-phone-screen">
          <div class="tdd-region tdd-header-region" :class="{ active: activeRegion === 'header' }" @click="activeRegion = 'header'">
            <draggable
              :list="(design.header as any[])"
              group="formItem"
              item-key="_uid"
              :min-height="40"
              class="tdd-region-list"
              @add="onAdd($event, 'header')"
            >
              <template #item="{ element }">
                <div
                  class="tdd-canvas-item"
                  :class="{ active: selectId === element._uid }"
                  @click.stop="selectId = element._uid"
                >
                  <component-render :item="element" />
                </div>
              </template>
            </draggable>
          </div>

          <div class="tdd-region tdd-body-region" :class="{ active: activeRegion === 'body' }" @click="activeRegion = 'body'">
            <draggable
              :list="(design.body as any[])"
              group="formItem"
              item-key="_uid"
              :min-height="200"
              class="tdd-region-list"
              @add="onAdd($event, 'body')"
            >
              <template #item="{ element }">
                <div
                  class="tdd-canvas-item"
                  :class="{ active: selectId === element._uid }"
                  @click.stop="selectId = element._uid"
                >
                  <component-render :item="element" />
                </div>
              </template>
            </draggable>
          </div>

          <div class="tdd-region tdd-footer-region" :class="{ active: activeRegion === 'footer' }" @click="activeRegion = 'footer'">
            <draggable
              :list="(design.footer as any[])"
              group="formItem"
              item-key="_uid"
              :min-height="40"
              class="tdd-region-list"
              @add="onAdd($event, 'footer')"
            >
              <template #item="{ element }">
                <div
                  class="tdd-canvas-item"
                  :class="{ active: selectId === element._uid }"
                  @click.stop="selectId = element._uid"
                >
                  <component-render :item="element" />
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>

    <!-- 右: 属性面板 -->
    <div class="tdd-right">
      <h4>属性</h4>
      <div v-if="currentItem" class="tdd-prop-form">
        <el-form label-position="top" size="small">
          <el-form-item label="组件类型">
            <el-tag>{{ currentItem.label }}</el-tag>
          </el-form-item>
          <el-form-item v-if="'text' in currentItem.props" label="文本内容">
            <el-input v-model="currentItem.props.text" />
          </el-form-item>
          <el-form-item v-if="'placeholder' in currentItem.props" label="占位符">
            <el-input v-model="currentItem.props.placeholder" />
          </el-form-item>
          <el-form-item v-if="'src' in currentItem.props" label="图片地址">
            <el-input v-model="currentItem.props.src" placeholder="输入图片URL" />
          </el-form-item>
          <el-form-item v-if="'color' in currentItem.props" label="文字颜色">
            <el-color-picker v-model="currentItem.props.color" />
          </el-form-item>
          <el-form-item v-if="'bg' in currentItem.props" label="背景色">
            <el-color-picker v-model="currentItem.props.bg" />
          </el-form-item>
          <el-form-item v-if="'size' in currentItem.props" label="字号">
            <el-input-number v-model="currentItem.props.size" :min="10" :max="48" />
          </el-form-item>
          <el-form-item v-if="'type' in currentItem.props" label="按钮类型">
            <el-select v-model="currentItem.props.type">
              <el-option label="primary" value="primary" />
              <el-option label="success" value="success" />
              <el-option label="warning" value="warning" />
              <el-option label="danger" value="danger" />
            </el-select>
          </el-form-item>
          <el-button type="danger" plain size="small" @click="removeCurrent">删除该组件</el-button>
        </el-form>
      </div>
      <el-empty v-else description="选中画布中的组件以编辑属性" :image-size="80" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, markRaw } from 'vue';
import draggable from 'vuedraggable';
import { ElButton, ElInput, ElInputNumber, ElColorPicker, ElForm, ElFormItem, ElTag, ElSelect, ElOption, ElEmpty } from 'element-plus';

/* iPhone 13 6.1 inch: 390 x 844, 这里用 383 x 812 兼容旧版设计稿 */
const PHONE_WIDTH = 383;
const PHONE_HEIGHT = 812;

interface LibItem {
  type: string;
  label: string;
  icon: string;
  props: Record<string, any>;
}

interface CanvasItem extends LibItem {
  _uid: string;
  region: 'header' | 'body' | 'footer';
}

let _uid = 1;
const newUid = () => `it-${Date.now()}-${_uid++}`;

const componentLib: LibItem[] = [
  { type: 'text', label: '文本', icon: 'T', props: { text: '这是一段文本', color: '#333', size: 14 } },
  { type: 'image', label: '图片', icon: '🖼', props: { src: 'https://picsum.photos/300/120', height: 120 } },
  { type: 'button', label: '按钮', icon: 'B', props: { text: '立即提交', type: 'primary', color: '#fff', bg: '#409eff' } },
  { type: 'input', label: '输入框', icon: 'I', props: { placeholder: '请输入', size: 14 } },
];

const design = reactive<{ header: CanvasItem[]; body: CanvasItem[]; footer: CanvasItem[] }>({
  header: [],
  body: [],
  footer: [
    { _uid: newUid(), type: 'button', label: '按钮', icon: 'B', region: 'footer', props: { text: '提交申请', type: 'primary', color: '#fff', bg: '#409eff' } },
  ],
});

const activeRegion = ref<'header' | 'body' | 'footer'>('body');
const selectId = ref<string>('');

const currentItem = computed<CanvasItem | undefined>(() => {
  if (!selectId.value) return undefined;
  return (design.header as CanvasItem[]).concat(design.body, design.footer).find((i) => i._uid === selectId.value);
});

const cloneItem = (item: LibItem): CanvasItem => ({
  ...item,
  _uid: newUid(),
  region: activeRegion.value,
  props: { ...item.props },
});

const onAdd = (evt: any, region: 'header' | 'body' | 'footer') => {
  // 拖入时 vuedraggable 已经 push 进去了, 修正 region
  const list = design[region] as CanvasItem[];
  const newItem = list[evt.newIndex];
  if (newItem) {
    newItem._uid = newUid();
    newItem.region = region;
    newItem.props = { ...newItem.props };
    selectId.value = newItem._uid;
  }
};

const removeCurrent = () => {
  if (!currentItem.value) return;
  const id = currentItem.value._uid;
  ['header', 'body', 'footer'].forEach((r) => {
    const list = design[r as 'header' | 'body' | 'footer'] as CanvasItem[];
    const idx = list.findIndex((i) => i._uid === id);
    if (idx >= 0) list.splice(idx, 1);
  });
  selectId.value = '';
};

const phoneFrameStyle = computed(() => ({
  width: `${PHONE_WIDTH}px`,
  height: `${PHONE_HEIGHT}px`,
}));

/* 简易渲染器: 直接把每个 type 渲染成对应元素 */
import { defineComponent, h } from 'vue';
const ComponentRender = markRaw(
  defineComponent({
    name: 'ComponentRender',
    props: ['item'],
    setup(p) {
      return () => {
        const it = p.item as CanvasItem;
        const props = it.props || {};
        switch (it.type) {
          case 'text':
            return h('div', { style: { color: props.color, fontSize: `${props.size}px`, padding: '4px 0' } }, props.text);
          case 'image':
            return h('img', { src: props.src, style: { width: '100%', height: `${props.height}px`, objectFit: 'cover', display: 'block' } });
          case 'button':
            return h(ElButton, { type: props.type, size: 'small' }, () => props.text);
          case 'input':
            return h(ElInput, { placeholder: props.placeholder, size: 'small' });
          default:
            return h('div', '未知组件');
        }
      };
    },
  })
);

defineOptions({ name: 'TeDragDesign' });
</script>

<style lang="less" scoped>
.te-drag-design {
  display: flex;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  gap: 12px;
  padding: 12px;

  .tdd-left,
  .tdd-right {
    width: 220px;
    background: #fff;
    border-radius: 6px;
    padding: 12px;
    box-sizing: border-box;
    overflow: auto;

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
    }
  }

  .tdd-left-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tdd-lib-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px dashed #c0c4cc;
    border-radius: 4px;
    background: #fafafa;
    cursor: grab;
    user-select: none;
    font-size: 13px;

    .tdd-lib-icon {
      display: inline-block;
      width: 22px;
      height: 22px;
      line-height: 22px;
      text-align: center;
      background: #409eff;
      color: #fff;
      border-radius: 4px;
      font-size: 12px;
    }
  }

  .tdd-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
  }

  .tdd-phone-frame {
    position: relative;
    background: #1c1c1e;
    border-radius: 36px;
    padding: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .tdd-phone-notch {
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 22px;
    background: #1c1c1e;
    border-radius: 0 0 12px 12px;
    z-index: 2;
  }

  .tdd-phone-screen {
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .tdd-region {
    flex: 0 0 auto;
    padding: 6px;
    border: 2px dashed transparent;
    transition: border-color 0.15s;

    &.active {
      border-color: #409eff;
    }
  }

  .tdd-header-region { background: #f0f9ff; min-height: 48px; }
  .tdd-body-region { flex: 1; background: #fff; min-height: 300px; }
  .tdd-footer-region { background: #f0f9ff; min-height: 56px; }

  .tdd-region-list {
    min-height: 32px;
  }

  .tdd-canvas-item {
    border: 2px solid transparent;
    border-radius: 4px;
    padding: 4px;
    margin: 2px 0;
    cursor: pointer;
    transition: border-color 0.15s;

    &.active {
      border-color: #409eff;
      background: #ecf5ff;
    }
  }

  .tdd-prop-form {
    :deep(.el-form-item) {
      margin-bottom: 12px;
    }
  }
}
</style>
