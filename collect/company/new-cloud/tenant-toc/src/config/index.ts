const env = process.env.NODE_ENV || 'production';

export const PUBLIC_PATH = env === 'production' ? '/tenant' : '/';

/**
 * 状态
 */
export const statuses = [
  {
    label: '正常',
    value: '1',
  },
  {
    label: '异常',
    value: '0',
  },
];

export const configStatuses = [
  {
    label: '自定义',
    value: 0,
  },
  {
    label: '系统预置',
    value: 1,
  },
];

/**
 * 分页数组
 */
export const pageSizesArray = [10, 20, 30, 40, 50];

/**
 * 文件上传最大限制
 */
export const FILE_UPLOAD_LIMIT = 6;

/**
 * 通用支持文件上传后缀名
 */
export const FILE_UPLOAD_EXTENSION = '.pdf,.doc,.docx,.xls,.xlsx,.xlsm,.png,.jpg,.jpeg';

/**
 * 项目中表单校验规则
 * @params NORMAL_INPUT_LENGTH 一般输入框
 * @params IP IP
 * @params PORT 端口
 * @params CODE 编码
 */
export const FORM_CHECK_RULES = {
  NORMAL_INPUT_LENGTH32: 32, // 一般输入框长度限制
  NORMAL_INPUT_LENGTH16: 16, // 一般输入框长度限制
  NORMAL_INPUT_LENGTH64: 64, // 一般输入框长度限制
  IP: new RegExp(
    /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/,
  ), // ip
  PORT: new RegExp(/^0$|^[1-5][0-9]{0,4}$|^[1-9][0-9]{0,3}$|^6[0-5][0-5][0-3][0-5]$/), // 端口
  CODE: new RegExp(/^[A-Za-z0-9_-]+$/),
  PASSWORD: new RegExp(/^[\w~!@#$%^&*()-+_]{1,20}$/), // 密码
  POSITIVE_INTEGER: new RegExp(/(^[1-9]\d*$)/), // 正整数
  ZERO_POSITIVE_INTEGER: new RegExp(/(^0$)|(^[1-9]\d*$)/), // 0或正整数
};
export const USER = {
  LOGINNAME: new RegExp(/^[a-zA-Z0-9\u4e00-\u9fa5\_]+$/), // 用户登录名
  PHONE: new RegExp(/^1[3|4|5|7|8|9][0-9]\d{8}$/), // 手机号
  PASSWORD: new RegExp(/^[\w~!@#$%^&*()-+_]{1,20}$/), // 密码
};

// 分页器每页数量
export const pageSizes = [10, 20, 30, 40, 50];

// 分析对象-treetype
export const treeTypeList = [
  { value: '1', label: '区域' },
  { value: '2', label: '业态' },
];

// 鉴权失败响应码
export const FORBIDDEN_CODES = [400, 401];
