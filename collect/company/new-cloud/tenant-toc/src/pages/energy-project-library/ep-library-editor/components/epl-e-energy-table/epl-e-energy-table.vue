<template>
  <div id="historical-energy-table">
    <div class="search-bar">
      <span>年度月份</span>
      <el-date-picker
        v-model="searchDate"
        type="monthrange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYYMM"
        style="margin-left: 10px; width: 328px"
        @change="searchDatechange"
      />
      <el-button type="primary" @click="search" style="margin-left: 20px">查询</el-button>
      <el-button @click="reset">重置</el-button>
      <!-- 历史版本详情没有新增按钮 -->
      <!-- <el-button type="primary" @click="add" class="search-bar-add" :disabled="addFlag">新增</el-button> -->
    </div>
    <div style="height: 100%">
      <el-table
        :data="tableData"
        ref="elTableRef"
        highlight-current-row
        style="width: 100%"
        class="he-table"
        @current-change="selectTableRow"
        v-loading="loading"
      >
        <!-- <el-table-column fixed prop="date" label="医院名称">
          <template #default="{ row }">{{ row.date }}</template>
        </el-table-column> -->
        <el-table-column fixed="left" prop="date" label="院区" width="120">
          <template #default="{ row }">
            <!-- <template v-if="row.edit">
              <el-input v-model="row.name"></el-input>
            </template> -->
            <span>{{ row.areaName ?? '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="date" label="年度" width="75">
          <template #default="{ row }">{{ row.year ?? '--' }}</template>
        </el-table-column>
        <el-table-column fixed="left" prop="date" label="月份" width="75">
          <template #default="{ row }">{{ row.month ?? '--' }}</template>
        </el-table-column>
        <el-table-column fixed="left" prop="date" label="年度月份" width="100">
          <template #default="{ row }">{{ row.yearMonthStr ?? '--' }}</template>
        </el-table-column>
        <el-table-column fixed="left" prop="date" label="建筑面积(m²)" width="130">
          <template #default="{ row }">{{ row.architectureArea?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column fixed="left" prop="date" label="面积修正(m²)" width="130">
          <template #default="{ row }">{{ row.areaCorrection?.toLocaleString() ?? '--' }}</template>
        </el-table-column>

        <!--  #region  电量  -->
        <el-table-column prop="date" label="电量(kWh)" width="180">
          <template #default="{ row }">{{ row.eleAmount?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="电费(元)" width="180">
          <template #default="{ row }">{{ row.eleCost?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="电单价(元/kWh)" width="200">
          <template #default="{ row }">{{ row.elePrice ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="电量修正：帐期(kWh)" width="200">
          <template #default="{ row }">{{ row.eleAccountPeriodCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="单位面积用电量(kWh/m²)" width="200">
          <template #default="{ row }">{{ row.eleAmountPerUnit ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="电量修正：面积(kWh)" width="200">
          <template #default="{ row }">{{ row.eleEnergyAreaCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="电量修正：设备(kWh)" width="200">
          <template #default="{ row }">{{ row.eleDeviceCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="电量修正：天气(kWh)" width="200">
          <template #default="{ row }">{{ row.eleWeatherCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="电量修正：其他(kWh)" width="200">
          <template #default="{ row }">{{ row.eleOtherCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="电量：修正后(kWh)" width="200">
          <template #default="{ row }">{{ row.eleAmountAfterCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <!--  #endregion  电量  -->

        <!--  #region  水量 -->
        <el-table-column prop="date" label="水量(t)" width="180">
          <template #default="{ row }">{{ row.waterAmount?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="水费(元)" width="180">
          <template #default="{ row }">{{ row.waterCost?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="水单价(元/t)" width="200">
          <template #default="{ row }">{{ row.waterPrice ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="水量修正：帐期(t)" width="200">
          <template #default="{ row }">{{ row.waterAccountPeriodCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="单位面积用水量(t/m²)" width="200">
          <template #default="{ row }">{{ row.waterAmountPerUnit ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="水量修正：面积(t)" width="200">
          <template #default="{ row }">{{ row.waterEnergyAreaCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="水量修正：设备(t)" width="200">
          <template #default="{ row }">{{ row.waterDeviceCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="水量：修正后(t)" width="200">
          <template #default="{ row }">{{ row.waterAmountAfterCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <!--  #endregion  水量 -->

        <!--  #region  燃气量 -->
        <el-table-column prop="date" label="燃气量(m³)" width="180">
          <template #default="{ row }">{{ row.gasAmount?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="燃气费(元)" width="180">
          <template #default="{ row }">{{ row.gasCost?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="燃气单价(元/m³)" width="200">
          <template #default="{ row }">{{ row.gasPrice ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="燃气量修正：帐期(m³)" width="200">
          <template #default="{ row }">{{ row.gasAccountPeriodCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="单位面积用燃气量(m³/m²)" width="200">
          <template #default="{ row }">{{ row.gasAmountPerUnit ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="燃气量修正：面积(m³)" width="200">
          <template #default="{ row }">{{ row.gasEnergyAreaCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="燃气量修正：设备(m³)" width="200">
          <template #default="{ row }">{{ row.gasDeviceCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="燃气量修正：天气(m³)" width="200">
          <template #default="{ row }">{{ row.gasWeatherCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="燃气量：修正后(m³)" width="200">
          <template #default="{ row }">{{ row.gasAmountAfterCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <!--  #endregion  燃气量 -->

        <!--  #region  蒸汽量 -->
        <el-table-column prop="date" label="蒸汽量(m³)" width="180">
          <template #default="{ row }">{{ row.steamAmount?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="蒸汽费(元)" width="180">
          <template #default="{ row }">{{ row.steamCost?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="蒸汽单价(元/m³)" width="200">
          <template #default="{ row }">{{ row.steamPrice ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="蒸汽量修正：帐期(m³)" width="200">
          <template #default="{ row }">{{ row.steamAccountPeriodCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="单位面积用蒸汽量(m³/m²)" width="200">
          <template #default="{ row }">{{ row.steamAmountPerUnit ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="蒸汽量修正：面积(m³)" width="200">
          <template #default="{ row }">{{ row.steamEnergyAreaCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="蒸汽量修正：天气(m³)" width="200">
          <template #default="{ row }">{{ row.steamWeatherCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <el-table-column prop="date" label="蒸汽量：修正后(m³)" width="200">
          <template #default="{ row }">{{ row.steamAmountAfterCor?.toLocaleString() ?? '--' }}</template>
        </el-table-column>
        <!--  #endregion  蒸汽量 -->

        <!-- <el-table-column fixed="right" label="操作" width="100">
          <template #default="{ row }">
            <button v-if="row.edit" primary text @click="confirmEdit(row)">保存</button>
            <button v-else primary text @click="row.edit = !row.edit">编辑</button>
            <button v-if="row.edit" text style="color: red" @click="">删除</button>
          </template>
        </el-table-column> -->
      </el-table>

      <!-- 分页 + -->
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="pageSizesArray"
        layout="prev, pager, next, sizes, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <!-- 分页 - -->
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { formatDateStamp } from '@/utils/index';
import { pageSizesArray } from '@/config/index';
import { default as mitt } from '@/core/eventbus/index';

import { HospitalDataList, TableType } from './epl-e-energy-table.api';
import { Service } from './epl-e-energy-table.service';

const emit = defineEmits(['selectTableRow']);
const route = useRoute();

const hospitalId = computed(() => {
  return route.query.hospitalId;
});
const versionId = computed(() => {
  return route.query.versionId ?? '';
});

const versionIdRef = ref(versionId.value);
const loading = ref<boolean>(false);
const searchDate = ref<[string | null, string | null]>([null, null]);
const elTableRef = ref();

const page = ref<number>(1);
const pageSize = ref<number>(pageSizesArray[0]);
const total = ref<number>(10);

const tableData = ref<HospitalDataList[]>([]);

const queryHistoryEnergyTableList = async () => {
  try {
    loading.value = true;
    const res = await Service.queryHistoryEnergyTableList(
      Object.assign(
        {
          pageNum: page.value,
          pageSize: pageSize.value,
          hospitalId: Number(hospitalId.value),
          startTime: searchDate.value[0],
          endTime: searchDate.value[1],
          type: TableType.历史能耗,
        },
        versionIdRef.value ? { versionId: Number(versionIdRef.value) } : {},
      ),
    );
    if (res?.data && res.code === 200) {
      tableData.value = res.data.list || [];
      total.value = res.data.total;
    } else {
      tableData.value = [];
    }
    console.log('第一次');
  } catch (error) {
    console.log(error, '获取历史能耗列表失败');
  } finally {
    loading.value = false;
  }
};

const selectTableRow = (val: any) => {
  console.log(val, '子组件打印');
  emit('selectTableRow', val.name);
  mitt.emit('selectTableRow', val.name);
};

const addFlag = ref<boolean>(false);

const add = () => {
  addFlag.value = true;
  const newLine = {};

  tableData.value.unshift(newLine);
};
const confirmEdit = (row: any) => {
  row.edit = false;
};

const handleSizeChange = (val: any) => {
  pageSize.value = val;
  queryHistoryEnergyTableList();
};
const handleCurrentChange = (val: any) => {
  page.value = val;
  queryHistoryEnergyTableList();
};

const search = () => {
  queryHistoryEnergyTableList();
};

const reset = () => {
  searchDate.value = [null, null];
  queryHistoryEnergyTableList();
};

// mitt.on('queryHistoryEnergyTableList', async (val: any) => {
//   versionIdRef.value = val;
//   queryHistoryEnergyTableList();
// });

const searchDatechange = () => {
  mitt.emit('searchDate', searchDate.value);
};

mitt.emit('searchDate', searchDate.value);

// 从主页进去历史版本详情
watch(
  () => versionId.value,
  (newval, oldval) => {
    if (newval && oldval !== undefined) {
      versionIdRef.value = newval;
      queryHistoryEnergyTableList();
    }
  },
  { immediate: true },
);

onMounted(async () => {
  // 重新布局表格，解决el-table固定列错位
  elTableRef.value.doLayout();
  await queryHistoryEnergyTableList();
});

onUnmounted(() => {
  mitt.off('queryHistoryEnergyTableList');
});
</script>
<style lang="less" scoped>
#historical-energy-table {
  display: flex;
  flex-direction: column;

  height: 100%;

  .search-bar {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    &-add {
      margin-left: auto;
    }
  }

  .he-table {
    flex: 1 1 auto;
  }
}
</style>
