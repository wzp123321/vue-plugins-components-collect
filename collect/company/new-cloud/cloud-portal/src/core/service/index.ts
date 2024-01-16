import axios from 'axios';
/**
 * 查询服务器时间
 * @returns
 */
export const getServerTime = async () => {
  const url = '/common/system/time';
  const res = await axios.post(url, {});
  return res;
};
