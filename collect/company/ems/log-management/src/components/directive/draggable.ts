import { App } from 'vue';

const registrDrag = (app: App) => {

  /**
   * 弹框initial值 用于重置
   */
  let initailMarginLeft = '';
  let initailMarginTop = ' ';
  // 记录是否操作
  app.directive('drag', {
    mounted(el, binding) {
      // 弹窗的容器
      const domDrag = el.firstElementChild.firstElementChild.firstElementChild;
      // 记录拖拽开始的光标坐标，0 表示没有拖拽
      const start = { x: 0, y: 0 };
      // 移动中记录偏移量
      const move = { x: 0, y: 0 };
      // debugger;
      const initTop = getInitialMarinTop(el);
      const initLeft = getInitialMarginLeft(el);
      initailMarginLeft = `${initLeft}px`;
      initailMarginTop = `${initTop}px`;
      domDrag.style.marginTop = `${initTop}px`;
      domDrag.style.marginLeft = `${initLeft}px`;
      // 鼠标按下，开始拖拽
      domDrag.onmousedown = (e: MouseEvent) => {
        if ((e.target as HTMLElement).className && Object.prototype.toString.call((e.target as HTMLElement).className)
          === '[object String]' && (e.target as HTMLElement).className.indexOf('el-dialog__header') !== -1) {
          const currentTop = getInitialMarinTop(el);
          const currentLeft = getInitialMarginLeft(el);
          //    记下当前坐标
          start.x = e.clientX;
          start.y = e.clientY;
          (e.target as HTMLElement).style.userSelect = 'none';

          // 鼠标移动，实时跟踪
          document.onmousemove = (moveE: MouseEvent) => {
            (moveE.target as HTMLElement).style.cursor = 'all-scroll'; // 改变光标形状
            move.x = moveE.clientX - start.x;
            move.y = moveE.clientY - start.y;
            // 初始位置 + 拖拽距离
            domDrag.style.marginLeft = (currentLeft + move.x) + 'px';
            domDrag.style.marginTop = (currentTop + move.y) + 'px';
          };
          // 鼠标抬起，结束拖拽
          document.onmouseup = (upE: MouseEvent) => {
            (upE.target as HTMLElement).style.cursor = 'default';
            document.onmousemove = null;
            document.onmouseup = null;
          };
        }
      };
    },
    /**
     * update中重置弹框定位
     * @param el
     * @param binding
     */
    updated(el) {
      // 弹窗的容器
      setTimeout(() => {
        const domDrag = el.firstElementChild.firstElementChild.firstElementChild;
        const initTop = getInitialMarinTop(el);
        const initLeft = getInitialMarginLeft(el);
        initailMarginLeft = `${initLeft}px`;
        initailMarginTop = `${initTop}px`;
        domDrag.style.marginTop = initailMarginTop;
        domDrag.style.marginLeft = initailMarginLeft;
      }, 200);
    },
  });
};
// 获取初始宽度
const getInitialMarinTop = (el: HTMLElement) => {
  const value = window.getComputedStyle(((el.firstElementChild as HTMLElement).firstElementChild as HTMLElement)
    .firstElementChild as HTMLElement, null).marginTop;
  let marginTop = 0;
  if (value.indexOf('vh') !== -1) {
    const clientHeight = document.documentElement.clientHeight;
    const count = Number(value.substring(0, value.indexOf('vh')));
    marginTop = (clientHeight / 100) * count;
  }
  if (value.indexOf('px') !== -1) {
    marginTop = Number(value.substring(0, value.indexOf('px')));
  }
  return marginTop;
};
// 获取初始marginLeft
const getInitialMarginLeft = (el: HTMLElement) => {
  const value = window.getComputedStyle(((el.firstElementChild as HTMLElement).firstElementChild as HTMLElement)
    .firstElementChild as HTMLElement, null).marginLeft;
  const clientWidth = document.documentElement.scrollWidth;
  let marginLeft = 0;
  if (value === 'auto') {
    const domWidth = window.getComputedStyle(((el.firstElementChild as HTMLElement)
      .firstElementChild as HTMLElement).firstElementChild as HTMLElement, null).width;
    const width = removeSuffix(clientWidth, domWidth, domWidth.indexOf('%') !== -1 ? '%' : 'px');
    marginLeft = (clientWidth - width) / 2;
  }
  if (value.indexOf('px') !== -1) {
    marginLeft = Number(value.substring(0, value.indexOf('px')));
  }
  return marginLeft;
};
// 去除后缀
const removeSuffix = (total: number, value: string, type: string) => {
  let num = 0;
  if (type === '%') {
    num = (total / 100) * Number(value.substr(0, value.indexOf('%')));
  }
  if (type === 'px') {
    num = Number(value.substr(0, value.indexOf('px')));
  }
  return num;
};

export default registrDrag;
