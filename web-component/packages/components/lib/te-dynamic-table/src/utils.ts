/*
 * @Author: 钱胜华 qiansh@tiansu-china.com
 * @Date: 2024-02-28 11:19:00
 * @LastEditors: 钱胜华 qiansh@tiansu-china.com
 * @LastEditTime: 2024-02-28 13:58:56
 * @FilePath: \nts-eam-front\src\components\te-dynamic-table\src\utils.ts
 * @Description: 动态表格工具函数
 */
// 获取唯一标识，用于给表格设置专属id
export const getUUID = (length: number) =>
  Number(Math.random().toString().substr(2, length) + Date.now()).toString(36);
