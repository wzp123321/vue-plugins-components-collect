<template>
  <div class="drag-container" :class="mode">
    <template v-if="mode == 'hor'">
      <div class="main-side-left" :style="{ width: `${width}px` }">
        <div
          class="drag-handler"
          @mouseenter.stop="enterHandler"
          @mouseleave.stop="leaveHandler"
          v-show="!flag"
          :draggable="true"
          @drag="dragMove"
          @dragstart.stop="dragStart"
          @dragend.stop="borderColor = 'var(--te-border-color-lighter)'"
        ></div>
        <div class="hor-content">
          <slot name="left-top"></slot>
        </div>
        <div
          class="datasource-put-away"
          @click.capture="toggleArea"
          v-if="isShowExpand"
        >
          <i class="svg-icon-wrapper icon-quick-bi-biaogeliezhankaijiantou">
            <svg
              class="svg-icon quick-bi-biaogeliezhankaijiantou-svg"
              :class="{ rotate180: flag }"
              viewBox="0 0 1024 1024"
              aria-hidden="true"
              width="1em"
              height="1em"
              fill="currentColor"
            >
              <path
                d="M235.52 463.872l436.565333-365.056a57.344 57.344 0 0 1 82.944 9.642667 63.402667 63.402667 0 0 1 12.970667 38.570666v729.941334c0 34.133333-26.453333 61.696-59.050667 61.696a57.429333 57.429333 0 0 1-36.864-13.482667L235.52 560.128a63.573333 63.573333 0 0 1 0-96.256z"
              ></path>
            </svg>
          </i>
        </div>
      </div>
      <div class="other-side" :style="{ width: `calc(100% - ${width}px` }">
        <slot name="right-bottom"></slot>
      </div>
    </template>
    <template v-if="mode == 'ver'">
      <div class="main-side-top" :style="{ height: `${height}px` }">
        <div
          class="drag-handler"
          @mouseenter="enterHandler"
          @mouseleave="leaveHandler"
          :draggable="true"
          @dragstart="dragStart"
          @drag="dragMove"
          @dragend="borderColor = 'var(--te-border-color-lighter)'"
        ></div>
        <div class="ver-content">
          <slot name="left-top"></slot>
        </div>

        <div
          class="expand-handler arrow-up"
          @click.capture="toggleArea"
          v-if="isShowExpand"
        >
          <i class="svg-icon-wrapper icon-quick-bi-biaogelieshouqijiantou">
            <svg
              :class="{ rotate180: flag }"
              class="svg-icon quick-bi-biaogeliezhankaijiantou-svg"
              viewBox="0 0 1024 1024"
              aria-hidden="true"
              width="1em"
              height="1em"
              fill="currentColor"
            >
              <path
                d="M235.52 463.872l436.565333-365.056a57.344 57.344 0 0 1 82.944 9.642667 63.402667 63.402667 0 0 1 12.970667 38.570666v729.941334c0 34.133333-26.453333 61.696-59.050667 61.696a57.429333 57.429333 0 0 1-36.864-13.482667L235.52 560.128a63.573333 63.573333 0 0 1 0-96.256z"
              ></path>
            </svg>
          </i>
        </div>
      </div>

      <div class="other-side" :style="{ height: `calc(100% - ${height}px)` }">
        <slot name="right-bottom"></slot>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { throttle } from 'lodash-es';
export default defineComponent({
  name: 'ComponentLayoutDrag',
  props: {
    mode: {
      type: String,
      default: 'ver',
    },
    leftIconTop: {
      type: String,
      default: '50%',
    },
    isShowExpand: {
      type: Boolean,
      default: true,
    },
    defaultValue: {
      type: Number,
      default: 240,
    },
  },
  setup({ mode, defaultValue }) {
    const flag = ref(false);
    const borderColor = ref('var(--te-border-color-lighter)');
    let offsetTop = 0;
    let offsetLeft = 0;
    let warpperHeight = 0;
    let defaultVal = defaultValue;
    const width = ref(defaultValue);
    const height = ref(defaultValue);
    // 获取最近父容器的高度
    const getParentHeight = (e: Event): number => {
      return (
        (e.currentTarget as HTMLElement).parentElement?.parentElement
          ?.clientHeight ?? 0
      );
    };
    // 开始拖拽
    const dragStart = (e: DragEvent) => {
      if (mode == 'ver') {
        !offsetTop && (offsetTop = e.clientY - defaultVal);
      } else {
        !offsetLeft && (offsetLeft = e.clientX - defaultVal);
      }
    };
    // 拖拽移动
    const dragMove = throttle((e: DragEvent) => {
      if (e.clientX < 0) return;
      borderColor.value = 'var(--te-border-color-dark)';
      if (e.pageX && e.pageY) {
        if (mode == 'hor') {
          let wid = e.clientX - offsetLeft;
          width.value = wid < defaultValue ? defaultValue : wid;
        } else {
          let h = e.clientY - offsetTop;
          height.value = h < defaultValue ? defaultValue : h;
        }
        flag.value = height.value > defaultValue;
      }
    }, 10);
    // 快捷切换
    const toggleArea = (e: Event) => {
      flag.value = !flag.value;
      if (mode == 'hor') {
        width.value = width.value > 0 ? 0 : defaultValue;
        defaultVal = width.value;
      }
      if (mode == 'ver') {
        warpperHeight = getParentHeight(e);
        height.value = flag.value ? 0 : warpperHeight! - 8;
        defaultVal = height.value;
      }
    };
    // 鼠标移入
    const enterHandler = () => {
      borderColor.value = 'var(--te-border-color-dark)';
    };
    // 鼠标移出
    const leaveHandler = () => {
      borderColor.value = 'var(--te-border-color-lighter)';
    };
    return {
      width,
      height,
      dragMove,
      flag,
      dragStart,
      toggleArea,
      borderColor,
      enterHandler,
      leaveHandler,
    };
  },
});
</script>

<style scoped lang="less">
.drag-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .rotate180 {
    transform: rotateZ(180deg);
  }

  .rotate270 {
    transform: rotateZ(270deg) !important;
  }

  .datasource-put-away {
    align-items: center;
    background: var(--te-color-white);
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    display: flex;
    width: 12px;
    height: 48px;
    justify-content: center;
    position: absolute;
    right: -14px;
    top: v-bind(leftIconTop);
    z-index: 999;
    border: 1px solid var(--te-border-color-lighter);

    border-left: none;
    > .svg-icon-wrapper {
      font-size: 12px;
    }
  }

  &.ver {
    flex-direction: column;

    > .main-side-top {
      width: 100%;
      background: var(--te-color-white);
      position: relative;

      > .expand-handler {
        align-items: center;
        background: var(--te-color-white);
        border: 1px solid var(--te-border-color-lighter);
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        display: flex;
        height: 12px;
        justify-content: center;
        left: v-bind(leftIconTop);
        position: absolute;
        bottom: 0px;
        transform: translate(-50%);
        width: 48px;
        z-index: 100;

        > .svg-icon-wrapper {
          transform: rotate(90deg);
          font-size: 12px;
        }
      }

      > .ver-content {
        height: 100%;
        position: relative;
        width: 100%;
        overflow: auto;
        border-bottom: 1px solid v-bind(borderColor);
      }

      > .drag-handler {
        left: 0;
        padding: 5px 0;
        position: absolute;
        bottom: -5px;
        width: 100%;
        z-index: 10;
        cursor: row-resize;
      }
    }

    > .other-side {
      width: 100%;
      background: var(--te-color-white);
    }
  }

  &.hor {
    > .main-side-left {
      height: 100%;
      background: var(--te-color-white);
      position: relative;
      z-index: 10;
      overflow-y: scoll;

      .hor-content {
        height: 100%;
        position: relative;
        width: 100%;
        background: var(--te-color-white);
        border-right: 1px solid v-bind(borderColor);
        overflow-y: auto;
        &::-webkit-scrollbar {
          display: none;
        }
      }

      > .drag-handler {
        cursor: col-resize;
        height: 100%;
        padding: 0 10px;
        position: absolute;
        right: -10px;
        top: 0;
        width: 1px;
        opacity: 0;
        z-index: 99;
      }
    }

    > .other-side {
      height: 100%;
    }
  }
}
</style>
