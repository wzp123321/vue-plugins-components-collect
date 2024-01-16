/*
 * @Description: 项目信息常量
 * @Autor: zpwan
 * @Date: 2022-04-07 11:43:20
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2023-10-31 14:50:17
 */
import { IKeyValue } from '../services/project-manage.api';

import { ProjectStatusEnum, BenchmarkTypeEnum, HostingTypeEnum, ProjectCodeEnum, RiskRatingEnum } from './enum';

// 节点props
export const defaultTreeProps = {
  children: 'childTree',
  label: 'treeName',
};
// 最大区域名称长度
export const MAX_INPUT_LEN_40 = 40;
// 最大能源经理名称长度
export const MAX_INPUT_LEN_20 = 20;

// 项目状态
export const projectStatusList: IKeyValue[] = [
  {
    name: '已签约未进场',
    code: ProjectStatusEnum.NO_PASS,
  },
  {
    name: '建设期',
    code: ProjectStatusEnum.CONSTRUCTION_PERIOD,
  },
  {
    name: '运营期',
    code: ProjectStatusEnum.OPERATION_PERIOD,
  },
];

// 基准类型
export const standardTypeList: IKeyValue[] = [
  {
    code: BenchmarkTypeEnum.PINTO_TYPE,
    name: '无增长型',
  },
  {
    code: BenchmarkTypeEnum.INCREASE_TYPE,
    name: '递增型',
  },
];

// 托管类型枚举
export const trusteeshipTypeList: IKeyValue[] = [
  {
    code: HostingTypeEnum.HOSTING_NUMBER,
    name: '托量型',
  },
  {
    code: HostingTypeEnum.HOSTING_PRICE,
    name: '托价型',
  },
];

// 节能项目 1-中央空调 2-锅炉 3-智慧照明 4-其他
export const projectTypeList: IKeyValue[] = [
  {
    code: ProjectCodeEnum.CENTRAL_AIR_CONDITIONING,
    name: '中央空调',
  },
  {
    code: ProjectCodeEnum.BOILER,
    name: '锅炉',
  },
  {
    code: ProjectCodeEnum.INTELLIGENT_LIGHTING,
    name: '智慧照明',
  },
  {
    code: ProjectCodeEnum.OTHERS,
    name: '其他',
  },
];

// 风险评级枚举： 1-边界清晰 2-有一定边界 3-无边界
export const riskRatingList: IKeyValue[] = [
  {
    code: RiskRatingEnum.SHARPNESS_BORDER,
    name: '边界清晰',
  },
  {
    code: RiskRatingEnum.HAS_BOUNDARY,
    name: '有一定边界',
  },
  {
    code: RiskRatingEnum.NO_BOUNDARY,
    name: '无边界',
  },
];

// 托管区域能源类型
export const mapEnergyIconClass = (name: string) => {
  let className = '';
  switch (name) {
    case '电':
      className = 'icon-dian';
      break;
    case '蒸汽':
      className = 'icon-zhengqi';
      break;
    case '水':
      className = 'icon-shui';
      break;
    case '燃气':
      className = 'icon-ranqi';
      break;
    case '市政热水':
      className = 'icon-hotwater';
      break;
    case '通用能源类型':
      className = 'icon-one-third-rotation';
      break;
    default:
      className = 'icon-one-third-rotation';
      break;
  }

  return className;
};

// 托管区域能源类型-样式
export const mapEnergyIconColor = (name: string) => {
  let color = '';
  switch (name) {
    case '电':
      color = 'rgb(24, 144, 255)';
      break;
    case '蒸汽':
      color = 'rgb(151, 71, 255)';
      break;
    case '水':
      color = 'rgb(69, 191, 187)';
      break;
    case '燃气':
      color = 'rgb(250, 140, 22)';
      break;
    case '市政热水':
      color = '#FA541C';
      break;
    case '通用能源类型':
      color = '#606266';
      break;
    default:
      color = '#606266';
      break;
  }

  return color;
};

// 归属天溯的节点id
export const PM_TIANSU_NODE_ID = '12';
