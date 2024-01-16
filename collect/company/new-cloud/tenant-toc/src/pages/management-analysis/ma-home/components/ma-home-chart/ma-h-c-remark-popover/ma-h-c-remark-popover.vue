<template>
  <div
    v-show="commentPopover.visible"
    :class="['ma-h-c-comment-popover', commentPopover.options.direction]"
    :style="{
      top: commentPopover.options.top,
      left: commentPopover.options.left,
    }"
  >
    <!-- 未编辑 或者 已编辑 -->
    <ul
      v-show="
        commentPopover.remarkStatus === RemarkStatus.待插入 || commentPopover.remarkStatus === RemarkStatus.已插入
      "
      :style="unRemarkStyle"
    >
      <li @click="commentPopover.insert">
        <img src="../../../../../../assets/images/management-analysis/ma-home-chart/ma-home-chart-remark.svg" />
        <span>{{ commentPopover.remarkStatus === RemarkStatus.待插入 ? '插入备注' : '编辑备注' }}</span>
      </li>
      <li v-show="commentPopover.remarkStatus === RemarkStatus.已插入" @click="commentPopover.deleteConfirm">
        <img src="../../../../../../assets/images/management-analysis/ma-home-chart/ma-home-chart-remark-delete.svg" />
        <span>删除备注</span>
      </li>
    </ul>
    <!-- 查看中 -->
    <div
      class="ma-h-c-cp-flex-column"
      :style="remarkStyle"
      v-show="commentPopover.remarkStatus === RemarkStatus.查看中"
      @mouseover="commentPopover.mouseOver"
      @mouseleave="commentPopover.mouseLeave"
    >
      <div class="icon">
        <img src="../../../../../../assets/images/management-analysis/ma-home-chart/ma-home-chart-arrow.svg" alt="" />
      </div>
      <p><label>用户名：</label>{{ commentPopover.username }}</p>
      <div class="content">{{ commentPopover.remark }}</div>
    </div>
    <!-- 编辑中 -->
    <div
      class="ma-h-c-cp-flex-column"
      :style="remarkStyle"
      v-show="commentPopover.remarkStatus === RemarkStatus.插入中"
    >
      <div class="icon">
        <img src="../../../../../../assets/images/management-analysis/ma-home-chart/ma-home-chart-arrow.svg" alt="" />
      </div>
      <p><label>用户名：</label>{{ commentPopover.username }}</p>
      <textarea
        maxlength="200"
        :style="{ backgroundColor: remarkStyle.backgroundColor }"
        v-model="commentPopover.remark"
        @input="commentPopover.handleInput"
        @blur="commentPopover.handleBlur"
      ></textarea>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import commentPopover from './ma-h-c-remark-popover.service';
import { RemarkStatus, remarkStyle, unRemarkStyle } from './ma-h-c-remark-popover.api';
import { sDatabase } from '../../../services/index';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const _destroy$ = new Subject<void>();

/**
 * 订阅查询参数
 */
onMounted(() => {
  sDatabase.bsSearchParam$.pipe(takeUntil(_destroy$)).subscribe((v) => {
    commentPopover.searchParams = v;
  });
});

onUnmounted(() => {
  _destroy$.next();
  _destroy$.complete();
});
</script>
<style lang="less">
.ma-h-c-comment-popover {
  position: absolute;
  background-color: #fff;
  box-shadow: 0px 10px 32px 0px rgba(38, 38, 38, 0.18);
  z-index: 9;
  user-select: text;

  ul {
    width: 119px;

    position: absolute;
    list-style-type: none;
    padding: 3px 0 6px;

    border-radius: 4px;
    background-color: rgba(255, 255, 255, 1);
    box-shadow: 0px 10px 32px 0px rgba(38, 38, 38, 0.18);
    border: none;

    margin-bottom: 0;

    &::before {
      content: '';
      position: absolute;
      top: 10px;
      left: -12px;

      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 6px solid transparent;

      border-right: 6px solid #fff;
    }

    > li {
      cursor: pointer;
      list-style-type: none;
      list-style: none;

      display: flex;
      align-items: center;

      padding: 5px 11px;
    }

    > li > span {
      display: inline-block;
      height: 22px;
      line-height: 22px;
      font-size: 14px;
      color: rgba(0, 0, 0, 1);
    }

    > li > img {
      margin-right: 9px;
    }

    > li:hover {
      background-color: var(--color-hover);
    }
  }

  .ma-h-c-cp-flex-column {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 8px 9px 0;

    .icon {
      width: 17px;
      height: 100%;

      position: absolute;
      top: 0;
      left: -16px;

      img {
        width: 15px;
        height: 15px;
      }
    }

    p,
    label {
      color: var(--color-text);
      height: 22px;
      line-height: 22px;
    }

    p {
      margin-bottom: 10px;
    }

    textarea {
      padding: 0;
      border: none;
      resize: none;

      caret-color: var(--color-text-primary);
    }

    div.content,
    textarea {
      width: 100%;
      flex: 1 1 auto;

      word-break: break-all;
      white-space: normal;
      overflow-y: auto;

      padding-right: 11px;
      line-height: 22px;
      color: var(--color-text);
    }

    textarea:active,
    textarea:focus {
      border-color: transparent !important;
      box-shadow: none !important;
    }
  }

  &.left > ul::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 119px;

    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid transparent;

    border-left: 6px solid #fff;
  }

  &.left > .ma-h-c-cp-flex-column > .icon {
    left: 140px;
    transform: rotateY(180deg);
  }
}
</style>
