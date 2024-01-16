declare namespace AlarmModule {

    /* 
   查询告警管理列表参数
  */
   interface QueryAlarmParams extends GeneralModule.CommonQueryParams {
     alarmLevel:Array;
     alarmSystem: string;
     endDate: string;
     startDate: string;
     status: string;
     type: Array;
   }
 
   /* 
     告警返回列表list
   */
   interface AlarmList {
    nodeName:string;
    alarmTypeName:string;
    updateTime:string;
    generateTime:string;
    content:string;
    nodeLocation:string;
    alarmStatus:string;
    businessTypeText:string;
    createTime: string;
    alarmTypeId: number;
    alarmLevelText:string;
    alarmLevel:string;
    id: number;
    businessType: string;
    nodeId: number;
    alarmStatusText: string;
   }
   
   /**
   *单个操作告警入参
  */
   interface operationAlarmType {
    alarmId: number;
    handleRemarks: string;
    operateType: string;
   }

   /**
   *批量操作告警入参
  */
   interface operationAlarmBatchType {
    alarmIds: number[];
    handleRemarks: string;
    operateType: string;
   }
 
   /**
    *
    */
  /** 通用对象 */
   interface CommonObject {
     [key: string]: any;
   }
 
 }
 