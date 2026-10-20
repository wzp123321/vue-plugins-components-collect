/**
 * 节点形状类型
 */
export enum NodeShapeType {
  BEGIN = 'startEvent',
  TASK = 'userTask',
  END = 'endEvent',
  CONDITION_BEGIN = 'geteway',
  CONDITION_END = 'geteway-end',
  CONDITION_BRANCH = 'sequenceFlow',
  OUTER = 'outerTask',
}
/**
 * 边形状类型
 */
export enum EdgeShapeType {
  //线条类型不再区分有箭头（arrow-edge）或无箭头（line-edge），都设置程无箭头线条,但保留ARROWEDGE和LINEEDGE两个类型，以便后续扩展。
  ARROWEDGE = 'line-edge',
  LINEEDGE = 'line-edge',
}
/**
 * 表单字段是否必填的配置
 */
export enum FiledRequired {
  REQUIRED = 1, //必填
  NO_REQUIRED = 0, //非必填
}
/**
 * 按钮样式
 */
export enum ButtonStyle {
  DEFAULT = 'DEFAULT',
  PRIMARY = 'PRIMARY',
  DANGER = 'DANGER',
  STRONG_PRIMARY = 'STRONGPRIMARY',
  STRONG_DANGER = 'STRONGDANGER',
}
/**
 * 终端编码
 * 所有终端都被承载于终端载体，例如系统管理平台（终端）的载体是pc 浏览器（终端载体）
 */
export enum TerminalId {
  SUI_SHOU_PAI_WECHAT_H5 = 'suishoupaiWechatH5', //随手拍（微信公众号）
  SUI_SHOU_PAI_WXWORK_H5 = 'suishoupaiWxworkH5', //随手拍（企业微信版）
  SUI_SHOU_PAI_DINGTALK_H5 = 'suishoupaiDingtalkH5', //随手拍（钉钉版）
  HOU_QIN_WXWORK_H5 = 'houqinWxworkH5', //后勤运维（企业微信版）
  HOU_QIN_DINGTALK_H5 = 'houqinDingtalkH5', //后勤运维（钉钉版）
  WORKBENCH_ANDROID = 'workbenchAndroid', //医溯通（Android）
  WORKBENCH_IOS = 'workbenchIOS', //医溯通（iOS）
  WYGJ_ANDROID = 'wygjAndroid', //我要管家（Android）
  WYGJ_IOS = 'wygjIOS', //我要管家（iOS）
  WORKBENCH_WEB = 'workbenchWeb', //医溯通（网页版）(就是我们平台pc端)
  OP_WEB = 'opWeb', //系统管理平台
  TOC = 'TOC', //天溯运营中心
}
/**
 * 终端载体编码(终端类型)
 */
export enum TerminalType {
  PC_WEB = 'PC_WEB', //pc  浏览器
  APP_IOS = 'APP_IOS', //ios
  APP_ANDROID = 'APP_ANDROID', //android
  WECHAT_MINI = 'WECHAT_MINI', //微信小程序
  WECHAT_H5 = 'WECHAT_H5', //微信公众号H5
  WXWORK_H5 = 'WXWORK_H5', //企业微信H5
  DINGTALK_H5 = 'DINGTALK_H5', //钉钉H5
}
