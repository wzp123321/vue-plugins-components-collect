import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

export interface UseDraggableIconOptions {
  /** 图标尺寸(px),用于视口边界 clamp,默认 52 */
  entrySize?: number;
  /** 默认距视口底部的距离(px),无缓存时生效,默认 100 */
  defaultBottom?: number;
  /** 最小距视口底部的距离(px),默认 20,防贴底 */
  minBottom?: number;
  /** 移动死区(px),超过才认为位移,默认 3 */
  threshold?: number;
}

export interface UseDraggableIconReturn {
  /** 距视口底部的距离(px) */
  position: Ref<{ y: number }>;
  /** 拖拽开始 handler,绑到 @pointerdown */
  onDragStart: (e: PointerEvent) => void;
  /** 拖拽进行中,父级用于显示遮罩绕开 iframe 事件吞噬 */
  isDragging: Ref<boolean>;
  /** 是否有实际位移(>threshold),用于区分 click vs drag */
  hasMoved: Ref<boolean>;
}

/**
 * 悬浮图标 Y 轴拖拽 composable:
 * - position.y 表示"距视口底部的距离"(向上拖 y 增大,向下拖 y 减小)
 * - 不持久化:每次挂载都从 defaultBottom 重新开始
 * - pointer 事件统一覆盖鼠标/触摸/笔
 */
export function useDraggableIcon(
  options: UseDraggableIconOptions = {},
): UseDraggableIconReturn {
  const {
    entrySize = 52,
    defaultBottom = 100,
    minBottom = 20,
    threshold = 3,
  } = options;

  /** 将 bottom 约束在 [minBottom, innerHeight - entrySize] 范围内 */
  const clampY = (y: number): number => {
    const maxY = Math.max(minBottom, window.innerHeight - entrySize);
    return Math.max(minBottom, Math.min(y, maxY));
  };

  const position = ref<{ y: number }>({
    y: clampY(defaultBottom),
  });

  const isDragging = ref(false);
  const hasMoved = ref(false);
  const startY = ref(0);
  const startBottom = ref(0);

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging.value) return;
    if (e.buttons === 0) {
      // 鼠标移出视口时 pointerup 不触发,buttons===0 主动收尾
      // eslint-disable-next-line no-use-before-define
      endDrag();
      return;
    }
    const deltaY = e.clientY - startY.value;
    // 3px 死区:轻微抖动不触发拖拽,避免 click 失效
    if (!hasMoved.value && Math.abs(deltaY) < threshold) return;
    hasMoved.value = true;
    // y 表示"距底部距离":向下拖(deltaY>0)→ bottom 减小
    position.value = { y: clampY(startBottom.value - deltaY) };
  };

  const onPointerEnd = () => {
    // eslint-disable-next-line no-use-before-define
    endDrag();
  };

  const onDragStart = (e: PointerEvent) => {
    if (e.button !== 0) return;
    isDragging.value = true;
    hasMoved.value = false;
    startY.value = e.clientY;
    startBottom.value = position.value.y;
    // 仅在拖拽期间挂载监听,结束由 endDrag 移除
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
  };

  /**
   * 统一拖拽收尾:卸载监听(无持久化)
   * hasMoved 不在此重置,留给 click handler 在 pointerup 之后消费,
   * 正确区分"点击 vs 拖拽"——pointerup 之后浏览器会同步派发 click 事件
   */
  const endDrag = () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerEnd);
    window.removeEventListener('pointercancel', onPointerEnd);
  };

  /** 视口缩放时 re-clamp */
  const onViewportResize = () => {
    position.value = { y: clampY(position.value.y) };
  };

  onMounted(() => {
    window.addEventListener('resize', onViewportResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onViewportResize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerEnd);
    window.removeEventListener('pointercancel', onPointerEnd);
  });

  return {
    position,
    onDragStart,
    isDragging,
    hasMoved,
  };
}
