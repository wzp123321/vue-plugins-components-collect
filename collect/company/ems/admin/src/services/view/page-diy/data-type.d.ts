declare module 'vue-grid-layout';
declare namespace pageDiyHttp {
    export interface GetInitType {
        x: number,
        y: number,
        w: number,
        h: number,
        componentCode: any,
        id: string,
        name: string,
        sketchMap: string,
    }
    export interface AddQueryComponents {
        pageNum: number,
        pageSize: number,
        searchCount: boolean,
    }
}
declare namespace pageDiyData {
    /** 通用对象 */
    interface CommonObject {
        [key: string]: any;
    }

    export interface IntroduceData {
        id: number;
        componentCode: string;
        componentTitle: string;
        componentDescription: string;
        componentPictureUri: string;
    }

}