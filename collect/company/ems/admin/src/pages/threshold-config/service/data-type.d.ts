/** 阈值设置模块 */
declare namespace ThresholdConfigModule {
    interface TableListItem {
        createTime: string;
        general: number;
        id: number;
        serious: number;
        thresholdName: string;
        thresholdType: string;
        updateTime: string;
        deadband: number;
        _edit?: boolean;
    }
    interface UpdateThresholdConfigValueParam {
        general: number;
        serious: number;
        deadband: number;
        thresholdType: string;
    }
}
