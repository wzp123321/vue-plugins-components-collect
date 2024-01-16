declare namespace EnvironmentEvaluationModule {
    export interface RelationAnalysisQueryForm {
        date: Date[]; //start，end时间
        treeId: number[],
        type: number; //type
    }
    // 请求入参
    export interface RelationAnalysisQueryParams {
        browserParamList: RealtionAnalysisParamInfo[] | null;
        correlationStatus: string;
        endTime: string;
        energyCode: string;
        isSelf: boolean;
        startTime: string;
        timeUnit: string;
        treeId: number,
        type: number,
        valueMean: number
    }

}

