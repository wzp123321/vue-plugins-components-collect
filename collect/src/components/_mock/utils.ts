/**
 * 通用工具: 防抖 / 节流
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 200): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function throttle<T extends (...args: any[]) => void>(fn: T, delay = 200): T {
  let last = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  }) as T;
}

/** 树扁平化 */
export function flatTree<T extends { children?: T[] }>(tree: T[]): T[] {
  const result: T[] = [];
  const walk = (list: T[]) => {
    list.forEach((n) => {
      result.push(n);
      if (n.children?.length) walk(n.children);
    });
  };
  walk(tree);
  return result;
}

/** 构建树 */
export interface TreeBuilderItem {
  id: string;
  parent: string | null;
  children?: any[];
}
export function buildTree<T extends TreeBuilderItem>(list: T[], parent: string | null = null, disabledCheck?: (n: T) => boolean): T[] {
  return list
    .filter((n) => n.parent === parent)
    .map((n) => ({
      ...n,
      children: buildTree(list, n.id, disabledCheck),
    }));
}
