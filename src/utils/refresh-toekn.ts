/*
 * @Author: wzp123321 wanzhipengx@163.com
 * @Date: 2024-01-20 14:51:57
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2025-01-24 09:53:34
 * @FilePath: \vue-plugins-components-collect\src\utils\refresh-toekn.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios';
import { storeToRefs } from 'pinia';
import useUserInfoStore from '../store/modules/user';

// 创建一个 axios 实例
const service = axios.create({
  timeout: 5000,
});

let tokenUpdating = false; //token是否处于更新中
let reqLists: any = []; //更新token时请求的队列

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 带上token发起请求
    const userInfoStore = useUserInfoStore(),
      { auth } = storeToRefs(userInfoStore);
    if (config && config.headers) {
      auth && (config.headers.auth = auth.value);
    }
    return config;
  },
  (error) => {
    // return error
    Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  async (res) => {
    const { status } = res.data,
      { url, method, params } = res.config;

    // token过期
    if (status === 456) {
      const reqConfig = { url, method, params };

      //  更新token中，先将请求配置push到reqLists，token更新完成后再重新发起请求
      if (tokenUpdating === true) {
        //token更新中，将请求挂起
        return new Promise((resolve) => {
          // token更新中，push请求 ，不push相同的请求
          const findRepeat = reqLists.findIndex((val: any) => JSON.stringify(val) === JSON.stringify(reqConfig));

          if (findRepeat === -1) reqLists.push(reqConfig);

          resolve(service(reqConfig));
        });

        // 开始更新token
      } else {
        tokenUpdating = true;
        const uid = 6666, //用户id
          { status } = await service({
            //向后端请求新token
            url: `/api/update/token`,
            params: {
              uid,
            },
          }),
          userInfoStore = useUserInfoStore(); //重点：pinia仓库，作用：存储token

        // token请求成功
        if (status === 200) {
          // 请求成功，更新token到pinia
          userInfoStore.$patch(() => {
            // state.auth = message;
          });
        } else {
          // token更新失败，重置pinia仓库
          userInfoStore.$reset();
        }
        //token更新完成 ——> 重新发起请求
        reqLists.forEach((it: any) => service(it));
        reqLists = []; //清空请求队列
        tokenUpdating = false; //关闭token更新

        // 重新发起请求
        return service(reqConfig);
      }
    }

    return res.data;
  },
  (error) => {
    Promise.reject(error);
  },
);

export default service;
