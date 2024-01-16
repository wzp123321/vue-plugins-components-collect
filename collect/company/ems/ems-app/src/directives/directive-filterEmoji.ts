// 过滤表情指令
let time = 0;

export const vFilterEmoji = {
  beforeUpdate(el: HTMLElement) {
    const ele: HTMLInputElement =
      el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
        ? (el as HTMLInputElement)
        : ((el.querySelector('input') || el.querySelector('textarea')) as HTMLInputElement);

    // 处理输入框
    const handleInput = (e: any) => {
      if (new Date().getTime() - time < 5) {
        return;
      }
      // 是否在剪切板
      if (e.isComposing) {
        return;
      }
      time = new Date().getTime();
      // 过滤表情
      const emojiReg = new RegExp(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/, 'g');
      ele.value = ele.value.replace(emojiReg, '');
      // 过滤特殊符号
      const characters: string = '';
      const defaultStr = String.raw`\`\\;\'\"<>`;
      const specialReg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
      ele.value = ele.value.replace(specialReg, '');
      ele.dispatchEvent(new Event('input'));
    };

    if (ele) {
      ele.value = ele.value.trim();
      // 解决输入中文的问题
      ele.addEventListener('compositionend', (e: any) => {
        handleInput(e);
      });
      ele.oninput = handleInput;
      ele.onchange = handleInput;
      ele.onblur = handleInput;
    }
  },
};
