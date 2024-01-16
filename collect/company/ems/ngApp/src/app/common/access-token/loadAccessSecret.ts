/**
 * 读取energy-ems配置文件
 */
export const loadAccessSecretConfigure = () => {
  return new Promise((resolve) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'assets/data/energy-ems', true);
    xhr.send(null);
    xhr.onload = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        if (!xhr.responseText) {
          resolve('');
          FSetCookie('energy-ems-access-secret', '');
          return;
        }
        try {
          const dataJSON = JSON.parse(xhr.responseText);
          if (dataJSON && dataJSON.hasOwnProperty('data')) {
            FSetCookie('energy-ems-access-secret', dataJSON?.data);
            resolve(dataJSON?.data);
          } else {
            FSetCookie('energy-ems-access-secret', '');
            resolve('');
          }
        } catch (error) {
          FSetCookie('energy-ems-access-secret', '');
          resolve('');
        }
      } else {
        FSetCookie('energy-ems-access-secret', '');
        resolve('');
      }
    };
  });
};

// 存入cookie
export function FSetCookie(key: string, value?: string): void {
  if (!key) {
    return;
  }

  // 先置空
  document.cookie = `${key.toLowerCase()}=${encodeURIComponent('')};path=/`;

  document.cookie = `${key.toLowerCase()}=${encodeURIComponent(
    value ?? ''
  )};path=/`;
}
