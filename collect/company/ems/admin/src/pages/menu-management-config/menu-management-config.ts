import { defineComponent, ref, onMounted, reactive } from 'vue';
import { cloneDeep } from 'lodash';
import { IconEditPen } from '@arco-iconbox/vue-te';

import MenuManagementConfigService from '@/pages/menu-management-config/service/menu-management-config.service';
import message from '@/utils/message';
interface MenuParams {
  likeName: string;
}
export default defineComponent({
  name: 'MenuManagementConfig',
  components: {
    IconEditPen,
  },
  setup() {
    // 表格节点名称最小宽度
    const tableTreeNameWidth = ref(180);

    //序号宽度
    const widthOfOrder = ref(240);

    const tableMaxWidth = ref(180);
    // 列表加载loading
    const loading = ref(true);
    // 数据源
    const tableData = ref<any>([]);
    // 搜索菜单名称
    const formSearch = reactive<MenuParams>({
      likeName: '',
    });
    // 展开节点
    const expandedKeys = ref<string[]>([]);
    /**
     * 初始化
     */
    onMounted(async () => {
      try {
        await getMenuToSelect();
        if (tableData.value?.length) {
          const arr: any = [];
          tableData.value?.forEach((item: any) => {
            if (item?.childMenu?.length) {
              arr.push(String(item?.id));
            }
          });
          expandedKeys.value = arr;
        }

        loading.value = false;
      } catch (err) {
        loading.value = false;
      }
    });
    const onSubmit = () => {
      getMenuToSelect();
    };
    const onReset = () => {
      formSearch.likeName = '';
      getMenuToSelect();
    };
    //获取菜单管理tree树
    const getMenuToSelect = async () => {
      try {
        const res = await MenuManagementConfigService.getMenuToSelect(formSearch);
        if (res.code == 200 && res.success && res?.data?.menuList?.length) {
          tableData.value = res.data?.menuList;
          getTreeNameWidth(tableData.value);
        } else {
          tableData.value = [];
        }
      } catch (error) {
        tableData.value = [];
      }
    };
    // 渲染空格
    const formatTreeName = (row: any) => {
      return row.name.replaceAll(' ', '&nbsp;');
    };
    /**
     * 自适应节点名称宽度
     */
    const getTreeNameWidth: any = (data: any) => {
      let res = null;
      if (!data) {
        return null;
      }
      for (let item of data) {
        const rowWidth = (item.stage + 1) * 20 + 20 + getTextWidth(item.name);
        if (rowWidth > tableMaxWidth.value) {
          tableMaxWidth.value = cloneDeep(rowWidth);
        }
        tableTreeNameWidth.value = cloneDeep(tableMaxWidth.value);
        if (!res && item.childMenu && item.childMenu.length > 0) {
          res = getTreeNameWidth(item.childMenu);
        }
      }
      return res;
    };
    /**
     * 获取文本宽度
     */
    const getTextWidth = (text: string) => {
      const canvas = document.createElement('canvas');
      const context: any = canvas.getContext('2d');
      context.font = 'bold 14px Microsoft YaHei';
      const metrics = context.measureText(text);
      return metrics.width;
    };
    //开关切换
    const changeSwitch = async (row: any) => {
      try {
        const showFlag = cloneDeep(row.showFlag);
        row.showFlag = !row.showFlag;
        const res = await MenuManagementConfigService.updateVisibility({
          menuId: row.id,
          showFlag: showFlag,
        });
        if (res.code === 200) {
          row.showFlag = showFlag;
          getMenuToSelect();
        } else if (res?.code + '' !== '401') {
          message.error(res?.message ?? '操作失败');
        }
      } catch (error) {}
    };
    // 展开
    const handleExpand = (row: any, expanded: boolean) => {
      if (expanded) {
        expandedKeys.value.push(row.id + '');
      } else {
        expandedKeys.value = expandedKeys.value.filter((item: any) => {
          return item != row.id;
        });
      }
    };

    const editParams = reactive<{
      index: number;
      id: number;
    }>({
      index: -1,
      id: -1,
    });

    /**
     * 是否处于编辑
     * @param row
     * @param index
     * @returns
     */
    const mapIsEditing = (row: any, index: number) => {
      return editParams.id === row.id && editParams.index === index;
    };

    const aliasEdit = (row: any, index: number) => {
      editParams.id = row.id;
      editParams.index = index;
    };

    const changeVal = async (row: any) => {
      try {
        const res = await MenuManagementConfigService.updateAlias({
          menuId: row.id,
          alias: row.alias === '' ? null : row.alias,
        });
        if (res.code == 200 && res.success && res?.data) {
          message.success('编辑成功');
        } else {
          message.success(res.message || '编辑失败');
        }
        getMenuToSelect();
      } catch (error) {
        message.success('编辑失败');
      }
    };

    const blurEvt = (row: any, index: number) => {
      editParams.id = -1;
      editParams.index = -1;
    };

    return {
      formSearch,
      loading,
      tableData,
      tableTreeNameWidth,
      expandedKeys,
      widthOfOrder,

      formatTreeName,
      changeSwitch,
      onSubmit,
      onReset,
      handleExpand,
      mapIsEditing,
      aliasEdit,
      blurEvt,
      changeVal,
    };
  },
});
