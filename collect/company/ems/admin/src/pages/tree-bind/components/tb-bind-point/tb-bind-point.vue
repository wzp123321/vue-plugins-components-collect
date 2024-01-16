<!--
 * @Author: yut
 * @Date: 2024-01-09 10:04:16
 * @LastEditors: yut
 * @LastEditTime: 2024-01-10 15:36:34
 * @Descripttion: 
-->
<template>
  <div class="tb-bind-point">
    <te-dialog
      title="点位选择"
      v-model="visible"
      width="1200px"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      destroy-on-close
      @closed="closed"
    >
      <template #header>
        <div class="tbp-header">
          <h5>点位选择</h5>
          <span @click="close">
            <icon-close />
          </span>
        </div>
      </template>
      <div class="tbp-container">
        <section class="tbp-container-left">
          <div class="tbp-container-header">
            <span>待选</span>
          </div>
          <div class="tbp-container-choose">
            <div class="tbp-container-carditem">
              <div class="tbp-container-carditem-header">站点名称</div>
              <div class="tbp-container-carditem-query">
                <te-input
                  maxLength="32"
                  v-model="searchStationInput"
                  v-inputFilter:search="{ allowSpace: false }"
                  placeholder="请输入站点名称"
                >
                  <template #suffix>
                    <icon-search />
                  </template>
                </te-input>
              </div>
              <div class="tbp-container-carditem-list" v-loading="tbBindService.stationObj.loading">
                <div
                  class="tbp-container-carditem-list-item"
                  :class="tbBindService.stationObj.checkedId === el.id ? 'is-checked' : ''"
                  @click="onConcentratorSelect(el)"
                  :title="el.name"
                  v-for="(el, index) in stationList"
                  v-if="stationList.length"
                  :key="index"
                >
                  <div>{{ el.name }}</div>
                </div>
                <no-data v-else></no-data>
              </div>
            </div>
            <div class="tbp-container-carditem">
              <div class="tbp-container-carditem-header">设备名称</div>
              <div class="tbp-container-carditem-query">
                <te-input
                  maxLength="32"
                  v-model="searchDeivceInput"
                  v-inputFilter:search="{ allowSpace: false }"
                  placeholder="请输入设备名称"
                >
                  <template #suffix>
                    <icon-search />
                  </template>
                </te-input>
              </div>
              <div class="tbp-container-carditem-list" v-loading="tbBindService.deveiceObj.loading">
                <div
                  class="tbp-container-carditem-list-item"
                  :class="tbBindService.deveiceObj.checkedId === el.id ? 'is-checked' : ''"
                  @click="onDeviceSelect(el)"
                  :title="el.name"
                  v-for="(el, index) in deviceList"
                  v-if="deviceList.length"
                  :key="index"
                >
                  <div>{{ el.name }}</div>
                </div>
                <no-data v-else></no-data>
              </div>
            </div>
            <div class="tbp-container-carditem">
              <div class="tbp-container-carditem-header">点位名称</div>
              <div class="tbp-container-carditem-query">
                <te-input
                  maxLength="32"
                  v-model="searchPointInput"
                  v-inputFilter:search="{ allowSpace: false }"
                  placeholder="请输入点位名称"
                >
                  <template #suffix>
                    <icon-search />
                  </template>
                </te-input>
              </div>
              <div class="tbp-container-carditem-list" v-loading="tbBindService.pointObj.loading">
                <te-checkbox-group v-model="checkList" v-if="pointList.length">
                  <te-checkbox
                    :label="el.id"
                    class="checkbox-list-item"
                    v-for="(el, i) in pointList"
                    :key="i"
                    :checked="el.isChecked"
                    :disabled="checkedIdList.includes(el.id)"
                    @change="changePointBoxChecked($event, el)"
                  >
                    <div class="label-item" :title="el.name">{{ el.name }}</div>
                  </te-checkbox>
                </te-checkbox-group>
                <no-data v-else></no-data>
              </div>
            </div>
          </div>
        </section>
        <section class="tbp-container-right">
          <div class="tbp-container-header">
            <span>{{ '已选' + '(' + tbBindService.checkedList.length + ')' }}</span>
            <i @click="clear"><icon-delete /></i>
          </div>
          <div class="tbp-container-checked" v-if="tbBindService.checkedList.length">
            <div
              class="tbp-container-carditem-list-item check-list-item"
              :title="el.name"
              v-for="(el, index) in tbBindService.checkedList"
              :key="index"
            >
              <div class="check-list-item-container">
                <div class="check-list-item-device">{{ el.deviceName }}</div>
                <div class="check-list-item-point">{{ el.name }}</div>
              </div>
              <i @click="deletePoint(el)"><icon-close /></i>
            </div>
          </div>
          <no-data v-else></no-data>
        </section>
      </div>
      <template #footer>
        <span class="tbp-footer">
          <button @click="close">取消</button>
          <button primary @click="onSubmit" :disabled="!tbBindService.checkedList.length">确定</button>
        </span>
      </template>
    </te-dialog>
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed, ref } from 'vue';
import TbBindPointService from './tb-bind-point.service';
import { IconClose, IconDelete, IconSearch } from '@arco-iconbox/vue-te';
import { Tb_ICommonVO, Tb_IPointInfoListInfo } from './tb-bind-point.api';
import { cloneDeep } from 'lodash';

const props = defineProps({
  standardPointCode: {
    type: String,
    default: '',
  },
  energyCode: {
    type: String,
    default: '',
  },
  checkedIdList: {
    type: Array as PropType<number[]>,
    default: [],
  },
});

const tbBindService = new TbBindPointService();
const visible = ref(false);
const searchStationInput = ref('');
const searchDeivceInput = ref('');
const searchPointInput = ref('');

const checkList = ref<number[]>([]);

const stationList = computed(() => {
  return tbBindService.stationObj.dataList.filter((item) => {
    return item.name.toLowerCase().indexOf(searchStationInput.value.toLowerCase()) > -1;
  });
});
const deviceList = computed(() => {
  return tbBindService.deveiceObj.dataList.filter((item) => {
    return item.name.toLowerCase().indexOf(searchDeivceInput.value.toLowerCase()) > -1;
  });
});
const pointList = computed(() => {
  return tbBindService.pointObj.dataList.filter((item) => {
    return item.name.toLowerCase().indexOf(searchPointInput.value.toLowerCase()) > -1;
  });
});

/**
 * 打开弹窗
 */
const show = async () => {
  visible.value = true;
  init();
  tbBindService.getStationParams.standardPointCode = props.standardPointCode ?? '';
  await tbBindService.getStationData();

  tbBindService.getDeviceParams.concentratorId = tbBindService.stationObj.checkedId;
  tbBindService.getDeviceParams.standardPointCode = props.standardPointCode ?? '';
  await tbBindService.getDeviceDataList();

  tbBindService.getPointParams.id = tbBindService.deveiceObj.checkedId;
  tbBindService.getPointParams.energyCode = props.energyCode ?? '';
  await tbBindService.getPointDataList();
};

/**
 * 点击集中器
 * @param el
 */
const onConcentratorSelect = async (el: Tb_ICommonVO) => {
  if (el.id === tbBindService.stationObj.checkedId) return;
  tbBindService.stationObj.checkedId = el.id;
  tbBindService.deveiceObj.loading = true;
  tbBindService.pointObj.loading = true;

  tbBindService.getDeviceParams.concentratorId = el.id;
  tbBindService.getDeviceParams.standardPointCode = props.standardPointCode ?? '';
  await tbBindService.getDeviceDataList();

  tbBindService.getPointParams.id = tbBindService.deveiceObj.checkedId;
  tbBindService.getPointParams.energyCode = props.energyCode ?? '';
  await tbBindService.getPointDataList();
};

/**
 * 点击设备
 * @param el
 */
const onDeviceSelect = (el: Tb_ICommonVO) => {
  if (el.id === tbBindService.deveiceObj.checkedId) return;
  tbBindService.deveiceObj.checkedId = el.id;
  tbBindService.getPointParams.id = el.id;
  tbBindService.getPointParams.energyCode = props.energyCode ?? '';
  tbBindService.getPointDataList();
};

const changePointBoxChecked = (value: boolean, el: Tb_IPointInfoListInfo) => {
  if (value) {
    tbBindService.checkedList = [...tbBindService.checkedList, el];
  } else {
    tbBindService.checkedList = tbBindService.checkedList.filter((item) => item.id !== el.id);
  }
};

/**
 * 删除已选点位
 * @param el
 */
const deletePoint = (el: Tb_IPointInfoListInfo) => {
  tbBindService.checkedList = tbBindService.checkedList.filter((item) => item.id !== el.id);
  checkList.value = cloneDeep(tbBindService.checkedList).map((it) => it.id);
};

/**
 * 清空
 */
const clear = () => {
  checkList.value = [];
  tbBindService.checkedList = [];
};

/**
 * 初始化
 */
const init = () => {
  tbBindService.stationObj = {
    loading: true,
    checkedId: -1,
    dataList: [],
  };
  tbBindService.deveiceObj = {
    loading: true,
    checkedId: -1,
    dataList: [],
  };
  tbBindService.pointObj = {
    loading: true,
    checkedId: -1,
    dataList: [],
  };
};

/**
 * 取消
 */
const close = () => {
  visible.value = false;
};

/**
 * 关闭后
 */
const closed = () => {
  init();
  checkList.value = [];
  tbBindService.checkedList = [];
  searchStationInput.value = '';
  searchDeivceInput.value = '';
  searchPointInput.value = '';
};

const emit = defineEmits(['add']);

const onSubmit = () => {
  visible.value = false;
  emit('add', tbBindService.checkedList);
};

defineExpose({
  show,
});
</script>
<style lang="less" scoped>
.tb-bind-point {
  :deep(.te-dialog__header) {
    padding: 0;
    margin: 0;
  }
  .tbp-header {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 20px;
    h5 {
      font-size: var(--te-font-size-h20);
      font-weight: 600;
      color: var(--te-text-color-primary);
    }
    span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      height: 32px;
      width: 32px;
      .teicon--icon-close {
        font-size: 20px;
      }
    }
  }

  .tbp-container {
    height: 440px;
    border-radius: 4px;
    border: 1px solid var(--te-border-color-light);
    display: flex;
    &-header {
      height: 40px;
      display: flex;
      flex: none;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      background-color: var(--te-fill-color-light);
      span {
        font-size: var(--te-font-size-b14);
        font-weight: 600;
        color: var(--te-text-color-regular);
      }
      i {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
      }
    }
    &-left {
      width: calc(100% - 280px);
      display: flex;
      flex-direction: column;
    }
    &-right {
      width: 280px;
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--te-border-color-light);
      .check-list-item {
        justify-content: space-between;
        cursor: default !important;
        height: 56px;
        &-container {
          flex: auto;
          width: 0;
          display: flex;
          flex-direction: column;
          div {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        &-device {
          font-size: var(--te-font-size-b12);
          color: var(--te-text-color-secondary);
        }
        &-point {
          font-size: var(--te-font-size-b14);
          color: var(--te-text-color-regular);
        }
      }
    }
    &-checked {
      flex: auto;
      height: 0;
      overflow: auto;
    }

    &-choose {
      flex: auto;
      flex-direction: row;
      display: flex;
    }
    &-carditem {
      width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      &:nth-child(2) {
        border-left: 1px solid var(--te-border-color-light);
        border-right: 1px solid var(--te-border-color-light);
      }
      &-header {
        height: 22px;
        margin-top: 8px;
        flex: none;
        color: var(--te-text-color-regular);
        font-size: var(--te-font-size-b14);
        padding: 0 var(--te-space-16);

        font-weight: 600;
      }
      &-query {
        flex: none;
        height: 48px;
        display: flex;
        align-items: center;
        padding: 8px var(--te-space-16);
      }
      &-list {
        flex: auto;
        height: 0;
        overflow: auto;
        &-item {
          height: 32px;
          cursor: pointer;
          display: flex;
          align-items: center;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          font-size: var(--te-font-size-b14);
          color: var(--te-text-color-regular);

          div {
            height: 100%;
            width: 100%;
            line-height: 32px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 0 var(--te-space-16);

            &:hover {
              font-weight: 600;
              background-color: var(--te-fill-color-light);
              i {
                visibility: visible;
              }
            }
          }
          &.is-checked {
            div {
              color: var(--te-color-primary);
              font-weight: 600;
            }
          }
          span {
            flex: auto;
            width: 0;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
          i {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            width: 16px;
            height: 16px;
            visibility: hidden;
          }
        }
      }
      .checkbox-list-item {
        height: 100%;
        width: 100%;
        height: 32px;
        line-height: 32px;
        padding: 0 var(--te-space-16);
        display: flex;

        :deep(.te-checkbox__label) {
          flex: auto;
          width: 0;
        }

        .label-item {
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        &:hover {
          .label-item {
            font-weight: 600;
          }
          background-color: var(--te-fill-color-light);
          i {
            visibility: visible;
          }
        }
      }
    }
  }
}
</style>
