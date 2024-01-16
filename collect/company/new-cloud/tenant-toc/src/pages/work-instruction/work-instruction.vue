<template>
  <div class="work-instruction">
    <te-row :gutter="16">
      <te-col :span="19" v-loading="wiService.leftLoading">
        <div class="work-instruction-left" v-if="!wiService.leftLoading">
          <div class="wil-pre-work" v-if="wiService.navigationMenu?.prepareWork?.length">
            <wi-container title="项目前期工作">
              <template #wiContent>
                <div class="wil-content-wrap">
                  <wi-bar
                    v-for="(item, index) in wiService.navigationMenu?.prepareWork"
                    :key="item.id"
                    :subTitle="item.showName"
                    :index="index + 1"
                    :path="item.url"
                    :flag="item.iframeFlag"
                    :id="item.id"
                    :accessed="item.accessed"
                  ></wi-bar>
                </div>
              </template>
            </wi-container>
          </div>
          <div class="wil-consumption-budget" v-if="wiService.navigationMenu?.energyCheck?.length">
            <wi-container title="能耗核算">
              <template #wiContent>
                <wi-content :wi-content-list="wiService.navigationMenu?.energyCheck"></wi-content>
              </template>
            </wi-container>
          </div>
          <div class="wil-consumption-control" v-if="wiService.navigationMenu?.energyControl?.length">
            <wi-container title="能耗管控">
              <template #wiContent>
                <div class="wil-content-wrap">
                  <wi-bar
                    v-for="(item, index) in wiService.navigationMenu?.energyControl"
                    :key="item.id"
                    :subTitle="item.showName"
                    :index="index + 1"
                    :path="item.url"
                    :id="item.id"
                    :flag="item.iframeFlag"
                    :accessed="item.accessed"
                  ></wi-bar>
                </div>
              </template>
            </wi-container>
          </div>
          <div class="wil-pre-accounting" v-if="wiService.navigationMenu?.projectCheck?.length">
            <wi-container title="项目预核算">
              <template #wiContent>
                <wi-content :wi-content-list="wiService.navigationMenu?.projectCheck"></wi-content>
              </template>
            </wi-container>
          </div>
          <div v-if="!wiService.navigationMenu" class="wil-nodata">
            <img src="../../assets/images/common/common-empty.svg" alt="" />
            <p>暂无内容</p>
          </div>
        </div>
      </te-col>
      <te-col :span="5" v-loading="wiService.rightLoading">
        <div class="work-instruction-right" v-if="!wiService.rightLoading">
          <div class="wir-user">
            <h3>{{ getTimeState() + '，' + userName }}</h3>
            <div>项目的成功离不开你每一天辛劳的付出！</div>
          </div>
          <div class="wir-latest-container" v-if="wiService.recentlyAccessedMenuList.length">
            <te-divider />
            <div class="wir-latest-content">
              <wi-latest-visit />
            </div>
          </div>

          <div class="wir-project-container">
            <te-divider />
            <div class="wir-project-content">
              <wi-project-info />
            </div>
          </div>
        </div>
      </te-col>
    </te-row>
  </div>
</template>

<script lang="ts" setup>
import { TeRow, TeCol, TeDivider } from '@tiansu/element-plus';
import { WiContainer, WiBar, WiContent, WiLatestVisit, WiProjectInfo } from './components';
import { EUrlPath, IWiContentData, EUrlName, WI_MENU_ID } from './work-instruction.api';
import { computed, ref } from 'vue';
import { FGetCookie } from '@/core/token';
import wiService from './work-instruction.service';

const userName = computed(() => FGetCookie('realName') ?? '-');

const getTimeState = () => {
  // 获取当前时间
  let timeNow = new Date();
  // 获取当前小时
  let hours = timeNow.getHours();
  // 设置默认文字
  let text = '';
  // 判断当前时间段
  if (hours >= 0 && hours <= 10) {
    text = '上午好';
  } else if (hours > 10 && hours <= 14) {
    text = '中午好';
  } else if (hours > 14 && hours <= 18) {
    text = '下午好';
  } else if (hours > 18 && hours <= 24) {
    text = '晚上好';
  }
  // 返回当前时间段对应的状态
  return text;
};
</script>

<style lang="less" scoped>
.work-instruction {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: var(--te-bg-color-page);
  overflow-y: auto;
  .te-row {
    width: 100%;
    height: 100%;
    margin-left: 0 !important;
  }
  .te-col {
    // height: 100%;
  }
  .te-col-19 {
    padding-left: 0 !important;
  }
  .te-col-5 {
    padding-right: 0 !important;
  }
  // 左边部分
  &-left {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--te-space-16);
    // justify-content: space-between;
    > div {
      border-radius: 4px;
      box-shadow: 0px 2px 6px var(--te-box-shadow-lighter);
      background-color: var(--te-color-white);
    }
    .wil-pre-work,
    .wil-consumption-control {
      height: 144px;
    }
    .wil-pre-accounting,
    .wil-consumption-budget {
      height: 249px;
    }
    .wil-consumption-budget {
      :deep(.wi-card) {
        padding: 0 var(--te-space-8);
      }
    }
    .wil-pre-accounting {
      :deep(.wi-card) {
        padding: 0 var(--te-space-24);
      }
    }

    // 项目前期工作插槽
    .wil-content-wrap {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--te-space-12);
    }

    .wil-nodata {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      img {
        height: 40%;
      }
      p {
        font-size: var(--te-font-size-b14);
        color: var(--te-text-color-placeholder);
      }
    }
  }
  // 右边部分
  &-right {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    padding: var(--te-space-20);
    box-shadow: 0px 2px 6px var(--te-box-shadow-lighter);
    background-color: var(--te-color-white);
    display: flex;
    flex-direction: column;
    .wir-user {
      height: 70px;
      flex: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      > h3 {
        font-weight: 500;
        height: 32px;
        line-height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--te-font-size-h24);
        color: var(--te-text-color-primary);
      }
      > div {
        height: 22px;
        line-height: 22px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--te-font-size-b14);
        color: var(--te-text-color-regular);
      }
    }

    .wir-project-container {
      flex: auto;
      display: flex;
      flex-direction: column;
    }
    .wir-latest-content {
      max-height: 190px;
    }
    .wir-project-content {
      height: 450px;
      flex: auto;
    }
  }
}
</style>
