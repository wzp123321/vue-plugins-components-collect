/*
 * @Author: wanzp wanzp@tiansu-china.com
 * @Date: 2022-01-02 17:57:26
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2022-05-10 10:11:40
 * @FilePath: \iot-ems-web\ems-container\src\views\pages\energy-balance\utils.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// utils

// 生成样式、事件
const iconStateStyles: { [key: string]: any } = {};
const iconEvents: { [key: string]: any } = {};
const iconTypes = ['negative', 'difference', 'increase', 'decrease', 'unauthorized'];
iconTypes.forEach(ele => {
  iconStateStyles[`mouseover:${ele}`] = {
    [`icon-${ele}-tooltip-arrow`]: {
      opacity: 0.85,
    },
    [`icon-${ele}-tooltip-rect`]: {
      opacity: 0.85,
      stroke: 'rgba(0, 0, 0, .65)',
    },
    [`icon-${ele}-tooltip-text`]: {
      opacity: 0.85,
    },
  };
  iconEvents[`icon-${ele}-bg:mouseover`] = 'onMouseover';
  iconEvents[`icon-${ele}:mouseover`] = 'onMouseover';
  iconEvents[`icon-${ele}-bg:mouseout`] = 'onMouseout';
  iconEvents[`icon-${ele}:mouseout`] = 'onMouseout';
});
const textStateStyles: { [key: string]: any } = {};
const textEvents: { [key: string]: any } = {};
const textTypes = ['title', 'value1', 'value2', 'mark1', 'mark2'];
textTypes.forEach(ele => {
  textStateStyles[`mouseover:${ele}`] = {
    [`text-${ele}-tooltip-arrow`]: {
      opacity: 0.85,
    },
    [`text-${ele}-tooltip-rect`]: {
      opacity: 0.85,
      stroke: 'rgba(0, 0, 0, 0.65)',
    },
    [`text-${ele}-tooltip-text`]: {
      opacity: 0.85,
    },
  };
  textEvents[`text-${ele}:mouseover`] = 'onMouseover';
  textEvents[`text-${ele}:mouseout`] = 'onMouseout';
});

export default {
  iconStateStyles,
  iconEvents,
  textStateStyles,
  textEvents,
};
