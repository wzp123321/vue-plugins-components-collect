/*
 * @Author: 贾文超 jiawc@tiansu-china.com
 * @Date: 2024-04-13 15:56:13
 * @LastEditors: 贾文超 jiawc@tiansu-china.com
 * @LastEditTime: 2024-04-13 15:56:13
 * @FilePath: /ts-web-package/packages/components/lib/te-drag-area/index.ts
 * @Description: 导出日期选择器
 */

import TeLayoutDrag from "./src/index.vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
TeLayoutDrag.install = (app: any) => {
	app.component("te-layout-drag", TeLayoutDrag);
};
export { TeLayoutDrag };
