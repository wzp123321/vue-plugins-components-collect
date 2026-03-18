import { MenuItem, TreeNode } from '@/apis/types';
import { useCommonStore } from '@/store/common';
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';
import GatewayUtil from './safe/GatewayUtil';

/**
 * @param envStr 环境变量key
 *
 * @returns 环境变量value
 */
export function getEnvValue(envStr: string): string {
  const env = import.meta.env ? import.meta.env[envStr] : '';
  return env;
}

/**
 * @param key 获取路径参数
 * @returns 参数值
 */
export const getUrlParam = (key: string): string => {
  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) {
    return '';
  }
  const val = params.get(key);
  return val ?? '';
};

/**
 * 递归遍历
 */
export const traverseTree = (
  data: Array<TreeNode<MenuItem>>,
): Array<string> => {
  const componentNames: Array<string> = [];
  function loop(list: Array<TreeNode<MenuItem>>) {
    list.forEach((item: TreeNode<MenuItem>) => {
      if (item.children) {
        loop(item.children);
      }
      componentNames.push(item.name);
    });
  }
  loop(data);
  return componentNames;
};

// 扩展映射文件类型
export const mapFileType = (str: string) => {
  const ext = str.split('.').pop()?.toLocaleLowerCase() ?? '';
  const fileTypeMap = {
    img: 'jpg,jpeg,png',
    video: 'mp4',
    pdf: 'pdf',
    ppt: 'ppt,pptx',
    word: 'doc,docx',
    excel: 'xls,xlsx',
  };
  const fileType = Object.entries(fileTypeMap).find(([, val]) =>
    val.includes(ext),
  );
  return fileType ? fileType[0] : '';
};

// 获取请求头
export const getRequestHeader = () => {
  const userStore = useUserStore();
  const commonStore = useCommonStore();
  const { userInfo } = storeToRefs(userStore);
  const { selectRegion } = storeToRefs(commonStore);
  console.log(getUrlParam('appId'));
  const instanceId = getUrlParam('appId') || localStorage.getItem('appId');
  console.log(userInfo.value.token, instanceId);
  return {
    'ts-token': userInfo.value.token,
    'campus-id': selectRegion.value[0]?.id,
    'access-token': GatewayUtil.buildClientAccessToken(),
    'app-id': getEnvValue('VITE_APP_ID'),
    'x-requested-with': 'XMLHttpRequest',
    'trace-id': GatewayUtil.uuid32(),
    'instance-id': 'elderlyCare',
    'ts-forward-for': '345',
  };
};
