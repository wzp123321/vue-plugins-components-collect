import { App } from 'vue';
import { INPUT_TYPES } from '@/config/enum';

let time = 0;

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
const handleSearchInput = (el: any, allowSpace: boolean, regularStr?: string) => {
  const ele: any =
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? el
      : el.querySelector('input') || el.querySelector('textarea');
  /**
   * 输入事件
   */
  const handleInput = (e: InputEvent) => {
    if (Math.abs(time - new Date().getTime()) < 1) {
      return;
    }
    time = new Date().getTime();
    // 是否在剪切板
    if (e.isComposing) {
      return;
    }
    const characters: string = '';
    let defaultStr = String.raw`\`\\;\'\"<>`;
    if (regularStr) {
      defaultStr = regularStr;
    }
    const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
    //console.log(regularStr, allowSpace);
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
 * @param negative 是否允许负数
 */
const handleNumberInput = (el: any, integral: number, decimal: number, negative: boolean = false) => {
  const ele: any =
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? el
      : el.querySelector('input') || el.querySelector('textarea');
  const handleInput = (e: InputEvent) => {
    if (new Date().getTime() - time < 5) {
      return;
    }
    time = new Date().getTime();
    if (e.isComposing) {
      return;
    }
    const regexp = new RegExp(String.raw`[^0-9${Math.ceil(decimal ?? 0) > 0 ? '.' : ''}${negative ? '-' : ''}]`, 'g');
    ele.value = ele.value.replace(regexp, '');

    let symbol = '';
    // 处理符号
    if (ele.value.substring(0, 1) === '-') {
      symbol = '-';
      ele.value = ele.value.substring(1);
    }
    ele.value = ele.value.replace(/[^0-9\.]/g, '');

    // 处理首位小数点
    if (ele.value.substring(0, 1) === '.') {
      ele.value = `0${ele.value}`;
    }

    // 禁止头部连续输入0
    if (ele.value.length > 1 && ele.value.substring(0, 1) === '0' && ele.value.substring(1, 2) !== '.') {
      ele.value = ele.value.substring(1);
    }

    // 处理小数点及小数位数
    if (ele.value.includes('.')) {
      ele.value = deduplicate(ele.value, '.');
      const temp = ele.value.split('.');
      ele.value = `${temp[0]}.${temp[1]?.substring(0, Math.ceil(decimal ?? 0) > 0 ? Math.ceil(decimal) : null) ?? ''}`;
    }

    // 处理头部多余的0
    if (ele.value.length > 1) {
      ele.value = ele.value.replace(/^0+(?!\.)/, '');
    }

    // 限制整数长度
    const temp = ele.value.split('.');
    temp[0] = temp[0].substring(0, Math.ceil(integral ?? 10));
    ele.value = temp.length === 2 ? `${symbol}${temp[0]}.${temp[1]}` : `${symbol}${temp[0]}`;
    ele.value = ele.value.trim();

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
 * @param maxValue 最大值
 */
const handlePositiveNumberInput = (
  el: any,
  integral: number,
  positiveInteger: boolean = false,
  maxValue: number | null,
) => {
  const ele: any =
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? el
      : el.querySelector('input') || el.querySelector('textarea');
  // 处理输入框
  const handleInput = (e: InputEvent) => {
    if (new Date().getTime() - time < 1) {
      return;
    }
    // 是否在剪切板
    if (e.isComposing) {
      return;
    }
    time = new Date().getTime();
    ele.value = ele.value.replace(/\D+/g, '');
    if (ele.value.length > 1 && ele.value.substring(0, 1) === '0') {
      ele.value = ele.value.substring(1);
    }
    if (positiveInteger && ele.value.substring(0, 1) === '0') {
      ele.value = ele.value.replace(/[^1-9]/g, '');
    }
    // 限制最大值
    if (maxValue !== null && !isNaN(ele.value) && Number(ele.value) > maxValue) {
      ele.value = String(maxValue);
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

/**
 * 处理自然数 可输入0
 * @param el 当前绑定对象
 * @param integral 最大整数位
 */
const handleProcessIntegerInput = (el: any, integral: number) => {
  const ele: any =
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? el
      : el.querySelector('input') || el.querySelector('textarea');
  // 处理输入框
  const handleInput = (e: InputEvent) => {
    if (new Date().getTime() - time < 5) {
      return;
    }
    // 是否在剪切板
    if (e.isComposing) {
      return;
    }
    time = new Date().getTime();
    ele.value = ele.value.replace(/\D+/g, '');
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

/**
 * 输入的值 [0, 100],可输入最大值限制
 * @param el 当前绑定对象
 * @param integral 最大整数位
 * @param decimal 最大小数位
 */
const handleHundredNumberInput = (el: any, integral: number, decimal: number, maxValue: number | null) => {
  const ele: any =
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      ? el
      : el.querySelector('input') || el.querySelector('textarea');
  const handleInput = (e: InputEvent) => {
    if (new Date().getTime() - time < 1) {
      return;
    }
    time = new Date().getTime();
    if (e.isComposing) {
      return;
    }
    ele.value = ele.value.replace(/[^0-9\.]/g, '');
    // 当输入的值大于 最大值禁止输入
    if (maxValue !== null && ele.value > maxValue && ele.value.length > String(maxValue).length) {
      ele.value = ele.value.substring(0, 3);
    }
    if (maxValue !== null && ele.value > maxValue && ele.value.length === String(maxValue).length) {
      ele.value = ele.value.substring(0, 2);
    }
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

const vInputFilter = (app: App) => {
  app.directive('inputFilter', {
    mounted(el, binding) {
      const type = binding.arg;
      const allowSpace =
        binding.value && Object.prototype.toString.call(binding.value.allowSpace) === '[object Boolean]'
          ? binding.value.allowSpace
          : true;
      const regularStr =
        binding.value && Object.prototype.toString.call(binding.value.regularStr) === '[object String]'
          ? binding.value.regularStr
          : '';
      const integral = binding.value && binding.value.integral ? binding.value.integral : 10;
      const decimal = binding.value && binding.value.decimal ? binding.value.decimal : 4;
      const negative =
        binding.value && Object.prototype.toString.call(binding.value.negative) === '[object Boolean]'
          ? binding.value.negative
          : true;
      // 是否都为正数
      const positiveInteger = binding.value && binding.value.positiveInteger ? binding.value.positiveInteger : false;
      // 最大值
      const maxValue = binding.value && binding.value.maxValue ? Number(binding.value.maxValue) : null;
      // 普通搜索框
      switch (type) {
        case INPUT_TYPES.SEARCH_INPUT:
          handleSearchInput(el, allowSpace, regularStr);
          break;
        case INPUT_TYPES.NUMBER_INPUT:
          handleNumberInput(el, integral, decimal, negative);
          break;
        // 正整数
        case INPUT_TYPES.POSITIVE_INTEGER:
          handlePositiveNumberInput(el, integral, positiveInteger, maxValue);
          break;
        case INPUT_TYPES.NATURAL_NUMBER_INPUT:
          handleProcessIntegerInput(el, integral);
          break;
        case INPUT_TYPES.MAXVALUE_NUMBER_INPUT:
          handleHundredNumberInput(el, integral, decimal, maxValue);
          break;
      }
    },
  });
};

export default vInputFilter;
