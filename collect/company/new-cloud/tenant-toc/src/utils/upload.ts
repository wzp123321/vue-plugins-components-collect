import Deffer from '@/utils/index';
/**
 * 文件上传
 * @param file 文件
 * @param accept 支持的后缀名
 * @returns 下载地址
 */
export const onFileUpload = async (file: File): Promise<string> => {
  const deffer = new Deffer();
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (res) => {
    deffer.resolve(res.target?.result);
  };
  return deffer.promise;
};
