/*
 * @Author: wzp123321 wanzhipengx@163.com
 * @Date: 2024-01-20 14:51:57
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2025-01-24 09:53:34
 * @FilePath: \vue-plugins-components-collect\src\utils\refresh-token.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios';
import { storeToRefs } from 'pinia';
import useUserInfoStore from '../store/modules/user';

const service = axios.create({
  timeout: 5000,
});

let tokenUpdating = false;
let reqLists: any = [];

service.interceptors.request.use(
  (config) => {
    const userInfoStore = useUserInfoStore(),
      { auth } = storeToRefs(userInfoStore);
    if (config && config.headers) {
      auth && (config.headers.auth = auth.value);
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

service.interceptors.response.use(
  async (res) => {
    const { status } = res.data,
      { url, method, params } = res.config;

    if (status === 456) {
      const reqConfig = { url, method, params };

      if (tokenUpdating === true) {
        return new Promise((resolve) => {
          const findRepeat = reqLists.findIndex((val: any) => JSON.stringify(val) === JSON.stringify(reqConfig));
          if (findRepeat === -1) reqLists.push(reqConfig);
          resolve(service(reqConfig));
        });
      } else {
        tokenUpdating = true;
        const uid = 6666,
          { status } = await service({
            url: `/api/update/token`,
            params: { uid },
          }),
          userInfoStore = useUserInfoStore();

        if (status === 200) {
          userInfoStore.$patch(() => {
            // state.auth = message;
          });
        } else {
          userInfoStore.$reset();
        }
        reqLists.forEach((it: any) => service(it));
        reqLists = [];
        tokenUpdating = false;

        return service(reqConfig);
      }
    }

    return res.data;
  },
  (error) => {
    Promise.reject(error);
  },
);
