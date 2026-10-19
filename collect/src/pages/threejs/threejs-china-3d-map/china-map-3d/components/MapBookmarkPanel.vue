<!--
 * MapBookmarkPanel.vue — 视角书签面板（P1 交互）
 * 职责：把「保存当前视角 / 切回已存视角 / 删除视角」做成一个小浮层。
 *   只负责呈现与输入，读写相机由 ChinaMap3D 完成（它才持有 viewport）。
 * 角色：纯 UI；书签数据来自 ChinaMap3D（localStorage 持久化，见 utils/viewBookmarks）。
 * 协作：ChinaMap3D（v-if 控制显隐，save/apply/remove 事件回传）。
 -->
<template>
  <div class="map-bookmark">
    <div class="map-bookmark__head">
      <span class="map-bookmark__title">视角书签</span>
      <button type="button" class="map-bookmark__close" title="关闭" @click="emit('close')">×</button>
    </div>

    <div class="map-bookmark__save">
      <input
        v-model="draftName"
        class="map-bookmark__input"
        type="text"
        maxlength="16"
        :placeholder="`视角 ${items.length + 1}`"
        @keydown.enter="onSave"
      />
      <button type="button" class="map-bookmark__saveBtn" @click="onSave">保存当前</button>
    </div>

    <ul v-if="items.length" class="map-bookmark__list">
      <li v-for="item in items" :key="item.id" class="map-bookmark__item">
        <button type="button" class="map-bookmark__apply" :title="'切换到 ' + item.name" @click="emit('apply', item.id)">
          <span class="map-bookmark__dot"></span>
          <span class="map-bookmark__name">{{ item.name }}</span>
        </button>
        <button type="button" class="map-bookmark__del" title="删除" @click="emit('remove', item.id)">×</button>
      </li>
    </ul>
    <div v-else class="map-bookmark__empty">还没有书签，调好角度后点「保存当前」</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ViewBookmark } from '../utils/viewBookmarks'

withDefaults(defineProps<{ items?: ViewBookmark[] }>(), { items: () => [] })

const emit = defineEmits<{
  (e: 'save', name: string): void
  (e: 'apply', id: string): void
  (e: 'remove', id: string): void
  (e: 'close'): void
}>()

/** 待命名的书签名（留空则由 ChinaMap3D 自动编号） */
const draftName = ref('')

const onSave = () => {
  emit('save', draftName.value.trim())
  draftName.value = ''
}
</script>

<style scoped>
.map-bookmark {
  position: absolute;
  top: 62px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 31;
  width: 236px;
  padding: 10px 12px 12px;
  background: rgba(6, 16, 40, 0.86);
  border: 1px solid rgba(95, 216, 255, 0.28);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.5);
  color: #dcefff;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
}
.map-bookmark__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.map-bookmark__title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #eaf6ff;
  text-shadow: 0 0 10px rgba(54, 224, 255, 0.45);
}
.map-bookmark__close {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 4px;
  background: none;
  color: #7fa8c8;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}
.map-bookmark__close:hover {
  background: rgba(95, 216, 255, 0.16);
  color: #eaf6ff;
}
.map-bookmark__save {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.map-bookmark__input {
  flex: 1;
  min-width: 0;
  padding: 5px 8px;
  border: 1px solid rgba(95, 216, 255, 0.22);
  border-radius: 6px;
  background: rgba(8, 20, 44, 0.9);
  color: #eaf6ff;
  font: 12px/1.2 inherit;
  outline: none;
}
.map-bookmark__input:focus {
  border-color: rgba(95, 216, 255, 0.6);
}
.map-bookmark__input::placeholder {
  color: #4f7794;
}
.map-bookmark__saveBtn {
  padding: 5px 10px;
  border: 1px solid rgba(47, 192, 255, 0.5);
  border-radius: 6px;
  background: rgba(47, 192, 255, 0.22);
  color: #eaf6ff;
  font: 600 12px/1.2 inherit;
  white-space: nowrap;
  cursor: pointer;
}
.map-bookmark__saveBtn:hover {
  background: rgba(47, 192, 255, 0.34);
  box-shadow: 0 0 12px rgba(47, 192, 255, 0.35);
}
.map-bookmark__list {
  max-height: 190px;
  margin: 10px 0 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}
.map-bookmark__item {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}
.map-bookmark__apply {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: rgba(120, 150, 180, 0.1);
  color: #cfe9ff;
  font: 12px/1.2 inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.16s ease, border-color 0.16s ease;
}
.map-bookmark__apply:hover {
  background: rgba(47, 192, 255, 0.2);
  border-color: rgba(95, 216, 255, 0.4);
}
.map-bookmark__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #5fd8ff;
  box-shadow: 0 0 6px #5fd8ff;
  flex: none;
}
.map-bookmark__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.map-bookmark__del {
  width: 20px;
  height: 20px;
  flex: none;
  border: none;
  border-radius: 4px;
  background: none;
  color: #6f9fc4;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
}
.map-bookmark__del:hover {
  background: rgba(255, 96, 96, 0.18);
  color: #ff9b9b;
}
.map-bookmark__empty {
  margin-top: 12px;
  font-size: 11px;
  line-height: 1.5;
  color: #6f9fc4;
}
</style>
