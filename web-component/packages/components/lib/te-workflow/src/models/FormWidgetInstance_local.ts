import FormWidgetInstance from '../../../models/FormWidgetInstance';
import { FormComponentTypeEnum } from '../../../models/FormComponentTypeEnum';
import WorkflowApi from '../apis/WorkflowApi';
import { Axios } from 'axios';
import type { Ref } from 'vue';
import DepartmentQd from '../../../models/DepartmentQd';
import EmployeeQd from '../../../models/EmployeeQd';
import { type UploadUserFile } from '@tiansu/element-plus';
export default class FormWidgetInstance_local extends FormWidgetInstance {
  axios: Axios | null = null;
  tenantId: string = '';
  // 控件类型
  //标题,将FormWidgetInstance具体控件对象中的label，placeholder，span字段转移到FormWidgetInstance这一层，方便功能上使用
  label: string = '';
  // // 默认提示
  // placeholder: string = '';
  //布局设置，仅对pc端生效，一行分成24列，span为几表示占几列：24-整行、12-1/2行，默认为24
  span: number = 24;

  valueConver: number | string | string[] | number[] | Date | Date[] | null = null;
  // 日期范围的时长
  valueConverTime: number | null = null;
  //选中的员工/部门
  selectedSubjects: { id: string; name: string }[] = [];
  //文件列表
  fileList: UploadUserFile[] | string[] = [];
  constructor(axios: Axios, tenantId: string) {
    super();
    this.axios = axios;
    this.tenantId = tenantId;
  }
  /**
   * FormWidgetInstance对象转成对应的local对象
   * @param vo FormWidgetInstance对象
   */
  convert(vo: FormWidgetInstance) {
    Object.assign(this, vo);
    this.doDefaultValue();
    let component = this.getComponent(vo);
    if (component) {
      this.label = component.label || '';
      this.span = component.span || 24;
    }
    if (this.componentType === FormComponentTypeEnum.DATE_TIME) {
      // this.value = '1717603200000';
      this.valueConver = this.value ? Number(this.value) : null;
    } else if (this.componentType === FormComponentTypeEnum.DATE_TIME_RANGE) {
      // 日期时间范围，value为字符串，格式为：开始日期,结束日期,时长
      // this.value = '1717603200000,1718294400000,8';
      this.valueConver = [];
      if (this.value) {
        let arr = this.value.split(',');
        this.valueConver = [Number(arr[0]), Number(arr[1])];
        this.valueConverTime = Number(arr[2]);
      }
    } else if (this.componentType === FormComponentTypeEnum.MULTI_SELECT) {
      // this.value = '1,2';
      this.valueConver = this.value ? this.value.split(',') : [];
    } else if (this.componentType === FormComponentTypeEnum.EMPLOYEE) {
      // this.value =
      //   '962024951379248,960714887681328,959268475036992,958249559885121,958249559885120,958163186963776,957445963904320,957428652000560,954659551032640,952933078177088,952932942107952,952932672329024,952848313357632,952847916279104,952847853417792,952481805808944,952478678390064,952477399508288,952477218944320,952197744563520,952131127670080,951863327954240,951155567859009,951155567859008,950378410139728,950377103611200,950351950624048,950080616244544,949791036929344,949790452872496,949746990540080,949669882164544,949668645152064,949667805488432,949667579901232,949664663532848,949663393613120,949387655382320,949369817232704,949369108813104,949363330471232,949362311497008,949358028064048,949302418339136,949293407294784,949282470425904,947252014650672,947250488804672,947247016928576,947238569940288,947237143164208,947193712944432,946908428641600,946897154696512,946525749581120,946522964608304,946481481229632,945468386178370,945468386178369,945468386178368,945416826668352,945111724123440,945040045884720,944768093590832,944699418015024,943007478506816,942926160397632,942924600698176,942365464065344,942305220982080,942304160552256,942297903392048,942207698212144,942015183144240,942015127950640,942013242905904,941932616320320,941932565120304,941932474467632,941930241049904,941929757091120,940916764648768,940903138030912,940873864860992,940862217528624,940860638336320,940824543053120,940569175692608,939860409529648,939860279969072,939759773816112,939733313652016,939730870113584,939729223226688,939721927578944,939525218424128,939475081737520,939397312832816,937656072979760,937611923510592';
      if (this.value) {
        //初始化查询员工的基本信息
        this.initEmployeeInfo(this.value.split(','));
      }
    } else if (this.componentType === FormComponentTypeEnum.DEPARTMENT) {
      // this.value = '941932767405376,949716551025984,950818619307328,952228087735600,95465910291795256';
      if (this.value) {
        //初始化查询部门的基本信息
        this.initDeptInfo(this.value.split(','));
      }
    } else if (
      this.componentType === FormComponentTypeEnum.FILE ||
      this.componentType === FormComponentTypeEnum.VIDEO ||
      this.componentType === FormComponentTypeEnum.IMAGE
    ) {
      // this.value = JSON.stringify([
      //   {
      //     name: '&amp;1.jpg',
      //     url: '/io/hlms-private/upload/700/taskCenter/202406/&amp;1.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=tiansu%2F20240607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240607T073902Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=30c841567bdce1649974688f558c4cc7c401f4f98c23c0ecb539dcfcea0c43b8',
      //   },
      // ]);
      if (this.value) {
        this.fileList = JSON.parse(this.value);
      }
    } else if (this.componentType === FormComponentTypeEnum.SELECT) {
      // this.value = '1';
    } else {
      this.valueConver = this.value || '';
    }
  }
  convertAsync() {}
  /**
   * 批量转
   * @param vo FormWidgetInstance对象
   */
  static convertOfList(
    formWidgetInstanceList: Ref<FormWidgetInstance_local[]>,
    vos: FormWidgetInstance[],
    axios: any,
    tenantId: string
  ) {
    if (vos) {
      vos.forEach((vo) => {
        let item = new FormWidgetInstance_local(axios, tenantId);
        formWidgetInstanceList.value.push(item);
        formWidgetInstanceList.value[formWidgetInstanceList.value.length - 1].convert(vo);
      });
    }
  }
  /**
   * 处理默认值
   */
  doDefaultValue() {
    // 处理默认值
    switch (this.componentType) {
      case FormComponentTypeEnum.INPUT:
        this.value = this.value || this.input?.defaultValue || '';
        break;
      case FormComponentTypeEnum.TEXT_AREA:
        this.value = this.value || this.textarea?.defaultValue || '';
        break;
      case FormComponentTypeEnum.NUMBER:
        this.value = this.value || this.number?.defaultValue || '';
        break;
      case FormComponentTypeEnum.SELECT:
        this.value = this.value || this.select?.defaultOption?.value || '';
        break;
      default:
        this.value = this.value || '';
        break;
    }
  }
  /**
   * 通过控件类型获取数据存储对象
   * @param formWidgetInstance 表单的控件项
   */
  getComponent(formWidgetInstance: FormWidgetInstance) {
    switch (formWidgetInstance.componentType) {
      case FormComponentTypeEnum.INPUT:
        return formWidgetInstance.input;
      case FormComponentTypeEnum.TEXT_AREA:
        return { ...formWidgetInstance.textarea, span: 24 };
      case FormComponentTypeEnum.NUMBER:
        return formWidgetInstance.number;
      case FormComponentTypeEnum.SELECT:
        return formWidgetInstance.select;
      case FormComponentTypeEnum.MULTI_SELECT:
        return formWidgetInstance.multiSelect;
      case FormComponentTypeEnum.DATE_TIME:
        return formWidgetInstance.dateTime;
      case FormComponentTypeEnum.DATE_TIME_RANGE:
        return { ...formWidgetInstance.dateTimeRange, span: 24 };
      case FormComponentTypeEnum.IMAGE:
        return { ...formWidgetInstance.image, span: 24 };
      case FormComponentTypeEnum.FILE:
        return { ...formWidgetInstance.file, span: 24 };
      case FormComponentTypeEnum.VIDEO:
        return { ...formWidgetInstance.video, span: 24 };
      case FormComponentTypeEnum.EMPLOYEE:
        return formWidgetInstance.employee;
      case FormComponentTypeEnum.DEPARTMENT:
        return formWidgetInstance.department;
      default:
        return null;
    }
  }
  /**
   * 初始化选中的部门信息
   */
  async initDeptInfo(ids: string[]) {
    if (ids && ids.length > 0) {
      let total = 0;
      let param = new DepartmentQd();
      param.page = { pageNum: 1, pageSize: 100 };
      param.fetchParts = ['name'];
      this.selectedSubjects = [];
      //过滤掉未查询到的数据
      let filterIds: string[] = [];
      while (ids.length > total) {
        param.idIn = ids.slice(total, total + 100); //先查前100个
        await WorkflowApi.queryDepartmentForPage(this.axios, this.tenantId, param).then((data) => {
          if (data.errcode === '0') {
            if (data.data?.records && data.data.records.length > 0) {
              let filterId = param.idIn?.filter((id) => {
                return (data.data?.records || []).some((item) => {
                  if (item.id === id) {
                    this.selectedSubjects.push({ id: item.id || '', name: item.name || '' });
                    return true;
                  } else {
                    return false;
                  }
                });
              });
              filterIds.push(...(filterId || []));
            }
            total += param.idIn!.length;
          }
        });
      }
      this.value = filterIds.join(',');
    }
  }
  /**
   * 初始化选中的人员信息
   */
  async initEmployeeInfo(ids: string[]) {
    if (ids && ids.length > 0) {
      let total = 0;
      let param = new EmployeeQd();
      param.page = { pageNum: 1, pageSize: 100 };
      this.selectedSubjects = [];
      //过滤掉未查询到的数据
      let filterIds: string[] = [];
      while (ids.length > total) {
        param.idIn = ids.slice(total, total + 100); //先查前100个
        await WorkflowApi.queryEmployeeForPage(this.axios, this.tenantId, param).then((data) => {
          if (data.errcode === '0') {
            if (data.data?.records && data.data.records.length > 0) {
              let filterId = param.idIn?.filter((id) => {
                return (data.data?.records || []).some((item) => {
                  if (item.id === id) {
                    this.selectedSubjects.push({ id: item.id || '', name: item.name || '' });
                    return true;
                  } else {
                    return false;
                  }
                });
              });
              filterIds.push(...(filterId || []));
            }
            total += param.idIn!.length;
          }
        });
      }
      this.value = filterIds.join(',');
    }
  }
}
