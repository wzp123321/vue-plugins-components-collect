export const uuid = () => {
  let d = Date.now();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // r 恒为 [0, 16) 内的整数：`% 16 | 0` 等价于 Math.trunc，`r & 0x3` 等价于 r % 4，`| 0x8` 等价于 +8
    const r = Math.trunc((d + Math.random() * 16) % 16);
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r % 4) + 8).toString(16);
  });
}