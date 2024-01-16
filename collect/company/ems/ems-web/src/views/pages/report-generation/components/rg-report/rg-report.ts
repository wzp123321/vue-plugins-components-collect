import { defineComponent, reactive, ref, onMounted, nextTick, watch } from 'vue';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { formatDate } from '@/utils/index';
import { FGetAuthorization, FGetStorageData } from '@/utils/token';
import { useCommonController } from '@/utils/use-common-controller';
import { disabledProps, FGetElTreeDefaultProps } from '@/utils/token';
import message from '@/utils/message';
import { subMonths } from 'date-fns';
// services
import CommonService from '@/services/common/common.service';

import reportGeneration from '../../services/report-generation.service';
import axios from 'axios';
import serviceConfig from '@/config/request';
import url from '@/api/api-url';
import RgCard from '../rg-card/rg-card.vue';

// import GatewayUtil from '@/utils/access-token/GatewayUtil';
// import { APP_ID } from '@/utils/access-token/api';

interface FormInlineType {
  analysisObject: number[];
  date: Date;
  radioValue: number;
}
interface downloadDialogType {
  format: string;
  date: Date;
  analysisObject: number[];
  radioValue: number;
  expandedKeys: number[];
  analysisObjectList: AlarmModule.CommonObject[];
}

export default defineComponent({
  name: 'ReReport',
  components: {
    RgCard,
  },
  props: ['reportItemList', 'tabName'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const { getTreeListWithExpandKeys } = useCommonController();
    const translateX = ref<number>(0);
    const itemIndex = ref<number>(0);
    let isLeftBtnShow = false;
    const reportBoxWidth = ref<number>(0); // 导航盒子宽度

    let multiple = 0;
    const formInline = reactive<FormInlineType>({
      analysisObject: [],
      date: new Date(new Date().getTime() - 3600 * 1000 * 24 * 30),
      radioValue: 1,
    });
    const analysisObjectList = ref<AlarmModule.CommonObject[]>([]); // 对象
    const treeIdExpanedKeys = ref<number[]>([]);

    const radioData = proxy.$emsConfig.treeTypeList;
    const analysisObjectExpanedKeys = ref<number[]>([1, 2]);
    const pageUrl = ref<string>('');
    const sectionHieght = ref<number>(0);
    const loading = ref<boolean>(false);
    const dialogFormVisible = ref<boolean>(false);
    const reportDownLoadLoading = ref(false);
    const noDataTitle = ref<string>('点击生成后可预览');

    const pageTreeLoading = ref<boolean>(false); // 页面加载树loading
    const dialogTreeLoading = ref<boolean>(false); // 弹框加载树loading
    let objItem: any = {}; // 接收Report组件下载按钮传来的 item

    let isRefresh = false;
    // 下载弹框表单
    const pageForm = ref<downloadDialogType>({
      format: 'word',
      date: new Date(new Date().getTime() - 3600 * 1000 * 24 * 30),
      analysisObject: [],
      expandedKeys: [],
      radioValue: 1,
      analysisObjectList: [],
    });
    // 当前选中的卡片id
    const selectedCardId = ref<number>(-1);

    // 导航框鼠标移入事件
    const onMouseOver = () => {
      if (multiple > 0) {
        const right_button_dom = document.querySelector('.right-button') as HTMLImageElement;
        right_button_dom.className = 're-report-box-button right-button';
      }
      if (itemIndex.value >= 1) {
        const left_button_dom = document.querySelector('.left-button') as HTMLImageElement;
        left_button_dom.className = 're-report-box-button left-button';
        isLeftBtnShow = true;
      }
      // 隐藏右侧按钮
      if (itemIndex.value > multiple) {
        const right_button_dom = document.querySelector('.right-button') as HTMLImageElement;
        right_button_dom.className = 're-report-box-button right-button buttonHide';
      }
    };
    // 导航框鼠标移出事件
    const onMouseOut = () => {
      if (multiple > 0) {
        const right_button_dom = document.querySelector('.right-button') as HTMLImageElement;
        right_button_dom.className = 're-report-box-button right-button buttonHide';
      }
      if (isLeftBtnShow) {
        const left_button_dom = document.querySelector('.left-button') as HTMLImageElement;
        left_button_dom.className = 're-report-box-button left-button buttonHide';
        isLeftBtnShow = false;
      }
    };
    // 左侧导航按钮点击事件
    const onLeftBtn = () => {
      if (itemIndex.value === 0) {
        translateX.value = 0;
      } else {
        itemIndex.value--;
        translateX.value = -itemIndex.value * 276;
      }
      //   隐藏左侧按钮
      if (itemIndex.value === 0) {
        const left_button_dom = document.querySelector('.left-button') as HTMLImageElement;
        left_button_dom.className = 're-report-box-button left-button buttonHide';
        isLeftBtnShow = false;
      }
    };

    // 右侧导航按钮点击事件
    const onRightBtn = () => {
      itemIndex.value++;
      translateX.value = -itemIndex.value * 276;
      // 左侧按钮显示
      if (itemIndex.value >= 1) {
        const left_button_dom = <HTMLImageElement>document.querySelector('.left-button');
        left_button_dom.className = 're-report-box-button left-button';
        isLeftBtnShow = true;
      }
      // 隐藏右侧按钮
      if (itemIndex.value > multiple) {
        const right_button_dom = <HTMLImageElement>document.querySelector('.right-button');
        right_button_dom.className = 're-report-box-button right-button buttonHide';
      }
    };
    // 监听浏览器窗口大小事件, 可实时拿到导航盒子宽度, 跟内置预览高度
    window.onresize = () => {
      if (props.reportItemList.length > 0) {
        // 导航盒子
        const report_box_dom = <HTMLImageElement>document.querySelector('.re-report-box');
        reportBoxWidth.value = report_box_dom.offsetWidth;
        //  倍数
        multiple = (props.reportItemList.length * 276 - reportBoxWidth.value) / 276;

        // 设置内置预览高度
        const divHeight = document.body.clientHeight as number;
        const tabs__header_dom = document.querySelector('.el-tabs__header') as HTMLImageElement;
        const form_inline_dom = document.querySelector('.form-inline') as HTMLImageElement;
        if (form_inline_dom) {
          sectionHieght.value =
            divHeight -
            tabs__header_dom.offsetHeight -
            report_box_dom.offsetHeight -
            form_inline_dom.offsetHeight -
            115;
        }
      }
    };
    // 卡片点击
    const itemClick = (id: number) => {
      selectedCardId.value = id;
    };

    // 下载按钮点击事件
    const downloadReport = (item: any) => {
      dialogFormVisible.value = true;
      clickDownload(item, formInline.analysisObject[0]);
    };
    // 获取对象
    const getPageTreeList = async () => {
      try {
        analysisObjectList.value = [];
        formInline.analysisObject = [];
        pageTreeLoading.value = true;
        const res = await getTreeListWithExpandKeys(formInline.radioValue, '00000', 2, false, 3);
        if (res?.data?.length) {
          analysisObjectList.value = res?.data ?? [];
          formInline.analysisObject = analysisObjectList.value?.length
            ? !analysisObjectList.value[0]?.lockFlag
              ? [analysisObjectList.value[0].id]
              : analysisObjectList.value[0]?.childTree?.length
              ? [analysisObjectList.value[0]?.childTree[0].id]
              : []
            : [];
          treeIdExpanedKeys.value = res?.expandTreeIds;
        } else {
          analysisObjectList.value = [];
          formInline.analysisObject = [];
          treeIdExpanedKeys.value = [];
        }
      } catch (error) {
        analysisObjectList.value = [];
        formInline.analysisObject = [];
        treeIdExpanedKeys.value = [];
      } finally {
        pageTreeLoading.value = false;
      }
    };
    /**
     * 区域、业态切换事件
     */
    const treeRaidoChange = () => {
      getPageTreeList();
    };
    // 弹框切换树类型
    const handleDialogTreeTypeChange = async () => {
      try {
        pageForm.value.analysisObjectList = [];
        pageForm.value.analysisObject = [];
        dialogTreeLoading.value = true;
        const res = await getTreeListWithExpandKeys(pageForm.value.radioValue, '00000', 2, false, 3);
        if (res?.data?.length) {
          pageForm.value.analysisObjectList = res?.data ?? [];
          pageForm.value.analysisObject = analysisObjectList.value?.length
            ? !analysisObjectList.value[0]?.lockFlag
              ? [analysisObjectList.value[0].id]
              : analysisObjectList.value[0]?.childTree?.length
              ? [analysisObjectList.value[0]?.childTree[0].id]
              : []
            : [];
          pageForm.value.expandedKeys = res?.expandTreeIds;
        } else {
          pageForm.value.analysisObjectList = [];
          pageForm.value.analysisObject = [];
          pageForm.value.expandedKeys = [];
        }
      } catch (error) {
        pageForm.value.analysisObjectList = [];
        pageForm.value.analysisObject = [];
        pageForm.value.expandedKeys = [];
      } finally {
        dialogTreeLoading.value = false;
      }
    };
    //  生成按钮事件
    const onSearch = () => {
      const params = {
        dataTime: formatDate(formInline.date, 'yyyy-MM'),
        fileType: 'pdf',
        reportType: '1',
        templateId: selectedCardId.value,
        treeId: formInline.analysisObject[0],
      };
      isFile(1, params);
    };
    /**
     * 更新
     */
    const onRefresh = async () => {
      if (!formInline.date) {
        message.error('请选择时间');
        return;
      }
      if (isRefresh) {
        return;
      }
      isRefresh = true;
      try {
        const date = formatDate(formInline.date, 'yyyy-MM');
        const res = await reportGeneration.refreshReport({ date });
        if (res?.code === 200) {
          message.success('正在更新报告，请稍后重新预览...');
        } else {
          if (res?.code !== 401 && !String((res as any)?.code)?.includes('4f0')) {
            message.error(res?.message || '更新失败');
          }
        }
      } catch (error) {
        message.error('更新失败');
      } finally {
        isRefresh = false;
      }
    };
    /**
     * 获取文件流前先判断是否有文件
     * @param type 用于判断是预览还是下载 1为预览文件， 2为下载文件
     */
    const isFile = async (type: number, obj: reportGenerationHttp.isFileParams) => {
      try {
        const res = await reportGeneration.isFile(obj);
        if (res && res.code == 200 && res.success) {
          if (type === 1) {
            getFile();
          } else {
            downloadAsync(obj, url.reportGeneration.downloadReport);
            dialogFormVisible.value = false;
          }
        } else if (res && res.code == 500 && !res.success) {
          if (type === 1) {
            noDataTitle.value = res.message;
            pageUrl.value = '';
            message.error(res?.message);
          }
          loading.value = false;
          if (type === 2) {
            return message.error(res.message?.includes('文件暂未生成') ? '文件未生成，无法下载！' : res?.message);
          }
        } else {
          if (type === 1) {
            noDataTitle.value = '文件未生成，无法预览！';
            pageUrl.value = '';
          }
          loading.value = false;
          if (type === 2) {
            return message.error(res.message?.includes('文件暂未生成') ? '文件未生成，无法下载！' : res?.message);
          }
        }
      } catch (error) {}
    };
    // 获取文件流
    const getFile = async () => {
      try {
        loading.value = true;
        if (!formInline.date || !formInline.analysisObject || formInline.analysisObject.length === 0) {
          console.log(!formInline.date, !formInline.analysisObject, formInline.analysisObject.length === 0);
          loading.value = false;
          return message.error('日期或对象不得为空');
        }
        const params = {
          dataTime: formatDate(formInline.date, 'yyyy-MM'),
          fileType: 'pdf',
          reportType: '1',
          templateId: selectedCardId.value,
          treeId: formInline.analysisObject[0],
        };
        const res: any = await axios({
          url: `${serviceConfig.BASE_URL}${url.reportGeneration.downloadReport}`,
          method: 'post',
          data: params,
          headers: {
            'content-type': 'application/json',
            tenantCode: FGetStorageData('energy-corpid') ?? '',
            token: FGetStorageData('energy-token') ?? '',
            loginName: FGetStorageData('energy-loginName') ?? '',
            Authorization: FGetAuthorization(),
            // access_token: GatewayUtil.buildClientAccessToken() || '',
            // app_id: APP_ID,
          },
          responseType: 'blob',
        });
        if (res && res.status === 200 && res?.data?.type !== 'application/json') {
          // 将文件流转为blob地址预览pdf文件
          const blob = new Blob([res.data], {
            type: 'application/pdf;chartset=UTF-8',
          });
          // 创建url
          pageUrl.value = window.URL.createObjectURL(blob);
          loading.value = false;
        } else if (res.data.type === 'application/json') {
          loading.value = false;
          message.error('文件未生成，无法预览！');
        }
      } catch (error) {
        loading.value = false;
        if ((error as any).response?.data?.errcode === '4f000002') {
          window.parent.postMessage((error as any).response?.data?.errcode, window.location.origin);
        }
      }
    };
    /**
     * 处理日期禁用回调
     */
    const onDisableDateCb = (date: Date) => {
      return date && date.valueOf() > new Date().getTime();
    };

    // 导出弹框关闭事件
    const onClose = () => {
      dialogFormVisible.value = false;
      pageForm.value.analysisObject =
        analysisObjectList.value && analysisObjectList.value.length > 0 ? [analysisObjectList.value[0].id] : [];
      pageForm.value.date = new Date(new Date().getTime() - 3600 * 1000 * 24 * 30);
      pageForm.value.format = 'word';
      pageForm.value.radioValue = 1;
    };
    // 下载
    const clickDownload = (item: any, analysisObject: any) => {
      pageForm.value.date = new Date(new Date().getTime() - 3600 * 1000 * 24 * 30);
      pageForm.value.format = 'word';
      pageForm.value.radioValue = 1;
      dialogFormVisible.value = true;
      nextTick(() => {
        pageForm.value.analysisObject =
          analysisObjectList.value && analysisObjectList.value.length > 0 ? [analysisObjectList.value[0].id] : [];
        analysisObjectExpanedKeys.value = [1, 2];
      });
      objItem = item;

      pageForm.value.radioValue = radioData[0].value;
      handleDialogTreeTypeChange();
    };
    // 导出弹框确定事件
    const onHideDaySubmit = () => {
      if (pageForm.value.date === null) {
        return message.error('日期不得为空');
      }
      const obj = {
        dataTime: formatDate(pageForm.value.date, 'yyyy-MM'),
        fileType: pageForm.value.format,
        reportType: '1',
        templateId: objItem.id,
        treeId: pageForm.value.analysisObject[0],
      };
      isFile(2, obj);
    };

    // 导出方法
    const downloadAsync = async (params: any, url: string) => {
      if (reportDownLoadLoading.value) {
        return;
      }
      reportDownLoadLoading.value = true;
      await CommonService.getFileStreamDownload(
        params,
        url,
        '下载',
        () => {
          reportDownLoadLoading.value = false;
        },
        () => {
          reportDownLoadLoading.value = false;
        },
      );
    };

    onMounted(async () => {
      await getPageTreeList();
      if (props.reportItemList.length > 0) {
        selectedCardId.value = props?.reportItemList?.[0]?.id;
        loading.value = true;

        nextTick(() => {
          formInline.date = subMonths(new Date(), 1);

          const params = {
            dataTime: formatDate(formInline.date, 'yyyy-MM'),
            fileType: 'pdf',
            reportType: '1',
            templateId: selectedCardId.value,
            treeId: formInline.analysisObject[0],
          };
          isFile(1, params);
        });

        // 导航盒子
        const report_box_dom = <HTMLImageElement>document.querySelector('.re-report-box');
        reportBoxWidth.value = report_box_dom.offsetWidth;
        nextTick(() => {
          //  倍数
          multiple = (props.reportItemList.length * 276 - reportBoxWidth.value) / 276;
        });

        // 设置内置预览高度
        const divHeight = document.body.clientHeight as number;
        const tabs__header_dom = document.querySelector('.el-tabs__header') as HTMLImageElement;
        const form_inline_dom = document.querySelector('.form-inline') as HTMLImageElement;
        if (form_inline_dom) {
          sectionHieght.value =
            divHeight -
            tabs__header_dom.offsetHeight -
            report_box_dom.offsetHeight -
            form_inline_dom.offsetHeight -
            115;
        }
      }
    });

    return {
      translateX,
      itemIndex,
      reportBoxWidth,
      formInline,
      analysisObjectList,
      analysisObjectExpanedKeys,
      pageUrl,
      sectionHieght,
      radioData,
      loading,
      dialogFormVisible,
      pageForm,
      noDataTitle,
      treeIdExpanedKeys,
      disabledProps,
      pageTreeLoading,
      dialogTreeLoading,
      selectedCardId,

      FGetElTreeDefaultProps,
      onMouseOver,
      onMouseOut,
      onRightBtn,
      onLeftBtn,
      onDisableDateCb,
      onSearch,
      onRefresh,
      downloadReport,
      treeRaidoChange,
      itemClick,
      onClose,
      clickDownload,
      onHideDaySubmit,
      getFile,
      handleDialogTreeTypeChange,
    };
  },
});
