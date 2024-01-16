export interface EMEventTypeInfoItem {
    id: number;
    eventTypeName: string;
}
export const photographData = [
    { value: 1, label: '拍照' }, 
    { value: 3, label: '从相册选择' },
    { value: 4, label: '取消', type: 'cancel' } 
  ];
  // TAdd | TReduce | TRebuilding
export const changeTypeList = [
    { value: 1, label: '新增'},
    { value: 2, label: '减少'},
    { value: 3, label: '改造'}
]
// TBinding | TManual
export const entryModelist = [
    { value: 1, label: '绑定设备'},
    { value: 2, label: '人工录入'} 
]

// TBinding | TManual
export const adjustmentTypeList = [
    { value: 1, label: '提早开'},
    { value: 2, label: '推迟关'} 
]
