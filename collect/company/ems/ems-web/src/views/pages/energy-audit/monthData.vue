<template>
  <div class="ea-month-data">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="日期">
        <el-date-picker
          :disabledDate="onDisableDateCb"
          v-model="formInline.yearDate"
          type="year"
          :clearable="false"
          placeholder="请选择起始年份"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <button primary @click="onSubmit">查询</button>
        <button @click="onReset">重置</button>
      </el-form-item>
    </el-form>
    <el-row class="module-wrap">
      <el-col :span="24">
        <div style="display: flex; justify-content: space-between; margin-bottom: 19px">
          <module-subhead :title="yearObj.title"></module-subhead>
          <div>
            <button primary @click="exportData">导出</button>
          </div>
        </div>
        <!-- 列表数据 -->
        <div v-if="abnormal" style="min-height: 250px">
          <el-table
            :data="yearObj.data"
            :stripe="lightOrDark"
            style="width: 100%"
            v-loading="tableDataLoading"
            height="250"
          >
            <el-table-column v-for="(item, index) in yearObj.colName" :key="index" align="center" show-overflow-tooltip>
              <template #header>
                <div v-html="item"></div>
              </template>
              <template #default="scope">
                <span v-if="index == 0">
                  {{ scope.row[index] }}
                </span>
                <span v-else>
                  {{ thousandSeparation(scope.row[index]) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else>
          <no-data></no-data>
        </div>
      </el-col>
    </el-row>
    <div class="border"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from 'vue';
import { cloneDeep } from 'lodash';
import { useStore } from 'vuex';
import CommonService from '@/services/common/common.service';
import energyAudit from './services/energy-audit';
import { thousandSeparation, formatDate } from '@/utils/index';
import message from '@/utils/message';
export default defineComponent({
  setup() {
    const store = useStore();
    let tableDataLoading = ref<boolean>(true);
    let formInline = reactive<any>({
      yearDate: '',
    });
    let yearObj = ref<any>({}); //存放接口返回的数据对象
    let formInline_copy: any;
    let abnormal = ref<boolean>(true);
    const lightOrDark = computed(() => {
      //通过获取仓库的白天黑夜来兼容黑夜样式
      return store.getters.theme == 'light' ? true : false;
    });
    // 禁止选择日期
    const onDisableDateCb = (date: Date) => {
      return date.getTime() > new Date().getTime();
    };
    const exportData = () => {
      console.log('daochu');
    };
    const onSubmit = async () => {
      try {
        tableDataLoading.value = true;
        let obj = {
          timeUnit: '1M',
          year: formatDate(formInline.yearDate, 'yyyy'),
        };
        const res = await energyAudit.queryData(obj);
        if (res.code == 200 && res.success) {
          console.log(res.data);
          yearObj.value = res.data;
          tableDataLoading.value = false;
          console.log(yearObj);
        } else {
          tableDataLoading.value = false;
          abnormal.value = false;
          return message.error(res.messsage);
        }
      } catch (err) {
        abnormal.value = false;
        tableDataLoading.value = false;
      }
    };
    const onReset = async () => {
      Object.assign(formInline, formInline_copy);
      await onSubmit();
    };
    const getDate = async () => {
      let serverDate = await CommonService.getServerDate();
      formInline.yearDate = serverDate;
    };
    onMounted(async () => {
      await getDate();
      await onSubmit();
      formInline_copy = cloneDeep(formInline);
    });
    return {
      formInline,
      onDisableDateCb,
      onSubmit,
      onReset,
      exportData,
      abnormal,
      tableDataLoading,
      lightOrDark,
      yearObj,
      thousandSeparation,
    };
  },
});
</script>
<style lang="less" scoped>
.ea-month-data {
  .border {
    // border-bottom: 1px solid var(--iot-border-color);
    margin-bottom: 32px;
  }
}
</style>
