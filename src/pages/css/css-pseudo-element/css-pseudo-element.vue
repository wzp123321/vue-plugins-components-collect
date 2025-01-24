<template>
  <div class="css-pseudo-element">
    <h1>伪元素</h1>
    <div class="pseudo-element">
      <div class="item pseudo-element-after">after</div>
      <div class="item pseudo-element-before">before</div>
      <div class="item pseudo-element-first-letter">first-letter</div>
      <div class="item pseudo-element-first-line">first-linefirst-linefirst-linefirst-linefirst-linefirst-line</div>
      <div class="item pseudo-element-selection">selection</div>
    </div>

    <h1>伪类</h1>
    <div class="pseudo-class">
      <div class="item pseudo-class-hover">hover</div>
      <div class="item pseudo-class-focus">
        <a-input type="text" placeholder="focus" />
      </div>
      <div class="item pseudo-class-active">active</div>
      <div class="item pseudo-class-first-child">
        <ul>
          <li>first-child</li>
          <li>first-child</li>
        </ul>
      </div>
      <div class="item pseudo-class-last-child">
        <ul>
          <li>last-child</li>
          <li>last-child</li>
        </ul>
      </div>
      <div class="item pseudo-class-not">
        <span class="not1">not1</span>
        <span class="not2">not2</span>
        <span class="not3">not3</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
.css-pseudo-element {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  .pseudo-element,
  .pseudo-class {
    display: flex;
    justify-content: start;
    column-gap: 24px;

    .item {
      position: relative;
      width: 240px;
      height: 100px;
      border: 1px solid rgba(0, 0, 0, 0.06);
    }
  }

  .pseudo-element {
    .pseudo-element-after::after {
      content: '';
      width: 2px;
      height: 16px;
      background-color: red;
      border-radius: 50%;

      position: absolute;
      top: 0;
      left: 0;
    }

    .pseudo-element-before::before {
      content: '';
      width: 2px;
      height: 16px;
      background-color: blue;
      border-radius: 50%;

      position: absolute;
      top: 0;
      left: 0;
    }

    .pseudo-element-first-letter::first-letter {
      color: red;
    }

    .pseudo-element-first-line {
      white-space: pre-wrap; // 强制换行，保留空格
      word-break: break-all; // 单词拆分换行
    }

    .pseudo-element-first-line::first-line {
      color: red;
    }

    .pseudo-element-selection::selection {
      color: red;
    }
  }

  .pseudo-class {
    .pseudo-class-hover:hover {
      color: red;
    }

    .pseudo-class-focus {
      input:focus {
        border-color: red;
      }
    }

    .pseudo-class-active:active {
      color: red;
    }

    .pseudo-class-first-child {
      ul li:first-child {
        color: blue;
      }
    }

    .pseudo-class-last-child {
      ul li:last-child {
        color: blue;
      }
    }

    .pseudo-class-not {
      span:not(.not1) {
        color: green;
      }
    }
  }
}
</style>
