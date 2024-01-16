/** 等效电能源管理设置模块 */
declare namespace EquivalentElectricModule {
    //    详情
    interface EquivalentElectricInfo {
        energyCode: string;
        energyCodeName: string;
        energyName: string;
        id: number;
        coefficient: number | null;
        status: string;
        unit: string;
    }
    // 表单
    interface equivalentElectricForm {
        id: number;
        energyName: string;
        energyCode: string;
        coefficient: number | null;
        status: string;
        unit: string;
    }
    // 新增
    interface CreateParams {
        energyCode: string;
        energyCodeName: string;
        energyName: string;
        coefficient: number | null;
        unit: string;
        status: string;
    }
    // 编辑
    interface UpdateParams extends CreateParams {
        id: number;
    }
}
