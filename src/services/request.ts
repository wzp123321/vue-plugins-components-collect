import axios from 'axios';

// 请求实例
const publicReq = async (params: { [key: string]: any }) => {
  const { url, method, param, options } = params;
  return await axios({
    url,
    method,
    ...options,
    [method === 'post' ? 'data' : 'params']: param,
  })
    .then((res: any) => {
      if (res) {
        return res?.data?.size
          ? res?.data
          : {
              code: Number(res?.data?.errcode) || res?.data?.code,
              message: res?.data?.errmsg || res?.data?.message,
              data: res?.data?.data,
              success: res?.data?.success,
            };
      }
    })
    .catch((e) => {
      console.log('%c✨✨publicReq✨✨', 'font-size: 24px', e);
      return e?.data?.size
        ? e?.data
        : {
            code: e?.data?.errcode === '4f000002' || e?.data?.errcode === '401' ? '4f000002' : e?.data?.errcode,
            message: e?.data?.errmsg,
          };
    });
};

// 请求超时函数
const timeoutfn = (delay: number, url: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`请求超时--${url}`);
    }, delay);
  });
};

// 单个请求 存在请求超时
export async function req(params: { [key: string]: any }, delay = 60 * 1000) {
  try {
    const response: any = await Promise.race([timeoutfn(delay, params.url), publicReq(params)]);
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}

// GET request
export async function getRequest(url: string, param?: { [key: string]: any }) {
  try {
    const response = await req({
      url,
      method: 'get',
      param,
    });
    return response;
  } catch (err) {
    return Promise.reject(err);
  }
}

// POST request
export async function postRequest(
  url: string,
  param?: { [key: string]: any } | number | string,
  options?: { [key: string]: string },
) {
  try {
    const response = await req({
      url,
      method: 'post',
      param,
      options,
    });
    return response;
  } catch (err) {
    return Promise.reject(err);
  }
}
