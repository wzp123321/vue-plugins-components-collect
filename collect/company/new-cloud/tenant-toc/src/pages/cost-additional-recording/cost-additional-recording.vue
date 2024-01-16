<template>
  <div class="cost-additional-recording" id="cost-additional-recording">
    <h5>成本补录</h5>
    <div class="car-main">
      <car-search-bar></car-search-bar>
      <car-table></car-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import CarSearchBar from './car-searchbar/car-searchbar.vue';
import CarTable from './car-table/car-table.vue';
</script>
<style lang="less" scoped>
#cost-additional-recording {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  background-color: #f0f4f9;

  overflow: hidden;

  h5 {
    font-size: 16px;
  }

  .car-main {
    flex: 1 1 auto;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    border-radius: 8px;
    box-shadow: 0 1px 7px 0 rgb(38 38 38 / 10%);
    padding: 15px 12px;
    min-width: 1440px;

    overflow: hidden;

    background-color: white;

    :deep(.car-table) {
      flex: 1 1 auto;

      overflow: hidden;
    }
  }
}
</style>
