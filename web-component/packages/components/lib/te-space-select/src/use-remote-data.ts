import { LocationTypeEnum } from '../../models/LocationTypeEnum';
import LocationV2DetailResponseVO from '../../models/LocationV2DetailResponseVO';
import LocationPathV2DetailResponseVO from '../../models/LocationPathV2DetailResponseVO';
import LocationV2LazyTreeResponseVO from '../../models/LocationV2LazyTreeResponseVO';

interface AllowSelectAllLevels {
  campus: boolean;
  building: boolean;
  buildingPart: boolean;
  floor: boolean;
  floorPart: boolean;
  room: boolean;
  roomPart: boolean;
}

/**
 * 接口返回数据的处理
 */
export const useRemoteData = () => {
  // 节点详情Map
  const detailMap: Map<
    string,
    LocationV2LazyTreeResponseVO | LocationV2DetailResponseVO | LocationPathV2DetailResponseVO
  > = new Map();
  /**
   * 处理懒加载分级数据的返回结果
   */
  const dealwithLazyData = (
    type: LocationTypeEnum,
    tree: LocationV2LazyTreeResponseVO[],
    allowSelectAllLevels: AllowSelectAllLevels,
    hideFromLevel?: keyof AllowSelectAllLevels
  ) => {
    const levelOrder = [
      'campus',
      'building',
      'buildingPart',
      'floor',
      'floorPart',
      'room',
      'roomPart',
    ];
    const hideFromIndex = levelOrder.indexOf(hideFromLevel);

    const res = tree.flatMap((item) => {
      // 此处入参type只会是PROJECT、BUILDING、FLOOR、ROOM
      const curLevelIndex = levelOrder.indexOf(type.toLowerCase());
      let isHideAfter = false;
      if (hideFromIndex !== -1) {
        if (hideFromLevel.includes('Part')) {
          isHideAfter = curLevelIndex === hideFromIndex - 1;
        } else {
          isHideAfter = curLevelIndex === hideFromIndex - 2;
        }
      }

      return [
        {
          ...item,
          value: item.id,
          label: item.name,
          leaf: isHideAfter || !item.hasChildren,
          disabled: getLevelDisabled(type, false, allowSelectAllLevels),
          initialDisabled: getLevelDisabled(type, false, allowSelectAllLevels),
          isChild: false,
          parentId: '',
          children: [],
        },
        ...(isHideAfter && hideFromLevel.includes('Part') ? [] : (item.children || [])).map((el) => {
          return {
            ...el,
            value: el.id,
            label: !!el?.realPName ? el.realPName + ' / ' + el.name : el.name,
            leaf: isHideAfter || !el.hasChildren,
            disabled: getLevelDisabled(type, true, allowSelectAllLevels),
            initialDisabled: getLevelDisabled(type, true, allowSelectAllLevels),
            isChild: true,
            parentId: String(item.id),
            children: [],
          };
        }),
      ];
    });
    res.forEach((item) => detailMap.set(String(item.value), item));
    return res;
  };

  /**
   * 判断该禁用的层级
   * @param type
   * @param parentStatus
   * @param allowSelectAllLevels
   * @returns
   */
  const getLevelDisabled = (
    type: LocationTypeEnum,
    parentStatus: boolean,
    allowSelectAllLevels: AllowSelectAllLevels
  ) => {
    const disabledLevels = {
      [JSON.stringify({ type: LocationTypeEnum.PROJECT, parentStatus: true })]: !allowSelectAllLevels.campus,
      [JSON.stringify({ type: LocationTypeEnum.PROJECT, parentStatus: false })]: !allowSelectAllLevels.campus,
      [JSON.stringify({ type: LocationTypeEnum.BUILDING, parentStatus: true })]: !allowSelectAllLevels.building,
      [JSON.stringify({ type: LocationTypeEnum.BUILDING, parentStatus: false })]: !allowSelectAllLevels.buildingPart,
      [JSON.stringify({ type: LocationTypeEnum.FLOOR, parentStatus: true })]: !allowSelectAllLevels.floor,
      [JSON.stringify({ type: LocationTypeEnum.FLOOR, parentStatus: false })]: !allowSelectAllLevels.floorPart,
      [JSON.stringify({ type: LocationTypeEnum.ROOM, parentStatus: true })]: !allowSelectAllLevels.room,
      [JSON.stringify({ type: LocationTypeEnum.ROOM, parentStatus: false })]: !allowSelectAllLevels.roomPart,
    };

    return disabledLevels[JSON.stringify({ type, parentStatus })];
  };

  /**
   * 搜索结果拼接成option树
   */
  const dealwithSearchData = (res: LocationPathV2DetailResponseVO[], allowSelectAllLevels: AllowSelectAllLevels) => {
    const tree = buildTree(res, allowSelectAllLevels);
    return tree;
  };

  /**
   * 空间list转为tree
   * @param data
   * @param allowSelectAllLevels
   * @returns
   */
  const buildTree = (dataArr: LocationPathV2DetailResponseVO[], allowSelectAllLevels: AllowSelectAllLevels) => {
    //数组去重
    const data = dataArr.filter((obj, index, self) => index === self.findIndex((t) => t.id === obj.id));
    const resTree = []; // 用于存储节点映射关系

    // 遍历数据，构建树结构
    data.forEach((val) => {
      detailMap.set(val.id, val);
      //第一级节点
      if (!resTree.find((item) => item.value === val.projectId)) {
        resTree.push({
          value: val.projectId,
          label: val.projectName,
          disabled: getLevelDisabled(LocationTypeEnum.PROJECT, true, allowSelectAllLevels),
          children: [],
          isChild: false,
        });
      }
    });

    //第二级节点
    resTree.forEach((item) => {
      let buildingArr = data.filter((val) => {
        return (
          val.projectId === item.value &&
          val.buildingId &&
          getIsParent(val.idPath!, item.value, val.buildingId)
        );
      });

      let buildingResArr = uniqueObjectsByProperty(buildingArr, 'buildingId').map((val) => {
        return {
          value: val.buildingId,
          label: val.buildingName,
          disabled: getLevelDisabled(LocationTypeEnum.BUILDING, true, allowSelectAllLevels),
          children: [],
          isChild: false,
        };
      });

      let buildingAreaArr = data.filter((val) => {
        return (
          val.projectId === item.value &&
          val.buildingAreaId &&
          getIsParent(val.idPath!, item.value, val.buildingId)
        );
      });

      let buildingAreaResArr = uniqueObjectsByProperty(buildingAreaArr, 'buildingAreaId').map((val) => {
        return {
          value: val.buildingAreaId,
          label: val.buildingName + ' / ' + val.buildingAreaName,
          disabled: getLevelDisabled(LocationTypeEnum.BUILDING, false, allowSelectAllLevels),
          children: [],
          isChild: true,
        };
      });

      item.children = [...buildingResArr, ...buildingAreaResArr];
    });

    //第三级节点
    resTree.forEach((itemProject) => {
      itemProject.children.forEach((item) => {
        let floorArr = data.filter((val) => {
          return (
            (val.buildingId === item.value ||
              val.buildingAreaId === item.value) &&
            val.floorId &&
            getIsParent(val.idPath!, item.value, val.floorId)
          );
        });

        let floorResArr = uniqueObjectsByProperty(floorArr, 'floorId').map((val) => {
          return {
            value: val.floorId,
            label: val.floorName,
            disabled: getLevelDisabled(LocationTypeEnum.FLOOR, true, allowSelectAllLevels),
            children: [],
            isChild: false,
          };
        });

        let floorAreaArr = data.filter((val) => {
          return (
            (val.buildingId === item.value ||
              val.buildingAreaId === item.value) &&
            val.floorAreaId &&
            getIsParent(val.idPath!, item.value, val.floorId!)
          );
        });

        let floorAreaResArr = uniqueObjectsByProperty(floorAreaArr, 'floorAreaId').map((val) => {
          return {
            value: val.floorAreaId,
            label: val.floorName + ' / ' + val.floorAreaName,
            leaf: false,
            disabled: getLevelDisabled(LocationTypeEnum.FLOOR, false, allowSelectAllLevels),
            children: [],
            isChild: true,
          };
        });

        item.children = [...floorResArr, ...floorAreaResArr];
      });
    });

    //第四级节点
    resTree.forEach((itemProject) => {
      itemProject.children.forEach((itemBuilding) => {
        itemBuilding.children.forEach((item) => {
          let roomArr = data.filter((val) => {
            return (
              (val.floorId === item.value || val.floorAreaId === item.value) &&
              val.roomId &&
              getIsParent(val.idPath!, item.value, val.roomId)
            );
          });

          let roomResArr = uniqueObjectsByProperty(roomArr, 'roomId').map((val) => {
            return {
              value: val.roomId,
              label: val.roomName,
              leaf: true,
              disabled: getLevelDisabled(LocationTypeEnum.ROOM, true, allowSelectAllLevels),
              children: [],
              isChild: false,
            };
          });

          let roomAreaArr = data.filter((val) => {
            return (
              (val.floorId === item.value || val.floorAreaId === item.value) &&
              val.roomAreaId &&
              getIsParent(val.idPath!, item.value, val.roomId!)
            );
          });

          let roomAreaResArr = uniqueObjectsByProperty(roomAreaArr, 'roomAreaId').map((val) => {
            return {
              value: val.roomAreaId,
              label: val.roomName + ' / ' + val.roomAreaName,
              leaf: true,
              disabled: getLevelDisabled(LocationTypeEnum.FLOOR, false, allowSelectAllLevels),
              children: [],
              isChild: true,
            };
          });

          item.children = [...roomResArr, ...roomAreaResArr];
        });
      });
    });
    return resTree;
  };

  // fix ISMS-10143 搜索结果比实际多，组装搜索结果数据时需要判断是否为父子节点
  const getIsParent = (
    idPath: string,
    pId: string,
    id: string,
  ) => {
    const idPathArr = idPath.split(',');
    const idIndex = idPathArr.findIndex((pathId) => pathId === id);
    const pIndex = idPathArr.findIndex((id) => id === pId);
    return pIndex + 1 === idIndex 
  };

  /**
   * 要去重的对象数组和用作唯一标识的属性名称
   * @param array
   * @param property
   * @returns
   */
  const uniqueObjectsByProperty = (array, property) => {
    const map = new Map();
    return array.reduce((acc, obj) => {
      if (!map.has(obj[property])) {
        map.set(obj[property], true); // 使用 Map 来记录已经出现过的属性值
        acc.push(obj);
      }
      return acc;
    }, []);
  };

  /**
   * 回显数据格式拼接
   */
  const dealwithEchoData = (res: LocationV2DetailResponseVO[]) => {
    let arr = [];
    res.forEach((item) => {
      const val = [
        item.projectId,
        item.buildingAreaId || item.buildingId,
        item.floorAreaId || item.floorId,
        item.roomAreaId || item.roomId,
      ].filter((id) => !!id);
      arr.push(val);
      detailMap.set(val[val.length - 1], item);
    });
    return arr;
  };

  return {
    dealwithLazyData,
    dealwithSearchData,
    dealwithEchoData,
    detailMap,
  };
};
