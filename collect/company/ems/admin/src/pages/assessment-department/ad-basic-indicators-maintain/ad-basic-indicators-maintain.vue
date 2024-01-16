<template>
  <page-common class="ad-basic-indicators-maintain" title="基础指标维护">
    <template v-slot:pageContent>
      <header class="flex-row-justify-center">
        <sub-title>基础指标维护明细</sub-title>
        <button primary @click="basicIndicatorMaintain.handleAddShow">新增</button>
      </header>
      <section v-loading="basicIndicatorMaintain.loading">
        <table>
          <thead>
            <tr>
              <th style="width: 120px">序号</th>
              <th>生效日期</th>
              <th>备注</th>
              <th style="width: 240px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in basicIndicatorMaintain.dataSource" :key="'data_' + index">
              <td style="width: 120px">
                {{
                  (basicIndicatorMaintain.queryParams.pageNum - 1) * basicIndicatorMaintain.queryParams.pageSize +
                  index +
                  1
                }}
              </td>
              <td>
                <div v-if="!item.effectiveStartTime && !item.effectiveEndTime">--</div>
                <el-tooltip
                  v-else
                  effect="dark"
                  :content="
                    item.effectiveStartTime && item.effectiveEndTime
                      ? `${item.effectiveStartTime + '~' + item.effectiveEndTime}`
                      : item.effectiveStartTime && !item.effectiveEndTime
                      ? `${item.effectiveStartTime}~至今`
                      : '--'
                  "
                  placement="top"
                  :show-after="500"
                >
                  <div>
                    {{
                      item.effectiveStartTime && item.effectiveEndTime
                        ? `${item.effectiveStartTime + '~' + item.effectiveEndTime}`
                        : item.effectiveStartTime && !item.effectiveEndTime
                        ? `${item.effectiveStartTime}~至今`
                        : '--'
                    }}
                  </div>
                </el-tooltip>
              </td>
              <td>
                <div v-if="!item.mark">--</div>
                <el-tooltip v-else effect="dark" :content="item.mark" placement="top" :show-after="500">
                  <div>{{ item.mark }}</div>
                </el-tooltip>
              </td>
              <td style="width: 240px">
                <button text @click="handlePageLink(item.id, item.effectiveStartTime, item.effectiveEndTime)">
                  维护数据
                </button>
                <button text @click="basicIndicatorMaintain.handleEditShow(item)">编辑</button>
                <el-popconfirm
                  title="确认删除吗？"
                  confirmButtonText="确定"
                  cancelButtonText="取消"
                  cancelButtonType="default"
                  @confirm="basicIndicatorMaintain.handleDeleteConfirm(item.id)"
                >
                  <template #reference>
                    <button text danger>删除</button>
                  </template>
                </el-popconfirm>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="common-table__empty" v-if="basicIndicatorMaintain.total === 0 && !basicIndicatorMaintain.loading">
          <img src="../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
          <p>暂无数据</p>
        </div>
        <ems-pagination
          v-show="!basicIndicatorMaintain.loading && basicIndicatorMaintain.total > 0"
          :current-page="basicIndicatorMaintain.queryParams.pageNum"
          :page-sizes="pageSizes"
          @size-change="basicIndicatorMaintain.handlePageSizeChange"
          @current-change="basicIndicatorMaintain.handlePageChange"
          :page-size="basicIndicatorMaintain.queryParams.pageSize"
          :total="basicIndicatorMaintain.total"
        >
        </ems-pagination>
      </section>
      <!-- 新增 -->
      <el-dialog
        v-model="basicIndicatorMaintain.visible"
        title="新增"
        width="495px"
        :before-close="basicIndicatorMaintain.handleClose"
        :close-on-click-modal="false"
      >
        <el-form :model="basicIndicatorMaintain.basicIndicatorVO" label-width="70px" @submit.native.prevent>
          <el-form-item label="开始日期">
            <el-date-picker
              :editable="false"
              v-model="basicIndicatorMaintain.basicIndicatorVO.effectiveStartTime"
              type="date"
              :disabled-date="basicIndicatorMaintain.handleStartDateDisabled"
              placeholder="开始日期"
              :prefix-icon="customPrefix"
              :clear-icon="customClose"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              :editable="false"
              v-model="basicIndicatorMaintain.basicIndicatorVO.effectiveEndTime"
              type="date"
              :disabled-date="basicIndicatorMaintain.handleEndDateDisabled"
              placeholder="结束日期"
              :prefix-icon="customPrefix"
              :clear-icon="customClose"
            />
          </el-form-item>
          <el-form-item class="textarea-form-item">
            <template #label>备注</template>
            <textarea
              rows="3"
              type="text"
              placeholder="请输入"
              v-inputFilter:search
              maxlength="200"
              v-model="basicIndicatorMaintain.basicIndicatorVO.mark"
            />
          </el-form-item>
        </el-form>
        <footer>
          <button @click="basicIndicatorMaintain.handleClose">取消</button>
          <button @click="handleSubmitAndLinkTo" v-if="!basicIndicatorMaintain.basicIndicatorVO.id">
            新增并维护数据
          </button>
          <button primary @click="basicIndicatorMaintain.submit">确定</button>
        </footer>
      </el-dialog>
    </template>
  </page-common>
</template>
<script lang="ts" setup>
import { BasicIndicatorMaintainService } from './ad-basic-indicators-maintain.service';
import { customPrefix, customClose } from '../../../config/index';
import { FGetSession, FSetSession } from '../../../utils/token';
import { useRouter, useRoute } from 'vue-router';
import { pageSizes } from '@/config';

const basicIndicatorMaintain = new BasicIndicatorMaintainService();
if (!!FGetSession('ad-basic-indicators-maintain-pageNum')) {
  const pageNum = Number(FGetSession('ad-basic-indicators-maintain-pageNum'));
  basicIndicatorMaintain.handlePageChange(pageNum);
} else {
  basicIndicatorMaintain.query();
}

const router = useRouter();
const route = useRoute();
function handlePageLink(id: string, effectiveStartTime: string, effectiveEndTime: string) {
  FSetSession('id', id);
  FSetSession('effectiveStartTime', effectiveStartTime);
  FSetSession('effectiveEndTime', effectiveEndTime);
  router.push({
    path: '/adBasicIndicatorMaintainDetail',
    query: route.query,
  });

  // 缓存当前页码
  FSetSession('ad-basic-indicators-maintain-pageNum', String(basicIndicatorMaintain.queryParams.pageNum));
}

async function handleSubmitAndLinkTo() {
  const res = await basicIndicatorMaintain.submit();

  if (res?.id) {
    handlePageLink(res?.id, res?.effectiveStartTime, res?.effectiveEndTime);
  }
}
</script>
<style lang="less" scoped>
.ad-basic-indicators-maintain {
  width: 100%;
  height: 100%;

  :deep(.page-common__container-detail) {
    display: flex;
    flex-direction: column;

    section {
      flex: 1 1 auto;
      margin-bottom: 16px;
    }
  }

  header {
    padding: 16px 0;
  }

  table {
    width: 100%;

    tbody tr td {
      overflow: hidden;
      text-overflow: ellipsis;

      vertical-align: middle;

      div {
        width: 100%;

        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 38px 63px 20px 57px;

    .el-form-item:first-child {
      .el-form-item__label {
        position: relative;

        &::before {
          content: '*';
          position: absolute;
          top: 56%;
          left: -7px;

          font-size: 16px;

          color: var(--color-error);

          transform: translateY(-50%);
        }
      }
    }

    .el-form-item__label {
      color: var(--color-text-primary);
    }

    textarea,
    .el-date-editor {
      width: 100%;
    }

    textarea {
      resize: none;
    }

    input::placeholder {
      color: rgba(191, 191, 191, 1);
    }

    footer {
      text-align: center;
      margin-top: 14px;
    }
    .textarea-form-item {
      align-items: flex-start;
      .el-form-item__label {
        line-height: 14px;
        margin-top: 7px;
      }
    }
  }
}
</style>
