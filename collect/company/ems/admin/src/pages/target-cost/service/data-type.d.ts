/** 目标成本设置模块 */
declare namespace TargetCostModule {
    //    详情
    interface TargetCostInfo {
        energyCode: string;
        energyName: string;
        id: number;
        targetValue: number;
        treeId: number;
        treeName: string;
        treeType: number;
    }
    // 表单
    interface TargetCostForm {
        targetValue: number | string;
        treeId: number[];
        energyCode: string;
    }
    // 新增
    interface CreateParams {
        energyCode: string;
        targetValue: number;
        treeId: number;
    }
    // 编辑
    interface UpdateParams extends CreateParams {
        id: number;
    }
    // 删除
    interface DeleteParams {
        id: number
    }
}
