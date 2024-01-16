<template>
  <div v-drag>
    <el-dialog v-model="dialogVisible" title="选择页面组态的组件" :close-on-click-modal="false">
      <div class="addDialogTab">
        <el-table
          :data="comTableData"
          style="width: 100%"
          v-loading="loading"
          ref="multipleTable"
          @row-click="getRowInfo"
        >
          <!-- <el-table-column type="selection" width="55"> </el-table-column> -->
          <el-table-column prop="code" label="组件编号" align="center"></el-table-column>
          <el-table-column prop="name" label="组件名称" align="center"></el-table-column>
          <el-table-column prop="size" label="组件大小" align="center"></el-table-column>
          <el-table-column prop="address" label="选中" align="center">
            <template #default="scope">
              <!-- <el-radio v-model="radioSelect" :label="scope.row.id"></el-radio> -->
              <el-checkbox v-model="scope.row.checked" :value="scope.row.id" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <button @click="dialogVisible = false">取消</button>
          <button primary @click="onSubmit">提 交</button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { onMounted, defineComponent, reactive, ref, toRefs } from 'vue';
import emitter from '@/utils/use-common-controller';
import useCurrentInstance from '@/utils/use-current-instance';

interface addComDlgState {
  dialogVisible: Boolean;
  radioSelect: any;
  selectRow: any;
}
export default defineComponent({
  name: 'AddComponentDialog',
  components: {},
  setup(props) {
    const { proxy } = useCurrentInstance();
    const comTableData = ref<pageDiyData.CommonObject[]>([]);
    let loading = ref<boolean>(true);
    const addComState = reactive<addComDlgState>({
      dialogVisible: false,
      radioSelect: null,
      selectRow: [],
    });
    /**
     * 初始化
     */
    onMounted(async () => {
      emitter.on('getComDate', (res: any) => {
        if (res.code == 200 && res.success && res.data.list.length > 0) {
          loading.value = false;
          for (let i = 0; i < res.data.list.length; i++) {
            res.data.list[i].checked = false;
          }
          comTableData.value = res.data.list;
        } else {
          loading.value = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      });
    });
    // 打开
    const show = () => {
      addComState.dialogVisible = true;
      addComState.radioSelect = null;
      addComState.selectRow = [];
    };
    //radio选中
    const getRowInfo = (row: any) => {
      addComState.selectRow = row;
      addComState.radioSelect = row.id;
      //  row.checked = !row.checked;
      // console.log(row)
    };
    //提交
    const onSubmit = () => {
      if (addComState.selectRow == '') {
        return proxy.$message.warning('请至少选中一个组件！');
      } else {
        const addItemData = addComState.selectRow;
        const addItemArray: any[] = [];
        comTableData?.value.map((item) => {
          if (item.checked) {
            console.log(item);
            addItemArray.push(item);
          }
        });

        console.log(addItemArray);
        emitter.emit('addItem', addItemArray);
        addComState.dialogVisible = false;
      }
    };
    return {
      ...toRefs(addComState),
      show,
      loading,
      comTableData,
      getRowInfo,
      onSubmit,
    };
  },
});
</script>
<style lang="less" scoped>
.addDialogTab {
  height: 532px;
  overflow-y: auto;
  /deep/ .el-radio .el-radio__label {
    display: none;
  }
  /deep/ .el-table__body tr:nth-child(even) > td {
    // background-color: rgba(230, 247, 255, 1) !important;
    background: #fafafa;
  }
  .el-table__body > tbody > tr:nth-child(even) > td,
  .el-table__body > tbody > .el-table__row:nth-child(even) > td {
    background: #fafafa;
  }
  /deep/ .el-table__body tr:hover > td {
    // background-color: rgba(230, 247, 255, 1) !important;
    background-color: #edf5fc;
  }
}
</style>
