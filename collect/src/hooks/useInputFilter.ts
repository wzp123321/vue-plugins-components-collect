import { throttle } from 'lodash';

/**
 * 输入框过滤
 * @returns
 */
export const useInputFilter = () => {
  const addEventListener = (el: Element, event: string, handler: EventListener, options?: EventListenerOptions) => {
    el.addEventListener(event, handler, options);
  };
  /**
   * 过滤特殊符号
   */
  const filterSpecialSymbol = (label: string, allowSpace: boolean = false) => {
    const characters: string = '';
    const _default = String.raw`\`\\;\'\"<>`;
    const reg = new RegExp(String.raw`[${_default}${characters}]`, 'g');
    label = label.trim();
    if (!allowSpace) {
      label = label.replace(/\s+/g, '');
    }
    return label.replace(reg, '');
  };
  /**
   * 输入事件
   * @param e
   * @param maxLen
   * @returns
   */
  const handleInput = throttle(
    (e: Event, maxLen: number = 20) => {
      const inputEle = e.target as HTMLInputElement;
      // 是否在剪切板
      if ((e as any).isComposing) {
        return;
      }

      inputEle.value = filterSpecialSymbol(inputEle.value);
      inputEle.value = inputEle.value.substring(0, maxLen);
      inputEle.dispatchEvent(new Event('input'));
    },
    2,
    {
      leading: true,
      trailing: false,
    },
  );
  /**
   * 绑定事件
   * @param {HTMLElement} target
   * @param {number} maxLen
   */
  const addInputFilter = (target: HTMLElement, maxLen: number = 20) => {
    addEventListener(target, 'input', ($event) => handleInput($event, maxLen));
    addEventListener(target, 'onblur', ($event) => handleInput($event, maxLen));
    addEventListener(target, 'compositionend', ($event) => handleInput($event, maxLen));
  };
  return {
    filterSpecialSymbol,
    addInputFilter,
  };
};

// 可参考
/**
 * 
 * import { DirectiveBinding } from 'vue';

const numberFilter = {
  mounted(el: HTMLInputElement, binding: DirectiveBinding) {
    const {
      allowNegative = false,
      allowZero = true,
      integerDigits = 10,
      decimalDigits = 2,
      maxValue = Number.MAX_SAFE_INTEGER,
      minValue = Number.MIN_SAFE_INTEGER,
    } = binding.value || {};

    el.addEventListener('input', (event: Event) => {
      const input = event.target as HTMLInputElement;
      let value = input.value;

      // 过滤非数字字符
      value = value.replace(/[^0-9.-]/g, '');

      // 处理负数
      if (!allowNegative) {
        value = value.replace(/-/g, '');
      } else if (value.startsWith('-')) {
        value = '-' + value.replace(/-/g, '');
      }

      // 处理小数点
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }

      // 限制整数位和小数位
      if (parts[0].length > integerDigits) {
        parts[0] = parts[0].slice(0, integerDigits);
      }
      if (parts[1] && parts[1].length > decimalDigits) {
        parts[1] = parts[1].slice(0, decimalDigits);
      }
      value = parts.join('.');

      // 处理最小值
      if (parseFloat(value) < minValue) {
        value = minValue.toString();
      }

      // 处理最大值
      if (parseFloat(value) > maxValue) {
        value = maxValue.toString();
      }

      // 处理是否允许为0
      if (!allowZero && parseFloat(value) === 0) {
        value = '';
      }

      input.value = value;
    });
  },
};

export default numberFilter;
 */
