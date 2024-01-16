declare namespace HomeModule {
  export interface ComponentPage {
    size: string;
    position: string;
    id: number;
    name: string;
    title: string;
    componentCode: string;
    configContent?: any;
  }
  export interface ComponentItem {
    id?: number;
    name?: string;
    title?: string;
    componentCode?: string;
    styleOption?: object;
    configContent?: any;
  }
  export interface LayoutMapItem {
    colPosition: number;
    rowPosition: number;
    width: number;
    height: number;
    name: string;
    title: string;
    componentCode: string;
    id: number;
    configContent?: any;
  }
}
