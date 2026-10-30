<template>
  <div v-if="visible" class="cm-alarm-center">
    <header class="cm-alarm-header">
      <span class="cm-alarm-title">告警中心</span>
      <span class="cm-alarm-count">{{ items.length }}</span>
      <button type="button" class="cm-alarm-close" title="关闭" @click="emit('close')">×</button>
    </header>
    <ul class="cm-alarm-list">
      <li
        v-for="item in items"
        :key="item.id"
        class="cm-alarm-item"
        :class="{ 'is-active': item.id === activeId }"
        @click="emit('locate', item)"
      >
        <i class="cm-alarm-dot"></i>
        <span class="cm-alarm-name">{{ item.name }}</span>
        <span class="cm-alarm-sub">{{ item.sub }}</span>
        <span class="cm-alarm-tag">{{ item.tag }}</span>
      </li>
      <li v-if="!items.length" class="cm-alarm-empty">当前视角暂无告警</li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CmAlarmCenter' })

export interface AlarmItem {
  id: string
  name: string
  sub: string
  tag: string
}

defineProps<{
  visible: boolean
  items: AlarmItem[]
  activeId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'locate', item: AlarmItem): void
}>()
</script>

<style lang="less" scoped>
.cm-alarm-center {
  position: absolute;
  top: 58px;
  right: 12px;
  z-index: 20;
  width: 280px;
  max-height: 46%;
  display: flex;
  flex-direction: column;
  background: rgba(6, 39, 65, 0.92);
  border: 1px solid rgba(54, 129, 255, 0.22);
  border-radius: var(--ai-radius-md);
  overflow: hidden;

  .cm-alarm-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid rgba(54, 129, 255, 0.25);
  }

  .cm-alarm-title {
    color: #d6e8ff;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .cm-alarm-count {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: rgba(255, 63, 0, 0.2);
    color: #ff7a45;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
  }

  .cm-alarm-close {
    margin-left: auto;
    padding: 0 4px;
    border: 0;
    background: transparent;
    color: #9ec9ff;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;

    &:hover {
      color: #00eaff;
    }
  }

  .cm-alarm-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    margin: 0;
    padding: 4px;
    list-style: none;
  }

  .cm-alarm-item {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 6px;
    border-radius: var(--ai-radius-xs);
    cursor: pointer;
    transition: background 0.2s;

    &:hover,
    &.is-active {
      background: rgba(54, 129, 255, 0.2);
    }
  }

  .cm-alarm-dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #ff3f00;
    box-shadow: 0 0 6px #ff3f00;
  }

  .cm-alarm-name {
    flex-shrink: 0;
    max-width: 96px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #d6e8ff;
    font-size: 12px;
  }

  .cm-alarm-sub {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #9ec9ff;
    font-size: 11px;
  }

  .cm-alarm-tag {
    flex-shrink: 0;
    padding: 1px 5px;
    border-radius: var(--ai-radius-xxs);
    background: rgba(255, 63, 0, 0.16);
    color: #ff9c6e;
    font-size: 10px;
  }

  .cm-alarm-empty {
    padding: 18px 8px;
    color: #9ec9ff;
    font-size: 12px;
    text-align: center;
  }
}
</style>
