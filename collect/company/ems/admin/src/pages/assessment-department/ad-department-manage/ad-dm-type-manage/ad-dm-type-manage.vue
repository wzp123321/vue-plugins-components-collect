<template>
  <page-common title="科室类型管理" class="ad-dm-type-manage">
    <template v-slot:pageContent>
      <section class="ad-dm-tm-btn">
        <button primary @click="departmentTypeManage.handleAddShow()">新增</button>
      </section>
      <section class="ad-dm-tm-table" v-loading="departmentTypeManage.loading">
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>科室类型</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in departmentTypeManage.dataSource" :key="'type_' + index">
              <td>{{ index + 1 }}</td>
              <td :title="item.name">{{ item.name ?? '--' }}</td>
              <td>
                <button text @click="departmentTypeManage.handleEditShow(item)">编辑</button>
                <button text danger>删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          class="common-table__empty"
          v-if="departmentTypeManage.dataSource?.length === 0 && !departmentTypeManage.loading"
        >
          <img src="../../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
          <p>暂无数据</p>
        </div>
      </section>
    </template>
  </page-common>
  <el-dialog
    v-model="departmentTypeManage.visible"
    :title="departmentTypeManage.typeVO?.id ? '编辑' : '新增'"
    width="404px"
    :before-close="departmentTypeManage.handleClose"
  >
    <el-form :model="departmentTypeManage.typeVO" label-width="65px" @submit.native.prevent>
      <el-form-item label="类型名称">
        <input
          type="text"
          maxlength="20"
          placeholder="请输入"
          v-model="departmentTypeManage.typeVO.name"
          v-inputFilter:search
        />
      </el-form-item>
    </el-form>
    <footer>
      <button @click="departmentTypeManage.handleClose">取消</button>
      <button primary>确定</button>
    </footer>
  </el-dialog>
</template>
<script lang="ts" setup>
/*
 *                        _oo0oo_
 *                       o8888888o
 *                       88" . "88
 *                       (| -_- |)
 *                       0\  =  /0
 *                     ___/`---'\___
 *                   .' \\|     |// '.
 *                  / \\|||  :  |||// \
 *                 / _||||| -:- |||||- \
 *                |   | \\\  - /// |   |
 *                | \_|  ''\---/''  |_/ |
 *                \  .-\__  '-'  ___/-. /
 *              ___'. .'  /--.--\  `. .'___
 *           ."" '<  `.___\_<|>_/___.' >' "".
 *          | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *          \  \ `_.   \_ __\ /__ _/   .-` /  /
 *      =====`-.____`.___ \_____/___.-`___.-'=====
 *                        `=---='
 *      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *            佛祖保佑               永无BUG
 */
import { DepartmentTypeManageService } from './ad-dm-type-manage.service';

const departmentTypeManage = new DepartmentTypeManageService();
departmentTypeManage.query();
</script>
<style lang="less" scoped>
.ad-dm-type-manage {
  width: 100%;
  height: 100%;

  :deep(.page-common__container-detail) {
    display: flex;
    flex-direction: column;
  }

  .ad-dm-tm-btn {
    padding: 16px 0;
    text-align: right;
  }

  .ad-dm-tm-table {
    flex: 1 1 auto;

    table {
      width: 100%;
    }
  }
}
.el-dialog__body {
  input {
    width: 100%;
  }

  footer {
    text-align: center;

    margin-top: 42px;
  }
}
</style>
