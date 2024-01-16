import { h, shallowRef } from 'vue';
const characters: string = '';

const _default = String.raw`\`\\;\'\"<>`;

// 分析对象-treetype
export const treeTypeList = [
  { value: 1, label: '区域' },
  { value: 2, label: '业态' },
];

// 页码
export const pageSizes = [10, 20, 30, 40, 50];

/**
 * 项目中表单校验规则
 * @params NORMAL_INPUT_LENGTH 一般输入框长度限制
 * @params CODE_INPUT_LENGTH 编码长度
 */
export const FORM_CHECK_RULES = {
  NORMAL_INPUT_LENGTH: 32,
  CODE_INPUT_LENGTH: 16,
};

// web前缀
export const webPrefixUrl = import.meta.env.VITE_WEB_PUBLIC_PATH || '/energy/ems/ems-container/';

// 菜单icon
export const getMenuIcon = (markId: number) => {
  let iconClassName = '';
  switch (markId) {
    case 1:
      iconClassName = 'icon-qiyemenhu';
      break;
    case 2:
      iconClassName = 'icon-35gaojingguize';
      break;
    case 3:
      iconClassName = 'icon-moxingshu';
      break;
    case 4:
      iconClassName = 'icon-yichangtiaojianshezhi';
      break;
    case 5:
      iconClassName = 'icon-library';
      break;
    case 6:
      iconClassName = 'icon-guanlianguize';
      break;
    case 7:
      iconClassName = 'icon-fengongsinenghaoduibiaofenxi';
      break;
    case 8:
      iconClassName = 'icon-huanjingjiance';
      break;
    default:
      iconClassName = 'icon-qiyemenhu';
      break;
  }
  return iconClassName;
};

export const FORBIDDEN_CODE = 401;

// 时间选择器自定义图标
export const customPrefix = shallowRef({
  render() {
    return h('p', { class: 'iconfont icon-Calendar' }, '');
  },
});

export const customClose = shallowRef({
  render() {
    return h('i', { class: 'iconfont icon-Close-Circle-Fill' }, '');
  },
});
