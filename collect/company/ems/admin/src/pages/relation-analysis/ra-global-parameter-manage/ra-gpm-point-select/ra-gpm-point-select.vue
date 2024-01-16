<template>
  <el-dialog
    v-model="pointSelect.visible"
    custom-class="ra-gpm-point-select"
    title="点位选择"
    width="540px"
    :close-on-click-modal="false"
  >
    <div class="ra-gpm-ps-container">
      <div class="list-item has-diliver">
        <h5>设备</h5>
        <ul v-if="pointSelect.deviceList?.length && !pointSelect.deviceLoading">
          <li v-for="(item, index) in pointSelect.deviceList" :title="item.deviceName">
            {{ item.deviceName }}
          </li>
        </ul>
        <div
          v-if="pointSelect.deviceList?.length === 0 && !pointSelect.deviceLoading"
          class="flex-column-center-center"
        >
          <img src="../../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
          <p>暂无数据</p>
        </div>
      </div>
      <div class="list-item">
        <h5>点位</h5>

        <ul v-if="pointSelect.pointList?.length && !pointSelect.deviceLoading">
          <li v-for="(item, index) in pointSelect.pointList">
            {{ item }}
          </li>
        </ul>
        <div v-if="pointSelect.pointList?.length === 0 && !pointSelect.deviceLoading" class="flex-column-center-center">
          <img src="../../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
          <p>暂无数据</p>
        </div>
      </div>
    </div>
    <template #footer>
      <button>取消</button>
      <button primary>确认</button>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import pointSelect from './ra-gpm-point-select.service';
</script>
<style lang="less">
.ra-gpm-point-select {
  font-size: 24px;

  .el-dialog__body {
    height: 400px !important;
    padding: 0 !important;
  }

  .ra-gpm-ps-container {
    height: 100%;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 1fr;

    .list-item {
      height: 100%;
      overflow: hidden;

      padding: 16px;

      display: flex;
      flex-direction: column;

      &.has-diliver {
        border-right: 1px solid var(--color-text-divider);
      }

      h5 {
        font-size: 16px;
        color: var(--color-text);

        margin-top: 8px;
        margin-bottom: 16px;
      }

      div,
      ul {
        flex: 1 1 auto;
        overflow-y: auto;
      }

      ul {
        li {
          line-height: 22px;

          padding: 7px 12px;

          overflow: hidden;
          text-overflow: ellipsis;
        }

        li:hover,
        li.selected {
          cursor: pointer;
          background-color: var(--color-hover);

          transition: all 233ms;
        }
      }
    }
  }
}
</style>
