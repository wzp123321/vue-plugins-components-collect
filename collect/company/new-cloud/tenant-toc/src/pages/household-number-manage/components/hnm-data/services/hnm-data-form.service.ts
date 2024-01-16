import { ref, nextTick } from 'vue';
import { FILE_TYPE } from '@/config/enum';
import { FORM_STATUS } from '../constant/index';

import Deffer, { formatDateStamp, getTenant, getImageFileFromUrl } from '@/utils/index';
import message from '@/utils/message';
import { verifyUpload } from '../utils/index';

import { ElForm } from 'element-plus';
import hhnEntryService from './hnm-data.service';

import hhnManageService from '@/pages/household-number-management/services/household-number-management.service';
import { FUploadHandler } from '@/pages/management-analysis/ma-annual-details/services/services.api';

const ACCEPT_EXTENSIONS = {
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xlsm': 'application/vnd.ms-excel.sheet.macroEnabled.12',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const MAXIMUN_SIZE = 10; // 文件大小限制 -MB
const LIMIT = 6;
const MAXIMUN_TOTAL_SIZE = 100; // 总大小

class HnmDataFormService {
  //  表单ref
  public formRef = ref(ElForm);

  constructor() {
    this.init();
  }

  //#region
  private _loading = ref<boolean>(false);
  public get loading(): boolean {
    return this._loading.value;
  }

  /**
   * 新增或编辑弹窗是否显示
   */
  private _visible = ref<boolean>(false);
  public get visible(): boolean {
    return this._visible.value;
  }
  public set visible(value: boolean) {
    this._visible.value = value;
  }

  /**
   * 编辑表单
   */
  private _formModel = ref<NHouseholdNumber.EntryForm>({
    accountNumber: '',
    actualPayment: '',
    amount: '',
    billDate: [],
    date: '',
    fileList: [],
    energyCode: '',
  });
  public get formModel(): NHouseholdNumber.EntryForm {
    return this._formModel.value;
  }

  /**
   * 新增或编辑类型
   */
  private _type = ref<number>(0);
  public get type(): number {
    return this._type.value;
  }
  public set type(value: number) {
    this._type.value = value;
  }

  /**
   * 户号列表
   */
  private _accountnumberList = ref<string[]>([]);
  public get accountNumberList(): string[] {
    return this._accountnumberList.value;
  }

  /**
   * 是否正在提交
   */
  private _is_submitting = ref<boolean>(false);
  public get is_submitting(): boolean {
    return this._is_submitting.value;
  }

  /**
   * 是否正在搜索
   */
  private _is_searching = ref<boolean>(false);
  public get is_searching(): boolean {
    return this._is_searching.value;
  }

  /**
   * 单位
   */
  private _unit = ref<string>('');
  public get unit(): string {
    return this._unit.value;
  }

  /**
   * 能源类型列表
   */
  private _energyCodeList = ref<NHouseholdNumber.EnergyCodeVO[]>([]);
  public get energyCodeList(): NHouseholdNumber.EnergyCodeVO[] {
    return this._energyCodeList.value;
  }
  public set energyCodeList(value: NHouseholdNumber.EnergyCodeVO[]) {
    this._energyCodeList.value = value;
  }

  /**
   * 初始化
   */
  init = () => {
    this._type.value = FORM_STATUS.ADD;
  };

  /**
   * 清除表单状态
   * @param prop
   */
  clearFormValidate = (prop: string) => {
    nextTick(() => {
      this.formRef.value.clearValidate(prop);
    });
  };

  /**
   * 文件change
   * @returns
   */
  // 限制6张图片  总大小不超过100M
  chooseFile = async () => {
    const images = this._formModel.value.fileList.filter((item) => {
      const ext = this.useType(item.name);
      return ext === FILE_TYPE.JPEG || ext === FILE_TYPE.JPG || ext === FILE_TYPE.PNG;
    });
    const file = await FUploadHandler(Object.keys(ACCEPT_EXTENSIONS).join());
    if (
      (this.useType(file.name) === FILE_TYPE.JPEG ||
        this.useType(file.name) === FILE_TYPE.JPG ||
        this.useType(file.name) === FILE_TYPE.PNG) &&
      images?.length >= LIMIT
    ) {
      message.error('图片最多上传6张！');
      return;
    }
    if (!verifyUpload(this._formModel.value.fileList, file, MAXIMUN_SIZE, ACCEPT_EXTENSIONS, MAXIMUN_TOTAL_SIZE)) {
      return false;
    }

    this.clearFormValidate('fileList');
    this._formModel.value.fileList.push(file);
    if (this.formRef.value) {
      this.formRef.value.clearValidate('fileList');
    }
  };

  /**
   * 获取类型
   * @param name 文件名
   * @returns
   */
  useType = (name: string) => {
    let ext = name.split('.').pop();
    ext = ext?.toLocaleLowerCase();
    return ext;
  };

  /**
   * 文件删除
   * @param index 下标
   */
  fileDelete(index: number) {
    this._formModel.value.fileList.splice(index, 1);
  }

  /**
   * 根据后缀名拿到响应icon
   * @param name 后缀名
   * @returns
   */
  mapFileTypeIcon(name: string): string {
    let ext = name.split('.').pop();
    ext = ext?.toLocaleLowerCase();
    switch (ext) {
      case 'xls':
      case 'xlsx':
      case 'xlsm':
        return require('../../../../../assets/images/common/common-file-suffix-excel.svg');
      case 'pdf':
        return require('../../../../../assets/images/common/common-file-suffix-pdf.svg');
      case 'doc':
      case 'docx':
        return require('../../../../../assets/images/common/common-file-suffix-word.svg');
      case 'pptx':
        return require('../../../../../assets/images/common/common-file-suffix-ppt.svg');
      case 'png':
        return require('../../../../../assets/images/common/common-file-suffix-png.svg');
      case 'jpg':
      case 'jpeg':
        return require('../../../../../assets/images/common/common-file-suffix-jpg.svg');
      default:
        return require('../../../../../assets/images/common/common-file-suffix-unknown.svg');
    }
  }

  /**
   * 分类分项change
   */
  onEnergyCodeChange = () => {
    this.clearFormValidate('energyCode');
    this._energyCodeList.value.forEach((item) => {
      if (item.code === this._formModel.value.energyCode) {
        this._unit.value = item.unit;
      }
    });
    this._formModel.value.accountNumber = '';
    this._formModel.value.amount = '';
    this._formModel.value.actualPayment = '';
    this.queryAccountNumberlistByEnergyCode();
    this.queryBillTime();
  };

  /**
   * 查询户号列表
   */
  queryAccountNumberlistByEnergyCode = async () => {
    const params = {
      ...getTenant(),
      energyCode: this._formModel.value.energyCode,
    };
    try {
      const res = await hhnManageService.queryAccountNumberByEnergyCode(params);
      if (res && res.code === 200 && res.success) {
        this._accountnumberList.value = res.data;
      } else {
        this._accountnumberList.value = [];
      }
    } catch (error) {
      this._accountnumberList.value = [];
    }
  };

  /**
   * 日期禁用
   * @param d 日期
   * @returns
   */
  disabledDataDate = (d: Date) => {
    return d.getTime() > new Date().getTime();
  };
  // 查询账期
  queryBillTime = async () => {
    this.clearFormValidate('date');
    if (!this._formModel.value.date || !this._formModel.value.energyCode) {
      return;
    }
    this._is_searching.value = true;
    try {
      const params = {
        ...getTenant(),
        yearMonth: formatDateStamp(this._formModel.value.date.getTime(), 'YYYY-MM'),
        energyCode: this._formModel.value.energyCode,
      };
      const res = await hhnEntryService.getBillTimeByEnergyCode(params);
      if (res && res.code === 200 && res.data) {
        this._formModel.value.billDate =
          res.data.billStartTime && res.data.billEndTime
            ? [new Date(res.data.billStartTime), new Date(res.data.billEndTime)]
            : [];
      } else {
        this._formModel.value.billDate = [];
      }
    } catch (error) {
      this._formModel.value.billDate = [];
    } finally {
      this._is_searching.value = false;
    }
  };

  /**
   * 表单展开
   */
  show = async () => {
    this._visible.value = true;
    if (this._formModel.value.energyCode) {
      await this.queryAccountNumberlistByEnergyCode();
    }
    nextTick(() => {
      this.formRef.value.clearValidate('date');
    });
  };

  /**
   * 新增时重置表单
   */
  resetFormInAdd = () => {
    this._type.value = FORM_STATUS.ADD;
    this._unit.value = this._energyCodeList.value?.length ? this._energyCodeList.value[0].unit : '';
    this._formModel.value = {
      accountNumber: '',
      actualPayment: '',
      amount: '',
      billDate: [],
      date: '',
      fileList: [],
      energyCode: this._energyCodeList.value?.length ? this._energyCodeList.value[0].code : '',
    };
  };

  /**
   * 编辑时重置
   * @param year
   * @param value
   */
  resetFormInEditor = async (year: string, value: NHouseholdNumber.AccountNumberInfo) => {
    this._type.value = FORM_STATUS.EDITOR;
    this._unit.value = value.energyUnit ?? '';
    const { accountNumber, actualPayment, month, amount, billEndTime, billStartTime, id, fileVOList } = value;
    const d = new Date();
    d.setFullYear(Number(year));
    d.setMonth(Number(month) - 1);
    this._formModel.value = {
      id,
      accountNumber,
      actualPayment,
      amount,
      fileList: [],
      billDate: billEndTime && billStartTime ? [new Date(billStartTime), new Date(billEndTime)] : [],
      date: d,
      energyCode: value.energyCode ?? '',
    };
    if (fileVOList?.length) {
      const ids = fileVOList.map((item) => {
        return item.fileId;
      });
      const urlArr = await hhnEntryService.getBatchUrlByIds(ids);
      if (urlArr?.length) {
        urlArr.forEach(async (item, index) => {
          const file = await getImageFileFromUrl(item, fileVOList[index].fileName);
          this._formModel.value.fileList.push(file as File);
        });
      }
    }
  };

  /**
   * 表单重置
   * @param value
   */
  reset = (value: NHouseholdNumber.AccountNumberInfo) => {
    this._formModel = {
      ...this._formModel,
      ...value,
    };
  };

  /**
   * 关闭弹窗
   */
  close = () => {
    if (this.formRef.value) {
      this.formRef.value.resetFields();
    }
    this._visible.value = false;
  };

  /**
   * 提交表单数据
   * @returns
   */
  submit = (): Promise<boolean> => {
    const deffer = new Deffer();
    if (!this._is_submitting.value) {
      this._is_submitting.value = true;
      this.formRef.value.validate(async (valid: boolean) => {
        if (valid) {
          try {
            const { energyCode, accountNumber, actualPayment, billDate, amount, fileList, date, id } =
              this._formModel.value;
            const tenant = getTenant();
            const formData = new FormData();
            let params: any = {
              energyCode,
              accountNumber,
              actualPayment,
              amount,
              yearMonth: formatDateStamp(date.getTime(), 'YYYY-MM'),
              billEndTime: formatDateStamp(billDate[1].getTime(), 'YYYY-MM-DD'),
              billStartTime: formatDateStamp(billDate[0].getTime(), 'YYYY-MM-DD'),
              ...tenant,
            };
            fileList.forEach((file) => {
              formData.append('file', file);
            });
            if (this._type.value === FORM_STATUS.EDITOR) {
              params = {
                ...params,
                id: Number(id),
              };
            }
            if (Object.keys(params)?.length) {
              Object.keys(params).forEach((item: string) => {
                formData.append(item, params[item]);
              });
            }
            const res =
              this._type.value === FORM_STATUS.ADD
                ? await hhnEntryService.getHouseholdNumberCreate(formData)
                : await hhnEntryService.getHouseholdNumberEditor(formData);
            if (res && res.code === 200 && res.success) {
              message.success(this._type.value === FORM_STATUS.ADD ? '新增成功！' : '编辑成功！');
              deffer.resolve(true);
            } else {
              message.error(res.message);
              deffer.resolve(false);
            }
          } catch (error) {
            console.warn('失败===================', this._type.value, error);
            message.error(this._type.value === FORM_STATUS.ADD ? '新增失败！' : '编辑失败！');
            deffer.resolve(false);
          } finally {
            this._is_submitting.value = false;
          }
        } else {
          this._is_submitting.value = false;
        }
      });
    }
    return deffer.promise;
  };
}

export default new HnmDataFormService();
