import * as echarts from 'echarts/core';
import { EffectScatterChart, MapChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import {
  EffectScatterSeriesOption,
  GeoOption,
  GridOption,
  MapSeriesOption,
  ScatterSeriesOption,
  TooltipOption,
} from 'echarts/types/dist/shared';
import { CH_EProfitState, CH_EProjectState, CH_IProjectInfo } from '../cloud-home.api';
import { TDeepReadonly } from '@/core/types';

import sProject from '../service/ch-project.service';

import mapConfig from '../../../assets/map/map-config.json';
import mapChina from '../../../assets/map/map-china.json';
import mapChinaMerge from '../../../assets/map/map-china-merge.json';
import texture from '../../../assets/img/cloud-home/ch-map/ch-map-texture.png';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';

// 加密
import cryptoUtil from '@/utils/crypto';

echarts.use([CanvasRenderer, MapChart, ScatterChart, EffectScatterChart, GridComponent, TooltipComponent]);
echarts.registerMap('china', mapChina as any);
echarts.registerMap('china-merge', mapChinaMerge as any);

/**
 * 地图组件服务
 * @classdesc 维护地图组件图表实例
 * @exports MapService *普通类
 */
export class MapService {
  private _chart?: echarts.ECharts;
  private readonly _option: echarts.EChartsCoreOption = {};
  private _selected: CH_EProjectState | null = null;
  private _originProjects: CH_IProjectInfo[] = [];

  public set selected(v: CH_EProjectState | null) {
    if (v === this._selected) {
      return;
    }

    this._selected = v;
    this.scalePoints();
  }

  constructor(readonly destroy$: Subject<void>, container: HTMLElement) {
    if (!container) {
      return;
    }

    this._chart = echarts.init(container);
    this._option.grid = this.mapGrid();
    this._option.tooltip = this.mapTooltip();

    this.mapGeo().then((v) => {
      this._option.geo = v;
      this._option.series = this.mapSeries();
      this._chart!.setOption(this._option);

      this._chart!.on('click', { seriesId: 'events' }, (param) => {
        const data: CH_IProjectInfo = param.value[2];
        if (data?.alarm && data?.tag) {
          // 2023-12-22--补充跳转参数加密
          const query = Object.entries({ tenantId: data?.id, tenantCode: data?.code })
            .map(([k, v]) => `${k}=${cryptoUtil.Encrypt(encodeURIComponent(v))}`)
            .join('&');

          sProject.updateEventState(data?.id, data?.code);
          window.open(`${import.meta.env.VITE_CONTAINER_PROXY_URL}${data?.tag}?${query}`, '_blank');
        }
      });

      fromEvent(window, 'resize')
        .pipe(takeUntil(destroy$), debounceTime(233))
        .subscribe(() => this._chart?.resize());

      /**
       * 项目列表点击事件
       */
      (window as any).handleProjectItemClick = (id: string) => {
        if (this._originProjects?.length) {
          this._originProjects.forEach((item) => {
            if (item?.id === String(id)) {
              const detailEle = document.getElementsByClassName('ch-map-tooltip-detail');

              if (detailEle?.length) {
                const scrollEle = document.getElementsByClassName('ch-map-tooltip-scroll');
                (scrollEle?.[0] as HTMLElement).style.display = 'none';

                const template = this.getTooltipTemplate(item);
                (detailEle[0] as HTMLElement).style.zIndex = '1';
                detailEle[0].innerHTML = template;
              }
            }
          });
        }
      };
      /**
       * 点击项目详情
       * @param tenantId 租户id
       * @param tenantCode 租户code
       * @param clickFlag 是否可跳转详情
       * @param hasNewEnergyEvent 是否有能源事件
       */
      (window as any).handleProjectDetailClick = (
        tenantId: string,
        tenantCode: string,
        clickFlag: boolean,
        hasNewEnergyEvent: boolean,
      ) => {
        console.log(
          'handleProjectDetailClick-------------',
          tenantId,
          tenantCode,
          clickFlag,
          hasNewEnergyEvent,
          typeof clickFlag,
        );
        if (clickFlag + '' === 'true') {
          // 2023-12-22--补充跳转参数加密
          const query = Object.entries({ tenantId, tenantCode })
            .map(([k, v]) => `${k}=${cryptoUtil.Encrypt(encodeURIComponent(v))}`)
            .join('&');
          window.open(`${import.meta.env.VITE_CLOUD_PROXY_URL}terminal?${query}`);

          // 2023-11-14隐藏能源事件散点图，跳转详情更改事件状态也一并隐藏
          // if (hasNewEnergyEvent) {
          //   sProject.updateEventState(tenantId, tenantCode);
          // }
        }
      };

      sProject.refSelectedState$.pipe(takeUntil(destroy$), debounceTime(233)).subscribe((v) => (this.selected = v));
      sProject.refProjects$.pipe(takeUntil(destroy$)).subscribe((v) => {
        this._originProjects = JSON.parse(JSON.stringify(v));
        this.initPoints(v);
      });
    });
  }

  private initPoints(projects: TDeepReadonly<Array<CH_IProjectInfo>>): void {
    const series: any = [
      {
        type: 'scatter',
        id: 'projects',
        coordinateSystem: 'geo',
        symbol: 'circle',
        emphasis: undefined,
        data: [],
        zlevel: 100,
        label: {
          show: true,
          distance: 5,
          offset: [11, -17],
          padding: [1, 0, 0, 0],
          formatter: (params: any) => {
            // 如果只有一个项目则不展示
            return params?.value?.length === 3 ? '' : `{title|${params?.value?.length - 2}}`;
          },
          rich: {
            title: {
              fontSize: 12,
              align: 'center',
              backgroundColor: '#ff0000',
              width: 14,
              height: 14,
              lineHeight: 14,
              borderRadius: [32, 32],
            },
          },
        },
      },
      // 2023-11-14隐藏能源事件，effectScatter-具有涟漪特效的ECharts散点图属性
      // {
      //   type: 'effectScatter',
      //   id: 'events',
      //   rippleEffect: { color: '#FF3F00', number: 3, scale: 2.5, brushType: 'stroke' },
      //   coordinateSystem: 'geo',
      //   symbol: `image://${mapConfig.mark.alarm}`,
      //   symbolSize: [26, 23],
      //   label: { show: true, position: 'top', distance: 5, formatter: '能源事件', color: '#FF3B00' },
      //   emphasis: undefined,
      //   data: [],
      //   zlevel: 100,
      // },
    ];
    projects.forEach((project) => {
      const item: { [key: string]: any } = {
        name: project.name,
        value: [...project.coordinate, project],
      };

      // 2024-01-09---改为不考虑告警字段，全都走普通打点
      // if (project.alarm) {
      // 2023-11-14隐藏能源事件，effectScatter-具有涟漪特效的ECharts散点图属性
      // (series[1].data as any[]).push(item);
      // } else {
      item.symbolSize = project.state === this._selected ? [24, 33] : [16, 22];
      item.groupId = project.state;
      switch (project.profitState) {
        case CH_EProfitState.亏损:
          item.symbol = `image://${mapConfig.mark.deficit}`;
          break;
        case CH_EProfitState.低盈利:
          item.symbol = `image://${mapConfig.mark.low}`;
          break;
        case CH_EProfitState.中盈利:
          item.symbol = `image://${mapConfig.mark.middle}`;
          break;
        case CH_EProfitState.高盈利:
          item.symbol = `image://${mapConfig.mark.high}`;
          break;
        default:
          break;
      }
      let isRepeat: boolean = false;
      (series[0].data as any[]).forEach((items) => {
        if (items.value[0] === project.coordinate[0] && items.value[1] === project.coordinate[1]) {
          isRepeat = true;
          items.value.push(item.value[2]);
        }
      });
      if (!isRepeat) {
        (series[0].data as any[]).push(item);
      }
      // }
    });
    if (series[0].data) {
      (series[0].data as any[]).forEach((item) => {
        if (item.value.length > 3) {
          const arr = item.value.splice(2);
          for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - 1 - i; j++) {
              if (arr[j].state < arr[j + 1].state) {
                const temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
              }
            }
          }
          item.value = [...item.value, ...arr];
        }
      });
    }

    this._option.series = series;
    this._chart?.setOption(this._option);
  }

  private scalePoints(): void {
    ((this._option.series as [ScatterSeriesOption, EffectScatterSeriesOption])[0]?.data as any[])?.forEach((item) => {
      item.symbolSize = item.groupId === this._selected ? [24, 33] : [16, 22];
    });
    this._chart?.setOption(this._option);
  }

  private mapGrid(): GridOption {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  private getTooltipTemplate(data: CH_IProjectInfo) {
    const rank = ((state) => {
      switch (state) {
        case CH_EProfitState.亏损:
          return 'deficit';
        case CH_EProfitState.低盈利:
          return 'low';
        case CH_EProfitState.中盈利:
          return 'middle';
        case CH_EProfitState.高盈利:
          return 'high';
        default:
          break;
      }
    })(data?.profitState);

    // const query = Object.entries({ tenantId: data?.id, tenantCode: data?.code })
    //   .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    //   .join('&');

    /**
     * 2023-10-31,为了实现点击项目详情跳转也能更新能源事件状态，这里不再使用a标签，通过绑定点击事件来实现
     */
    const template = `
    ${
      data?.clickFlag
        ? `<div
      style="cursor: pointer"
    >`
        : ''
    }
    <div class="ch-map-tooltip-header"  onclick="window.handleProjectDetailClick('${data?.id}','${data?.code}','${
      data?.clickFlag
    }','${data?.alarm}')">
      <span class="ch-map-tooltip-icon" rank="${rank}"></span>
      <h6 class="ch-map-tooltip-title">${data?.name ?? '--'}</h6>
      <span class="ch-map-tooltip-state">${CH_EProjectState[data?.state] ?? '--'}</span>
    </div>
    <div class="ch-map-tooltip-body"  onclick="window.handleProjectDetailClick('${data?.id}','${data?.code}','${
      data?.clickFlag
    }','${data?.alarm}')">
      <div>
        <span class="ch-map-tooltip-label">托管周期</span>
        <span class="ch-map-tooltip-value">${data?.start ?? ''}～${data?.end ?? ''}</span>
      </div>
      <div>
        <span class="ch-map-tooltip-label">能源经理</span>
        <span class="ch-map-tooltip-value">${data?.manager ?? '--'}</span>
      </div>
      <div>
        <span class="ch-map-tooltip-label">项目累计盈利</span>
        <span class="ch-map-tooltip-value">${data?.surplus?.value ?? '--'}${data?.surplus?.unit ?? ''}</span>
      </div>
    </div>
    ${data?.clickFlag ? `</div>` : ''}
  `;

    return template;
  }

  private mapTooltip(): TooltipOption {
    return {
      trigger: 'item',
      enterable: true,
      renderMode: 'html',
      confine: false,
      className: 'ch-map-tooltip',
      position: 'right',
      formatter: (params) => {
        if (!(params instanceof Array)) {
          params = [params];
        }

        const arr = (params[0].value as any[]).slice(2);
        if (arr.length === 1) {
          const data: CH_IProjectInfo = params[0].value[2];

          const template = this.getTooltipTemplate(data);

          return template;
        } else {
          let str = '';
          arr.forEach((item, index) => {
            const data: CH_IProjectInfo = item;

            const rank = ((state) => {
              switch (state) {
                case CH_EProfitState.亏损:
                  return 'deficit';
                case CH_EProfitState.低盈利:
                  return 'low';
                case CH_EProfitState.中盈利:
                  return 'middle';
                case CH_EProfitState.高盈利:
                  return 'high';
                default:
                  break;
              }
            })(data?.profitState);

            str += `<a 
            onclick="window.handleProjectItemClick(${data?.id})"
            data-code="${data?.code}"
            target="_blank"
          >
            <div class="ch-map-tooltip-table-header">
              <span class="ch-map-tooltip-icon" rank="${rank}"></span>
              <h6 class="ch-map-tooltip-title">${data?.name ?? '--'}</h6>
              <span class="ch-map-tooltip-state">${CH_EProjectState[data?.state] ?? '--'}</span>
            </div>
          </a>`;
          });
          const template = `
          <div class='ch-map-tooltip-scroll'>
          ${str}
          </div>
          <div class="ch-map-tooltip-detail"></div>
          `;
          return template;
        }
      },
      backgroundColor: 'rgba(6, 39, 65, 1)',
      borderColor: 'rgba(54, 129, 255, 1)',
      borderWidth: 1,
    };
  }

  private mapGeo(): Promise<GeoOption> {
    const image = new Image(1100, 900);
    image.src = texture;
    return new Promise((resolve) => {
      image.onload = () => {
        resolve({
          map: 'china-merge',
          roam: false,
          itemStyle: {
            areaColor: { image, repeat: 'no-repeat' },
            borderColor: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#264571' },
                { offset: 1, color: '#009EFF' },
              ],
            },
            borderWidth: 3,
            shadowBlur: 15,
            shadowColor: 'rgba(51, 149, 216, 1)',
            shadowOffsetY: 10,
          },
          emphasis: undefined,
          select: undefined,
          silent: true,
        });
      };
    });
  }

  private mapSeries(): MapSeriesOption {
    return {
      type: 'map',
      map: 'china',
      geoIndex: 1,
      roam: false,
      selectedMode: false,
      itemStyle: {
        areaColor: 'transparent',
        borderColor: '#009EFF',
        borderWidth: 1,
        shadowBlur: 20,
        shadowColor: 'rgba(109, 178, 236, 0.5)',
      },
      emphasis: undefined,
      select: undefined,
      silent: true,
    };
  }
}
