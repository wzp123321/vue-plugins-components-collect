import { message } from 'ant-design-vue';
import axios from 'axios';
import { Ref } from 'vue';

export const useFileExport = () => {
  /**
   * 处理json响应结果
   */
  const mapUploadError = (type: string, res: Blob) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const errRes = JSON.parse(e.target?.result as string);
      if (errRes?.errmsg && typeof errRes?.errmsg === 'string' && +errRes?.errcode !== 401) {
        console.log(`%c✨✨${type}失败✨✨', 'font-size: 24px`, errRes?.errmsg);
        message.error(`${type}失败，${errRes?.errmsg}`);
      }
    };
    reader.readAsText(res);
  };
  /**
   * 文件下载处理
   * @param url 源路径
   * @param name 输出文件名
   */
  const useFileDownLoadHandler = (url: string, name?: string) =>
    new Promise((resolve, reject) => {
      if (url) {
        const element = document.createElement('a');
        element.href = url;
        if (name) {
          element.download = name;
        }
        element.click();
        element.remove();
        resolve(true);
      } else {
        reject(new Error(`无法下载${name || '文件'}`));
      }
    });
  /**
   * 二进制响应处理
   * @param blob 二进制流
   * @param name 输出文件名
   */
  const useFileBlobHandler = (blob: Blob, name?: string) =>
    new Promise((resolve, reject) => {
      if (blob.size) {
        const reader = new FileReader();

        if (blob.type.includes('json')) {
          reader.onloadend = (e) => {
            const res = JSON.parse(e.target?.result as string);
            reject(res?.message ?? '未知原因');
          };
          reader.readAsText(blob);
        } else {
          reader.onloadend = (e) => {
            useFileDownLoadHandler(e.target?.result as string, name)
              .then(() => resolve(true))
              .catch((error) => reject(error));
          };
          reader.readAsDataURL(blob);
        }
      } else {
        reject(new Error(`无法获取${name || '文件'}`));
      }
    });

  const handleFileExport = async (
    loading: Ref<boolean>,
    path: string,
    type: string,
    params?: { [key: string]: any },
  ) => {
    if (loading.value) {
      return;
    }
    loading.value = true;
    message.loading(`正在${type}`);
    try {
      const res = await axios.post(path, params, {
        responseType: 'blob',
      });
      const symbol = Object.getOwnPropertySymbols(res)[0];
      const name = symbol ? (res as any)[symbol] : '数据导出表.xlsx';
      // 如果是json
      if (res.data?.size && res.data?.type.includes('json')) {
        mapUploadError(type, res.data);
        return false;
      }
      await useFileBlobHandler(res.data, name);
      message.success(`${type}成功`);
      return true;
    } catch (error) {
      if (error && (error as any).data) {
        mapUploadError(type, (error as any).data);
      } else {
        message.error(`${type}失败`);
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    handleFileExport,
    useFileDownLoadHandler,
    useFileBlobHandler,
  };
};
