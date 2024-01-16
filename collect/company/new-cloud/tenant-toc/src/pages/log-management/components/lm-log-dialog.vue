<template>
  <div class="lm-log-dialog">
    <el-dialog
      title="日志详情"
      v-model="dialogLogVisible"
      width="686px"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :before-close="onInitBeforeClose"
    >
      <el-table :data="logDetailsList" ref="detailsLogTable">
        <el-table-column prop="index" label="序号" width="68" align="center">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="attributeAlias" label="字段名称" width="200">
          <template #default="scope">
            <el-tooltip class="tips" effect="dark" placement="bottom" :offset="4" :show-after="500">
              <template #content>
                <div class="tips-dialog">
                  {{
                    scope.row.attributeAlias === null || scope.row.attributeAlias === ''
                      ? '--'
                      : scope.row.attributeAlias
                  }}
                </div>
              </template>
              <div class="text">
                {{
                  scope.row.attributeAlias === null || scope.row.attributeAlias === '' ? '--' : scope.row.attributeAlias
                }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column v-if="operationName == '修改'" prop="oldValue" label="修改前">
          <template #default="scope">
            <el-tooltip popper-class="tips" effect="dark" placement="bottom" :offset="4" :show-after="500">
              <template #content>
                <div class="tips-dialog">
                  {{ scope.row.oldValue === null || scope.row.oldValue === '' ? '--' : scope.row.oldValue }}
                </div>
              </template>
              <div class="text">
                {{ scope.row.oldValue === null || scope.row.oldValue === '' ? '--' : scope.row.oldValue }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column v-if="operationName == '修改'" prop="newValue" label="修改后">
          <template #default="scope">
            <el-tooltip
              popper-class="tips"
              effect="dark"
              :content="scope.row.newValue === null || scope.row.newValue === '' ? '--' : scope.row.newValue"
              placement="bottom"
              :offset="4"
              :show-after="500"
            >
              <template #content>
                <div class="tips-dialog">
                  {{ scope.row.newValue === null || scope.row.newValue === '' ? '--' : scope.row.newValue }}
                </div>
              </template>
              <div class="text">
                {{ scope.row.newValue === null || scope.row.newValue === '' ? '--' : scope.row.newValue }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column v-if="operationName == '新增' || operationName == '删除'" prop="newValue" label="字段值">
          <template #default="scope">
            <el-tooltip
              popper-class="tips"
              effect="dark"
              :content="scope.row.newValue === null || scope.row.newValue === '' ? '--' : scope.row.newValue"
              placement="bottom"
              :offset="4"
              :show-after="500"
            >
              <template #content>
                <div class="tips-dialog">
                  {{ scope.row.newValue === null || scope.row.newValue === '' ? '--' : scope.row.newValue }}
                </div>
              </template>
              <div class="text">
                {{ scope.row.newValue === null || scope.row.newValue === '' ? '--' : scope.row.newValue }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, PropType, nextTick } from 'vue';
import { ElTable } from 'element-plus';
// utils
import { onScroll } from '@/utils/index';
// services
import { CommonObject } from '../services/log-management.api';
export default defineComponent({
  name: 'lmLogDialog',
  props: {
    logDetailsList: {
      type: Array as PropType<CommonObject[]>,
      default: [],
    },
    dialogLog: {
      type: Boolean,
      default: false,
    },
    operationName: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const detailsLogTable = ref(ElTable);
    let dialogLogVisible = ref<boolean>(false);
    dialogLogVisible.value = props.dialogLog ? true : false;
    let logDetailsList = ref<CommonObject[]>();
    logDetailsList.value = props.logDetailsList;
    if (logDetailsList.value?.length > 10) {
      nextTick(() => {
        (document.querySelector('.lm-log-dialog .is-scrolling-none') as HTMLElement).addEventListener(
          'scroll',
          onScroll
        );
      });
    } else {
      if (document.querySelector('.lm-log-dialog .is-scrolling-none')) {
        (document.querySelector('.lm-log-dialog .is-scrolling-none') as HTMLElement).removeEventListener(
          'scroll',
          onScroll
        );
      }
    }

    const operationName = computed(() => {
      return props.operationName;
    });
    // 显示
    const show = async () => {
      dialogLogVisible.value = true;
    };
    // 关闭前初始化
    const onInitBeforeClose = () => {
      dialogLogVisible.value = false;
      logDetailsList.value = [];
    };
    return {
      dialogLogVisible,
      logDetailsList,
      operationName,
      detailsLogTable,
      show,
      onInitBeforeClose,
    };
  },
});
</script>
<style lang="less" scoped>
.lm-log-dialog {
  .text {
    white-space: nowrap;
    overflow: hidden !important;
    text-overflow: ellipsis;
  }
  :deep(.el-dialog__header) {
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 20px;
    background-color: var(--color-table-header);
    border: none;
    border-radius: 3px 3px 0 0;
  }
  :deep(.el-dialog__header .el-dialog__headerbtn) {
    top: 16px;
  }
  :deep(.el-dialog__body .el-table__body-wrapper) {
    max-height: 480px;
    overflow-y: auto;
  }
}
</style>
