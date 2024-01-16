<template>
  <div class="adssa-point-select">
    <!-- 站点 -->
    <div class="adssaps-point-select-item">
      <div class="item-header">站点名称</div>
      <div class="item-input">
        <el-input
          placeholder="请输入关键字搜索"
          maxLength="20"
          v-inputFilter:search
          v-model="pointService.concentratorInput.value"
          @input="pointService.inputChange('concentrator')"
          :suffix-icon="Search"
        ></el-input>
      </div>
      <div class="ul-container" v-loading="pointService.concentratorLoading.value">
        <ul class="item-list" v-if="pointService.concentratorFilterList?.value?.length !== 0">
          <li
            class="concentrator-li"
            :class="{ 'concentrator-active': item.id === pointService.selectPoint.concentratorId }"
            v-for="item in pointService.concentratorFilterList?.value"
            @click="concentratorClick(item)"
            :title="item.name"
          >
            {{ item.name }}
          </li>
        </ul>
        <no-data
          :width="125"
          :height="125"
          v-if="
            pointService.concentratorLoading.value === false && pointService.concentratorFilterList?.value?.length === 0
          "
        ></no-data>
      </div>
    </div>
    <!-- 设备 -->
    <div class="adssaps-point-select-item">
      <div class="item-header">测量设备名称</div>
      <div class="item-input">
        <el-input
          maxLength="20"
          v-inputFilter:search
          placeholder="请输入关键字搜索"
          v-model="pointService.deviceInput.value"
          @input="pointService.inputChange('device')"
          :suffix-icon="Search"
        ></el-input>
      </div>
      <div class="ul-container item-middle" v-loading="pointService.deviceLoading.value">
        <ul class="item-list" v-if="pointService.deviceFilterList.value?.length !== 0">
          <li
            class="device-li"
            :class="{ 'device-active': item.id === pointService.selectPoint.deviceId }"
            v-for="item in pointService.deviceFilterList.value"
            @click="deviceClick(item)"
            :title="item.name"
          >
            {{ item.name }}
          </li>
        </ul>
        <no-data
          :width="125"
          :height="125"
          v-if="pointService.deviceLoading.value === false && pointService.deviceFilterList.value?.length === 0"
        ></no-data>
      </div>
    </div>
    <!-- 点位 -->
    <div class="adssaps-point-select-item">
      <div class="item-header">点位名称</div>
      <div class="item-input">
        <el-input
          maxLength="20"
          v-inputFilter:search
          placeholder="请输入关键字搜索"
          v-model="pointService.pointInput.value"
          @input="pointService.inputChange('point')"
          :suffix-icon="Search"
        ></el-input>
      </div>
      <div class="ul-container" v-loading="pointService.pointLoading.value">
        <ul class="item-list" v-if="pointService.pointFilterList?.value?.length !== 0">
          <li
            class="point-li"
            :class="{ 'point-active': item.id === pointService.selectPoint.pointNumber }"
            v-for="item in pointService.pointFilterList?.value"
            @click="pointClick(item)"
            :title="item.name"
          >
            {{ item.name }}
          </li>
        </ul>
        <no-data
          :width="125"
          :height="125"
          v-show="pointService.pointLoading.value === false && pointService.pointFilterList?.value?.length === 0"
        ></no-data>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { PointService } from './adssa-point-select-service';
import { Adssa_PointItem, SelectedPoint } from './adssa-point-select-api';
import { cloneDeep, debounce } from 'lodash';

const props = defineProps({
  energyCode: String,
  initData: Object as PropType<SelectedPoint | null>,
});
const emit = defineEmits(['selectedPoint']);

const pointService = new PointService(props.energyCode || '', props.initData, emit);

const concentratorClick = debounce((item: Adssa_PointItem) => {
  pointService.selectPoint.concentratorId = item.id;
  pointService.selectPoint.concentratorName = item.name;

  // 清空之前的状态，防止在后续请求没完成就切换站点
  pointService.selectPoint.deviceId = '';
  pointService.selectPoint.deviceName = '';
  pointService.selectPoint.pointNumberName = '';
  pointService.selectPoint.pointNumber = '';
  pointService.deviceFilterList.value = [];
  pointService.pointFilterList.value = [];

  pointService.deviceParams.id = item.id;
  pointService.isInitPoint.value = false;

  pointService.getDeviceList();
}, 200);
/**
 * 勾选设备
 */
const deviceClick = debounce((item: Adssa_PointItem) => {
  pointService.selectPoint.deviceId = item?.id;
  pointService.selectPoint.deviceName = item?.name;

  pointService.pointParams.id = item.id;
  pointService.isInitPoint.value = false;

  pointService.getPointList();
}, 200);
/**
 * 勾选点位
 */
const pointClick = debounce((item: Adssa_PointItem) => {
  pointService.selectPoint.pointNumberName = item?.name;
  pointService.selectPoint.pointNumber = item?.id;
  pointService.selectPoint.standardPointCode = item?.standardPointCode ?? '';
  emit('selectedPoint', cloneDeep(pointService.selectPoint));
}, 200);
</script>

<style lang="less" scoped>
.adssa-point-select {
  display: flex;
  justify-content: space-between;
  border: 1px solid rgba(210, 210, 210, 1);
  padding: 12px;
  gap: 12px;
  .item-middle {
    display: flex;
    position: relative;
    &::before {
      content: '';
      display: block;
      position: absolute;
      left: -6px;
      top: 0px;
      width: 1px;
      height: 100%;
      background-color: rgba(223, 223, 223, 1);
    }
    &::after {
      content: '';
      display: block;
      position: absolute;
      right: -6px;
      top: 0px;
      width: 1px;
      height: 100%;
      background-color: rgba(223, 223, 223, 1);
    }
  }
  .adssaps-point-select-item {
    flex: 1;
    width: 0;
    .item-header {
      margin-bottom: 8px;
    }
    .item-list {
      height: 100%;
      width: 100%;
      overflow: auto;
      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: rgba(223, 223, 223, 1);
      }
      li {
        height: 32px;
        width: 100%;
        line-height: 32px;
        padding-left: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        margin-bottom: 4px;
      }
      li:hover {
        background-color: #e6f7ff;
      }
      .concentrator-active {
        background-color: rgba(230, 247, 255, 1) !important;
        color: #1890ff;
      }
      .device-active {
        background-color: rgba(230, 247, 255, 1) !important;
        color: #1890ff;
      }
      .point-active {
        background-color: rgba(230, 247, 255, 1) !important;
        color: #1890ff;
      }
    }
  }
  .ul-container {
    height: 320px;
    padding-top: 8px;
  }
  :deep(.el-input__suffix-inner) {
    display: inline-flex;
    align-items: center;
  }
}
</style>
