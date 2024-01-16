/**
 * 页面加载平台
 */
export enum Common_ELoadPlatform {
  APP = 'app',
  小程序 = 'mini_program',
  企业微信 = 'wxworkH5',
}

/**
 * 公共请求地址
 */
export enum Common_EPath {
  查询带总能耗的能源类型列表 = '/admin/energy/code/listEnergyParentCode',
  查询搜索关键字记录列表 = '/app/common/querySearchRecordList',
  字典查询 = '/app/common/queryTreeType',
  根据树节点ID查询子节点列表 = '/app/common/queryChildrenNodeList',
  查询能耗分析顶级节点 = '/app/common/queryTopNode',
}

/**
 * 原生方法
 */
export enum Common_EBridgeType {
  获取配置信息 = 'config',
  返回上一层 = 'goback',
  隐藏状态栏 = 'sizeTop',
  老版隐藏状态栏 = 'showOrHideStatusbar',
  加载成功 = 'loadSuccess',
  原生键盘适配 = 'keyboardEnable', // type: 1 开启原生适配键盘  2：关闭原生适配键盘
}

/**
 * 适配原生键盘
 */
export enum Common_EKeyboardType {
  开启原生适配键盘 = 1,
  关闭原生适配键盘 = 2
}

/**
 * 能源类型
 */
export enum Common_EEnergyCode {
  总能耗 = '00000',
  电 = '01000',
  水 = '02000',
  燃气 = '03000',
  蒸汽 = '20000',
}

/**
 * 颗粒度
 */
export enum Common_ETimeUnit {
  日 = '1d',
  月 = '1M',
  年 = '1y',
}

/**
 * 网络状态
 */
export enum Common_ENetworkType {
  'wifi网络' = 'wifi',
  '2g网络' = '2g',
  '3g网络' = '3g',
  '4g网络' = '4g',
  '5g网络' = '5g',
  '有线网络' = 'ethernet',
  'Android下不常见的网络类型' = 'unknown',
  无网络 = 'none',
}

/**
 * 树类型
 */
export enum Common_ETreeType {
  区域 = '1',
  业态 = '2',
}

/**
 * 日期选择类型
 */
export enum Common_EPickerType {
  年月日 = 'yyyy-MM-dd',
  年月 = 'yyyy-MM',
  年 = 'yyyy',
}

/**
 * 下拉刷新状态
 */
export enum Common_ERefresherStatus {
  默认状态 = 0,
  松手立即刷新 = 1,
  刷新中 = 2,
  刷新成功 = 3,
}

/**
 * 菜单id
 */
export enum Common_EMenuId {
  能耗纵览 = 523,
  能耗分析 = 502,
  节能考核 = 503,
}

/**
 * 公共字典类型
 */
export enum Common_EDictionaryType {
  颗粒度 = 'time_unit',
  树类型 = 'tree_type',
}

//是否能点击
export enum Common_EClickStatus {
  否 = '0',
  是 = '1',
}

/**
 * 所有页面异常情况
 */
export enum Common_EPageErrorType {
  正常加载,
  网络异常,
  加载失败,
  没有树节点权限,
  没有配置树节点,
  没有配置区域树列表,
  没有配置能耗类型列表,
  当前能源类型没有配置该节点,
  配置正常但是没有数据,
  没有关联设备,
}

/**
 * 异常状态码
 */
export enum Common_EErrorCode {
  操作失败 = '500',
  能源类型不存在 = '50000',
  区域树不存在 = '50001',
  用户所属角色未配置树节点权限 = '50002',
  用户所属角色未配置树类型权限 = '50003',
  树模型不存在 = '50004',
}

/**
 * 异常提示语
 */
export const Common_EErrorTitle = {
  正常加载: {
    title: '',
    subTitle: '',
  },
  网络异常: {
    title: '',
    subTitle: '',
  },
  加载失败: {
    title: '',
    subTitle: '',
  },
  没有树节点权限: {
    title: '',
    subTitle: '',
  },
  没有配置树节点: {
    title: '',
    subTitle: '',
  },
  没有配置能耗类型列表: {
    title: '',
    subTitle: '',
  },
  当前能源类型没有配置该节点: {
    title: '',
    subTitle: '',
  },
  配置正常但是没有数据: {
    title: '',
    subTitle: '',
  },
  没有关联设备: {
    title: '',
    subTitle: '',
  },
};
