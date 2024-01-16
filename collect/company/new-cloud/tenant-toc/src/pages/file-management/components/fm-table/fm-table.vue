<template>
  <div id="fm-table">
    <div class="fm-table-btnbar">
      <h5>文件列表</h5>
      <div>
        <button primary @click="onUploadFile">上传</button>
        <button
          :style="{ color: fileIdList.length === 0 ? '' : 'red' }"
          :disabled="fileIdList.length === 0"
          @click="onMultipleDel"
        >
          删除
        </button>
      </div>
    </div>
    <div class="fm-table-list" v-loading="loading">
      <el-table
        :data="fileListTableData"
        style="width: 100%"
        @select="onSelectionChange"
        @select-all="onSelectionAllChange"
        v-if="fileListTableData.length > 0"
      >
        <el-table-column type="selection" width="60" />
        <el-table-column type="index" label="序号" width="60">
          <template #default="{ row }">
            {{ row.index }}
          </template>
        </el-table-column>
        <el-table-column property="origionName" label="文件名称" />
        <el-table-column property="categoryName" label="文件类别">
          <template #default="{ row }">
            <el-tag :type="getFileType(row.categoryName)" size="small">{{ row.categoryName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column property="timeDimension" label="时间维度" />
        <el-table-column property="uploadTime" label="上传时间" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <button text primary @click="onDownloadFile(row.id)">下载</button>
            <el-popconfirm title="删除后无法恢复，确定要删除吗？" @confirm="onSingleDel(row.id)">
              <template #reference>
                <button text danger>删除</button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="fileListTableData.length > 0"
        :current-page="searchParams.pageNum"
        :page-sizes="pageSizesArray"
        @size-change="onPageSizeChange"
        @current-change="onCurrentChange"
        :page-size="searchParams.pageSize"
        layout="prev, pager, next, sizes, jumper"
        :total="total"
      >
      </el-pagination>
      <no-data v-if="!loading && !fileListTableData.length"></no-data>
    </div>
  </div>
  <FmUpload
    ref="fmUpload"
    :uploadFileDialogVisible="uploadFileDialogVisible"
    @closeUploadFileDialog="closeUploadFileDialog"
    @queryFileListPage="queryFileListPage"
  ></FmUpload>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { FGetCookie } from '@/core/token';

import { default as mitt } from '@/core/eventbus';

import { ElMessageBox } from 'element-plus';
import message from '@/utils/message';

import { Service } from './fm-table.service';
import { pageSizesArray } from '@/config/index';

import { FileManagementQueryFileListPageRequest, FileManagementListTableData } from './fm-table.api';

import FmUpload from '../fm-upload/fm-upload.vue';
import { getTenant } from '@/utils';

const fmUpload = ref();
const uploadFileDialogVisible = ref<boolean>(false);

// 文件id列表
const fileIdList = ref<number[]>([]);
// 文件id
const fileId = ref<number[]>([]);

const loading = ref<boolean>(false);

// 文件列表
const fileListTableData = ref<FileManagementListTableData[]>([]);

// 文件列表查询参数
const total = ref<number>(10);
const { tenantId } = getTenant();
const searchParams = ref<FileManagementQueryFileListPageRequest>({
  origionName: '',
  category: '',
  startTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 10,
  tenantId: tenantId,
});

const queryFileListPage = async () => {
  try {
    loading.value = true;
    const res = await Service.queryFileListPage(searchParams.value);
    if (res && res.code == 200 && res.success) {
      fileListTableData.value =
        res.data.list?.map((item, index) => {
          return {
            id: item.id,
            tenantId: item.tenantId,
            origionName: item.origionName,
            categoryName: item.categoryName,
            bucketName: item.bucketName,
            objectKey: item.objectKey,
            category: item.category,
            type: item.type,
            timeDimensionType: item.timeDimensionType,
            timeDimension: item.timeDimension,
            fileSize: item.fileSize,
            uploadTime: item.uploadTime,
            index: (searchParams.value.pageNum - 1) * searchParams.value.pageSize + index + 1,
          };
        }) ?? [];
      total.value = res.data.total as number;
    } else {
      fileListTableData.value = [];
    }
  } catch (error) {
    fileListTableData.value = [];
    console.log(error, '获取文件列表失败');
  } finally {
    loading.value = false;
  }
};

const onUploadFile = () => {
  uploadFileDialogVisible.value = true;
  fmUpload.value.fileName = '';
  fmUpload.value.file = null;
};

const closeUploadFileDialog = () => {
  uploadFileDialogVisible.value = false;
};

const onPageSizeChange = (val: number) => {
  searchParams.value.pageSize = val;
  queryFileListPage();
};
const onCurrentChange = (val: number) => {
  searchParams.value.pageNum = val;
  queryFileListPage();
};

const onSelectionChange = (val: any) => {
  fileIdList.value = [];
  val.forEach((item: any) => {
    fileIdList.value.push(item.id);
  });
};

const onSelectionAllChange = (val: any) => {
  fileIdList.value = [];
  val.forEach((item: any) => {
    fileIdList.value.push(item.id);
  });
};

// 删除多选
const onMultipleDel = () => {
  ElMessageBox.confirm('删除后无法恢复，确定要删除吗？', '批量删除文件', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await Service.deleteFiles(fileIdList.value);
        message.success('删除成功');
        fileIdList.value = [];
        const lastPage = Math.ceil(total.value / searchParams.value.pageSize);
        if (searchParams.value.pageNum === lastPage && total.value % searchParams.value.pageSize === 1) {
          searchParams.value.pageNum--; //页码-1
        }
        if (searchParams.value.pageNum === 0) {
          searchParams.value.pageNum = 1;
        }
        queryFileListPage();
      } catch (error) {
        console.log(error, '操作失败');
        message.error('操作失败');
      }
    })
    .catch((error) => {
      console.log(error, '取消操作');
    });
};

// 删除
const onSingleDel = async (val: number) => {
  fileId.value = [val];
  try {
    await Service.deleteFiles(fileId.value);
    message.success('删除成功');
    const lastPage = Math.ceil(total.value / searchParams.value.pageSize);
    if (searchParams.value.pageNum === lastPage && total.value % searchParams.value.pageSize === 1) {
      searchParams.value.pageNum--; //页码-1
    }
    if (searchParams.value.pageNum === 0) {
      searchParams.value.pageNum = 1;
    }
    queryFileListPage();
  } catch (error) {
    console.log(error, '操作失败');
    message.error('操作失败');
  }
};

// 下载文件
const onDownloadFile = async (val: any) => {
  try {
    await Service.downloadSingleFile(val);
  } catch (error) {
    console.log('操作失败', error);
  }
};

const getFileType = (type: string) => {
  switch (type) {
    case '经营分析预算表':
      return '';
    case '基础数据表':
      return 'success';
    case '能耗预算表':
      return 'danger';
    default:
      return 'info';
  }
};

// 监听来自searchbar的【查询、重置】事件（初始化查询）
mitt.on('search', (val: any) => {
  searchParams.value.origionName = val.fileName;
  searchParams.value.category = val.fileType;
  searchParams.value.startTime = val.uploadDate[0] ? val.uploadDate[0] + ' 00:00:00' : '';
  searchParams.value.endTime = val.uploadDate[1] ? val.uploadDate[1] + ' 23:59:59' : '';
  if (
    searchParams.value.origionName === '' &&
    searchParams.value.category === '' &&
    searchParams.value.startTime === ''
  ) {
    searchParams.value.pageNum = 1;
  }
  queryFileListPage();
});

onMounted(() => {});

// 关闭查询监听事件
onUnmounted(() => {
  mitt.off('search');
  mitt.off('fileTypeList');
});
</script>

<style lang="less" scoped>
#fm-table {
  display: flex;
  flex-direction: column;

  .fm-table-btnbar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h5 {
      position: relative;
      height: 52px;
      line-height: 52px;
      font-size: 14px;
      color: var(--color-text-title);
      font-weight: 600;
      padding-left: 12px;

      &::before {
        content: '';
        width: 4px;
        height: 16px;
        background-color: var(--color-primary);
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }

  .fm-table-list {
    flex: 1 1 auto;

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
  }
}
</style>

<style lang="less">
.el-dialog {
  .el-dialog__header {
    padding: 12px 20px;
  }

  &__body {
    margin-top: 10px;
    padding: 10px 20px;
  }

  .el-divider--horizontal {
    margin: 8px 0px;
  }
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
}

.el-popover .el-popconfirm .el-button--text {
  border: none !important;
}

.el-message-box__status {
  position: absolute;
}
</style>
