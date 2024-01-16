<template>
  <div id="cpad-detail" v-loading="props.cpadService?.loading">
    <!-- 本月关注项 + -->
    <div v-if="!props.cpadService?.loading">
      <h5>本月关注项</h5>
      <div class="cpad-detail-container">
        <div
          class="focus-content"
          v-if="!props.cpadService?.loading && props.cpadService?.dataSource.monthConcern.length"
        >
          <div v-for="(item, index) in props.cpadService.dataSource.monthConcern">
            <div class="content-title">
              <span :class="mapClassName(item.itemPartName).name">{{ item.itemPartName }}</span>
              <span class="count">{{ item.itemCount }}<span>项</span></span>
            </div>
            <div class="content-item-wrap">
              <div
                :class="mapClassName(item.itemPartName).itemName"
                v-for="(childrenItem, index) in item.items"
                :key="index"
              >
                <div :title="childrenItem.itemName + '(' + childrenItem.unit + ')'">
                  {{ childrenItem.itemName + '(' + childrenItem.unit + ')' }}
                </div>
                <div :title="childrenItem.rate" :class="['count', childrenItem.rate.includes('-') ? 'waring' : '']">
                  {{ thousandSeparation(childrenItem.rate) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="cpad-detail-empty"
          v-if="!props.cpadService?.loading && !props.cpadService?.dataSource.monthConcern.length"
        >
          <img src="../../../../assets/images/cpad-detail/pic-focus-empty.svg" alt="" />
          <p>暂无关注项</p>
        </div>
      </div>
    </div>
    <!-- 本月关注项 - -->

    <!-- 日志记录 + -->
    <div v-if="!props.cpadService?.loading">
      <h5>日志记录</h5>
      <div class="cpad-detail-container log-detail">
        <div class="log-content" v-if="!props.cpadService?.loading && props.cpadService?.dataSource.logList.length">
          <el-steps direction="vertical">
            <el-step
              v-for="(item, index) in props.cpadService?.dataSource.logList"
              :key="index"
              :description="item.date"
            >
              <template #title>
                <div :title="item.logInfo" class="log-content-title">
                  {{ item.logInfo }}
                </div>
              </template>
            </el-step>
          </el-steps>
        </div>
        <div
          v-if="!props.cpadService?.loading && !props.cpadService?.dataSource.logList.length"
          class="cpad-detail-empty"
        >
          <img src="../../../../assets/images/cpad-detail/pic-log-empty.svg" alt="" />
          <p>暂无日志记录</p>
        </div>
      </div>
    </div>
    <!-- 日志记录 - -->

    <!-- 批语 +  -->
    <div v-if="!props.cpadService?.loading">
      <div class="comment-btnbar">
        <h5 class="comment-title">批语</h5>
        <button primary size="small" @click="add">新增批语</button>
      </div>
      <div class="cpad-detail-container">
        <div
          class="comment-content"
          v-if="!props.cpadService?.loading && props.cpadService?.dataSource.commentList.length"
        >
          <div class="content-item" v-for="(item, index) in props.cpadService?.dataSource.commentList" :key="index">
            <div class="content-item-avator">{{ item.username.substring(0, 1).toLocaleUpperCase() ?? 'N' }}</div>
            <div class="content-item-user">
              <div class="content-item-username">
                <span>{{ item.username }}</span>
                <span>{{ item.date }}</span>
              </div>
              <div class="content-item-text" :title="item.comment">{{ item.comment }}</div>
            </div>
          </div>
        </div>
        <div
          v-if="!props.cpadService?.loading && !props.cpadService?.dataSource.commentList.length"
          class="cpad-detail-empty"
        >
          <img src="../../../../assets/images/cpad-detail/pic-suggest-empty.svg" alt="" />
          <p>暂无批语</p>
        </div>
      </div>
    </div>
    <!-- 批语 -  -->
  </div>
  <cpad-d-add ref="cpadDAddRef" @search="search"></cpad-d-add>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { EMonthConcernItem } from './cpad-detail.api';
import CpadDAdd from './cpad-d-add/cpad-d-add.vue';
import { thousandSeparation } from '@/utils';

const cpadDAddRef = ref();

const props = defineProps({
  cpadService: {
    type: Object,
  },
});

const emits = defineEmits(['search']);

const add = () => {
  cpadDAddRef.value.show();
};

const mapClassName = (name: string) => {
  let classObj = {};
  switch (name) {
    case EMonthConcernItem.项目收入:
      classObj = {
        name: 'project-income',
        itemName: 'project-income-item',
      };
      break;
    case EMonthConcernItem.直接成本:
      classObj = {
        name: 'direct-cost',
        itemName: 'direct-cost-item',
      };
      break;
    case EMonthConcernItem.运营成本:
      classObj = {
        name: 'operate-cost',
        itemName: 'operate-cost-item',
      };
      break;
    default:
      break;
  }
  return classObj as { name: string; itemName: string };
};

const search = () => {
  emits('search');
};
</script>
<style lang="less" scoped>
#cpad-detail {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  & > div {
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 16px 0 16px 16px;
    background: var(--nts-white-color-font);
    box-shadow: 0px 1px 7px 0px rgba(38, 38, 38, 0.1);
    border-radius: 4px;
    // overflow: auto;
    // flex: 1;
    h5 {
      &:not(.comment-title) {
        margin-bottom: 10px;
      }
      position: relative;
      height: 20px;
      line-height: 20px;
      font-size: 14px;
      color: var(--color-text-title);
      font-weight: 600;
      padding-left: 12px;

      &::before {
        content: '';
        width: 4px;
        height: 16px;
        background-color: var(--color-primary);
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .comment-btnbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      margin-right: 16px;
      button {
        width: 72px;
        height: 24px;
        padding: 0;
        line-height: 24px;
        font-size: 12px;
      }
    }
    .cpad-detail-container {
      display: flex;
      flex-direction: column;
      padding: 10px 0 10px 0;
      height: 100%;

      overflow: scroll;

      .focus-content {
        .content-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          margin-right: 8px;
        }

        .direct-cost {
          color: #fa8c16;
        }
        .operate-cost {
          color: #722ed1;
        }
        .project-income {
          color: var(--te-color-success);
        }
        .direct-cost-item,
        .project-income-item,
        .operate-cost-item {
          width: 212px;
          height: 74px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          padding: 8px 0 8px 16px;
          border: 1px solid #fff;
          border-radius: 4px;

          div {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 1;
          }
        }

        .direct-cost-item {
          border-color: var(--te-color-warning-light-8);
          background-color: var(--te-color-warning-light-9);
        }

        .operate-cost-item {
          border-color: #efdbff;
          background: #f9f0ff;
        }
        .project-income-item {
          border-color: var(--te-color-success-light-8);
          background: var(--te-color-success-light-9);
        }

        .count {
          font-size: 24px;
          font-weight: 700;
          line-height: 28px;
          color: #000000d9;
          font-family: D-DIN;
          span {
            margin-left: 2px;
          }
        }
        .waring {
          color: #f5222d;
        }
        .content-item-wrap {
          display: flex;
          flex-wrap: wrap;
          padding-bottom: 20px;
          gap: 8px;
        }
      }

      .log-content {
        :deep(.el-step__icon) {
          width: 12px;
          height: 12px;
        }

        :deep(.el-step__line) {
          width: 2px;
          top: 25px;
          bottom: 5px;
          left: 5px;
          background: rgba(0, 0, 0, 0.1);
        }

        :deep(.el-step__icon-inner),
        :deep(.el-step__line-inner) {
          display: none;
        }

        :deep(.el-step.is-vertical .el-step__head) {
          width: 16px;
        }

        :deep(.is-process .el-step__icon) {
          border-color: #1890ff;
        }

        :deep(.el-step__title.is-process),
        :deep(.el-step__title.is-wait),
        :deep(.el-step__title.is-finish) {
          width: 270px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #000;
          font-weight: 400;
        }

        :deep(.el-step__description) {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
        }
        :deep(.el-step__head.is-wait) .el-step__icon,
        :deep(.el-step__head.is-finish) .el-step__icon {
          border: none;
          background-color: rgba(0, 0, 0, 0.1);
        }
        :deep(.el-step__main) {
          height: 64px;
        }
      }

      .comment-content {
        .content-item {
          display: flex;
          margin-bottom: 16px;
          margin-right: 8px;
          gap: 16px;
          &:nth-last-child(1) {
            margin-bottom: 0;
          }

          &-avator {
            width: 24px;
            height: 24px;
            background-color: #c0c4cc;
            border-radius: 50% 50%;
            color: white;
            line-height: 24px;
            text-align: center;
            flex: none;
          }

          &-user {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          &-username {
            display: flex;
            justify-content: space-between;
            color: #909399;

            span:first-child {
              color: #303133;
            }
          }

          &-text {
            max-height: 44px;
            overflow: hidden;
            -webkit-line-clamp: 2;
            text-overflow: ellipsis;
            white-space: pre-line;
            word-wrap: break-word;
            word-spacing: normal;
            text-align: inherit;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            color: #606266;
          }
        }
      }

      .cpad-detail-empty {
        height: 150px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    }
    .log-detail {
      overflow: hidden;
      &:hover {
        overflow-y: overlay;
      }
    }
  }

  & > div:nth-child(2) {
    flex: none;
    height: 320px;
  }
  & > div:nth-child(1) {
    height: fit-content;
  }
  & > div:nth-child(3) {
    height: fit-content;
  }
  .log-content-title {
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
