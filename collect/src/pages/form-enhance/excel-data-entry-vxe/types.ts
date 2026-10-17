// 录入台共享类型与基础常量
export type ColType = 'text' | 'number' | 'select' | 'date';

export interface ColDef {
  field: string;
  label: string;
  type: ColType;
  /** select 类型的可选项（同时用作列筛选器候选） */
  options?: string[];
  required?: boolean;
  /** 是否可见（列设置抽屉切换，不可见的列不参与查询/复制/统计） */
  visible: boolean;
  /** 冻结在左侧（vxe fixed: 'left'） */
  frozen?: boolean;
  /** 基准宽（px）；实际显示宽由 useGridColumns 按容器宽度等比换算 */
  width?: number;
}

export type Row = { __id: string; __dirty: boolean; [key: string]: any };

// 撤销/重做快照：行数据 + 列结构
export interface Snap {
  rows: Row[];
  defs: ColDef[];
}

// 列结构模板（localStorage 持久化，仅存列结构不存数据）
export interface Tpl {
  name: string;
  defs: ColDef[];
  ts: number;
}

export const typeLabel: Record<ColType, string> = { text: '文本', number: '数字', select: '下拉', date: '日期' };

export const DEPARTMENTS = ['研发', '市场', '财务', '人事', '运营'];
export const STATUSES = ['在职', '试用期', '离职'];
export const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
export const GIVEN = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '霞', '平', '刚', '燕'];
export const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '苏州'];

let seq = 0;
export const uid = () => `row_${Date.now().toString(36)}_${seq++}`;

// 列类型的空值默认值：一律留空（数字→null，其余→空串）。
// 新增行/插入行/模板应用/加列回填都只应有序号列有值，下拉不预选首项（预选会掩盖"未填写"）
export const emptyValueFor = (d: ColDef): any => (d.type === 'number' ? null : '');
