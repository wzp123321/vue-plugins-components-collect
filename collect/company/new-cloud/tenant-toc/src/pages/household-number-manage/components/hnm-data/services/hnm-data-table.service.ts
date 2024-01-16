import { reactive, ref } from 'vue';
import { FORBIDDEN_CODES, pageSizesArray } from '@/config/index';
import { FILE_TYPE } from '@/config/enum';

import { formatDateStamp, getTenant } from '@/utils/index';
import message from '@/utils/message';

import hhnEntryService from './hnm-data.service';
import commonService from '@/service/pkg/index';
class MaHeSearchService {
  // 请求参数
  private _pageForm = ref<NHouseholdNumber.SearchForm>({
    accountNumber: '',
    energyCode: '',
    year: new Date(),
    pageSize: 0,
    pageNum: 1,
    orders: [
      {
        column: '',
        asc: true,
      },
    ],
    searchCount: true,
  });
  // 在查询标记
  private _is_searching = ref<boolean>(false);
  // 下载中
  private _is_downloading = ref<boolean>(false);
  // 预览中
  private _is_previewing = ref<boolean>(false);

  // 页面加载loading
  private _loading = ref<boolean>(true);
  public get loading(): boolean {
    return this._loading.value;
  }
  public set loading(value: boolean) {
    this._loading.value = value;
  }

  // 查询是否出错
  private _is_error = ref<boolean>(false);
  public get is_error(): boolean {
    return this._is_error.value;
  }
  public get pageForm(): NHouseholdNumber.SearchForm {
    return this._pageForm.value;
  }

  // 页面数据总数
  private _total = ref<number>(0);
  public get total(): number {
    return this._total.value;
  }

  // 能源类型列表
  private _energyCodeList = ref<NHouseholdNumber.EnergyCodeVO[]>([]);
  public get energyCodeList(): NHouseholdNumber.EnergyCodeVO[] {
    return this._energyCodeList.value;
  }

  // 表格数据
  private _dataSource = reactive<NHouseholdNumber.AccountNumberInfo[]>([]);
  public get dataSource(): NHouseholdNumber.AccountNumberInfo[] {
    return this._dataSource;
  }

  // 分页
  public get pageSizeList() {
    return pageSizesArray;
  }

  // 租户信息
  private _tenant: GeneralModule.TenantVO = { tenantCode: '', tenantId: 0 };
  public get tenant() {
    return this._tenant;
  }

  // 能源类型
  private _searchEnergyCode = ref<NHouseholdNumber.EnergyCodeVO>({ code: '', name: '', unit: '' });
  public get searchEnergyCode(): NHouseholdNumber.EnergyCodeVO {
    return this._searchEnergyCode.value;
  }

  // 年份
  private _searchYear = ref<string>('');
  public get searchYear(): string {
    return this._searchYear.value;
  }

  // 弹窗是否显示
  private _visible = ref<boolean>(false);
  public get visible(): boolean {
    return this._visible.value;
  }
  public set visible(value: boolean) {
    this._visible.value = value;
  }

  // 附件文件列表
  private _fileList = ref<NHouseholdNumber.FileVO[]>([]);
  public get fileList(): NHouseholdNumber.FileVO[] {
    return this._fileList.value;
  }
  public set fileList(value: NHouseholdNumber.FileVO[]) {
    this._fileList.value = value;
  }

  // 图片列表
  private _imageList = ref<string[]>([]);
  public get imageList(): string[] {
    return this._imageList.value;
  }
  public set imageList(value: string[]) {
    this._imageList.value = value;
  }

  // 预览是否打开
  private _previewVisible = ref<boolean>(false);
  public get previewVisible(): boolean {
    return this._previewVisible.value;
  }
  public set previewVisible(value: boolean) {
    this._previewVisible.value = value;
  }

  // 预览初始索引
  private _initialIndex = ref<number>(0);
  public get initialIndex(): number {
    return this._initialIndex.value;
  }
  public set initialIndex(value: number) {
    this._initialIndex.value = value;
  }

  /**
   * 初始参数
   */
  init = async () => {
    this._tenant = getTenant();
    this.pageForm.year = new Date();
    this.pageForm.pageSize = pageSizesArray[0];
    this.pageForm.pageNum = 1;

    await this.queryEnergyCodeList();
    this._pageForm.value.energyCode = '';
    this._searchEnergyCode.value = { code: '', name: '', unit: '' };
    this._searchYear.value = this.pageForm.year.getFullYear();
  };

  /**
   * 查询分类分项
   */
  queryEnergyCodeList = async () => {
    try {
      const res = await hhnEntryService.queryEnergyCodeList(this._tenant);
      if (res && res.code === 200 && res.data) {
        this._energyCodeList.value = res.data ?? [];
      } else {
        this._energyCodeList.value = [];
      }
    } catch (error) {
      this._is_error.value = true;
      this._energyCodeList.value = [];
    }
  };

  /**
   * 页码切换
   * @param value 页码
   */
  onPageChange = (value: number) => {
    this.pageForm.pageNum = value;
    this.query();
  };

  /**
   * pageSize切换
   * @param value 页面大小
   */
  onPageSizeChange = (value: number) => {
    this.pageForm.pageNum = 1;
    this.pageForm.pageSize = value;
    this.query();
  };

  /**
   * 重置
   */
  reset = () => {
    this.pageForm.pageNum = 1;
    this.pageForm.pageSize = pageSizesArray[0];
    this.pageForm.accountNumber = '';
    this.pageForm.year = new Date();
    this.pageForm.energyCode = '';
    this._searchEnergyCode.value = { code: '', name: '', unit: '' };
    this._searchYear.value = this._pageForm.value.year.getFullYear();
    this.query();
  };

  /**
   * 查询
   * @returns
   */
  search = () => {
    if (!this._pageForm.value.year) {
      message.error('请选择年份！');
      return;
    }
    this._energyCodeList.value.forEach((item) => {
      if (item.code === this._pageForm.value.energyCode) {
        this._searchEnergyCode.value = item;
      }
    });
    this.pageForm.pageNum = 1;
    this.pageForm.pageSize = pageSizesArray[0];
    this._searchYear.value = this._pageForm.value.year.getFullYear();
    this.query();
  };

  /**
   * 请求数据
   * @returns
   */
  query = async () => {
    if (this._is_searching.value) {
      return;
    }
    this._is_searching.value = true;
    this._is_error.value = false;
    if (this._energyCodeList.value?.length === 0) {
      this._is_error.value = true;
      this._loading.value = false;
      return;
    }
    const { pageNum, pageSize, accountNumber, year, energyCode, searchCount, orders } = this.pageForm;
    try {
      this._loading.value = true;
      const res = await hhnEntryService.getHouseholdnumberList({
        pageNum,
        pageSize,
        accountNumber,
        year: formatDateStamp(year.getTime(), 'YYYY'),
        energyCode,
        searchCount,
        orders,
        tenantCode: this.tenant.tenantCode,
        tenantId: this.tenant.tenantId,
      });
      if (res && res.code == 200 && res.data && res?.data?.list?.length) {
        this.converter(res.data.list);
        this._total.value = res.data.total;
        this._is_error.value = false;
      } else {
        this._is_error.value = true;
        this._dataSource = [];
        this._total.value = 0;
      }
    } catch (error) {
      this._dataSource = [];
      this._is_error.value = true;
      this._total.value = 0;
    } finally {
      this._loading.value = false;
      this._is_searching.value = false;
    }
  };

  /**
   * 数据转化处理
   * @param data
   */
  converter(data: NHouseholdNumber.AccountNumberInfo[]) {
    this._dataSource = data?.length
      ? data.map((item) => {
          return {
            accountNumber: item.accountNumber ?? '',
            actualPayment: item.actualPayment ?? '',
            actualPrice: item.actualPrice ?? '',
            amount: item.amount ?? '',
            attachmentIds: item.attachmentIds ?? '',
            billEndTime: item.billEndTime ?? '',
            billStartTime: item.billStartTime ?? '',
            id: item.id ?? 0,
            month: item.month ?? '',
            treeName: item.treeName ?? '',
            unit: item.unit ?? '',
            fileVOList: item.fileVOList?.length
              ? item.fileVOList.map((item) => {
                  return {
                    fileName: item.fileName ?? '',
                    fileId: item.fileId ?? 0,
                  };
                })
              : [],
            energyCode: item.energyCode,
            energyName: item.energyName,
            energyUnit: item.energyUnit,
          };
        })
      : [];
  }

  /**
   * 打开附件弹窗
   * @param fileList
   */
  showFilePreview = (fileList: NHouseholdNumber.FileVO[]) => {
    this._fileList.value = fileList;
    this._visible.value = true;
  };

  /**
   * 弹框关闭前
   */
  beforeClose = () => {
    this._visible.value = false;
  };

  /**
   * 获取类型
   * @param name
   * @returns
   */
  useType = (name: string) => {
    let ext = name.split('.').pop();
    ext = ext?.toLocaleLowerCase();
    return ext;
  };

  /**
   * 下载
   * @param id 文件id
   * @returns
   */
  download = async (id: number) => {
    if (this._is_downloading.value) {
      return;
    }
    this._is_downloading.value = true;
    try {
      commonService.getFileStreamDownload<number>(
        id,
        '/tenant/file/downloadFile',
        '下载',
        () => {
          this._is_downloading.value = false;
        },
        () => {
          this._is_downloading.value = false;
        },
      );
    } catch (error: any) {
      if (!FORBIDDEN_CODES?.includes(error?.status)) {
        message.error('文件下载失败！');
      }
    } finally {
      this._is_downloading.value = false;
    }
  };

  /**
   * 预览
   * @param fileId 预览文件id
   * @returns
   */
  preview = async (fileId: number) => {
    if (this._is_previewing.value) {
      return;
    }
    this._is_previewing.value = true;
    try {
      this._imageList.value = [];
      const imgArr = this._fileList.value.filter((item) => {
        return (
          this.useType(item.fileName) === FILE_TYPE.JPEG ||
          this.useType(item.fileName) === FILE_TYPE.PNG ||
          this.useType(item.fileName) === FILE_TYPE.JPG
        );
      });
      this._initialIndex.value = imgArr.findIndex((item) => {
        return item.fileId === fileId;
      });
      const ids = imgArr.map((item) => {
        return item.fileId;
      });
      const urlArr = await hhnEntryService.getBatchUrlByIds(ids);
      if (urlArr?.length) {
        console.log(urlArr);
        this._imageList.value = urlArr;
        this._previewVisible.value = true;
        this._visible.value = false;
      } else {
        message.error('获取文件地址失败！');
        this._imageList.value = [];
      }
    } catch (error) {
      message.error('获取文件地址失败！');
      this._imageList.value = [];
    } finally {
      this._is_previewing.value = false;
    }
  };
}

export default new MaHeSearchService();
