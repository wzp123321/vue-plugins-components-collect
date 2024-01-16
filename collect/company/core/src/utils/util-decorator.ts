/**
 * 构造函数及原型密封装饰器
 * @param target 目标类/构造函数
 */
export function FSealDecorator(target: Function): void {
  Object.seal(target);
  Object.seal(target.prototype);
}
