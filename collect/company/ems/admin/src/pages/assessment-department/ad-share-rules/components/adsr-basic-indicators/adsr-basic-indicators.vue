<template>
  <div class="adsr-basic-indicators">
    <div class="adsr-bi-btn">
      <sub-title title="基础指标明细"></sub-title>
      <button primary @click="basicIndicator.handleAddShow">新增</button>
    </div>
    <div v-loading="basicIndicator.loading" class="adsr-bi-table">
      <table>
        <thead>
          <tr>
            <th style="width: 120px">序号</th>
            <th>指标名称</th>
            <th>指标属性</th>
            <th style="width: 240px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in basicIndicator.dataSource" :key="'data_' + index">
            <td style="width: 120px">
              {{ (basicIndicator.queryParams.pageNum - 1) * basicIndicator.queryParams.pageSize + index + 1 }}
            </td>
            <td>
              <span>{{ item.name ? item.name : '--' }}</span>
            </td>
            <td>
              <span>{{ item.indexType ? item.indexType : '--' }}</span>
            </td>
            <td style="width: 240px">
              <button text @click="basicIndicator.handleEditShow(item)">编辑</button>
              <el-popconfirm
                title="确认删除该条数据吗？"
                confirmButtonText="确定"
                cancelButtonText="取消"
                cancelButtonType="default"
                @confirm="basicIndicator.handleDeleteConfirm(item.id)"
              >
                <template #reference>
                  <button text danger>删除</button>
                </template>
              </el-popconfirm>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="common-table__empty" v-if="basicIndicator.total === 0 && !basicIndicator.loading">
        <img src="../../../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
        <p>暂无数据</p>
      </div>
      <ems-pagination
        v-show="!basicIndicator.loading && basicIndicator.total > 0"
        :current-page="basicIndicator.queryParams.pageNum"
        :page-sizes="pageSizes"
        @size-change="basicIndicator.handlePageSizeChange"
        @current-change="basicIndicator.handlePageChange"
        :page-size="basicIndicator.queryParams.pageSize"
        :total="basicIndicator.total"
      >
      </ems-pagination>
    </div>

    <!-- 新增&编辑 -->
    <el-dialog
      v-model="basicIndicator.visible"
      :title="basicIndicator.basicIndicatorVO?.id ? '编辑' : '新增'"
      width="495px"
      :before-close="basicIndicator.handleClose"
      :close-on-click-modal="false"
    >
      <el-form
        v-loading="basicIndicator.formLoading"
        :model="basicIndicator.basicIndicatorVO"
        label-width="65px"
        @submit.native.prevent
      >
        <el-form-item label="指标名称" class="name-formitem">
          <input
            type="text"
            placeholder="请输入"
            class="form-name"
            maxlength="20"
            v-inputFilter:search="{ allowSpace: false }"
            v-model="basicIndicator.basicIndicatorVO.name"
          />
        </el-form-item>
        <el-form-item label="指标属性">
          <el-select v-model="basicIndicator.basicIndicatorVO.indexType" placeholder="请选择">
            <el-option
              v-for="(item, index) in basicIndicator.indexTypes"
              :key="'options' + index"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <div class="btn-form">
          <button @click="basicIndicator.handleClose">取消</button>
          <button primary @click="basicIndicator.submit">确定</button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { AdsrBasicIndicatorService } from './adsr-basic-indicators.service';

import { pageSizes } from '@/config';

const basicIndicator = new AdsrBasicIndicatorService();
basicIndicator.query();
</script>

<style lang="less" scoped>
.adsr-basic-indicators {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  .adsr-bi-btn {
    display: flex;
    flex-direction: row;

    align-items: center;
    justify-content: space-between;

    padding: 20px 0 13px;
  }

  .adsr-bi-table {
    flex: 1 1 auto;

    table {
      width: 100%;

      border-spacing: 0;

      tbody tr td {
        overflow: hidden;

        span {
          white-space: normal;
          word-break: break-all;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      }
    }
  }

  :deep(.el-dialog) {
    .el-dialog__body {
      padding-bottom: 17px;

      .el-form {
        padding-left: 40px;
        padding-right: 40px;
      }

      .el-form .name-formitem {
        position: relative;
        margin-bottom: 36px !important;
        margin-top: 18px;

        input {
          border-color: var(--color-text-border);
        }

        input:focus {
          border-color: var(--color-primary);
        }

        input:hover {
          border-color: var(--color-primary);
        }
      }

      .btn-form {
        margin-top: 32px;
        margin-bottom: 4px;
        text-align: center;
      }
    }

    input,
    .el-select {
      width: 100%;
    }
  }
}
</style>
