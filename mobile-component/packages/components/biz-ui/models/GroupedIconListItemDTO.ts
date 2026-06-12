import IconFileDTO from './IconFileDTO';
export default class GroupedIconListItemDTO {
  // 分组名称,若未分组则将图标列表平铺展示
  groupName: Nullable<string>;
  // 图标列表
  iconFileList: Nullable<IconFileDTO[]>;
}
