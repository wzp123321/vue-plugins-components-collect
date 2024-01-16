import { defineComponent, ref } from 'vue';
// utils
import dayjs, { Dayjs } from 'dayjs';
// services
import reportGeneration from './services/report-generation.service';
// component
import Report from './components/rg-report/rg-report.vue';
import RgStateMent from '@/views/pages/report-generation/components/rg-statement/rg-statement.vue';

interface ReportItemType {
  createTime: string;
  name: string;
  updateTime: string;
  followFlag: string;
  id: number;
}

interface DownloadDialogType {
  format: string;
  date: Dayjs;
  analysisObject: number[];
  radioValue: number;
}

export default defineComponent({
  name: 'reportGeneration',
  components: {
    Report,
    RgStateMent,
  },
  setup() {
    const activeName = ref('reportForm');
    const reportRef = ref<any>();
    const reportItemList = ref<ReportItemType[]>([]);

    const reportLoading = ref<boolean>(true);
    // 下载弹框表单
    const pageForm = ref<DownloadDialogType>({
      format: 'word',
      date: dayjs(new Date(new Date().getTime() - 3600 * 1000 * 24 * 30)),
      analysisObject: [],
      radioValue: 1,
    });

    //  已关注点击事件
    const isFollow = ref<boolean>(false);
    const onFollow = () => {
      isFollow.value = true;
      activeName.value = 'report';
      const re_follow_dom = <HTMLImageElement>document.querySelector('.re-follow');
      re_follow_dom.className = 're-follow re-follow-click';
      // 筛选已关注
      const reportFollowList: ReportItemType[] = [];
      reportItemList.value.filter(item => {
        if (item.followFlag === '1') {
          reportFollowList.push(item);
        }
      });
      reportItemList.value = reportFollowList;
      console.log(reportRef.value);
      if (reportRef.value) {
        reportRef.value.getFile();
      }
    };

    //  tabs点击事件
    const handleClick = (val: any) => {
      isFollow.value = false;
      if (val.props.name === 'reportForm') {
        // 调获取报表接口
        //  getReportData(1);
      } else if (val.props.name === 'report') {
        // 调获取报告接口
        getReportData(1);
      }

      const re_follow_dom = <HTMLImageElement>document.querySelector('.re-follow');
      if (re_follow_dom) {
        re_follow_dom.className = 're-follow';
      }
    };

    // 获取报告数据
    const getReportData = async (param: number) => {
      try {
        reportLoading.value = true;
        const res = await reportGeneration.getReportDataUrl(param);
        if (res.code == 200 && res.success) {
          if (res.data && res.data.length > 0) {
            reportItemList.value = res.data?.[0].reportList || [];
          } else {
            reportItemList.value = [];
          }
        } else {
          reportItemList.value = [];
        }
      } catch (error) {
        reportItemList.value = [];
      } finally {
        reportLoading.value = false;
      }
    };

    // 修改报告关注状态成功
    const updateFollowStatusOk = async () => {
      try {
        const res = await reportGeneration.getReportDataUrl(1);
        if (res.code == 200 && res.success) {
          if (res.data && res.data.length > 0) {
            reportItemList.value = res.data[0].reportList || [];
          } else {
            reportItemList.value = [];
          }
        } else {
          reportItemList.value = [];
        }
      } catch (error) {
        reportItemList.value = [];
      }
    };

    return {
      activeName,
      reportItemList,
      pageForm,
      reportLoading,
      reportRef,
      isFollow,
      onFollow,
      handleClick,
      updateFollowStatusOk,
    };
  },
});
