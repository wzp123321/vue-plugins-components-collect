import { LocationTypeEnum } from '../../../models/LocationTypeEnum';

export default class QueryCascape {
  /**
   * mock查询各级数据
   * @returns
   */
  static queryLazyData = (LevelType, parentId) => {
    let defaultObj = {
      [LocationTypeEnum.PROJECT]: 0,
      [LocationTypeEnum.BUILDING]: 1,
      [LocationTypeEnum.FLOOR]: 2,
      [LocationTypeEnum.ROOM]: 3,
    };
    let level = defaultObj[LevelType];

    let pid = parentId || 'rr';
    let id = level * 100;
    const nodes = Array.from({ length: 100 }).map((item) => {
      id = id + 1;
      return {
        children: [
          {
            children: [],
            hasChildren: level < 3,
            id: pid + 'child' + id,
            name: `Optionchild${id}`,
            namePath: '',
            pId: pid,
          },
          {
            children: [],
            hasChildren: level < 3,
            id: pid + 'child' + id,
            name: `Optionchild${id}`,
            namePath: '',
            pId: pid,
          },
        ],
        hasChildren: level < 3,
        id: pid + 'hh' + id,
        name: `Option${id}`,
        namePath: '',
        pId: pid,
      };
    });

    return {
      errcode: '0',
      data: nodes,
    };
  };

  /**
   * mock 根据已选中的id，取获取完整id的二维数组
   * @returns
   */
  static queryEchoData = () => {
    const nodes = [
      {
        id: 'rrhh2',
        name: 'Option2',
        level: '1',
        projectId: 'rrhh2',
        projectName: 'Option2',
        buildingId: '',
        buildingName: '',
        buildingAreaId: '',
        buildingAreaName: '',
        floorId: '',
        floorName: '',
        floorAreaId: '',
        floorAreaName: '',
        roomId: '',
        roomName: '',
        roomAreaId: '',
        roomAreaName: '',
        namePath: '',
      },
    ];

    return {
      errcode: '0',
      data: nodes,
    };
  };

  /**
   * 模糊搜索
   * @param LevelType
   * @param parentId
   * @returns
   */
  static searchData = (val) => {
    const nodes = [
      {
        id: 'rrhh2',
        name: 'Option2',
        level: '1',
        projectId: 'rrhh2',
        projectName: 'Option2',
        buildingId: '',
        buildingName: '',
        buildingAreaId: '',
        buildingAreaName: '',
        floorId: '',
        floorName: '',
        floorAreaId: '',
        floorAreaName: '',
        roomId: '',
        roomName: '',
        roomAreaId: '',
        roomAreaName: '',
        namePath: '',
      },
      {
        id: 'rrhh12',
        name: 'Option12',
        level: '1',
        projectId: 'rrhh12',
        projectName: 'Option12',
        buildingId: '',
        buildingName: '',
        buildingAreaId: '',
        buildingAreaName: '',
        floorId: '',
        floorName: '',
        floorAreaId: '',
        floorAreaName: '',
        roomId: '',
        roomName: '',
        roomAreaId: '',
        roomAreaName: '',
        namePath: '',
      },
    ];

    return {
      errcode: '0',
      data: nodes,
    };
  };
}
