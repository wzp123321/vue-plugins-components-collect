/**
 * viewBookmarks.ts —— 视角书签的本地持久化（localStorage）
 *
 * 把当前相机位置 + 视点（OrbitControls.target）序列化保存，供「自定义视角书签」
 * 交互读取/恢复。纯数据层，不涉及 Three.js；由 ChinaMap3D 调用。
 */

const KEY = 'china3d-view-bookmarks'

export interface ViewBookmark {
  id: string
  name: string
  /** 相机位置 [x, y, z] */
  position: [number, number, number]
  /** 视点（OrbitControls.target）[x, y, z] */
  target: [number, number, number]
}

/** 读取全部书签（解析失败兜底空数组） */
export const loadBookmarks = (): ViewBookmark[] => {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as ViewBookmark[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

const save = (list: ViewBookmark[]): ViewBookmark[] => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* 隐私模式/容量满：静默降级，本次会话内仍可正常使用 */
  }
  return list
}

/** 新增书签（自动生成 id），返回最新列表 */
export const addBookmark = (
  name: string,
  position: [number, number, number],
  target: [number, number, number],
): ViewBookmark[] => {
  const list = loadBookmarks()
  list.push({ id: `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3).toString(36)}`, name: name.trim() || `视角 ${list.length + 1}`, position, target })
  return save(list)
}

/** 删除书签，返回最新列表 */
export const removeBookmark = (id: string): ViewBookmark[] => save(loadBookmarks().filter((b) => b.id !== id))
