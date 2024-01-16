// 对标详情
export const OPTIONS_BG_COLOR = 'rgb(115, 115, 115)';
export const VALUES_BG_COLOR = 'rgb(24, 144, 255)';
export const STANDARDS_BG_COLOR = 'rgb(43, 206, 129)';

// 状态
export enum BENCH_STATUS {
    LOW = 2,
    HIGH = 1,
    NORMAL = 0,
    NODATA = -1,
}

// 对标详情
export enum BENCH_TYPE {
    TITLE = 'title', // 对标项
    VALUE = 'value', // 测量值
    STANDARD = 'standard', // 标准值
}
