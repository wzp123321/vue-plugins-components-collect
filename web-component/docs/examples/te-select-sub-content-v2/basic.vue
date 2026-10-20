<!--
 * @Author: yanghui yanghui@tiansu-china.com
 * @Date: 2024-06-13 15:20:12
 * @LastEditors: yanghui yanghui@tiansu-china.com
 * @LastEditTime: 2024-06-25 17:25:18
 * @Description: 
-->
<template>
  <TeSelectSubContentV2 v-model="value" :data="options" :value-key="'id'" :textProps="props"
    :filterKeysArr="filterKeysArr"></TeSelectSubContentV2>
  <div>{{ value }}</div>
</template>
<script setup lang="ts">
import { TeSelectSubContentV2 } from '@ts-web-package/components/lib/te-select-sub-content-v2';
import { ref } from 'vue'

const props = {
  mainText: 'text',
  subText: 'subShowText'
}

const filterKeysArr = ['deptName', 'code', 'devPropertyName']

const options = [
  {
    code: 'MEMS-SBLB-133669',
    label: 'ces222',
    deptId: '910002183147552',
    deptName: '台州市中心医院',
    thirdCode: null,
    serialNumber: null,
    devBusinessCategory: 549075160096774,
    devBusinessCategoryName: '2222',
    devProperty: null,
    devPropertyName: null,
    mainTip: 'ces222',
    subShowText: '-',
    devCode: 'MEMS-SBLB-133669',
    text: 'ces222',
    id: '549096398553093'
  },
  {
    code: 'MEMS-SBLB-133666',
    label: '123',
    deptId: '910002183147552',
    deptName: '台州市中心医院',
    thirdCode: null,
    serialNumber: null,
    devBusinessCategory: 547058461306886,
    devBusinessCategoryName: '123>',
    devProperty: '2',
    devPropertyName: '效益设备',
    mainTip: '123',
    subShowText: '-',
    devCode: 'MEMS-SBLB-133666',
    text: '123',
    id: '547602294177797'
  },
  {
    code: 'MEMS-YLP-133656',
    label: '放大发的',
    deptId: '945471794910528',
    deptName: '部门1',
    thirdCode: 'sssss',
    serialNumber: '123456',
    devBusinessCategory: 531683710615557,
    devBusinessCategoryName: '饮料瓶',
    devProperty: null,
    devPropertyName: null,
    mainTip: '放大发的',
    subShowText: 'sssss/123456',
    devCode: 'MEMS-YLP-133656',
    text: '放大发的',
    id: '547387151241221'
  },
  {
    code: 'MEMS-YLP-133657',
    label: '放大发的',
    deptId: '945471794910528',
    deptName: '部门1',
    thirdCode: 'sssss',
    serialNumber: null,
    devBusinessCategory: 531683710615557,
    devBusinessCategoryName: '饮料瓶',
    devProperty: null,
    devPropertyName: null,
    mainTip: '放大发的',
    subShowText: 'sssss',
    devCode: 'MEMS-YLP-133657',
    text: '放大发的',
    id: '547387151249413'
  },
  {
    code: 'MEMS-SBLB-133658',
    label: 'ceshi',
    deptId: '910002183147552',
    deptName: '台州市中心医院',
    thirdCode: 'sf',
    serialNumber: null,
    devBusinessCategory: 546897016446981,
    devBusinessCategoryName: '设备类别子级AAA',
    devProperty: null,
    devPropertyName: null,
    mainTip: 'ceshi',
    subShowText: 'sf',
    devCode: 'MEMS-SBLB-133658',
    text: 'ceshi',
    id: '547387151249415'
  },
  {
    code: 'MEMS-SBLB-133659',
    label: 'ceshi',
    deptId: '910002183147552',
    deptName: '台州市中心医院',
    thirdCode: 'sf',
    serialNumber: null,
    devBusinessCategory: 546897016446981,
    devBusinessCategoryName: '设备类别子级AAA',
    devProperty: null,
    devPropertyName: null,
    mainTip: 'ceshi',
    subShowText: 'sf',
    devCode: 'MEMS-SBLB-133659',
    text: 'ceshi',
    id: '547387151249417'
  },
  {
    code: 'MEMS-SBLB-133660',
    label: 'ceshi',
    deptId: '910002183147552',
    deptName: '台州市中心医院',
    thirdCode: 'sf',
    serialNumber: null,
    devBusinessCategory: 546897016446981,
    devBusinessCategoryName: '设备类别子级AAA',
    devProperty: null,
    devPropertyName: null,
    mainTip: 'ceshi',
    subShowText: 'sf',
    devCode: 'MEMS-SBLB-133660',
    text: 'ceshi',
    id: '547387151249419'
  },
  {
    code: 'MEMS-SBLB-133661',
    label: 'ceshi',
    deptId: '910002183147552',
    deptName: '台州市中心医院',
    thirdCode: 'sf',
    serialNumber: null,
    devBusinessCategory: 546897016446981,
    devBusinessCategoryName: '设备类别子级AAA',
    devProperty: null,
    devPropertyName: null,
    mainTip: 'ceshi',
    subShowText: 'sf',
    devCode: 'MEMS-SBLB-133661',
    text: 'ceshi',
    id: '547387151249421'
  },
  {
    code: 'MEMS-SBLB-133662',
    label: 'ceshi',
    deptId: '910002183147552',
    deptName: '台州市中心医院',
    thirdCode: 'sf',
    serialNumber: null,
    devBusinessCategory: 546897016446981,
    devBusinessCategoryName: '设备类别子级AAA',
    devProperty: null,
    devPropertyName: null,
    mainTip: 'ceshi',
    subShowText: 'sf',
    devCode: 'MEMS-SBLB-133662',
    text: 'ceshi',
    id: '547387151249423'
  },
  {
    code: 'MEMS-SBLB-133663',
    label: 'ceshi',
    deptId: '910002183147552',
    deptName: '台州市中心医院',
    thirdCode: 'sf',
    serialNumber: null,
    devBusinessCategory: 546897016446981,
    devBusinessCategoryName: '设备类别子级AAA',
    devProperty: null,
    devPropertyName: null,
    mainTip: 'ceshi',
    subShowText: 'sf',
    devCode: 'MEMS-SBLB-133663',
    text: 'ceshi',
    id: '547387151249425'
  },
  {
    code: 'MEMS-SBLB-133664',
    label: 'ceshi',
    deptId: '910002183147552',
    deptName: '台州市中心医院',
    thirdCode: 'sf',
    serialNumber: null,
    devBusinessCategory: 546897016446981,
    devBusinessCategoryName: '设备类别子级AAA',
    devProperty: null,
    devPropertyName: null,
    mainTip: 'ceshi',
    subShowText: 'sf',
    devCode: 'MEMS-SBLB-133664',
    text: 'ceshi',
    id: '547387151249427'
  }
]
const value = ref()
</script>
<script lang="ts">
export default {
  name: 'te-select-sub-content-v2',
};
</script>
<style scoped lang="scss"></style>
