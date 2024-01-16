import { App } from 'vue';
import { INPUT_TYPES } from '@/config/enum';

let time = 0;
const THROTTLE_COUNT = 5;

// 过滤连续.等特殊字符
const deduplicate = (target: string, symbol: string): string => {
  if (target.includes(symbol)) {
    const temp = target.split(symbol);
    let str = `${temp.shift() ?? ''}${symbol}`;
    temp.filter((v) => v).forEach((v) => (str += v));
    return str;
  }
  return target;
};

/**
 * 处理普通输入框
 * @param el 当前绑定对象
 */
const handleSearchInput = (el: any, allowSpace: boolean) => {
  const ele: any =
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? el
      : el.querySelector('input') || el.querySelector('textarea');
  /**
   * 输入事件
   */
  const handleInput = (e: InputEvent) => {
    if (Math.abs(time - new Date().getTime()) < THROTTLE_COUNT) {
      return;
    }
    time = new Date().getTime();
    // 是否在剪切板
    if (e.isComposing) {
      return;
    }
    const characters: string = '';
    const defaultStr = String.raw`\`\\;\'\"<>`;
    const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
    ele.value = ele.value.replace(reg, '');
    // 过滤空格
    if (!allowSpace) {
      ele.value = ele.value.replace(/\s+/g, '');
    }

    ele.dispatchEvent(new Event('input'));
  };
  ele.oninput = handleInput;
  ele.onblur = handleInput;
  // 解决输入中文的问题
  ele.addEventListener('compositionend', (e: InputEvent) => {
    handleInput(e);
  });
};

/**
 * 处理数字输入
 * @param el 当前绑定对象
 * @param integral 最大整数位
 * @param decimal 最大小数位
 */
const handleNumberInput = (el: any, integral: number, decimal: number, allowZero: boolean = true) => {
  const ele: any =
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? el
      : el.querySelector('input') || el.querySelector('textarea');
  const handleInput = (e: InputEvent) => {
    if (new Date().getTime() - time < THROTTLE_COUNT) {
      return;
    }
    time = new Date().getTime();
    if (e.isComposing) {
      return;
    }

    // 过滤中文
    ele.value = ele.value.replace(/[^\x00-\xff]/g, '');

    ele.value = ele.value.replace(/[^0-9\.]/g, '');
    // 处理首位小数点
    if (ele.value.substring(0, 1) === '.') {
      ele.value = `0${ele.value}`;
    }
    // 禁止头部连续输入0
    if (ele.value.length > 1 && ele.value.substring(0, 1) === '0' && ele.value.substring(1, 2) !== '.') {
      ele.value = ele.value.substring(1);
    }
    if (ele.value.indexOf('.') !== ele.value.lastIndexOf('.')) {
      ele.value = deduplicate(ele.value, '.');
    }
    // 不允许有0
    if (!allowZero && ele.value.startsWith('0')) {
      ele.value = ele.value.replace(/\b(0+)/gi, '');
    }

    if (ele.value.indexOf('.') !== -1) {
      const valueArr = ele.value.split('.');
      ele.value = `${valueArr[0].substring(0, integral)}.${valueArr[1].substring(0, decimal) || ''}`;
    } else {
      ele.value = ele.value.substring(0, integral);
    }
    ele.value = ele.value.trim();

    // 限制小数点后几位
    ele.value = ele.value.replace(`/^(\-)*(\d+)\.(\d{0,${decimal}}).*$/`, '$1$2.$3');

    ele.dispatchEvent(new Event('input'));
  };
  ele.oninput = handleInput;
  ele.onchange = handleInput;
  ele.onblur = handleInput;
  // 解决输入中文的问题
  ele.addEventListener('compositionend', (e: InputEvent) => {
    // 过滤中文
    ele.value = ele.value.replace(/[^\x00-\xff]/g, '');
    handleInput(e);
  });
};

/**
 * 处理整数 0-5位
 * @param el 当前绑定对象
 * @param integral 最大整数位
 * @param positiveInteger 判断是否需要大于0 默认不需要大于0
 */
const handlePositiveNumberInput = (el: any, integral: number, positiveInteger: boolean = false) => {
  const ele: any =
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? el
      : el.querySelector('input') || el.querySelector('textarea');
  // 处理输入框
  const handleInput = (e: InputEvent) => {
    if (new Date().getTime() - time < THROTTLE_COUNT) {
      return;
    }
    // 是否在剪切板
    if (e.isComposing) {
      return;
    }
    time = new Date().getTime();

    // 过滤中文
    ele.value = ele.value.replace(/[^\x00-\xff]/g, '');

    ele.value = ele.value.replace(/\D+/g, '');
    if (ele.value.length > 1 && ele.value.substring(0, 1) === '0') {
      ele.value = ele.value.substring(1);
    }
    if (positiveInteger && ele.value.substring(0, 1) === '0') {
      ele.value = ele.value.replace(/[^1-9]/g, '');
    }
    ele.value = ele.value.substring(0, integral);

    ele.dispatchEvent(new Event('input'));
  };
  ele.value = ele.value.trim();
  // 解决输入中文的问题
  ele.addEventListener('compositionend', (e: InputEvent) => {
    // 过滤中文
    ele.value = ele.value.replace(/[^\x00-\xff]/g, '');
    handleInput(e);
  });
  ele.oninput = handleInput;
  ele.onchange = handleInput;
  ele.onblur = handleInput;
};

const registerInputFilter = (app: App) => {
  app.directive('inputFilter', {
    mounted(el, binding) {
      const type = binding.arg;
      const allowSpace =
        binding.value && Object.prototype.toString.call(binding.value.allowSpace) === '[object Boolean]'
          ? binding.value.allowSpace
          : true;
      // 是否允许自然数
      const allowZero =
        binding.value && Object.prototype.toString.call(binding.value.allowZero) === '[object Boolean]'
          ? binding.value.allowZero
          : true;
      const integral = binding.value && binding.value.integral ? binding.value.integral : 10;
      const decimal = binding.value && binding.value.decimal ? binding.value.decimal : 4;
      const positiveInteger = binding.value && binding.value.positiveInteger ? binding.value.positiveInteger : false;
      // 普通搜索框
      switch (type) {
        case INPUT_TYPES.SEARCH_INPUT:
          handleSearchInput(el, allowSpace);
          break;
        case INPUT_TYPES.NUMBER_INPUT:
          handleNumberInput(el, integral, decimal, allowZero);
          break;
        case INPUT_TYPES.POSITIVE_INTEGER:
          handlePositiveNumberInput(el, integral, positiveInteger);
          break;
      }
    },
  });
};

export default registerInputFilter;
