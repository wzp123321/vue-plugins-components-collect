<template>
  <div id="epl-l-history-version-table" v-loading="loading">
    <el-table ref="table" :data="historicalVersionTableData" style="width: 100%" :max-height="245">
      <el-table-column label="序号" width="70">
        <template #default="scope"> {{ scope.row.index }} </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="版本更新时间" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.versionTime }}
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="录入人员">
        <template #default="{ row }">
          {{ row.operator ?? '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="bindProject" label="操作">
        <template #default="{ row }">
          <el-button class="action-btn" type="text" @click="onPageNavTo('historyVersion', row.hospitalId, row.id)">
            详情
          </el-button>
          <el-button
            v-if="exportBtnPermission === CheckPermission.有权限"
            class="action-btn"
            type="text"
            @click="onSingleDownload(row.hospitalId, row.id)"
            >下载</el-button
          >
          <el-popconfirm
            v-if="deletePermission !== 0"
            title="删除后无法恢复，确定要删除吗？"
            placement="right"
            @confirm="onSingleDel(row.id)"
          >
            <template #reference>
              <el-button class="action-btn" type="text" style="color: red">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <el-pagination
    v-if="historicalVersionTableData.length > 0"
    class="version-pagenation"
    :current-page="page"
    :page-sizes="pageSizesArray"
    @size-change="onPageSizeChange"
    @current-change="onCurrentChange"
    :page-size="pageSize"
    layout="prev, pager, next, sizes"
    :total="total"
  >
  </el-pagination>
  <el-divider></el-divider>
  <el-row type="flex" justify="end">
    <el-button @click="onCancel">关闭</el-button>
  </el-row>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { default as mitt } from '@/core/eventbus';
import message from '@/utils/message';

import { formatDateStamp } from '@/utils/index';
import { pageSizesArray } from '@/config/index';

import { Service } from './epl-l-history-version-table.service';
import { EnergyProjectLibrarySelectVersionData } from './epl-l-history-version-table.api';
import { CheckPermission } from '../../../energy-project-library.service';

export default defineComponent({
  name: 'HisitoryVersionTable',
  emits: ['close'],
  props: {
    id: {
      type: Number,
      default: '',
    },
    deletePermission: {
      type: Number,
      default: 0,
    },
    exportBtnPermission: {
      type: Number,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const historicalVersionTableData = ref<EnergyProjectLibrarySelectVersionData[]>([]);

    const loading = ref<boolean>(false);
    const table = ref();
    const page = ref<number>(1);
    const pageSize = ref<number>(pageSizesArray[0]);
    const total = ref<number>(10);

    const versionId = computed(() => {
      return props.id;
    });

    const deletePermission = computed(() => {
      return props.deletePermission;
    });

    const exportBtnPermission = computed(() => {
      return props.exportBtnPermission;
    });
    // 查询表格数据列表
    const queryHistoricalVersionTableList = async () => {
      try {
        loading.value = true;
        historicalVersionTableData.value = Array(4).fill({
          createTime: '',
          deleteFlag: 0,
          hospitalId: 0,
          id: 0,
          operator: '',
          updateTime: '',
          versionTime: '',
        });
        const params = {
          pageNum: page.value,
          pageSize: pageSize.value,
          searchCount: true,
          hospitalId: versionId.value,
        };
        const res = await Service.queryEnergeBenchmarkLibraryList(params);
        if (res && res.code == 200 && res.success) {
          historicalVersionTableData.value =
            res.data.list.map((item: any, index: number) => {
              return {
                createTime: item.createTime,
                deleteFlag: item.deleteFlag,
                hospitalId: item.hospitalId,
                id: item.id,
                operator: item.operator,
                updateTime: item.updateTime,
                versionTime: item.versionTime,
                index: (page.value - 1) * pageSize.value + index + 1,
              };
            }) || [];
          total.value = res.data.total;
        } else {
          // return proxy.$message.error(res.message);
          historicalVersionTableData.value = [];
        }
      } catch (error) {
        loading.value = false;
        historicalVersionTableData.value = [];
        // console.log('error------------', error);
      } finally {
        loading.value = false;
      }
    };

    // 跳转项目详情
    const onPageNavTo = (versionType: string, hospitalId: number, versionId: number) => {
      router.replace({
        path: '/home/energyProjectLibrary/editor',
        query: {
          versionType,
          hospitalId,
          versionId,
        },
      });

      mitt.emit('versionId', versionId);
      emit('close');
    };

    // 下载
    const onSingleDownload = async (id: number, versionId: number) => {
      try {
        await Service.singleDownload({ hospitalIdList: [id], versionId: versionId });
      } catch (error) {
        console.log(error, '操作失败');
      }
    };

    // 删除
    const onSingleDel = async (id: any) => {
      try {
        const res = await Service.singleDel({ id });
        if (res.data && res.code === 200) {
          message.success(res.message ?? '删除成功');
          const lastPage = Math.ceil(total.value / pageSize.value);
          if (page.value === lastPage && total.value % pageSize.value === 1) {
            page.value--; //页码-1
          }
          queryHistoricalVersionTableList();
        } else {
          message.error(res.message ?? '操作失败');
        }
      } catch (error) {
        message.error('操作失败');
        console.log(error);
      }
    };

    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
      page.value = 1;
      historicalVersionTableData.value = [];
      queryHistoricalVersionTableList();
    };
    const onCurrentChange = (value: number) => {
      page.value = value;
      historicalVersionTableData.value = [];
      queryHistoricalVersionTableList();
    };

    const onCancel = () => {
      emit('close');
    };

    onMounted(async () => {
      await queryHistoricalVersionTableList();
      table.value.doLayout();
    });

    onUnmounted(() => {
      mitt.off('permission');
    });

    return {
      table,
      deletePermission,
      exportBtnPermission,
      CheckPermission,
      historicalVersionTableData,
      loading,
      onPageNavTo,
      onSingleDownload,
      onSingleDel,

      page,
      pageSize,
      total,
      pageSizesArray,

      onPageSizeChange,
      onCurrentChange,

      onCancel,
      formatDateStamp,
    };
  },
});
</script>
<style lang="less" scoped>
#epl-l-history-version-table {
  .empty {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
      width: 60px;
      height: 60px;
    }

    p {
      color: rgba(0, 0, 0, 0.25);
      display: inline-block;
      line-height: 22px;
      margin-top: 8px;
    }
  }
  :deep(.el-table th.el-table__cell) {
    padding: 0px !important;
  }
  :deep(.el-table) tbody tr {
    td.el-table__cell {
      position: relative;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      border-bottom: 1px solid var(--color-text-divider) !important;
    }
  }
  .action-btn {
    min-height: 24px !important;
    line-height: 24px !important;
    padding: 0 0px !important;
  }

  .el-divider--horizontal {
    margin: 8px 0px;
  }
}
</style>

<style lang="less">
.el-dialog {
  &__body {
    padding: 10px 20px;
  }
}

.el-popover .el-popconfirm .el-button--text {
  border: none !important;
}

.el-popover .el-popconfirm button.el-button {
  min-width: 48px !important;
  height: 48px !important;
  min-height: 24px !important;
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 8px !important;
  display: inline-flex;
  align-items: center;
  font-size: 12px !important;
}
</style>
