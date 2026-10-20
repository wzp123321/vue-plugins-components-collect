import QueryPrintConfig from '../mock/query-print-config';
import QrCodeTemplateQueryRequestVO from '../models/QrCodeTemplateQueryRequestVO';
import QrCodeTemplateVO from '../models/QrCodeTemplateVO';
import RestResult from '../models/RestResult';

/**
 * 二维码打印管理
 */
export default class PrintTemplateV2ApiApi {

	//是否是在线文档环境
	static docMode = typeof window !== 'undefined' && window.location.href.includes('ts-package-document');

	/**
	 * 根据模板查询二维码模板配置详情
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static getQrCodeTemplateDetailByKey(axios, tenantId: string, body: QrCodeTemplateQueryRequestVO): Promise<RestResult<QrCodeTemplateVO>> {

		if (this.docMode) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					let res = QueryPrintConfig.queryModel();
					return resolve(res)
				}, 1000)
			})
		}

		return axios.post(`/hlms/openapi/portal/v2/${tenantId}/qrcode/getQrCodeTemplateDetailByKey`, body, {}).then((res) => {
			return res.data
		})
	}

}