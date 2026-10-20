import QueryCascape from '../mock/query-cascape';
import LocationDetailQueryRequestVO from '../../../models/LocationDetailQueryRequestVO';
import LocationPathV2DetailResponseVO from '../../../models/LocationPathV2DetailResponseVO';
import LocationV2DetailRequestVO from '../../../models/LocationV2DetailRequestVO';
import LocationV2DetailResponseVO from '../../../models/LocationV2DetailResponseVO';
import LocationV2FuzzyRequestVO from '../../../models/LocationV2FuzzyRequestVO';
import LocationV2LazyTreeResponseVO from '../../../models/LocationV2LazyTreeResponseVO';
import LocationV2FuzzyPageRequestVO from '../../../models/LocationV2FuzzyPageRequestVO';
import RestResult from '../../../models/RestResult';
import PageResult from '../../../models/PageResult';

/**
 * 空间选择组件接口
 */
export default class LocationV2ApiApi {
  //是否是在线文档环境
  static docMode = typeof window !== 'undefined' && window.location.href.includes('ts-package-document');

  /**
   * 空间组件：模糊搜索,返回列表
   *
   * @param tenantId
   * @param body
   */
  static fuzzyQueryForList(
    axios,
    tenantId: string,
    body: LocationV2FuzzyRequestVO
  ): Promise<RestResult<LocationV2DetailResponseVO[]>> {
    if (this.docMode) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let res = QueryCascape.searchData(body.nameLike);
          return resolve(res);
        }, 1000);
      });
    }

    return axios.post(`/hlms/openapi/portal/v2/${tenantId}/location/fuzzyQueryForList`, body, {}).then((res) => {
      return res.data;
    });
  }

  /**
   * 空间组件：模糊搜索,返回分页列表
   *
   * @param tenantId
   * @param body
   */
  static fuzzyQueryForPage(
    axios,
    tenantId: string,
    body: LocationV2FuzzyPageRequestVO
  ): Promise<RestResult<PageResult<LocationV2DetailResponseVO>>> {
    return axios.post(`/hlms/openapi/portal/v2/${tenantId}/location/fuzzyQueryForPage`, body, {}).then((res) => {
      return res.data;
    });
  }

  /**
   * 空间组件：根据id查询路径节点信息,如编辑时初始渲染
   *
   * @param tenantId
   * @param body
   */
  static locationPathForDetail(
    axios,
    tenantId: string,
    body: LocationDetailQueryRequestVO
  ): Promise<RestResult<LocationPathV2DetailResponseVO[]>> {
    if (this.docMode) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let res = QueryCascape.queryEchoData();
          return resolve(res);
        }, 1000);
      });
    }
    return axios
      .post(`/hlms/openapi/portal/v2/${tenantId}/location/LocationPathDetailQueryForList`, body, {})
      .then((res) => {
        return res.data;
      });
  }

  /**
   * 空间组件：级联查询各级列表或树
   *
   * @param tenantId
   * @param body
   */
  static queryLocationV2LazyTree(
    axios,
    tenantId: string,
    body: LocationV2DetailRequestVO
  ): Promise<RestResult<LocationV2LazyTreeResponseVO[]>> {
    if (this.docMode) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let res = QueryCascape.queryLazyData(body.typeEq, body.idEq);
          return resolve(res);
        }, 1000);
      });
    }

    return axios.post(`/hlms/openapi/portal/v2/${tenantId}/location/queryLocationV2LazyTree`, body, {}).then((res) => {
      return res.data;
    });
  }
}
