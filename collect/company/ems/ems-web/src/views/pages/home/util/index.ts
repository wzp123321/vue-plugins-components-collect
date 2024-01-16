const widthMap: any = {
  1: `${(1 / 3) * 100}%`,
  2: `${(2 / 3) * 100}%`,
  3: '100%',
};
const heightMap: any = {
  1: '420px',
};
const HomeService = {
  componentMap() {
    return {
      ZJ001: 'ProjectIntroduction', // 项目介绍
      ZJ002: 'CostCompareOverview', // 同环比概览
      ZJ003: 'Kpi', // kpi
      ZJ004: 'EnergyConsumptionRank', // 能耗排名
      ZJ005: 'KeyAreaAnalysis', // 重点区域用能
      ZJ006: 'EnergyCostAnalysis', // 能源成本分析
      ZJ007: 'AlarmEventAnalysis', // 告警事件分析
      ZJ008: 'SlideEnergyConsumption', // 滑动能耗组件
      ZJ009: 'DeviceStatusMonitor', // 设备状态监测
      ZJ010: 'EnergySubItem', // 用能分项占比
      ZJ011: 'AssociationAnalysis', // 关联分析
      ZJ012: 'ProjectSiteOverview', // 项目点位概览
      ZJ013: 'UnitAreaEnergyRank', // 单位面积能耗排名
    };
  },

  /**
   * 根据后台json数据生成组件的行列排布二维数组
   * @param res 首页组件数据
   */
  getContainerOptions(res: HomeModule.ComponentPage[]) {
    let maxRows = 0;
    const layoutMap: any = {};
    for (const item of res) {
      const width = Number(item.size.split(',')[0]);
      const height = Number(item.size.split(',')[1]);
      const colPosition = Number(item.position.split(',')[0]);
      const rowPosition = Number(item.position.split(',')[1]);
      const { componentCode, name, title, id, configContent } = item;

      if (layoutMap[rowPosition]) {
        layoutMap[rowPosition] = [
          ...layoutMap[rowPosition],
          {
            colPosition,
            width,
            height,
            name,
            title,
            componentCode,
            id,
            configContent,
          },
        ];
      } else {
        layoutMap[rowPosition] = [
          {
            colPosition,
            width,
            height,
            name,
            title,
            componentCode,
            id,
            configContent,
          },
        ];
      }

      if (maxRows < rowPosition) {
        maxRows = rowPosition;
      }
    }
    return this.getFlexContainer(maxRows, layoutMap);
  },

  /**
   * 根据二维数组生成首页的Html
   * @param maxRows 最大行数
   * @param layoutMap 组件行列排布二维数组
   */
  getFlexContainer(maxRows: number, layoutMap: any): any {
    const rowArray = [];
    for (let i = 1; i <= maxRows; i++) {
      let colArray: any = [];

      if (!layoutMap[i]) {
        rowArray.push([]);
        continue;
      }

      const rowItems = layoutMap[i].sort(
        (x: HomeModule.LayoutMapItem, y: HomeModule.LayoutMapItem) => x.colPosition - y.colPosition,
      );
      colArray = this.getColArray(rowItems);
      rowArray.push(colArray);
    }
    return rowArray;
  },
  /**
   * 获取单行的组件布局
   * @param rowItems 单行的组件数据
   */
  getColArray(rowItems: HomeModule.LayoutMapItem[]) {
    let colArray: HomeModule.ComponentItem[] = [];

    // 累加宽度
    const rowWidth = rowItems.reduce((accumulator: number, currentValue: HomeModule.LayoutMapItem) => {
      return accumulator + currentValue.width;
    }, 0);
    // 如果刚好填满，则正常按照顺序渲染
    if (rowWidth === 3) {
      for (const item of rowItems) {
        colArray.push({
          id: item.id,
          name: item.name,
          title: item.title,
          componentCode: item.componentCode,
          configContent: item.configContent,
          styleOption: {
            width: widthMap[item.width],
            height: heightMap[item.height],
          },
        });
      }
      return colArray;
    }

    // 如果一行只有一个1*1组件
    if (rowWidth === 1) {
      colArray = this.fillThree_OneMultiplyOneComp();
      const item = rowItems[0];
      colArray[item.colPosition - 1] = {
        id: item.id,
        name: item.name,
        title: item.title,
        componentCode: item.componentCode,
        configContent: item.configContent,
        styleOption: {
          width: widthMap[item.width],
          height: heightMap[item.height],
        },
      };
      return colArray;
    }

    // 如果一行只有一个2*1组件
    if (rowWidth === 2 && rowItems.length === 1) {
      const item = rowItems[0];
      colArray = this.fillOne_TwoMultiplyOneComp(item);
      return colArray;
    }

    // 如果一行只有两个1*1组件
    if (rowWidth === 2 && rowItems.length === 2) {
      colArray = this.fillTwo_OneMultiplyOneComp(rowItems);
      return colArray;
    }
  },
  /**
   * 填充1个1*1组件
   */
  fillThree_OneMultiplyOneComp(): HomeModule.ComponentItem[] {
    const blankContainerHtml = {
      styleOption: {
        height: heightMap[1],
        width: widthMap[1],
      },
    };
    return Array(3).fill(blankContainerHtml); // 填充满一行3个1*1
  },

  /**
   * 填充一个2*1组件
   * @param item 2*1组件
   */
  fillOne_TwoMultiplyOneComp(item: HomeModule.LayoutMapItem) {
    return [
      {
        id: item.id,
        name: item.name,
        title: item.title,
        componentCode: item.componentCode,
        configContent: item.configContent,
        styleOption: {
          width: widthMap[item.width],
          height: heightMap[item.height],
          order: item.colPosition - 1,
        },
      },

      {
        configContent: item.configContent,
        styleOption: {
          width: widthMap[1],
          height: heightMap[1],
        },
      },
    ];
  },

  /**
   * 填充两个1*1组件
   * @param rowItems 单行组件排布
   */
  fillTwo_OneMultiplyOneComp(rowItems: HomeModule.LayoutMapItem[]) {
    const colArray: HomeModule.ComponentItem[] = this.fillThree_OneMultiplyOneComp();
    for (const item of rowItems) {
      colArray[item.colPosition - 1] = {
        id: item.id,
        name: item.name,
        title: item.title,
        componentCode: item.componentCode,
        configContent: item.configContent,
        styleOption: {
          width: widthMap[item.width],
          height: heightMap[item.height],
        },
      };
    }
    return colArray;
  },
};
export default HomeService;
