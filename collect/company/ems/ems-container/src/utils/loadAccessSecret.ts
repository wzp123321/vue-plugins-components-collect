import { getCurrentDomain, FSetSessionStorageData } from './index';

const BASE_URL = import.meta.env.VITE_PUBLIC_PATH;

/**
 * 读取energy-ems配置文件
 */
export const loadAccessSecretConfigure = () => {
  return new Promise((resolve) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `${getCurrentDomain()}${BASE_URL}energy-ems`, true);
    xhr.send(null);
    xhr.onload = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        if (!xhr.responseText) {
          FSetSessionStorageData('energy-ems-access-secret', '');
          resolve('');
          return;
        }
        try {
          const dataJSON = JSON.parse(xhr.responseText);
          if (dataJSON && dataJSON.hasOwnProperty('data')) {
            FSetSessionStorageData('energy-ems-access-secret', dataJSON?.data);
            resolve(dataJSON?.data);
          } else {
            FSetSessionStorageData('energy-ems-access-secret', '');
            resolve('');
          }
        } catch (error) {
          FSetSessionStorageData('energy-ems-access-secret', '');
          resolve('');
        }
      } else {
        FSetSessionStorageData('energy-ems-access-secret', '');
        resolve('');
      }
    };
  });
};
