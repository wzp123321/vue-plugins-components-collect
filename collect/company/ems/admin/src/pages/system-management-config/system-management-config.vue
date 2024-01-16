<template>
  <div class="system-management-config">
    <page-common :title="'系统管理'" :isSubHead="false" :showSearch="false">
      <template v-slot:pageContent>
        <div class="smc-table mt16">
          <el-table :data="tableData" style="width: 100%" v-loading="isLoading">
            <el-table-column type="index" label="序号" width="180" />
            <el-table-column prop="function" label="功能">
              <template #default="scope">{{ scope.row.moduleName }}</template>
            </el-table-column>
            <el-table-column label="配置项">
              <template #default="scope">
                <el-checkbox-group v-model="scope.row.checkList" v-if="scope.row.chooseType === '1'">
                  <el-checkbox
                    v-for="(tree, index) in scope.row.configurationValueList"
                    :key="index"
                    @change="configsChange(scope.row, index, scope.row.checkList)"
                    :label="tree.configurationItemName"
                    >{{ tree.configurationItemName }}</el-checkbox
                  >
                </el-checkbox-group>
                <div v-if="scope.row.chooseType === '2'">
                  <el-switch
                    v-for="(item, index) in scope.row.configurationValueList"
                    :key="index"
                    :inactive-text="item.configurationItemName"
                    @change="changeSwitch(scope.row)"
                    v-model="item.itemSelectedFlag"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </page-common>
  </div>
</template>

<script setup lang="ts">
import message from '@/utils/message';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ref, onMounted, onUnmounted } from 'vue';

import { ConfigurationValueList, SystemManageTable } from './service/system-management-config.api';
import SystemManageService from './service/system-management-config.service';

import { useStore } from 'vuex';

import { ElMessageBox } from 'element-plus';

const tableData = ref<SystemManageTable[]>([]); //表格数据
const isLoading = ref<boolean>(false); //是否加载
const isChange = ref<boolean>(false); //是否操作
const checkList = ref<string[]>([]); //选中列表
const sSystemMange = SystemManageService; //服务
const destroy = new Subject<void>();
const store = useStore();

let flag = false;

onMounted(() => {
  //查询
  sSystemMange.query();

  //表格数据
  sSystemMange.dataResult$.pipe(takeUntil(destroy)).subscribe((v) => {
    if (v?.code === 401) {
      if (flag) {
        return;
      }
      flag = true;
      ElMessageBox.alert('登录信息已失效，请重新登录', '', {
        confirmButtonText: '确认',
        showClose: false,
        showCancelButton: false,
        type: 'warning',
      })
        .then(() => {
          window.location.href = store?.getters?.tenantVO?.tenant?.loginUrl;
        })
        .catch(() => {
          console.warn('cancel');
        });

      return;
    }

    checkList.value = [];
    v?.data?.map((row) => {
      let list: string[] = [];
      if (row.chooseType === '1') {
        row.configurationValueList.forEach((it: ConfigurationValueList) => {
          if (it.itemSelectedFlag) {
            list.push(it.configurationItemName);
            checkList.value.push(it.configurationItemName);
          }
        });
      }
      row.checkList = list;
    });
    tableData.value = v?.data ?? [];
  });
});
/**
 * @description: 复选框勾选事件
 * @param {*} row 表格行
 * @param {*} index 下标
 * @param {*} checkList 选中的选项
 * @return {*}
 */
const configsChange = (row: SystemManageTable, index: number, checkList: string[]) => {
  if (checkList.length == 0) {
    message.warning('至少选择一个');
    checkList.push(row?.configurationValueList[index]?.configurationItemName);
    return;
  }
  row?.configurationValueList?.map((item: ConfigurationValueList) => {
    if (checkList.includes(item.configurationItemName)) {
      item.itemSelectedFlag = true;
    } else {
      item.itemSelectedFlag = false;
    }
  });
  //更新调用
  isChange.value = true;
  sSystemMange.update({
    chooseType: row.chooseType,
    configurationValueList: row.configurationValueList.map((item) => {
      return {
        configurationItemCode: item.configurationItemCode,
        configurationItemName: item.configurationItemName,
        itemSelectedFlag: item.itemSelectedFlag,
      };
    }),
    id: row.id,
  });
};

/**
 * 更新开关数据
 * @param row
 */
const changeSwitch = (row: SystemManageTable) => {
  sSystemMange.updateSwitch({
    chooseType: row.chooseType,
    configurationValue: row.configurationValue,
    configurationValueList: row.configurationValueList.map((item) => {
      return {
        configurationItemCode: item.configurationItemCode,
        configurationItemName: item.configurationItemName,
        itemSelectedFlag: item.itemSelectedFlag,
      };
    }),
    id: row.id,
    moduleKey: row.moduleKey,
    moduleName: row.moduleName,
  });
};

onUnmounted(() => {
  destroy.next();
  destroy.complete();
});
</script>

<style lang="less" scoped>
.system-management-config {
  width: 100%;
  height: 100%;
  :deep(.el-switch__label) {
    color: var(--el-text-color-primary) !important;
  }
}
</style>
