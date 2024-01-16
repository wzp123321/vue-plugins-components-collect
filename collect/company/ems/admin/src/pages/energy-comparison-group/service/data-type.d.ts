/** 能耗对比组设置模块 */
declare namespace EnergyComparisonGroupModule {
    // 详情
    interface EnergyCompareGroupInfo {
        contrastTreeId: number;
        contrastTreeName: string;
        energyCode: string;
        energyName: string;
        id: number;
        name: string;
        treeId: number;
        treeName: string;
        treeType: number;
    }
    // 新增
    interface CreateParams {
        contrastTreeId: number;
        energyCode: string;
        name: string;
        treeId: number;
    }
    // 表单
    interface CompareGroupForm {
        contrastTreeId: number[];
        energyCode: string;
        name: string;
        treeId: number[];
    }
    // 修改
    export interface UpdateParams extends CreateParams {
        id: number;
    }
    // 删除
    interface DeleteParams {
        id: number;
    }
}