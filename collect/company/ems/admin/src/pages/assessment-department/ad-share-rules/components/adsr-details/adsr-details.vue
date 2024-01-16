<template>
  <div class="adsr-details">
    <div class="adsrd-btn" v-show="ruleDetails.isShowTable">
      <sub-title title="分摊规则明细"></sub-title>
      <button primary @click="ruleDetails.handleDialogShow()">新增</button>
    </div>
    <div class="adsrd-table-container" v-loading="ruleDetails.loading">
      <div v-show="ruleDetails.loading" class="adsrd-table-mask"></div>
      <el-table max-height="536px" v-show="ruleDetails.isShowTable" :data="ruleDetails.dataSource">
        <el-table-column label="序号" width="100px">
          <template #default="scope">
            {{ (ruleDetails.queryParams.pageNum - 1) * ruleDetails.queryParams.pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="规则名称" width="400px" show-overflow-tooltip>
          <template #default="scope">
            <span> {{ scope.row.name || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="规则说明" show-overflow-tooltip>
          <template #default="scope">
            <span> {{ scope.row.description || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template #default="scope">
            <button text @click="ruleDetails.seeDetail(scope.row)">查看</button>
            <button text @click="ruleDetails.editRule(scope.row)">编辑</button>
            <el-popconfirm
              title="确认删除该条数据吗?"
              placement="bottom"
              confirmButtonText="确定"
              cancelButtonText="取消"
              cancelButtonType="default"
              @confirm="ruleDetails.deleteRule(scope)"
            >
              <template #reference>
                <button text style="color: rgba(245, 34, 45, 1)">删除</button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <ems-pagination
        v-show="!ruleDetails.loading && ruleDetails.dataSource.length > 0"
        :current-page="ruleDetails.queryParams.pageNum"
        :page-sizes="pageSizes"
        @size-change="ruleDetails.handlePageSizeChange"
        @current-change="ruleDetails.handlePageChange"
        :page-size="ruleDetails.queryParams.pageSize"
        :total="ruleDetails.total"
      >
      </ems-pagination>
      <div class="adsrd-empty-data" v-show="!ruleDetails.loading && !ruleDetails.isShowTable">
        <img src="@/assets/img/assessment-department/ad-empty-data.svg" alt="empty" />
        <div class="adsrd-empty-tips">
          请前往&nbsp;<span class="adsrd-empty-jump" @click="toBasicIndicator">“基础指标”</span>&nbsp;进行数据配置
        </div>
      </div>
    </div>
    <!-- 新增&编辑 -->
    <!-- 新增&编辑 -->
    <el-dialog
      v-model="ruleDetails.visible"
      :title="ruleDetails.title.value"
      width="700px"
      :before-close="ruleDetails.handleClose"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <add-dialog
        title="规则"
        name="分摊规则"
        :isAdd="ruleDetails.title.value === '新增分摊规则'"
        @cancel="cancelAddOrEdit"
        @sure="sureAddOrEdit"
        :editItem="ruleDetails.ruleItem.value"
      ></add-dialog>
    </el-dialog>
    <!-- 查看 -->
    <el-dialog v-model="ruleDetails.visibleLook" title="查看" width="575px" :close-on-click-modal="false">
      <div class="adsrd-detail">
        <span class="adsrd-detail-label">规则名称:</span>
        <span class="adsrd-detail-value">{{ ruleDetails.ruleItem.value?.name || '--' }}</span>
      </div>
      <div class="adsrd-detail">
        <span class="adsrd-detail-label">规则说明:</span>
        <span class="adsrd-detail-value">{{ ruleDetails.ruleItem.value?.description || '--' }}</span>
      </div>
      <div class="adsrd-detail-rule">
        <span class="adsrd-detail-rule-label">分摊规则:</span>
        <span class="adsrd-detail-rule-value">
          <span class="adsrd-formula-name">{{ ruleDetails.ruleItem.value?.name || '' }}=</span>
          <span
            :class="{
              'adsrd-detail-formula': !isOperator(item.serialNumber) && item.indexType !== 'number',
            }"
            :style="{
              backgroundColor: ColorType[item.indexType],
              color: FontColorType[item.indexType],
            }"
            v-for="item in ruleDetails.ruleItem.value?.formulaComponentList"
          >
            {{ item.serialNumber.includes('R') ? 'Σ' + item.name : item.name }}
          </span>
        </span>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { AdsrDetailsService } from './adsr-details.services';
import AddDialog from '../adsr-add-dialog/adsr-add-dialog.vue';
import { pageSizes } from '../../../../../config/index';
import { ColorType, FontColorType } from '../adsr-add-dialog/adsr-add-dialog-api';
import { ElMessageBox } from 'element-plus';
import { RuleItem } from './adsr-details.api';
import message from '@/utils/message';

const emit = defineEmits(['toBasicIndicator']);

const ruleDetails = new AdsrDetailsService();

function cancelAddOrEdit(isChange: boolean) {
  if (isChange) {
    ElMessageBox.confirm('退出后不保存编辑内容', '确认退出吗？', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'adsrci-cancel-dialog',
    })
      .then(() => {
        ruleDetails.query();
        ruleDetails.visible = false;
      })
      .catch(() => {});
  } else {
    ruleDetails.query();
    ruleDetails.visible = false;
  }
}

function sureAddOrEdit(data: RuleItem) {
  if (
    data.formulaComponentList?.[0].indexType === 'number' &&
    (Number(data.formulaComponentList?.[0].serialNumber) > 1 ||
      Number(data.formulaComponentList?.[0].serialNumber) <= 0)
  ) {
    message.error('分摊规则需大于0且小于等于1');
  } else {
    ruleDetails.addOrEditRule(data);
  }
}
function isOperator(val: string): boolean {
  const operators = ['+', '-', '*', '/', 'Σ', '(', ')'];
  return operators.includes(val);
}

function toBasicIndicator() {
  emit('toBasicIndicator');
}
</script>

<style lang="less" scoped>
.adsr-details {
  width: 100%;
  height: 100%;

  .adsrd-table-container {
    height: calc(100% - 68px);
    position: relative;
  }
  .adsrd-table-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    z-index: 5;
  }
  .adsrd-btn {
    display: flex;
    flex-direction: row;

    justify-content: space-between;
    align-items: center;

    padding: 20px 0 12px;
  }

  :deep(.el-dialog) {
    .el-dialog__body {
      padding-left: 67px;
      padding-right: 67px;
      max-height: 600px;
      overflow: auto;
      .form-name {
        width: 300px;
      }

      .form-description {
        width: 100%;
        resize: none;
      }
    }
  }
  .adsrd-empty-data {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .adsrd-empty-tips {
      font-size: 16px;
      margin-top: 43px;
    }
    .adsrd-empty-jump {
      cursor: pointer;
      font-size: 16px;
      color: rgba(24, 144, 255, 1);
    }
  }
  .adsrd-detail {
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
  .adsrd-detail-rule {
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
    .adsrd-formula-name {
      color: #1890ff;
    }
    .adsrd-detail-formula {
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
