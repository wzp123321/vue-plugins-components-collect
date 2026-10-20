/*
 * @Author: 钱胜华 qiansh@tiansu-china.com
 * @Date: 2024-02-02 17:20:13
 * @LastEditors: 钱胜华 qiansh@tiansu-china.com
 * @LastEditTime: 2024-03-04 15:56:56
 * @FilePath: \ts-web-package\packages\components\lib\te-date-switch\index.ts
 * @Description: 导出日期选择器
 */

import TeDateSwitch from "./src/index.vue";
import type { DateSwitchProps } from "./src/type";

TeDateSwitch.install = (app: any) => {
  app.component("te-date-switch", TeDateSwitch);
};
export { TeDateSwitch, DateSwitchProps };
