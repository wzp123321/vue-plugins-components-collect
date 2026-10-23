<!-- 告警/事件数据表格 + 分页器(单向 props + emit) -->
<template>
  <div class="alarm-data-table" v-loading="loading">
    <div class="alarm-data-table-container">
      <te-table
        :data="data"
        :row-key="'id'"
        stripe
        @selection-change="handleSelectionChange"
      >
        <te-table-column reserve-selection type="selection" width="48" />
        <te-table-column prop="generationTime" label="告警时间" width="176">
          <template #default="{ row }">
            {{ formatTime(row.generationTime) }}
          </template>
        </el-table-column>
        <te-table-column prop="levelCode" label="告警等级" width="88">
          <template #default="{ row }">
            <te-tag :type="mapTagTypeByAlarmLevel(row.levelCode)" effect="dark">
              {{ mapAlarmLevelNameByLevel(row.levelCode) }}
            </el-tag>
          </template>
        </el-table-column>
        <te-table-column prop="systemName" label="专业模块" width="120">
          <template #default="{ row }">
            {{ row?.systemName || '-' }}
          </template>
        </el-table-column>
        <te-table-column
          prop="objectName"
          label="告警对象"
          min-width="200"
          show-overflow-tooltip
        >
        </el-table-column>
        <te-table-column prop="drawLinkList" label="告警追踪" width="90px">
          <template #default="scope">
            <te-popover
              popper-class="adt-popover"
              :show-after="500"
              placement="left"
              :width="200"
              trigger="click"
              @show="handleShow(scope.row)"
              @hide="handleHide"
            >
              <template #reference>
                <te-button link type="primary">电子地图</el-button>
              </template>
              <div class="adt-popover-body">
                <div
                  class="adt-column-jump adt-column-jump-empty"
                  v-if="scope.row.drawLinkList?.length < 1"
                >
                  无关联图纸
                </div>
                <div
                  @click="jumpToMap(el.url, el.systemId, el.drawId)"
                  v-for="el in scope.row.drawLinkList"
                  class="adt-column-jump adt-column-jump-link"
                  :key="el.drawId"
                  :title="el.drawName"
                >
                  {{ el.drawName }}
                </div>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <te-table-column
          v-if="showAlarmStatus"
          prop="statusName"
          label="告警状态"
          width="94"
        >
          <template #default="{ row }">
            <te-badge
              class="ati-alarm-status"
              is-status
              :type="row.statusName === '已恢复' ? 'info' : 'danger'"
            >
              {{ row.statusName }}
            </el-badge>
          </template>
        </el-table-column>
        <te-table-column
          prop="operationStatusName"
          label="处理状态"
          width="120"
        >
          <template #default="{ row }">
            <span
              v-if="row.operationStatusName !== '未确认'"
              class="adt-table-noconsurebut"
            >
              {{ row.operationStatusName }}
            </span>
            <te-button
              v-else
              size="small"
              type="primary"
              class="alarm-data-table-confirm"
              @click="emit('row-confirm', row)"
            >
              确认
            </el-button>
          </template>
        </el-table-column>
        <te-table-column label="查看" width="80">
          <template #default="{ row }">
            <te-button link type="primary" @click="emit('view', row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="alarm-data-table-pager">
      <te-pagination
        v-show="!loading && total > 0"
        :current-page="pageNum"
        :page-size="pageSize"
        :total="total"
        :page-sizes="PAGE_SIZES"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handleCurrentPageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ElTable,
  TeTableColumn,
  ElTag,
  ElBadge,
  ElPopover,
  ElButton,
  TePagination,
} from 'element-plus';
import { inject, ref } from 'vue';
import { IAlarmLinkList, type AlarmInfo } from '../api/index.api';
import { IMS_SYSTEM_PREFIX } from '../constant';
import { mapAlarmLevelNameByLevel, mapTagTypeByAlarmLevel } from '../utils';
import { TeAlarmAffixApi } from '../api/TeAlarmAffixApi';
import { TE_AL_SERVICES_KEY } from '../types/injection';
import { PAGE_SIZES } from '../../../constant';

defineOptions({ name: 'TeAlarmDataTable' });

const props = defineProps<{
  data: AlarmInfo[];
  loading: boolean;
  showAlarmStatus: boolean;
  selection: AlarmInfo[];
  pageNum: number;
  pageSize: number;
  total: number;
}>();

const services = inject(TE_AL_SERVICES_KEY, null);
if (!services) {
  throw new Error(
    '[AlarmDataTable] 必须在外层 <TeAlarmAffix> / 业务容器内使用',
  );
}

const emit = defineEmits<{
  (event: 'update:selection', value: AlarmInfo[]): void;
  (event: 'row-confirm', row: AlarmInfo): void;
  (event: 'view', row: AlarmInfo): void;
  (event: 'page-change', payload: { pageNum: number; pageSize: number }): void;
}>();

const formatTime = (iso: string): string => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (num: number) => (num < 10 ? `0${num}` : String(num));
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

const handleSelectionChange = (rows: AlarmInfo[]) => {
  emit('update:selection', rows);
};

const handleCurrentPageChange = (currentPage: number) => {
  emit('page-change', { pageNum: currentPage, pageSize: props.pageSize });
};

const handleSizeChange = (nextPageSize: number) => {
  emit('page-change', { pageNum: 1, pageSize: nextPageSize });
};

const drawLinkList = ref<IAlarmLinkList[]>([]);
const handleHide = () => {
  drawLinkList.value = [];
};
/**
 * 弹窗时调接口拉图纸列表回写到 row.drawLinkList
 * @param params
 */
const handleShow = async (params: any) => {
  try {
    const res = await TeAlarmAffixApi.drawMapList(services.axiosInstance, {
      objectId: params.objectId,
      objectType: params.objectType,
      deviceId: params.deviceId,
    });
    params.drawLinkList = res?.data ?? [];
  } catch (error) {
    params.drawLinkList = [];
    console.warn(error);
  }
};

/**
 * 跳转到电子地图(新窗口)
 * @param url
 * @param systemId
 * @param drawId
 */
const jumpToMap = (url: string, systemId: string, drawId: number) => {
  window.open(
    `${IMS_SYSTEM_PREFIX}${url}?systemId=${systemId}&drawId=${drawId}`,
  );
};
</script>

<style lang="less" scoped>
.alarm-data-table {
  flex: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &-pager {
    display: flex;
    justify-content: flex-end;
    padding-top: var(--te-space-12);
  }

  &-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    :deep(.te-table) {
      height: 100%;
      .adt-table-noconsurebut {
        color: #a8abb2;
      }
      .te-tag.te-tag--data6 {
        background-color: var(--te-color-data6-default);
      }
    }
  }

  &-popover-body {
    max-height: 300px;
    overflow: scroll;
  }
}
</style>
<style lang="less">
.adt-popover {
  .adt-popover-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    max-height: 240px;
    overflow-y: auto;
    gap: var(--te-space-4);
    .adt-column-jump-empty {
      color: #ccc;
      text-align: center;
    }
    .adt-column-jump-link {
      flex-shrink: 0;
      color: var(--te-color-primary);
      cursor: pointer;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
