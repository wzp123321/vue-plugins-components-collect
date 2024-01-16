import axios from 'axios';
import { useStore } from 'vuex';
import Deffer from '@/utils/index';
import gateWayConfig from '@/config/request';
import { useCommonController } from '@/utils/use-common-controller';

/**
 * 获取文件后缀名
 * @param file 文件
 * @returns 后缀名
 */
export const getFileExtension = (file: File) => {
  const name = file.name;
  const arr = name.split('.');
  return arr[arr.length - 1];
};

/**
 * 文件上传
 * @param file 文件
 * @param accept 支持的后缀名
 * @returns 下载地址
 */
export const onFileUpload = async (file: File, accept: string): Promise<string> => {
  const { proxy } = useCommonController();

  const deffer = new Deffer();
  const extension = getFileExtension(file);
  console.log(extension, 'extension');
  if (accept && accept.indexOf(extension) === -1) {
    proxy.$message.warning('暂不支持当前后缀名文件！');
    return Promise.reject('暂不支持当前后缀名文件！');
  }
  // const tenantCode = getTenantCode();
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (res) => {
    deffer.resolve(res.target?.result);
  };
  // reader.onloadstart =  () {
  //     console.log('图片正在上传处理......');
  // };
  // const res = await axios({
  //     method: 'POST',
  //     url: `${gateWayConfig.BASE_URL}/`,
  //     headers: {
  //         tenantCode,
  //         'content-type': 'multipart/form-data',
  //     },
  // });
  // if (res && res.status === 200) {
  //     deffer.resolve(res);
  // }
  return deffer.promise;
};
