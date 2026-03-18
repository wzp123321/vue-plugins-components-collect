// 声明一个数组用于存储每个请求的取消函数和axios标识
const pending: any = [];

/**
 * 判断有未完成的重复请求并取消,参数不一致则正常调用
 * @param config 请求配置参数
 */
const removePending = (config: any) => {
  pending.forEach((item: any, i: number) => {
    if (
      item.url === config.url &&
      JSON.stringify(item.data) === JSON.stringify(config.data)
    ) {
      item.f(); // 执行取消操作
      item.splice(i, 1); // 把pending记录删掉
    }
  });
};

export { pending, removePending };
