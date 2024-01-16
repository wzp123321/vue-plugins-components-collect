import axios from 'axios';
interface ICheckTokenParams {
  token: string;
}

/**
 * 查询服务器时间
 * @returns
 */
export const getServerTime = async () => {
  const url = '/common/system/time';
  const res = await axios.post(url, {});
  return res;
};

/**
 * 查询服务器时间
 * @returns
 */
export const checkTokenInterval = async (params: ICheckTokenParams) => {
  const url = '/keepAlive';
  const res = await axios.post(url, params);
  return res;
};
