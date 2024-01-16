<template>
  <div class="da-params-configure">
    <!-- 提示语 -->
    <DaWarningBoard v-if="!paramsConfigure.pageForm.configFlag"></DaWarningBoard>
    <!-- 前三步 -->
    <div
      class="dpc-container flex-row-start-center"
      :style="{ height: paramsConfigure.pageForm.showFlag ? '150px' : '28px' }"
    >
      <!-- 第一步 -->
      <div class="dpc-container-module">
        <da-sub-title :sort="1" title="建立科室能耗模型"></da-sub-title>
        <div class="dpc-container-module-item dpc-container-module-is-first">
          <span class="dpc-container-module-item-label">科室能耗模型梳理</span>
          <span
            class="dpc-container-module-item-link"
            @click="handlePageLink(DPC_EJumpUrl.树模型管理, CommonESystemType.后台)"
          >
            <label>{{ mapConfigureButtonLabel() }}</label>
            <icon-right />
          </span>
        </div>
        <div class="dpc-container-module-item">
          <span class="dpc-container-module-item-label">未计量科室分摊</span>
          <span
            class="dpc-container-module-item-link"
            @click="handlePageLink(DPC_EJumpUrl.科室分摊分摊规则, CommonESystemType.后台)"
          >
            <label>{{ mapConfigureButtonLabel() }}</label>
            <icon-right />
          </span>
        </div>
      </div>
      <!-- 分割图片 -->
      <div class="dpc-container-separator">
        <img
          src="../../../../assets/img/department-assessment/da-arrow.png"
          v-show="paramsConfigure.pageForm.showFlag"
          alt="separator"
        />
      </div>
      <!-- 第二步 -->
      <div class="dpc-container-module">
        <da-sub-title :sort="2" title="选择科室考核指标"></da-sub-title>
        <div class="dpc-container-module-item dpc-container-module-is-first">
          <span class="dpc-container-module-item-label flex-row-start-center">
            考核指标
            <!-- <icon-explain class="ml4" /> -->
          </span>
          <te-select-v2
            class="dpc-container-module-index-select"
            v-model="paramsConfigure.pageForm.indexIdList"
            :max-collapse-tags="maxIndexTags"
            placeholder="请选择"
            :options="paramsConfigure.indexList"
            :multiple="true"
            collapse-tags
            collapse-tags-tooltip
            @change="handleIndexChange"
          />
        </div>
        <div class="dpc-container-module-item">
          <span class="dpc-container-module-item-label">科室基础数据维护</span>
          <span
            class="dpc-container-module-item-link"
            @click="handlePageLink(DPC_EJumpUrl.指标数据维护, CommonESystemType.后台)"
          >
            <label>去维护</label>
            <icon-right />
          </span>
        </div>
      </div>
      <!-- 分割图片 -->
      <div class="dpc-container-separator">
        <img
          src="../../../../assets/img/department-assessment/da-arrow.png"
          alt="separator"
          v-show="paramsConfigure.pageForm.showFlag"
        />
      </div>
      <!-- 第三步 -->
      <div class="dpc-container-module">
        <da-sub-title :sort="3" title="确定科室考核目标"></da-sub-title>
        <div class="dpc-container-module-item dpc-container-module-is-first">
          <span class="dpc-container-module-item-label">能源类型</span>
          <!-- <te-checkbox-group v-model="paramsConfigure.pageForm.energyCodeList" @change="handleEnergyChange">
            <te-checkbox
              v-for="(item, index) in paramsConfigure.energyList"
              :key="item.code + index"
              :label="item.code"
            >
              {{ item.name }}
            </te-checkbox>
          </te-checkbox-group> -->
          <te-select-v2
            class="dpc-container-module-energy-select"
            v-model="paramsConfigure.pageForm.energyCodeList"
            :max-collapse-tags="maxEnergyTags"
            :multiple="true"
            placeholder="请选择"
            :options="paramsConfigure.energyList"
            collapse-tags
            collapse-tags-tooltip
            @change="handleEnergyChange"
          />
        </div>
        <div class="dpc-container-module-special">
          <div class="dpc-container-module-item">
            <span class="dpc-container-module-item-label">考核科室</span>
            <span class="dpc-container-module-item-link" @click="handleSelectDialogShow">
              <label>{{ mapSelectButtonLabel() }}</label>
              <icon-right />
            </span>
          </div>
          <div class="dpc-container-module-item">
            <span class="dpc-container-module-item-label">考核目标值</span>
            <span
              class="dpc-container-module-item-link"
              @click="handlePageLink(DPC_EJumpUrl.维护考核目标值, CommonESystemType.前台)"
            >
              <label>去维护</label>
              <icon-right />
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- 折叠按钮 -->
    <div
      :class="['dpc-collapse-btn', paramsConfigure.pageForm.showFlag ? 'is-expanded' : '']"
      @click="handleExpandChange"
      :title="paramsConfigure.pageForm.showFlag ? '收起' : '展开'"
    >
      <icon-caret-bottom />
    </div>
  </div>
  <!-- 配置弹框 -->
  <DaTreeSelectDialog></DaTreeSelectDialog>
</template>
<script lang="ts" setup>
// 公共库
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { debounce } from 'lodash';
// 服务 api
import departmentAssessmentService from '../department-assessment.service';
import treeSelectDialogService from '../da-tree-select-dialog/da-tree-select-dialog.service';
import DaParamsConfigureService from './da-params-configure.service';
import { DPC_EJumpUrl, DPC_JUMP_INDICATOR__KEY, DPC_MIN_COLLAPSE_TAGS_WIDTH } from './da-params-configure.api';
import { CommonESystemType, Common_ETreeType } from '../../../../services/common/common-api';
// 组件
import { IconRight, IconCaretBottom } from '@arco-iconbox/vue-te';
import { TeSelectV2 } from '@tiansu/element-plus';
import DaWarningBoard from '../da-warning-board/da-warning-board.vue';
import DaSubTitle from '../da-sub-title/da-sub-title.vue';
import DaTreeSelectDialog from '../da-tree-select-dialog/da-tree-select-dialog.vue';
// 工具方法
import { openBlankUrl } from '@/utils/index';
import { FSetStorageData } from '@/utils/token';
// 可观察对象
const destroy$ = new Subject<void>();
// 服务
const paramsConfigure = new DaParamsConfigureService();
// 最大展示指标tag
const maxIndexTags = ref<number>(2);
// 最大展示指标tag
const maxEnergyTags = ref<number>(4);
/**
 * 初始化，订阅页面配置信息
 */
onMounted(() => {
  // 查询指标列表
  paramsConfigure.queryIndexList();
  departmentAssessmentService.configResult$.pipe(takeUntil(destroy$)).subscribe((v) => {
    paramsConfigure.setPageFormAndEnergyList(
      v?.indexIdList?.map((item) => item.id) ?? [],
      v?.treeIdList,
      v?.energyCodeList?.map((item) => item.code) ?? [],
      v?.configFlag ?? false,
      v?.showFlag ?? true,
      v?.allEnergyCodeList,
    );

    nextTick(() => {
      onResize();
    });
  });

  window.addEventListener('resize', onResize);
});

/**
 * 组件销毁
 */
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();

  window.removeEventListener('resize', onResize);
});
const onResize = () => {
  mapMaxIndexCollapseTags();
  mapMaxEnergyCollapseTags();
};
/**
 * 根据组件的宽度，判断展示指标tag的数量
 * 默认2个，展示不下则展示1个
 */
const mapMaxIndexCollapseTags = () => {
  const ele = document.querySelector('.dpc-container-module-index-select');
  const width = ele?.clientWidth;
  console.log('%c✨✨计算组件宽度，判断展示tag数量✨✨', 'font-size: 24px', width, DPC_MIN_COLLAPSE_TAGS_WIDTH);
  maxIndexTags.value = width && width < DPC_MIN_COLLAPSE_TAGS_WIDTH ? 1 : 2;
};
/**
 * 根据组件的宽度，判断展示指标tag的数量
 * 默认2个，展示不下则展示1个
 */
const mapMaxEnergyCollapseTags = () => {
  const ele = document.querySelector('.dpc-container-module-energy-select');
  const width = ele?.clientWidth;
  console.log('%c✨✨计算组件宽度，判断展示tag数量✨✨', 'font-size: 24px', width);
  if (width) {
    if (width < 230) {
      maxEnergyTags.value = 1;
    } else if (width < 285) {
      maxEnergyTags.value = 2;
    } else if (width < 310) {
      maxEnergyTags.value = 3;
    } else {
      maxEnergyTags.value = 4;
    }
  }
};
/**
 * 按钮文本
 * @returns {string}
 */
const mapConfigureButtonLabel = (): string => {
  return paramsConfigure.pageForm.configFlag ? '修改配置' : '立即配置';
};
/**
 * 按钮文本
 * @returns {string}
 */
const mapSelectButtonLabel = (): string => {
  return paramsConfigure.pageForm.configFlag ? '修改选择' : '选择';
};
/**
 * 页面跳转
 * @param {string} url 跳转地址
 * @param {CommonESystemType} type 系统类型
 */
const handlePageLink = async (url: string, type: CommonESystemType) => {
  FSetStorageData(DPC_JUMP_INDICATOR__KEY, '');
  // 如果是跳转至指标数据维护，则缓存传参
  if (url === DPC_EJumpUrl.指标数据维护) {
    FSetStorageData(DPC_JUMP_INDICATOR__KEY, Common_ETreeType.科室);
  }
  // 打开新窗口
  openBlankUrl(url, type);
  // 如果未进行过配置，则保存用户操作
  if (!paramsConfigure.pageForm.configFlag) {
    const res = await departmentAssessmentService.handleOperationSave(paramsConfigure.pageForm.showFlag, true);
    if (res) {
      paramsConfigure.pageForm.configFlag = true;
    }
  }
};
/**
 * 修改指标
 */
const handleIndexChange = debounce(async () => {
  // 对配置的指标进行排序,与列表顺序一致
  paramsConfigure.pageForm.indexIdList = paramsConfigure.pageForm.indexIdList?.sort((a, b) => {
    return (
      paramsConfigure.indexList?.findIndex((item) => item.value === a) -
      paramsConfigure.indexList?.findIndex((item) => item.value === b)
    );
  });
  const res = await paramsConfigure.handleIndexSave();
  if (res) {
    departmentAssessmentService.saveOperationAndQuery(paramsConfigure.pageForm.showFlag, true);
  }
}, 888);
/**
 * 修改能源类型
 */
const handleEnergyChange = debounce(async () => {
  // 对配置的能源类型进行排序,与列表顺序一致
  paramsConfigure.pageForm.energyCodeList = paramsConfigure.pageForm.energyCodeList?.sort((a, b) => {
    return (
      paramsConfigure.energyList?.findIndex((item) => item.value === a) -
      paramsConfigure.energyList?.findIndex((item) => item.value === b)
    );
  });

  const res = await paramsConfigure.handleEnergySave();
  if (res) {
    departmentAssessmentService.saveOperationAndQuery(paramsConfigure.pageForm.showFlag, true);
  }
}, 888);
/**
 * 展开收起操作
 */
const handleExpandChange = () => {
  paramsConfigure.pageForm.showFlag = !paramsConfigure.pageForm.showFlag;
  departmentAssessmentService.handleOperationSave(
    paramsConfigure.pageForm.showFlag,
    paramsConfigure.pageForm.configFlag,
  );
};
/**
 * 打开科室树选择弹框
 */
const handleSelectDialogShow = () => {
  treeSelectDialogService.show();
};
</script>
<style lang="less" scoped>
.da-params-configure {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: var(--te-bg-color);
  padding: 20px;
  border-bottom: 1px solid var(--te-border-color);

  .dpc-container {
    gap: 24px;
    overflow: hidden;

    > .dpc-container-separator {
      min-width: 48px;
      width: 48px;
      height: 119px;
      transition: none;

      img {
        width: 100%;
        height: 100%;
        transition: none;
      }
    }

    .dpc-container-module {
      width: 0;
      height: 100%;

      flex: auto;

      .dpc-container-module-item {
        width: 100%;
        height: 48px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 12px;
        gap: 16px;

        border-radius: 4px;
        background: var(--te-fill-color-light);

        > :deep(.te-select-v2) {
          width: 100%;

          &.dpc-container-module-energy-select {
            flex: auto;
            width: 0;
          }

          .te-tag__content {
            line-height: 24px;
            height: 24px;
          }

          .te-select-v2__tags-text {
            line-height: inherit;
          }

          .te-select-v2__selected-item.te-select-v2__input-wrapper input {
            cursor: pointer;
          }
        }

        > :deep(.te-checkbox-group) > .te-checkbox {
          margin-right: 24px;

          .te-checkbox__label {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          &:last-child {
            margin-right: 0;
          }
        }

        .dpc-container-module-item-label {
          color: var(--te-text-color-regular);
          font-size: var(--te-font-size-b14);
          line-height: 22px;
        }

        .dpc-container-module-item-link {
          display: flex;
          align-items: center;
          cursor: pointer;
          color: var(--te-color-primary);

          label {
            font-weight: 600;
            color: var(--te-color-primary);
            font-size: var(--te-font-size-b14);
            cursor: pointer;
            margin-right: 8px;
          }
        }

        &.dpc-container-module-is-first {
          margin-top: 16px;
          margin-bottom: 8px;
        }
      }

      .dpc-container-module-special {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  .dpc-collapse-btn {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;

    width: 104px;
    height: 14px;
    line-height: 14px;
    text-align: center;
    border-radius: 4px 4px 0px 0px;
    border-top: 1px solid var(--te-border-color);
    border-left: 1px solid var(--te-border-color);
    border-right: 1px solid var(--te-border-color);
    background: var(--te-bg-color);

    svg {
      transition: all 233ms;
    }

    &.is-expanded svg {
      transform: rotate(180deg);
      transition: all 233ms;
    }
  }
}
</style>
