import message from '@/utils/message';
// 校验文件
export const verifyUpload = (
  list: File[],
  target: File,
  maxSize: number,
  accept: { [key: string]: string },
  total: number,
): boolean => {
  if (target?.size > maxSize * 1024 * 1024) {
    message.error(`上传${target?.name ?? ''}失败，文件大小不能超过${maxSize}MB！`);
    return false;
  }

  const suffix = target?.name?.substring(target?.name?.lastIndexOf('.'));
  if (!Object.keys(accept).includes(suffix)) {
    message.error(`上传${target?.name ?? ''}失败，当前页面只支持上传${Object.keys(accept).join('/')}格式文件！`);
    return false;
  }

  if (list.map((file) => file.name).includes(target?.name)) {
    message.error(`上传${target?.name ?? ''}失败，已存在同名文件，请修改文件名称重新上传！`);
    return false;
  }

  let totalSize = list.reduce((total: number, currentValue: File) => {
    return total + currentValue.size;
  }, 0);

  totalSize += target.size;
  if (totalSize > total * 1024 * 1024) {
    message.error(`上传${target?.name ?? ''}失败，待上传附件总大小不能超过${total}MB！`);
    return false;
  }

  return true;
};
