import { defineComponent, reactive, ref, onMounted, nextTick, computed } from 'vue';
import { useStore } from 'vuex';
// utils
// import useCurrentInstance from '@/utils/use-current-instance';
import { openBlankUrl } from '@/utils/index';
// config
import { pageSizes } from '@/config/config';
// services
import equipmentDetail from './services/equipment-detail';

interface equitmentItemListType {
  cardName: string;
  cardCount: number;
}

interface formInlineType {
  search: string;
  type: number | undefined;
}

interface type {
  typeName: string;
  typeId: number;
}

export default defineComponent({
  name: 'EquipmentDetail',
  setup() {
    // const { proxy } = useCurrentInstance();
    const equitmentItemList = ref<equitmentItemListType[]>([]);
    const store = useStore();
    // 色卡（蓝色、橙色、黄色、绿色、红色、深蓝色、紫色、雾霾蓝、砖红、淡紫）
    const colorArr = [
      '#3681FF',
      '#FF9121',
      '#FFCB20',
      '#00B261',
      '#FE4B4E',
      '#443AFF',
      '#A83BFF',
      '#00A5B2',
      '#D91026',
      '#EC50D2',
    ];
    const colorShadowArr = [
      'rgba(54, 129, 255, 0.5)',
      'rgba(255, 145, 33, 0.5)',
      'rgba(255, 203, 32, 0.5)',
      'rgba(0, 178, 97, 0.5)',
      'rgba(254, 75, 78, 0.5)',
      'rgba(68, 58, 255, 0.5)',
      'rgba(168, 59, 255, 0.5)',
      'rgba(0, 165, 178, 0.5)',
      'rgba(217, 16, 38, 0.5)',
      'rgba(236, 80, 210, 0.5)',
    ];
    const translateX = ref<number>(0);
    const itemIndex = ref<number>(0);
    let isLeftBtnShow = false;
    const reportBoxWidth = ref<number>(0); // 导航盒子宽度

    let multiple = 0;
    const formInline = reactive<formInlineType>({
      search: '',
      type: undefined,
    });
    const typeList = ref<type[]>([]); // 类型
    const pageNum = ref<number>(1);
    const pageSize = ref<number>(pageSizes[0]);
    const total = ref<number>(0);
    const abnormal = ref<boolean>(true);
    const carLloading = ref<boolean>(true); // 导航loading
    const loading = ref<boolean>(true); // 表格loading
    const tableData = ref<equipmentDetail.CommonObject[]>([]);
    const lightOrDark = computed(() => {
      return store.getters.theme === 'light' ? true : false;
    });
    // 获取数据
    const getData = async () => {
      try {
        carLloading.value = true;
        const res = await equipmentDetail.getDataUrl();
        if (res && res.code === 200 && res.success) {
          equitmentItemList.value = res.data || [];
          carLloading.value = false;
        } else {
          carLloading.value = false;
          // return proxy.$message.error(res.message || '汇总成卡片数据获取失败');
        }
      } catch (error) {
        carLloading.value = false;
        // return proxy.$message.error(error.message || '汇总成卡片数据获取失败');
      }
    };

    // 导航框鼠标移入事件
    const onMouseOver = () => {
      if (multiple > 0) {
        const right_button_dom = <HTMLImageElement>document.querySelector('.right-button');
        right_button_dom.className = 'equipment-card-box-button right-button';
      }
      if (itemIndex.value >= 1) {
        const left_button_dom = <HTMLImageElement>document.querySelector('.left-button');
        left_button_dom.className = 'equipment-card-box-button left-button';
        isLeftBtnShow = true;
      }
      // 隐藏右侧按钮
      if (itemIndex.value > multiple) {
        const right_button_dom = <HTMLImageElement>document.querySelector('.right-button');
        right_button_dom.className = 'equipment-card-box-button right-button buttonHide';
      }
    };
    // 导航框鼠标移出事件
    const onMouseOut = () => {
      if (multiple > 0) {
        const right_button_dom = <HTMLImageElement>document.querySelector('.right-button');
        right_button_dom.className = 'equipment-card-box-button right-button buttonHide';
      }
      if (isLeftBtnShow) {
        const left_button_dom = <HTMLImageElement>document.querySelector('.left-button');
        left_button_dom.className = 'equipment-card-box-button left-button buttonHide';
        isLeftBtnShow = false;
      }
    };
    // 左侧导航按钮点击事件
    const onLeftBtn = () => {
      if (itemIndex.value === 0) {
        translateX.value = 0;
      } else {
        itemIndex.value--;
        translateX.value = -itemIndex.value * 401;
      }
      //   隐藏左侧按钮
      if (itemIndex.value === 0) {
        const left_button_dom = <HTMLImageElement>document.querySelector('.left-button');
        left_button_dom.className = 'equipment-card-box-button left-button buttonHide';
        isLeftBtnShow = false;
      }
    };

    // 右侧导航按钮点击事件
    const onRightBtn = () => {
      itemIndex.value++;
      translateX.value = -itemIndex.value * 401;
      // 左侧按钮显示
      if (itemIndex.value >= 1) {
        const left_button_dom = <HTMLImageElement>document.querySelector('.left-button');
        left_button_dom.className = 'equipment-card-box-button left-button';
        isLeftBtnShow = true;
      }
      // 隐藏右侧按钮
      if (itemIndex.value > multiple) {
        const right_button_dom = <HTMLImageElement>document.querySelector('.right-button');
        right_button_dom.className = 'equipment-card-box-button right-button buttonHide';
      }
    };
    // 监听浏览器窗口大小事件, 可实时拿到导航盒子宽度
    window.onresize = () => {
      if (equitmentItemList.value.length > 0) {
        // 导航盒子
        const equipment_card_dom = <HTMLImageElement>document.querySelector('.equipment-card');
        reportBoxWidth.value = equipment_card_dom.offsetWidth;
        //  倍数
        multiple = (equitmentItemList.value.length * 401 - reportBoxWidth.value) / 401;
      }
    };

    //  查询按钮事件
    const onSearch = () => {
      pageNum.value = 1;
      pageSize.value = pageSizes[0];
      getList();
    };
    // 重置按钮事件
    const onReset = () => {
      formInline.search = '';
      formInline.type = 0;
      onSearch();
    };

    // 获取列表
    const getList = async () => {
      try {
        loading.value = true;
        const obj = {
          keyword: formInline.search,
          deviceTypeId: formInline.type,
          orders: [
            {
              asc: true,
              column: '',
            },
          ],
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          searchCount: true,
        };
        // console.log(sortName.value, 'obj');
        const res = await equipmentDetail.getListUrl(obj);
        // console.log(res, '数据');
        if (res && res.code === 200 && res.success) {
          loading.value = false;
          tableData.value = res.data.list || [];
          total.value = res.data.total;
        } else {
          abnormal.value = false;
          loading.value = false;
          // return proxy.$message.error(res.message);
        }
      } catch (error) {
        loading.value = false;
        abnormal.value = false;
        // console.log('error------------', error);
      }
    };

    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
      pageNum.value = 1;
      getList();
    };
    const onCurrentChange = (value: number) => {
      pageNum.value = Math.floor(value);
      getList();
    };
    // 获取类型
    const getType = async () => {
      try {
        const res = await equipmentDetail.getSelectUrl();
        if (res && res.code === 200 && res.success) {
          typeList.value = res.data || [];
          formInline.type = 0;
          // loading.value = false;
        } else {
          // return proxy.$message.error(res.message || '设备类型获取失败');
          // loading.value = false;
        }
      } catch (error) {
        // loading.value = false;
        // console.log('error------------', error);
        // return proxy.$message.error(error.message || '设备类型获取失败');
      }
    };

    // 详细信息跳转
    const jumper = (val: any) => {
      openBlankUrl('/web/equipmentDetailInfo', 'web', { deviceId: val.id });
    };

    onMounted(async () => {
      await getData();
      await getType();
      await getList();
      // 导航盒子
      if (equitmentItemList.value.length > 0) {
        const report_box_dom = <HTMLImageElement>document.querySelector('.equipment-card-box');
        reportBoxWidth.value = report_box_dom.offsetWidth;
        nextTick(() => {
          //  倍数
          multiple = (equitmentItemList.value.length * 401 - reportBoxWidth.value) / 401;
        });
      }
    });
    return {
      equitmentItemList,
      colorArr,
      colorShadowArr,
      translateX,
      itemIndex,
      multiple,
      reportBoxWidth,
      formInline,
      loading,
      carLloading,
      abnormal,
      pageNum,
      pageSize,
      total,
      pageSizes,
      tableData,
      typeList,
      lightOrDark,
      onMouseOver,
      onMouseOut,
      onRightBtn,
      onLeftBtn,
      onSearch,
      onReset,
      onPageSizeChange,
      onCurrentChange,
      jumper,
    };
  },
});
