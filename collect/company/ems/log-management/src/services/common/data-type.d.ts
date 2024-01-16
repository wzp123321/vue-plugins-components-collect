/** Http请求模块 */
declare namespace HttpRequestModule {
  /** 接口返参 start */
  interface ResTemplate<T> {
    code: number
    message: string
    success: boolean
    data: T
  }
}

/** 定义全局接口 */
declare namespace GlobalModule {
  /** 通用对象 */
  export interface CommonObject {
    [key: string]: any
  }
  // 树
  export interface TreeVO {
    airConditionedArea: number
    area: number
    childTree: TreeList[]
    createTime: any
    hospitalCode: string
    id: number
    parentId: number
    parentIds: string
    peopleNumber: number
    treeLeaf: number
    treeLevel: number
    treeName: string
    treeNames: string
    treeSort: number
    treeType: number
    updateTime: any
  }

   /** 字典 */
   interface DictionaryInfo {
    code: string;
    name: string;
  }
}
