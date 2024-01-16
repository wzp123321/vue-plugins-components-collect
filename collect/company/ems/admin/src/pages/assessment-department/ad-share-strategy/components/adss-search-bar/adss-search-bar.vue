<template>
  <div class="adss-search-bar">
    <el-form :model="adssSearchBar.formSearch" :inline="true" @submit.native.prevent>
      <el-form-item>
        <el-input
          class="asb-name-input"
          v-inputFilter:search
          v-model="adssSearchBar.formSearch.likeName"
          placeholder="请输入策略名称、分摊源名称、分摊对象查询"
          maxlength="20"
          :suffix-icon="Search"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="能源类型">
        <el-select v-model="adssSearchBar.formSearch.energyType">
          <el-option
            v-for="item in energyList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
            :title="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分摊周期">
        <el-date-picker
          v-model="adssSearchBar.formSearch.shareDate"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <button primary @click="adssSearchBar.onSubmit">查询</button>
      </el-form-item>
      <el-form-item>
        <button @click="adssSearchBar.onReset">重置</button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { postRequest } from '../../../../../services/request';
import { Search } from '@element-plus/icons-vue';
import { Common_ICodeName } from '../../../../../services/common/common-api';
import { Ass_EPath } from '../../ad-share-strategy.api';
// 服务
import adssSearchBar from './adss-search-bar.service';
// 工具方法
import { FResHandler } from '../../../../../utils/token';

// 能源类型
const energyList = ref<Common_ICodeName[]>([]);
/**
 * 查询能源类型
 */
async function getEnergyList() {
  try {
    const res = await postRequest(Ass_EPath.查询能源类型);
    const result = FResHandler<Common_ICodeName[]>(res);
    energyList.value = result ?? [];
    energyList.value.unshift({ code: '', name: '全部' });
  } catch (error) {
    energyList.value = [];
  }
}

onMounted(() => {
  getEnergyList();

  adssSearchBar.onSubmit();
});
</script>
<style lang="less" scoped>
.adss-search-bar {
  .asb-name-input {
    width: 330px;
    .el-input__suffix {
      display: flex;
      align-items: center;
    }
  }
}
</style>
