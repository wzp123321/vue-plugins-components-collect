<template>
  <div class="adsr-associated-scope">
    <section class="adsr-as-toolbar flex-row-justify-center">
      <sub-title title="关联范围明细"></sub-title>
      <button primary @click="associateScope.handleAddShow">新增</button>
    </section>
    <section class="adsr-as-table" v-loading="associateScope.loading">
      <table>
        <thead>
          <tr>
            <th style="width: 120px">序号</th>
            <th>关联范围名称</th>
            <th>关联范围属性</th>
            <th style="width: 240px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in associateScope.dataSource" :key="'data_' + index">
            <td style="width: 120px">
              {{ (associateScope.queryParams.pageNum - 1) * associateScope.queryParams.pageSize + index + 1 }}
            </td>
            <td>
              <span>{{ item.name ? item.name : '--' }}</span>
            </td>
            <td>
              <span>{{ item.scopeTypeText ? item.scopeTypeText : '--' }}</span>
            </td>
            <td style="width: 240px">
              <button
                v-if="item.fixed !== String(ADSR_FIXED_TYPE.系统内置)"
                text
                @click="associateScope.handleDetailShow(item.id)"
              >
                查看
              </button>
              <button
                v-if="item.fixed !== String(ADSR_FIXED_TYPE.系统内置)"
                text
                @click="associateScope.handleEditShow(item)"
              >
                编辑
              </button>
              <el-popconfirm
                v-if="item.fixed !== String(ADSR_FIXED_TYPE.系统内置)"
                title="确认删除该条数据吗？"
                confirmButtonText="确定"
                cancelButtonText="取消"
                cancelButtonType="default"
                @confirm="associateScope.handleDeleteConfirm(item.id)"
              >
                <template #reference>
                  <button text danger>删除</button>
                </template>
              </el-popconfirm>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="common-table__empty" v-if="associateScope.total === 0 && !associateScope.loading">
        <img src="../../../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
        <p>暂无数据</p>
      </div>
      <ems-pagination
        v-show="!associateScope.loading && associateScope.total > 0"
        :current-page="associateScope.queryParams.pageNum"
        :page-sizes="pageSizes"
        @size-change="associateScope.handlePageSizeChange"
        @current-change="associateScope.handlePageChange"
        :page-size="associateScope.queryParams.pageSize"
        :total="associateScope.total"
      >
      </ems-pagination>
    </section>
    <!-- 新增&编辑 -->
    <el-dialog
      v-model="associateScope.visible"
      :title="associateScope.associateScopeVO?.id ? '编辑' : '新增'"
      width="536px"
      :before-close="associateScope.handleClose"
      :close-on-click-modal="false"
    >
      <el-form
        v-loading="associateScope.formLoading"
        :model="associateScope.associateScopeVO"
        label-width="93px"
        @submit.native.prevent
      >
        <el-form-item label="关联范围名称" class="formitem-margin">
          <input
            type="text"
            placeholder="请输入"
            v-model="associateScope.associateScopeVO.name"
            maxlength="20"
            v-inputFilter:search="{ allowSpace: false }"
          />
        </el-form-item>
        <el-form-item label="关联范围属性" class="formitem-margin">
          <el-select
            v-model="associateScope.associateScopeVO.scopeType"
            class="m-2"
            placeholder="请选择"
            @change="associateScope.handleScopeTypeChange"
          >
            <el-option
              v-for="item in associateScope.indexTypes"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联节点">
          <tree-select
            :showSearch="true"
            :maxLength="9999"
            nameSpace="关联节点"
            placeholder="请选择"
            :autoWidth="true"
            :multiple="true"
            :nodeKey="TM_NodeKey"
            :loading="associateScope.treeLoading"
            :expanedKeys="associateScope.expandedKeys"
            :defaultProps="{
              ...TM_DefaultProps,
              disabled: 'selectable',
            }"
            :treeData="associateScope.treeList"
            v-model:modelValue="associateScope.associateScopeVO.treeIds"
            :disabledProps="{ disabledKey: 'selectable', disabledValue: true }"
          ></tree-select>
        </el-form-item>
        <footer>
          <button @click="associateScope.handleClose">取消</button>
          <button primary @click="associateScope.submit">确定</button>
        </footer>
      </el-form>
    </el-dialog>
    <!-- 查看 -->
    <el-dialog
      v-model="associateScope.detailVisible"
      title="查看"
      width="536px"
      custom-class="detail-dialog"
      :before-close="associateScope.handleClose"
      :close-on-click-modal="false"
    >
      <div class="adsr-as-detail" v-loading="associateScope.formLoading">
        <label>关联范围名称：</label>
        <div :title="associateScope.associateScopeVO.name">
          {{ associateScope.associateScopeVO.name ? associateScope.associateScopeVO.name : '--' }}
        </div>
        <label>关联范围属性：</label>
        <div :title="associateScope.associateScopeVO.scopeTypeText">
          {{ associateScope.associateScopeVO.scopeTypeText ? associateScope.associateScopeVO.scopeTypeText : '--' }}
        </div>
        <label>关联节点：</label>
        <div>
          <p
            v-for="(item, index) in associateScope.associateScopeVO.treeNames"
            :key="'treeName_' + index"
            :title="item"
          >
            {{ item }}
          </p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { AssociateScopeService } from './adsr-associated-scope.service';
import { ADSR_FIXED_TYPE, ADBIM_ESTATE } from './adsr-associated-scope.api';
import { pageSizes } from '@/config';
import { TM_DefaultProps, TM_NodeKey } from '@/pages/tree-manage/tree-manage.api';

const associateScope = new AssociateScopeService();
associateScope.query();
</script>

<style lang="less" scoped>
.adsr-associated-scope {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  .adsr-as-toolbar {
    padding: 20px 0 13px;
  }

  .adsr-as-table {
    flex: 1 1 auto;

    table {
      width: 100%;
    }
  }

  :deep(.el-dialog__body) {
    padding: 38px 71px 20px 69px;

    input,
    .el-select {
      width: 100%;
    }

    footer {
      margin-top: 30px;
      text-align: center;
    }

    .el-form {
      .formitem-margin {
        margin-bottom: 36px !important;
      }
    }

    .adsr-as-detail {
      height: 100%;
      display: grid;
      grid-template-columns: 88px auto;
      gap: 50px 16px;

      padding: 7px 0 0;

      label,
      div {
        line-height: 22px;
        color: var(--color-text-secondary);
        font-size: 14px;
      }

      label {
        text-align: right;
      }

      div {
        color: var(--color-text-title);
        overflow: hidden;

        p {
          color: var(--color-text-title);
          height: 22px;
          line-height: 22px;
          margin-bottom: 4px;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  :deep(.el-dialog.detail-dialog) {
    .el-dialog__body {
      padding-bottom: 50px;
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>
