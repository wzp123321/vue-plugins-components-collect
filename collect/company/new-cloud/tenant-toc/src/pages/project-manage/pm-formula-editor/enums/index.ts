// 指标类型
export enum PFE_ESymbolType {
  基础 = 'B',
  定值 = 'D',
  运算 = 'C',
  数字 = '3',
  运算符 = '4',
  判断符 = '5',
}
// 是否是预制 是否系统内置  0内置，1非内置
export enum PFE_EFixedType {
  内置 = '0',
  非内置 = '1',
}

// 接口地址
export enum PFE_EPath {
  查询收益分享模式各项指标列表 = '/incomeShare/queryIndexList',
  新增定值运算指标 = '/incomeShare/saveIndex',
  删除定值运算指标 = '/incomeShare/deleteIndex',
  查询公式组信息与指标配置信息 = '/incomeShare/queryGroupInfoAndIndexConfigInfo',
  编辑公式组信息与指标配置信息 = '/incomeShare/saveGroupInfoAndIndexConfigInfo',
}

// 容器类型
export enum PFE_EContainerType {
  条件 = 'condition',
  公式 = 'formula',
}
