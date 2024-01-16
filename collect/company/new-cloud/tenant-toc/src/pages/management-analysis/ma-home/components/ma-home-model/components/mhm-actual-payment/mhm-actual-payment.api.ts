export interface MHM_ActualType {
  queryStart: number;
  queryEnd: number;
}

export interface MHM_ActualParamType {
  tenantCode: string;
  tenantId: number;
  queryStart: number;
  queryEnd: number;
}

export interface MHM_ActualPaymentType {
  code: number;
  message: string;
  data: MHM_ActualPaymentDataType;
}

export interface MHM_ActualPaymentDataType {
  energyNameColourList: NamecolorList[];
  allEnergyActualPaymentList: MHM_AllActualPaymentDataType[];
  histogramEnergyActualPayments: string | null[][];
  yearMonthList: string[];
}

export interface MHM_AllActualPaymentDataType {
  energyName: string;
  oneEnergyActualPaymentList: MHM_OneActualPaymentDataType[];
}

export interface MHM_OneActualPaymentDataType {
  actualPayment: string;
  attachmentIds: string;
  date: string;
  fileVOList: MHM_FileVOListType[];
  pictureVOList: MHM_FileVOListType[];
}

export interface MHM_FileVOListType {
  fileId: number;
  fileName: string;
  fileType: string;
  fileUrl?: string;
}

export interface MHM_ActualPaymentListType {
  allEnergyActualPaymentList: MHM_AllActualPaymentDataType[];
  chartsData: MHM_HRAType[];
  lineChartsData: MHM_HRAType[];
  XaxisList: string[];
  legendList: NamecolorList[];
}

export interface MHM_HRAType {
  year: string;
  name: string;
  value: number | null;
  rate: number | null;
  color: string;
  energyCode: string;
}

export interface NamecolorList {
  colour: string;
  energyCode: string;
  energyName: string;
}

export const MHM_ActualPaymentList = {
  yearMonthList: ['2022-01', '2022-02', '2022-03', '2022-04', '2022-05', '2022-06'],
  energyNameColourList: [
    {
      energyCode: '实际缴费',
      energyName: '实际缴费',
      colour: '#03BEFF',
    },
    {
      energyCode: '02000',
      energyName: '水',
      colour: '#FF9120',
    },
    {
      energyCode: '01000',
      energyName: '电',
      colour: '#3681FF',
    },
    {
      energyCode: '03000',
      energyName: '燃气',
      colour: '#FFCB20',
    },
    {
      energyCode: '20000',
      energyName: '蒸汽',
      colour: '#FE4B4E',
    },
  ],
  histogramEnergyActualPayments: [
    ['5000.12', null, '5000.12', null, null],
    ['10000.01', '5000', '5000.01', null, null],
    ['5000', null, '5000', null, null],
    ['5000.07', null, '5000.07', null, null],
    ['5000', null, '5000', null, null],
    ['5000', null, '5000', null, null],
  ],
  allEnergyActualPaymentList: [
    {
      energyName: '全部',
      oneEnergyActualPaymentList: [
        {
          date: '2022-01',
          actualPayment: '5000.12',
          attachmentIds: null,
          fileVOList: null,
        },
        {
          date: '2022-02',
          actualPayment: '10000.01',
          attachmentIds: null,
          fileVOList: null,
        },
        {
          date: '2022-03',
          actualPayment: '5000',
          attachmentIds: null,
          fileVOList: null,
        },
        {
          date: '2022-04',
          actualPayment: '5000.07',
          attachmentIds: null,
          fileVOList: null,
        },
        {
          date: '2022-05',
          actualPayment: '5000',
          attachmentIds: null,
          fileVOList: null,
        },
        {
          date: '2022-06',
          actualPayment: '5000',
          attachmentIds: null,
          fileVOList: null,
        },
      ],
    },
    {
      energyName: '水',
      oneEnergyActualPaymentList: [
        {
          date: '2022-01',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
          pictureVOList: [
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
            },
          ],
        },
        {
          date: '2022-02',
          actualPayment: '5000',
          attachmentIds: '1478740334870594',
          fileVOList: [],
          pictureVOList: [
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
            },
          ],
        },
        {
          date: '2022-03',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-04',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-05',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-06',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
      ],
    },
    {
      energyName: '电',
      oneEnergyActualPaymentList: [
        {
          date: '2022-01',
          actualPayment: '5000.12',
          attachmentIds: '1478740334870594',
          fileVOList: [
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
          ],
          pictureVOList: [
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
          ],
        },
        {
          date: '2022-02',
          actualPayment: '5000.01',
          attachmentIds: '1478740334870594',
          fileVOList: [
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
            {
              fileId: 1482541731151938,
              fileName: '能源异常九类规则描述.doc',
              fileType: 'doc',
            },
            {
              fileId: 1482543117369410,
              fileName: '设备能源3.0版本_测试用例_20220518163547.xls',
              fileType: 'xls',
            },
          ],
        },
        {
          date: '2022-03',
          actualPayment: '5000',
          attachmentIds: '1482543117369474',
          fileVOList: [
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.jpg',
            },
          ],
        },
        {
          date: '2022-04',
          actualPayment: '5000.07',
          attachmentIds: '1482543117369474',
          fileVOList: [
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.jpg',
            },
          ],
        },
        {
          date: '2022-05',
          actualPayment: '5000',
          attachmentIds: '1478740334870594',
          fileVOList: [],
          pictureVOList: [
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T105441Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9b9852b227c825a061402e7e90e025f1384e073be8639a20803779d018b31dbc',
            },
            {
              fileId: 1482551220764738,
              fileName: '2454fd23￥36964cfe52e9e3010f1912d059c.jpg',
              fileType: 'jpg',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482551220764706.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e8b6163ec20cbe919600c8d9838b1cfe7a1982b347d6408c0235b7bb57cf516a',
            },
            {
              fileId: 1482543117369474,
              fileName: '20211027134028.JPG',
              fileType: 'JPG',
              fileUrl:
                'http://192.168.50.24:10000/tenant-account-data/cloud/test_wqy/1482543117369442.JPG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20220607%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220607T090227Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3c76371499f13fb4eae74d18834686cb2de1d24e3497e66d89cb0a44db4a9959',
            },
          ],
        },
        {
          date: '2022-06',
          actualPayment: '5000',
          attachmentIds: '1478740334870594',
          fileVOList: [],
        },
      ],
    },
    {
      energyName: '燃气',
      oneEnergyActualPaymentList: [
        {
          date: '2022-01',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-02',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-03',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-04',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-05',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-06',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
      ],
    },
    {
      energyName: '蒸汽',
      oneEnergyActualPaymentList: [
        {
          date: '2022-01',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-02',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-03',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-04',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-05',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
        {
          date: '2022-06',
          actualPayment: null,
          attachmentIds: null,
          fileVOList: [],
        },
      ],
    },
  ],
};
