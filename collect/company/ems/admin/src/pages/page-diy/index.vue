<!-- @format -->

<template>
  <div class="page-home">
    <page-common title="门户管理" :showSearch="true" :isSubHead="true">
      <!-- buttonBar -->
      <template v-slot:pageSubHead>
        <ButtonBar></ButtonBar>
      </template>
      <template v-slot:pageContent>
        <div class="divCon" v-loading="loading">
          <grid-layout
            v-if="layout?.length > 0"
            :layout.sync="layout"
            :col-num="3"
            :row-height="350"
            :is-draggable="true"
            :is-resizable="false"
            :is-mirrored="false"
            :vertical-compact="false"
            :margin="[10, 10]"
            :use-css-transforms="true"
          >
            <grid-item
              v-for="item in layout"
              :item="watchItem(item)"
              :x="item.x"
              :y="item.y"
              :w="item.w"
              :h="item.h"
              :i="item.i"
              :key="item.i"
              :is-draggable="true"
              @move="moveEvent(item)"
              @moved="movedEvent"
            >
              <div class="itemCon">
                <div class="itemConTitle">
                  <span class="itemTitWord">{{ item.name }}</span>
                  <span class="itemConIcon" @click="deleteItem(item.i)">
                    <i class="iconfont icon-shanchu1"></i>
                  </span>
                  <span class="itemConIcon" @click="configItem(item)">
                    <i class="iconfont icon-shezhi"></i>
                  </span>
                </div>
                <div class="itemConImg">
                  <img :src="getImgUrl(item.componentCode)" style="width: 100%; height: 100%" alt="component" />
                </div>
              </div>
            </grid-item>
          </grid-layout>
          <no-data v-if="layout?.length === 0 && !loading"></no-data>
        </div>
      </template>
    </page-common>
    <!-- 设置弹框 -->
    <ComponentSettingDialog
      ref="componentSettingDialog"
      :title="dialogDataTitle"
      :type="dialogDataType"
    ></ComponentSettingDialog>
    <AddComponentDialog ref="addComponentDialog"></AddComponentDialog>
  </div>
</template>
<script lang="ts">
import { onBeforeMount, onMounted, defineComponent, reactive, ref, toRefs, onUnmounted } from 'vue';
import emitter from '@/utils/use-common-controller';
import useCurrentInstance from '@/utils/use-current-instance';
import { ElDialog } from 'element-plus';
// services
import pageDiy from '@/services/view/page-diy/index';
// components
import ButtonBar from '@/pages/page-diy/pd-button-bar.vue';
import AddComponentDialog from '@/pages/page-diy/pd-add-component-dialog.vue';
import ComponentSettingDialog from '@/pages/page-diy/pd-component-setting-dialog/index.vue';
// utils
import { useStore } from 'vuex';

interface dataType {
  layout: any;
  historyLayout: any;
  curBox: any;
  newX: number;
  newY: number;
  testy: number;
  testx: number;
  dialogDataTitle: string;
  dialogDataType: string;
}
interface getInitType {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
  componentCode: any;
  id: string;
  name: string;
  sketchMap: string;
}
interface addItemType {
  size: string;
  i: string;
  code: any;
  id: string;
  name: string;
  sketchMap: string;
}
export default defineComponent({
  setup() {
    const store = useStore();
    const { proxy } = useCurrentInstance();
    const componentSettingDialog = ref(ElDialog);
    const addComponentDialog = ref(ElDialog);
    let loading = ref<boolean>(true);
    const state = reactive<dataType>({
      layout: [],
      historyLayout: [],
      curBox: '',
      newX: 0,
      newY: 0,
      testy: 0,
      testx: 0,
      dialogDataTitle: '',
      dialogDataType: '',
    });
    onBeforeMount(async () => {
      await getInitLayout();
    });
    /**
     * 初始化
     */
    onMounted(async () => {
      //保存布局
      emitter.on('saveLayout', async () => {
        if (loading.value) {
          return;
        }
        try {
          loading.value = true;
          const obj = state.layout;
          const res = await pageDiy.saveLayout(
            obj?.map((item: any) => {
              return {
                componentCode: item.componentCode,
                h: item.h,
                id: item.id,
                position: item.position,
                size: item.size,
                w: item.w,
                x: item.x,
                y: item.y,
              };
            }),
          );
          if (res.code == 200 && res.success) {
            loading.value = false;
            //保存之后重新刷新
            await resetLayout();
            proxy.$message.success(res.message);
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        } catch (error: any) {
          loading.value = false;
          proxy.$message.error('操作失败');
          console.log('error------------', error);
        }
      });
      //新增组件addNewcomponent
      emitter.on('addNewcomponent', async () => {
        try {
          const addParams = {
            pageNum: 1,
            pageSize: 1,
            searchCount: true,
          };
          const res = await pageDiy.addQueryComponent(addParams);
          if (res.code == 200 && res.success) {
            if (addComponentDialog.value) {
              addComponentDialog.value.show();
              emitter.emit('getComDate', res);
            }
          } else {
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              return proxy.$message.error(res.message);
            }
          }
        } catch (error: any) {}
      });
      //请求重置
      emitter.on('onReset', async () => {
        // 调用重置
        await resetLayout();
      });
      //重置
      const resetLayout = async () => {
        //重新请求
        await getInitLayout();
      };
      //选中要新增的组件，调用addItem
      emitter.on('addItem', (res: any) => {
        addItem(res);
      });
    });
    onUnmounted(() => {
      emitter.off('saveLayout');
      emitter.off('addNewcomponent');
      emitter.off('onReset');
      emitter.off('addItem');
    });
    //获取最初布局
    const getInitLayout = async () => {
      try {
        loading.value = true;
        state.historyLayout = [];
        state.layout = [];
        const res = await pageDiy.getInitLayout();
        if (res.code == 200 && res.success) {
          loading.value = false;
          res.data.forEach(function (element: getInitType) {
            state.layout.push({
              x: element.x,
              y: element.y,
              w: element.w,
              h: element.h,
              componentCode: element.componentCode,
              name: element.name,
              i: element.id,
              id: element.id,
              sketchMap: element.sketchMap,
            });
          });
          state.historyLayout = state.layout;
        } else {
          //清空布局
          state.historyLayout = [];
          state.layout = [];
          loading.value = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (error: any) {
        //清空布局
        state.historyLayout = [];
        state.layout = [];
        loading.value = false;
        proxy.$message.error('操作失败');
        console.log('error------------', error);
      }
    };
    //item watch事件
    const watchItem = (item: any) => {
      //若是不是当前移动的 使其位置保持不变
      if (state.curBox != item.i) {
        for (let j = 0; state.historyLayout[j] != undefined; j++) {
          if (state.historyLayout[j].i == item.i) {
            item.x = state.historyLayout[j].x;
            item.y = state.historyLayout[j].y;
          }
        }
      }
      return item;
    };
    //item移动事件
    const moveEvent = (item: any) => {
      state.curBox = item.i;
      state.testx = item.x;
      state.testy = item.y;
    };
    //item移动后的事件
    const movedEvent = (i: any, newX: any, newY: any) => {
      for (let j = 0; state.historyLayout[j] != undefined; j++) {
        if (state.historyLayout[j].x === state.testx && state.historyLayout[j].y === state.testy) {
          state.layout = state.historyLayout;
        } else {
          if (state.historyLayout[j].i == i) {
            state.newX = state.historyLayout[j].x;
            state.newY = state.historyLayout[j].y;
            state.historyLayout[j].x = newX;
            state.historyLayout[j].y = newY;
          }
        }
      }
      for (let j = 0; state.historyLayout[j] != undefined; j++) {
        if (i != state.historyLayout[j].i && state.historyLayout[j].x === newX && state.historyLayout[j].y === newY) {
          state.historyLayout[j].x = state.newX;
          state.historyLayout[j].y = state.newY;
        }
      }
    };
    //增加item事件
    const addItem = (res: addItemType[]) => {
      //截取size的w值
      if (res && res.length > 0) {
        for (let i = 0; i < res.length; i++) {
          const item = res[i];
          const prew = item.size.substr(0, 1);
          const newW = parseInt(prew);
          console.log(prew);
          //获取布局y最大值
          const newArray = state.layout.map((item2: { y: number }) => item2.y);
          const newY = newArray.length == 0 ? 0 : Math.max(...newArray) + 1;
          state.layout.push({
            x: 0,
            y: newY,
            w: newW,
            h: 1,
            componentCode: item.code,
            name: item.name,
            i: (Math.random() * 1000000).toString().replace('.', ''),
            id: null,
            sketchMap: item.sketchMap,
          });
        }
      }
      emitter.emit('saveLayout');
    };
    //删除item事件
    const deleteItem = (val: any) => {
      const index = state.layout.map((item: { i: number }) => item.i).indexOf(val);
      state.layout.splice(index, 1);
      //删除后更新history布局
      state.historyLayout = state.layout;
    };
    const homeOptionData = ref<any>({});
    //配置item事件
    const configItem = (item: getInitType) => {
      console.log(item, 'configItem');
      homeOptionData.value = item;
      store.dispatch('setHomeOption', item);
      console.log(item);
      //新增未保存组件不可配置
      if (item.id == null) {
        return proxy.$message.warning('新增组件需先保存才可配置！');
      } else if (item.name === '设备状态监测') {
        return proxy.$message.warning('此组件没有配置项，无需配置！');
      } else {
        if (item.componentCode == 'ZJ007') {
          return proxy.$message.warning('此组件没有配置项，无需配置');
        }
        // console.log(state.dialogData);
        state.dialogDataTitle = item.name;
        state.dialogDataType = item.componentCode;
        componentSettingDialog.value.show();
      }
    };
    //获取路径
    const getImgUrl = (imgName: string) => {
      const path = `/src/assets/img/pagediy/pd-${imgName}.png`;
      const modules = import.meta.globEager('/src/assets/img/pagediy/*.png');
      return modules[path] && modules[path].default ? modules[path].default : '';
    };
    return {
      ...toRefs(state),
      movedEvent,
      moveEvent,
      watchItem,
      deleteItem,
      configItem,
      addComponentDialog,
      componentSettingDialog,
      loading,
      getImgUrl,
      homeOptionData,
    };
  },
  components: {
    ButtonBar,
    AddComponentDialog,
    ComponentSettingDialog,
  },
});
</script>
<style lang="less">
.page-home {
  height: 100%;
  overflow-y: auto;
  div.page-common.flex.flex-column {
    div {
      div.page-common__container-search {
        margin-bottom: 0 !important;
        padding: 0 !important;
      }
    }
  }
}
.divCon {
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow-y: auto;
  .vue-grid-item {
    background: #e3e9f4;
    box-shadow: 0 -1px 4px #ccc;
    border-radius: 5px;
  }
  .itemCon {
    width: 100%;
    .itemConTitle {
      padding: 0 10px;
      height: 36px;
      background-color: #fff;
      .itemTitWord {
        line-height: 36px;
        font-size: 14px;
        color: #000;
      }
      .itemConIcon {
        float: right;
        margin-right: 10px;
        line-height: 36px;
        i {
          cursor: pointer;
          font-size: 18px;
        }
      }
    }
    .itemConImg {
      height: 314px;
      box-shadow: 0px -1px 6px rgb(231, 231, 231);
      background-color: #fff;
    }
  }
}
</style>
