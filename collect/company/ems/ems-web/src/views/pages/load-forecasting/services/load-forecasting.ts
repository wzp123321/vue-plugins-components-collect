import { postRequest } from '@/services/request';

const loadForecatService = {
  /**
   * 获取负荷预测列表
   * @param params
   * @returns
   */
  async getForecastDataUrl(
    params: loadForecatService.getForecastDataUrlType,
  ): Promise<HttpRequestModule.ResTemplate<loadForecatService.returnForecastDataUrlType>> {
    const res: HttpRequestModule.ResTemplate<loadForecatService.returnForecastDataUrlType> = await postRequest(
      '/forecast/getForecastData',
      params,
    );
    return res;
  },
};

export default loadForecatService;
