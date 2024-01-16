<template>
  <div id="ep-library-editor">
    <page-container title="综能项目库">
      <template #pageSearch>
        <epl-e-project-toolbar :paramId="paramId" />
      </template>
      <template #pageContent>
        <epl-e-project-descriptions />
        <div class="ep-library-bottom">
          <el-tabs v-model="activeTableName" class="tabs" @tab-click="handleClick">
            <el-tab-pane label="历史能耗" name="first">
              <epl-e-history-energy-table @selectTableRow="selectTableRow" />
            </el-tab-pane>
            <!-- <el-tab-pane label="业务量" name="second">
              <epl-e-business-table />
            </el-tab-pane> -->
          </el-tabs>
        </div>
      </template>
    </page-container>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

import EplEHistoryEnergyTable from './components/epl-e-energy-table/epl-e-energy-table.vue';
import EplEProjectDescriptions from './components/epl-e-project-descriptions/epl-e-project-descriptions.vue';
import EplEBusinessTable from './components/epl-e-business-table/epl-e-business-table.vue';
import EplEProjectToolbar from './components/epl-e-project-toolbar/epl-e-project-toolbar.vue';

const activeTableName = ref<string>('first');
const paramId = ref<string>('');
const selectTableRow = (val: any) => {
  console.log(val, '子传递');
  paramId.value = val;
};
const handleClick = (val: any) => {
  console.log(val.paneName);
};
</script>
<style lang="less" scoped>
#ep-library-editor {
  height: 100%;

  .ep-library-bottom {
    margin-top: 10px;

    :deep(.el-tabs__item) {
      font-weight: 700;
    }
  }
}

:deep(.el-dialog-body) {
  padding: 4px 15px !important;
}

// :deep(.el-dialog__footer) {
//     padding: 10px 0px 0px 20px !important;
// }

:deep(.el-table) tbody tr {
  td.el-table__cell {
    position: relative;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    border-bottom: 1px solid var(--color-text-divider) !important;
  }
}

:deep(.cost-delete-confirm i.el-icon.el-message-box__status.el-message-box-icon--warning) {
  position: absolute !important;
}
</style>
<style lang="less">
.el-message-box.cost-delete-confirm {
  i {
    position: absolute;
  }
}

.el-dialog {
  .el-dialog__header {
    padding: 12px 20px;
  }
  &__body {
    margin-top: 10px;
    padding: 10px 20px;
  }
}

.el-divider--horizontal {
  margin: 8px 0px;
}
</style>
