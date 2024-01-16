/** 建筑信息设置模块 */
declare namespace BuildingInformationModule {
    // 请求列表
    export interface QueryParams extends GlobalModule.CommonSearchParams {
        name: string;
    }
    //    详情
    interface BuildingInformationInfo {
        id: number;
        address: string; //建筑地址
        airConditionedArea: number | null; //空调面积
        area: number | null; //各功能分区面积
        buildingType: string; //建筑功能类型名称
        buildingTypeText: string;
        buildingYear: number | null; //建筑年代
        coolingMode: string; //制冷模式
        curtainType: string; //建筑外帘类型
        glassType: string; //建筑玻璃类型
        heatingArea: number | null; //采暖面积
        heatingMode: string; //采暖模式
        layers: number | null; //建筑层数
        name: string; //建筑名称
        shapeCoefficient: number| null; //建筑体形系数
        structure: string; //建筑结构形式
        treeId: number; //建筑关联的树节点ID
        treeName: string; //	树节点名称
        wallMaterial: string; //建筑外墙材料
        wallWarmMode: string; //建筑外墙保温形式
        windowMaterialType: string; //窗框材料类型
        treeType: number;
    }
    // 表单
    interface BuildingInformationForm {
        id: number;
        name: string; //建筑名称
        buildingYear: number | null; //建筑年代
        layers: number | null; //建筑层数
        treeId: number[]; //关联树节点
        treeName: string; //	树节点名称
        treeType: number;
        buildingType: string; //建筑功能
        buildingTypeText: string;
        address: string; //建筑地点
        area: number | null; //各功能分区面积(㎡)
        airConditionedArea: number | null; //空调面积(㎡)
        heatingArea: number | null; //采暖面积(㎡)
        coolingMode: string; //建筑空调系统模式
        heatingMode: string, //建筑采暖系统形式
        shapeCoefficient: number| null; //建筑体型系数
        structure: string; //建筑结构形式
        wallMaterial: string; //建筑外墙材料形式
        wallWarmMode: string; //建筑外墙保温形式
        curtainType: string; //建筑外帘类型
        glassType: string; //建筑玻璃类型
        windowMaterialType: string; //窗框材料类型
    }
    // 新增
    interface CreateParams {
        name: string; //建筑名称
        buildingYear: number | null; //建筑年代
        layers: number | null; //建筑层数
        treeId: number; //关联树节点
        buildingType: string; //建筑功能
        address: string; //建筑地点
        heatingArea: number | null; //采暖面积(㎡)
        coolingMode: string; //建筑空调系统模式
        heatingMode: string, //建筑采暖系统形式
        shapeCoefficient: number| null; //建筑体型系数
        structure: string; //建筑结构形式
        wallMaterial: string; //建筑外墙材料形式
        wallWarmMode: string; //建筑外墙保温形式
        curtainType: string; //建筑外帘类型
        glassType: string; //建筑玻璃类型
        windowMaterialType: string; //窗框材料类型

    }
    // 编辑
    interface UpdateParams extends CreateParams {
        id: number;
    }
}
