<!--
 * MapSearchBox.vue — 左上角「行政区搜索框」
 * 职责：在当前层级内搜索行政区，提供候选下拉与键盘导航（↑↓ 选择、Enter 确认、
 *   Esc 清空/收起）。命中后 emit('pick') 交给 ChinaMap3D 下钻/选中；无候选时
 *   Enter 触发 emit('search') 走跨层级兜底定位。
 * 角色：纯 UI；items 即 ChinaMap3D 的 searchItems（当前层级全部行政区）。
 * 暴露 focus() 供父组件键盘 "/" 聚焦输入框。
 -->
<template>
  <div class="map-search">
    <div class="map-search__box" :class="{ 'map-search__box--open': open && suggestions.length > 0 }">
      <span class="map-search__icon">⌕</span>
      <input
        ref="inputEl"
        v-model="keyword"
        class="map-search__input"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="open = true"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <button v-if="keyword" class="map-search__clear" type="button" @click="clear">✕</button>
    </div>
    <ul v-show="open && suggestions.length > 0" class="map-search__list">
      <li
        v-for="(item, index) in suggestions"
        :key="item.adcode"
        class="map-search__item"
        :class="{ 'map-search__item--active': index === activeIndex }"
        @mousedown.prevent="pick(item)"
        @mouseenter="activeIndex = index"
      >
        <span class="map-search__name">{{ item.name }}</span>
        <span class="map-search__meta">{{ item.levelText }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

export interface SearchItem {
  name: string
  adcode: number
  levelText?: string
}

const props = withDefaults(
  defineProps<{
    /** 当前层级可选的全部行政区 */
    items: SearchItem[]
    placeholder?: string
    disabled?: boolean
  }>(),
  { placeholder: '搜索当前层级行政区…', disabled: false },
)

const emit = defineEmits<{
  (e: 'pick', item: SearchItem): void
  (e: 'search', keyword: string): void
}>()

const keyword = ref('')
const open = ref(false)
const activeIndex = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)

/**
 * stripSuffix — 去掉行政区名称里的单位后缀，让「江苏」也能命中「江苏省」。
 * 正则末尾 $ 锚定，逐一剥掉 省/市/自治区/特别行政区/自治州/地区/盟/县/区/旗/新区
 * 等常见后缀（注意：只去结尾，避免误伤中间带"区"字的地名）。
 */
const stripSuffix = (name: string) =>
  String(name ?? '').replace(/(省|市|自治区|特别行政区|自治州|地区|盟|县|区|旗|新区)$/g, '')

const suggestions = computed<SearchItem[]>(() => {
  const key = keyword.value.trim()
  if (!key) return []
  const norm = stripSuffix(key)
  const scored = props.items
    .map((item) => {
      const name = String(item.name ?? '')
      // 命中优先级（score 越小越靠前）：0=adcode 精确相等；1=名称精确或去后缀相等；2=名称包含关键词
      if (String(item.adcode) === key) return { item: { ...item }, score: 0 }
      if (name === key || stripSuffix(name) === norm) return { item, score: 1 }
      if (name.includes(key)) return { item, score: 2 }
      return null
    })
    .filter(Boolean) as Array<{ item: SearchItem; score: number }>
  // 先按 score 升序，再按中文名排序；最多取前 8 条避免下拉过长。
  scored.sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name, 'zh-Hans-CN'))
  return scored.slice(0, 8).map((entry) => entry.item)
})

watch(suggestions, () => {
  activeIndex.value = 0
})

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % Math.max(1, suggestions.value.length)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + suggestions.value.length) % Math.max(1, suggestions.value.length)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const item = suggestions.value[activeIndex.value] ?? suggestions.value[0]
    if (item) pick(item)
    else emit('search', keyword.value.trim())
  } else if (event.key === 'Escape') {
    event.stopPropagation()
    if (keyword.value) clear()
    else open.value = false
  }
};

const pick = (item: SearchItem) => {
  keyword.value = item.name
  open.value = false
  emit('pick', item)
};

const clear = () => {
  keyword.value = ''
  open.value = false
  nextTick(() => inputEl.value?.blur())
};

const onBlur = () => {
  // 失焦先留一帧，否则 mousedown 选中还没触发列表就被收起
  setTimeout(() => (open.value = false), 120)
};

defineExpose({
  focus: () => inputEl.value?.focus(),
})
</script>

<style scoped>
.map-search {
  position: absolute;
  top: 62px;
  left: 24px;
  z-index: 32;
  width: 208px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.map-search__box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(6, 16, 40, 0.78);
  border: 1px solid rgba(95, 216, 255, 0.22);
  backdrop-filter: blur(10px);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.map-search__box--open {
  border-color: rgba(143, 235, 255, 0.6);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: 0 0 18px rgba(47, 192, 255, 0.25);
}
.map-search__icon {
  font-size: 14px;
  color: #5fd8ff;
}
.map-search__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #eaf6ff;
  font-size: 12px;
  font-family: inherit;
  letter-spacing: 0.5px;
}
.map-search__input::placeholder { color: #6f9fc4; }
.map-search__input:disabled { color: #4d7ea3; cursor: not-allowed; }
.map-search__clear {
  border: none;
  background: none;
  color: #6f9fc4;
  font-size: 11px;
  cursor: pointer;
  padding: 0 2px;
}
.map-search__clear:hover { color: #eaf6ff; }
.map-search__list {
  margin: 0;
  padding: 4px;
  list-style: none;
  max-height: 224px;
  overflow-y: auto;
  background: rgba(6, 16, 40, 0.92);
  border: 1px solid rgba(143, 235, 255, 0.4);
  border-top: none;
  border-radius: 0 0 10px 10px;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
}
.map-search__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #cfe9ff;
}
.map-search__item--active { background: rgba(47, 192, 255, 0.22); color: #eaf6ff; }
.map-search__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.map-search__meta { font-size: 10px; color: #6f9fc4; }
</style>
