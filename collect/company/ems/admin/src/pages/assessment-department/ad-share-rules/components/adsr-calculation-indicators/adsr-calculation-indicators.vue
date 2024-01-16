<template>
  <div class="adsr-calculation-indicators">
    <div class="adsr-ci-btn">
      <sub-title title="计算指标明细"></sub-title>
      <button primary @click="calculationIndicators.handleDialogShow()">新增</button>
    </div>
    <div class="adsrci-table-container" v-loading="calculationIndicators.loading">
      <div v-show="calculationIndicators.loading" class="adsrci-table-mask"></div>
      <el-table max-height="536px" :data="calculationIndicators.dataSource">
        <el-table-column label="序号" width="100px">
          <template #default="scope">
            {{
              (calculationIndicators.queryParams.pageNum - 1) * calculationIndicators.queryParams.pageSize +
              scope.$index +
              1
            }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="指标名称" width="400px" show-overflow-tooltip>
          <template #default="scope">
            <span> {{ scope.row.name || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="指标说明" show-overflow-tooltip>
          <template #default="scope">
            <span> {{ scope.row.description || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template #default="scope">
            <button text @click="calculationIndicators.seeDetail(scope.row)">查看</button>
            <button text @click="calculationIndicators.editIndicator(scope.row)">编辑</button>
            <el-popconfirm
              title="确认删除该条数据吗?"
              placement="bottom"
              confirmButtonText="确定"
              cancelButtonText="取消"
              cancelButtonType="default"
              @confirm="calculationIndicators.deleteIndicator(scope)"
            >
              <template #reference>
                <button text style="color: rgba(245, 34, 45, 1)">删除</button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <ems-pagination
        v-show="calculationIndicators.total > 0"
        :current-page="calculationIndicators.queryParams.pageNum"
        :page-sizes="pageSizes"
        @size-change="calculationIndicators.handlePageSizeChange"
        @current-change="calculationIndicators.handlePageChange"
        :page-size="calculationIndicators.queryParams.pageSize"
        :total="calculationIndicators.total"
      >
      </ems-pagination>
    </div>

    <!-- 新增&编辑 -->
    <el-dialog
      v-model="calculationIndicators.visible"
      :title="calculationIndicators.title.value"
      width="700px"
      :before-close="calculationIndicators.handleClose"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <add-dialog
        title="指标"
        name="计算指标"
        :isAdd="calculationIndicators.title.value === '新增计算指标'"
        @cancel="cancelAddOrEdit"
        @sure="sureAddOrEdit"
        :editItem="calculationIndicators.indicatorItem.value"
      ></add-dialog>
    </el-dialog>

    <!-- 查看 -->
    <el-dialog v-model="calculationIndicators.visibleLook" title="查看" width="575px" :close-on-click-modal="false">
      <div class="adsrci-detail">
        <span class="adsrci-detail-label">指标名称:</span>
        <span class="adsrci-detail-value">{{ calculationIndicators.indicatorItem.value?.name || '--' }}</span>
      </div>
      <div class="adsrci-detail">
        <span class="adsrci-detail-label">指标说明:</span>
        <span class="adsrci-detail-value">{{ calculationIndicators.indicatorItem.value?.description || '--' }}</span>
      </div>
      <div class="adsrci-detail-rule">
        <span class="adsrci-detail-rule-label">计算指标:</span>
        <span class="adsrci-detail-rule-value">
          <span class="adsrci-formula-name">{{ calculationIndicators.indicatorItem.value?.name || '' }}=</span>
          <span
            :class="{
              'adsrci-detail-formula': !isOperator(item.serialNumber) && item.indexType !== 'number',
            }"
            :style="{
              backgroundColor: ColorType[item.indexType],
              color: FontColorType[item.indexType],
            }"
            v-for="item in calculationIndicators.indicatorItem.value?.formulaComponentList"
          >
            {{ item.serialNumber.includes('R') ? 'Σ' + item.name : item.name }}
          </span>
        </span>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { AdsrCalculationIndicatorService } from './adsr-calculation-indicators.service';
import AddDialog from '../adsr-add-dialog/adsr-add-dialog.vue';
import { pageSizes } from '../../../../../config/index';
import { ColorType, FontColorType, CalculationIndicatoItem } from '../adsr-add-dialog/adsr-add-dialog-api';
import { ElMessageBox } from 'element-plus';

const calculationIndicators = new AdsrCalculationIndicatorService();
calculationIndicators.query();

function cancelAddOrEdit(isChange: boolean) {
  if (isChange) {
    ElMessageBox.confirm('退出后不保存编辑内容', '确认退出吗？', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'adsrci-cancel-dialog',
    })
      .then(() => {
        calculationIndicators.query();
        calculationIndicators.visible = false;
      })
      .catch(() => {});
  } else {
    calculationIndicators.query();
    calculationIndicators.visible = false;
  }
}

function sureAddOrEdit(data: CalculationIndicatoItem) {
  calculationIndicators.addOrEditIndicator(data);
}

function isOperator(val: string): boolean {
  const operators = ['+', '-', '*', '/', 'Σ', '(', ')'];
  return operators.includes(val);
}
</script>

<style lang="less" scoped>
.adsr-calculation-indicators {
  width: 100%;
  height: 100%;
  .adsrci-table-container {
    height: calc(100% - 68px);
    position: relative;
  }
  .adsrci-table-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    z-index: 5;
  }
  .adsr-ci-btn {
    display: flex;
    flex-direction: row;

    justify-content: space-between;
    align-items: center;

    padding: 20px 0 12px;
  }

  table {
    width: 100%;
    border-spacing: 0;
    thead {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

    thead.overflow-thead {
      width: calc(100% - 8px);
    }

    tbody {
      max-height: 480px;
      overflow-y: auto;
      display: block;

      tr {
        display: table;
        width: 100%;
        table-layout: fixed;

        td {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
      }
    }
  }

  :deep(.el-dialog) {
    .el-dialog__body {
      max-height: 600px;
      overflow: auto;
      padding: 40px 67px;
    }
    .el-dialog__header {
      padding-bottom: 20px;
    }
  }
  .adsrci-detail {
    display: flex;
    margin-bottom: 40px;
    &-label {
      width: 60px;
      margin-right: 16px;
    }
    &-value {
      flex: 1;
      overflow: hidden;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
  .adsrci-detail-rule {
    display: flex;
    min-height: 34px;
    &-label {
      line-height: 34px;
      width: 60px;
      margin-right: 16px;
    }
    &-value {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      span {
        display: inline-block;
        height: 34px;
        line-height: 34px;
      }
    }
    .adsrci-formula-name {
      color: #1890ff;
    }
    .adsrci-detail-formula {
      height: 34px;
      line-height: 34px;
      padding: 0 12px;
      border-radius: 17px;
      color: #096dd9;
      background-color: #e6f7ff;
    }
  }
}
</style>
<style lang="less">
.adsrci-cancel-dialog {
  .el-message-box__container {
    .el-message-box__status {
      position: absolute;
    }
  }
}
</style>
