import QrCodeTemplateVO from "../models/QrCodeTemplateVO";

export default class QueryPrintConfig {



    static queryModel = () => {
        let data = new QrCodeTemplateVO();
        data.templateStyle = 'BFV4TGS14CNRSTYLE_BASIC';
        return {
            errcode: '0',
            data: data,
            errmsg: '',
            secretFields: [],
        };

    };

}