import TreeQd from './TreeQd';
export default class FunctionPropertyTreeQueryDTO extends TreeQd {
  // 功能属性名称,模糊匹配; 传入此值,idEq和levels将失效
  nameLike: Nullable<string>;
  // 功能属性状态: true-仅返回有效,false-返回无效数据;不传或传null值-返回全部数据
  status: Nullable<boolean>;
}
