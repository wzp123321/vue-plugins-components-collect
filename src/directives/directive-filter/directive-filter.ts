/*
 * @Author: wanzp
 * @Date: 2023-04-18 20:48:05
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-25 22:41:46
 * @Description:
 */
import { App, DirectiveBinding } from 'vue';
import { EDirectiveType, IDirectiveTextBindingVO, IDirectiveNumberBindingVO } from './directive-filter.api';
import { getModelAssigner, addEventListener, deduplicate, looseToNumber } from './directive-filter.utils';

/**
 * 过滤文本
 * @param domValue 文本内容
 * @param binding 指令传参
 * @returns
 */
function handleTextFilter(domValue: string, binding: DirectiveBinding<IDirectiveTextBindingVO>) {
  const regExp = binding?.value?.regExp;
  const allowSpace =
    Object.prototype.toString.call(binding?.value?.allowSpace) === '[object Boolean]'
      ? binding?.value?.allowSpace
      : true;
  const allowChinese =
    Object.prototype.toString.call(binding?.value?.allowChinese) === '[object Boolean]'
      ? binding?.value?.allowChinese
      : true;

  const characters: string = '';
  const defaultStr = String.raw`\`\\;\'\"<>`;
  const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
  domValue = domValue.replace(regExp && regExp instanceof RegExp ? regExp : reg, '');
  // 过滤空格
  if (!allowSpace) {
    domValue = domValue.replace(/\s+/g, '');
  }
  if (!allowChinese) {
    domValue = domValue.replace(/[^\x00-\xff]/g, '');
  }
  return domValue;
}

/**
 * 数字过滤
 * @param domValue 文本内容
 * @param binding 指令传参
 * @returns
 */
function handleNumberFilter(domValue: string, binding: DirectiveBinding<IDirectiveNumberBindingVO>) {
  const decimal = binding?.value?.decimal;
  const negative = binding?.value?.negative;
  const integral = binding?.value?.integral;
  const min = binding?.value?.min;
  const max = binding?.value?.max;
  const reg = new RegExp(String.raw`[^0-9${Math.ceil(decimal ?? 0) > 0 ? '.' : ''}${negative ? '-' : ''}]`, 'g');
  console.log('decimal------------------------------------------------------', decimal);
  console.log('negative-----------------------------------------------------', negative);
  console.log('integral-----------------------------------------------------', integral);
  domValue = domValue.replace(reg, '');
  let symbol = '';
  // 处理符号
  if (domValue.substring(0, 1) === '-') {
    symbol = '-';
    domValue = domValue.substring(1);
  }
  domValue = domValue.replace(/[^0-9\.]/g, '');

  // 处理首位小数点
  if (domValue.substring(0, 1) === '.') {
    domValue = `0${domValue}`;
  }

  // 禁止头部连续输入0
  if (domValue.length > 1 && domValue.substring(0, 1) === '0' && domValue.substring(1, 2) !== '.') {
    domValue = domValue.substring(1);
  }

  // 处理小数点及小数位数
  if (domValue.includes('.')) {
    domValue = deduplicate(domValue, '.');
    const temp = domValue.split('.');
    domValue = `${temp[0]}.${
      temp[1]?.substring(0, (Math.ceil(decimal ?? 0) > 0 ? Math.ceil(decimal) : null) as number) ?? ''
    }`;
  }

  // 处理头部多余的0
  if (domValue.length > 1) {
    domValue = domValue.replace(/^0+(?!\.)/, '');
  }

  // 限制整数长度
  const temp = domValue.split('.');
  temp[0] = temp[0].substring(0, Math.ceil(integral ?? 10));
  domValue = temp.length === 2 ? `${symbol}${temp[0]}.${temp[1]}` : `${symbol}${temp[0]}`;

  // 限制最大最小
  if (
    Object.prototype.toString.call(min) !== '[object Undefined]' &&
    Object.prototype.toString.call(min) !== '[object Null]' &&
    min &&
    domValue !== '' &&
    looseToNumber(domValue) < min
  ) {
    domValue = min + '';
  }
  if (
    Object.prototype.toString.call(max) !== '[object Undefined]' &&
    Object.prototype.toString.call(max) !== '[object Null]' &&
    max &&
    domValue !== '' &&
    looseToNumber(domValue) > max
  ) {
    domValue = max + '';
  }

  return domValue;
}

// https://www.bilibili.com/video/BV1td4y1r76e/?spm_id_from=333.337.search-card.all.click&vd_source=0f5e2a21dd6833ba3d8d41c10053181d
const registerInputFilter = (app: App) => {
  app.directive('inputFilter', {
    created(el, binding, vnode) {
      console.log('created-------------------', el, vnode);
      // https://juejin.cn/post/7115655868267364366
      // 通过 getModelAssigner 方法获取 props 中的 onUpdate:modelValue 属性对应的函数，赋值给 el._assign 属性；_assign可任意命名
      el._assign = getModelAssigner(vnode);
      const type = binding.arg;
      addEventListener(el, 'input', (e) => {
        if ((e.target as any).composing) return;
        let domValue: string = el.value;
        switch (type) {
          case EDirectiveType.文本:
            domValue = handleTextFilter(domValue, binding);
            break;
          case EDirectiveType.数字:
            domValue = handleNumberFilter(domValue, binding);
            break;
        }
        // 调用 el._assign 方法更新数据
        el._assign(domValue);
      });
    },
    beforeMount(el, binding) {
      console.log('beforeMount----------------------------------------');
    },
    mounted(el, binding) {
      console.log('mounted----------------------------------------');
      const type = binding.arg;
      let domValue: string = el.value;
      switch (type) {
        case EDirectiveType.文本:
          domValue = handleTextFilter(domValue, binding);
          break;
        case EDirectiveType.数字:
          domValue = handleNumberFilter(domValue, binding);
          break;
      }
      el.value = domValue;
    },
    beforeUpdate(el, binding, vnode) {
      console.log('beforeUpdate-----------', el, binding, vnode, binding?.instance as any);
      // https://juejin.cn/post/7115655868267364366
      // 通过 getModelAssigner 方法获取 props 中的 onUpdate:modelValue 属性对应的函数，赋值给 el._assign 属性；_assign可任意命名
      el._assign = getModelAssigner(vnode);
      const type = binding.arg;
      addEventListener(el, 'input', (e) => {
        if ((e.target as any).composing) return;
        let domValue: string = el.value;
        switch (type) {
          case EDirectiveType.文本:
            domValue = handleTextFilter(domValue, binding);
            break;
          case EDirectiveType.数字:
            domValue = handleNumberFilter(domValue, binding);
            break;
        }
        // 调用 el._assign 方法更新数据
        el._assign(domValue);
      });
    },
    updated(el, binding) {
      console.log('updated---el, binding----------------------', el, binding);
    },
    beforeUnmount(el, binding) {
      console.log('beforeUnmount---el, binding----------------------', el, binding);
    },
    unmounted(el, binding) {
      console.log('unmounted---el, binding----------------------', el, binding);
    },
    deep: false,
  });
};

export default registerInputFilter;
