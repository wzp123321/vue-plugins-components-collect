/*
 * @Description: 项目信息常量
 * @Autor: zpwan
 * @Date: 2022-04-07 11:43:20
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-21 16:32:13
 */
import { IKeyValue } from '../../project-manage/services/project-manage.api';
import { ProjectStatusEnum } from './enum';

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
