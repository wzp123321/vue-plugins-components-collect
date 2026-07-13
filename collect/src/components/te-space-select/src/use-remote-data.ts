import type { MockSpaceNode } from '../../_mock/space';

export interface SpaceOption {
  value: string;
  label: string;
  disabled?: boolean;
  leaf?: boolean;
  children?: SpaceOption[];
  isChild?: boolean;
  level?: string;
  raw: MockSpaceNode;
}

export interface AllowSelectAllLevels {
  building: boolean;
  floor: boolean;
  room: boolean;
}

/**
 * 模拟 useRemoteData：把后端 lazy 树数据格式化成 cascader 可用 options
 */
export const useRemoteData = () => {
  const detailMap: Map<string, SpaceOption> = new Map();

  /** 处理懒加载分级数据 */
  const dealwithLazyData = (tree: MockSpaceNode[], allow: AllowSelectAllLevels) => {
    const res: SpaceOption[] = [];
    tree.forEach((item: any) => {
      const parentDisabled = !allow.building;
      res.push({
        value: item.id,
        label: item.name,
        disabled: parentDisabled,
        leaf: !item.children || item.children.length === 0,
        isChild: false,
        level: item.type,
        raw: item,
        children: [],
      });
      if (item.children) {
        item.children.forEach((el: any) => {
          const childDisabled = el.type === 'floor' ? !allow.floor : !allow.room;
          res.push({
            value: `${item.id}|${el.id}`,
            label: el.name,
            disabled: childDisabled,
            leaf: !el.children || el.children.length === 0,
            isChild: true,
            level: el.type,
            raw: el,
            children: el.children ? el.children.map((g: any) => mapChild(item.id, g, allow)) : [],
          });
        });
      }
    });
    res.forEach((item) => detailMap.set(String(item.value), item));
    return res;
  };

  const mapChild = (parentId: string, el: MockSpaceNode, allow: AllowSelectAllLevels): SpaceOption => {
    const childDisabled = el.type === 'floor' ? !allow.floor : !allow.room;
    return {
      value: `${parentId}|${el.id}`,
      label: el.name,
      disabled: childDisabled,
      leaf: true,
      isChild: true,
      level: el.type,
      raw: el,
    };
  };

  /** 扁平搜索结果拼成 cascader 树（保留 path 信息） */
  const buildCascaderFromFlat = (list: MockSpaceNode[]) => {
    return list.map((n) => ({
      value: n.id,
      label: n.name,
      leaf: true,
      level: n.type,
      raw: n,
    }));
  };

  return { dealwithLazyData, buildCascaderFromFlat, detailMap };
};
