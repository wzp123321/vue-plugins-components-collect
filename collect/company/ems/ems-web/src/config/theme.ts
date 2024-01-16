/**
 * 主题配置
 */
const themeOptions: GlobalModule.CommonObject = {
  // 白天模式 -默认
  light: {
    // 颜色
    '--iot-bg-color-root': 'rgb(240, 244, 249)', // 全局基础背景颜色
    '--iot-bg-color-header-menu': 'rgb(23, 26, 28)', // 头部、menu背景色
    '--iot-bg-color-container': 'rgb(240, 244, 249)', // container内容区背景色
    '--iot-font-color-root': 'rgba(0, 0, 0, 0.65)', // 全局基础文本颜色
    '--iot-font-color-white': 'rgb(255, 255, 255)', // 白色字体
    '--iot-font-color-deep': 'rgb(0, 0, 0)', // 深色文本颜色
    '--iot-font-color-shadow': 'rgba(0, 0, 0, 0.45)', // 浅色文本颜色
    '--iot-border-color': 'rgba(0, 0, 0, 0.15)', // 边框颜色
    '--iot-border-color-shadow': 'rgba(0, 0, 0, 0.04)', // 浅色边框颜色
    '--iot-bg-color-component': 'rgb(255, 255, 255)', // 一般组件背景色
    '--iot-color-component-shadow': 'rgba(38, 38, 38, 0.1)', // 一般组件阴影色
    '--iot-color-active': '#1890ff', // active color
    '--iot-color-active-red': 'rgba(255, 0, 0, 1)', // 红色高亮
    '--iot-color-disabled': 'rgba(0, 0, 0, 0.25)',
    '--iot-component-bg-color-white': 'rgb(255, 255, 255)', // 白色背景
    '--iot-color-shadow-primary-1': 'rgba(0, 0, 0, 0.04)', // 浅色-1
    '--iot-color-shadow-primary-2': 'rgba(230, 247, 255, 1)', // 浅色-2
    '--iot-no-data-color': 'rgba(0, 0, 0, 0.25)', // 无数据时提示颜色
    /**
     * page common组件
     */
    '--subhead-title-color': 'rgba(0, 0, 0, 0.85)', // submodule title color
    /**
     * 门户首页
     */
    '--portal-card-title': 'rgba(0, 0, 0, 0.85)',
    '--portal-card-head-bg': '#fff',
    '--portal-card-body-bg': '#fff',
    '--portal-card-head-bg-gradient': 'linear-gradient(rgba(255, 255, 255, 0.1) 0%,rgba(0, 0, 0, 0.1) 100%)',
    '--portal-percent-bg': '#F4F4F4',
    '--portal-compare-card-bg': '#f5f5f5',
    '--portal-compare-card-font': 'rgba(0, 0, 0, 0.65)',
    '--portal-kpi-title-font': 'rgba(0, 0, 0, 0.65)',
    /**
     * switch btn
     */
    '--icon-switch-bg': '#f5f5f5',
    '--icon-switch-selected-bg': '#fff',
    '--icon-switch-sort-icon-color': 'rgba(0, 0, 0, 0.65)',
    /**
     * check-select组件
     */
    '--check-select-scroll-bg': 'rgba(0, 0, 0, 0.02)',
    '--check-item-color': 'rgba(0, 0, 0.65)',
    '--check-select-button-bg': 'rgba(249, 249, 249, 1)',
    '--check-select-button-shadow': 'rgba(0, 0, 0, 0.13)',
    '--check-select-drop-bg': 'rgba(255, 255, 255, 1)',
    '--check-item-hover-color': '#ecf5ff',
    /**
     * 节能考核
     */
    '--energy-conservation-data-normal-bg-color': 'rgb(30, 197, 114)', // 节能考核数据卡片正常背景色
    '--energy-conservation-data-over-bg-color': 'rgb(245,34,45)', // 节能考核数据卡片超出背景色
    '--energy-tips-bg-color': 'rgb(255, 255, 255)', // 节能考核建议背景色
    '--energy-item-title-color': 'rgba(0, 0, 0, 0.65)', // item 标题颜色
    '--energy-item-num-color': 'rgba(0, 0, 0)', // item 标题颜色
    '--energy-item-unit-color': 'rgba(0, 0, 0, 0.45)', // item 标题颜色
    '--energy-tooltip-shadow-border-color': 'rgb(187, 223, 255)', // 节能考核tootip 边框
    '--energy-tooltip-shadow-background-color': 'rgb(251,253,255)', // 节能考核tootip 边框
    '--energy-tooltip-blue-bg-color': 'rgb(240, 248, 255)', // tooltip蓝色背景色
    '--energy-tooltip-yellow-bg-color': 'rgb(255,249,239)', // tooltip蓝色背景色
    '--energy-tooltip-red-bg-color': 'rgb(254, 232, 234)', // tooltip蓝色背景

    '--progress-green-color': 'rgb(43, 255, 193)', // 进度条绿色
    '--progress-blue-color': 'rgb(24, 144, 255)', // 进度条蓝色
    '--progress-yellow-color': 'rgb(255, 161, 0)', // 进度条黄色
    '--progress-red-color': 'rgb(245, 34, 45)', // 进度条绿色
    '--progress-text-color': 'rgba(0, 0, 0, 0.65)',
    '--progress-bg-color': 'rgba(0, 0, 0, 0.15)',
    '--progress-line-color': 'rgb(26, 145, 255)',
    '--progress-tooltip_amount-color': '#fa8c16',
    '--progress-burble-color': 'rgb(255,246,237)',


    '--iot-color-bg-relation': '#fafafa', // 关联分析 关联系数 建议的淡白色建议
    '--iot-color-side-remark': 'rgba(0, 0, 0, 0.65)', // 关联分析 关联系数 建议的淡白色建议

    /**
     * 能耗异常
     */
    '--iot-anomaly-hidden-bg-color': 'rgba(24,144,255,.65)', // 能耗异常隐藏按钮背景色
    '--iot-anomaly-select-bg-color': '#fafdff', // 能耗异常左侧背景色
    '--iot-anomaly-card-icon-bg-color': '#bcbebe', // 能耗异常卡片icon背景色
    '--iot-anomaly-card-count-bg-color': '#f54d42', // 能耗异常卡片数量背景色
    '--iot-anomaly-energycode-select-bg-color': 'rgba(0, 0, 0, .02)', // 能耗异常分类分项类型背景
    '--iot-anomaly-hide-card-item-bg-color': '#edf5fc', // 隐藏卡片背景色
    '--iot-anomaly-contrast-line-bg-shadow-color': '#ffcac7', // 对比异常浅色背景色
    '--iot-anomaly-rank-value-bg-color': 'rgba(245,77,66,.04)', // 数值按钮背景色
    '--iot-anomaly-content-box-shadow-color': 'rgb(0, 0, 0, 0.05)', // 内容区域左侧阴影
    '--iot-anomaly-energycode-icon-bg-color': 'rgba(249, 249, 249, 1)', // 分类分项icon
    '--iot-anomaly-general-bg-color': 'rgba(245,77,66,.04)', // 普通异常背景色
    '--iot-anomaly-serious-bg-color': '#f54d42', // 严重异常背景色
    '--iot-anomaly-card-border-color': '#dce8ff', // 卡片边框


    /**
     * element-plus
     */
    '--el-color-primary': 'rgb(64, 158, 255)',
    '--el-text-color-regular': '#606266',
    '--el-table-border': '1px solid #ebeef5', // 表格边框
    '--el-color-white': 'rgb(255, 255, 255)',
    '--el-color-black': 'rgb(0, 0, 0)000',
    '--el-table-header-font-color': '#909399',
    '--el-table-border-color': 'rgb(255, 255, 255)',
    '--el-color-primary-light-9': '#ecf5ff',
    '--el-tree-node-hover-background-color': '#f5f7fa',
    '--el-datepicker-inrange-background-color': '#f2f6fc',
    '--el-datepicker-border-color': '#e4e7ed',
    '--el-datepicker-inner-border-color': '#e4e7ed',
    // '--el-text-color-placeholder': '#c0c4cc',
  },
  // 黑夜模式
  dark: {
    '--iot-bg-color-root': '#01070b', // 全局基础背景颜色
    '--iot-bg-color-header-menu': 'rgb(23, 26, 28)', // 头部、menu背景色
    '--iot-bg-color-container': '#01070B', // container内容区背景色
    '--iot-font-color-root': 'rgba(255, 255, 255, 0.85)', // 全局基础文本颜色
    '--iot-font-color-white': 'rgb(23, 26, 28)', // 白色颜色
    '--iot-font-color-deep': 'rgba(255, 255, 255, 0.85)', // 深色文本颜色
    '--iot-font-color-shadow': 'rgba(255, 255, 255, 0.75)', // 浅色文本颜色
    '--iot-border-color': 'rgba(255, 255, 255, 0.55)', // 边框颜色
    '--iot-border-color-shadow': 'rgba(255, 255, 255, 0.04)', // 浅色边框颜色
    '--iot-bg-color-component': '#171A1E', // 一般组件背景色
    '--iot-color-component-shadow': 'none', // 一般组件阴影色
    '--iot-color-active': 'rgb(64, 158, 255, 1)', // active color
    '--iot-color-active-red': 'rgba(255, 0, 0, 1)', // 红色高亮
    '--iot-color-disabled': 'rgba(0, 0, 0, 0.25)',
    '--iot-component-bg-color-white': '#171A1E', // 白色背景
    '--iot-color-shadow-primary-1': 'rgba(255, 255, 255, 0.04)', // 浅色-1
    '--iot-color-shadow-primary-2': 'rgba(0, 70, 104, 1)', // 浅色-2
    '--iot-no-data-color': 'rgba(255, 255, 255, 0.45)', // 无数据时提示颜色
    /**
     * page common组件
     */
    '--subhead-title-color': 'rgba(255, 255, 255, 0.85)', // submodule title color
    /**
     * 门户首页
     */
    '--portal-card-title': '#838D98',
    '--portal-card-head-bg': '#22282E',
    '--portal-card-body-bg': '#171A1E',
    '--portal-card-head-bg-gradient': 'linear-gradient(rgba(255, 255, 255, 0.1) 0%,rgba(0, 0, 0, 0.1) 100%)',
    '--portal-percent-bg': '#4F4F4F',
    '--portal-compare-card-bg': '#212529',
    '--portal-compare-card-font': '#838D98',
    '--portal-kpi-title-font': '#838D98',
    /**
     * switch btn
     */
    '--icon-switch-bg': '#212529',
    '--icon-switch-selected-bg': 'rgba(255, 255, 255, 0.08)',
    '--icon-switch-sort-icon-color': 'rgba(255, 255, 255, 1)',
    /**
     * check-select组件
     */
    '--check-select-scroll-bg': '#212529',
    '--check-item-color': 'rgba(255, 255, 255, 0.85)',
    '--check-select-button-bg': 'rgba(255, 255, 255, 0.85)',
    '--check-select-button-shadow': 'rgba(255, 255, 255, 0.5)',
    '--check-select-drop-bg': '#212529',
    '--check-item-hover-color': 'rgba(255, 255, 255, 0.85)',
    /**
     * 节能考核
     */
    '--energy-conservation-data-normal-bg-color': 'rgb(30, 197, 114)', // 节能考核数据卡片正常背景色
    '--energy-conservation-data-over-bg-color': 'rgb(245,34,45)', // 节能考核数据卡片超出背景色
    '--energy-tips-bg-color': 'rgb(0, 0, 0)', // 节能考核建议背景色
    '--energy-item-title-color': 'rgba(0, 0, 0, 0.65)', // item 标题颜色
    '--energy-item-num-color': 'rgba(0, 0, 0)', // item 标题颜色
    '--energy-item-unit-color': 'rgba(0, 0, 0, 0.45)', // item 标题颜色
    '--energy-tooltip-shadow-border-color': 'rgb(187, 223, 255)', // 节能考核tootip 边框
    '--energy-tooltip-shadow-background-color': 'rgb(251,253,255)', // 节能考核tootip 边框
    '--energy-tooltip-blue-bg-color': 'rgb(10, 2, 0)', // tooltip蓝色背景色
    '--energy-tooltip-yellow-bg-color': 'rgb(0, 6, 16)', // tooltip蓝色背景色
    '--energy-tooltip-red-bg-color': 'rgb(1, 13, 21)', // tooltip蓝色背景

    '--progress-green-color': 'rgb(43, 255, 193)', // 进度条绿色
    '--progress-blue-color': 'rgb(48, 144, 255)', // 进度条蓝色
    '--progress-yellow-color': 'rgb(255, 161, 0)', // 进度条黄色
    '--progress-red-color': 'rgb(245, 34, 45)', // 进度条绿色
    '--progress-text-color': 'rgba(0, 0, 0, 0.65)',
    '--progress-bg-color': 'rgba(255, 255, 255, 0.15)',
    '--progress-line-color': 'rgb(26, 145, 255)',
    '--progress-tooltip_amount-color': '#fa8c16',
    '--progress-burble-color': 'rgb(255,246,237)',


    '--iot-color-bg-relation': '#01070b',
    '--iot-color-side-remark': 'rgba(255, 255, 255, 0.85)', // 关联分析 关联系数 建议的淡白色建议

    /**
     * 能耗异常
     */
    '--iot-anomaly-hidden-bg-color': 'rgba(24,144,255,.65)', // 能耗异常隐藏按钮背景色
    '--iot-anomaly-select-bg-color': '#050200', // 能耗异常左侧背景色
    '--iot-anomaly-card-icon-bg-color': '#bcbebe', // 能耗异常卡片icon背景色
    '--iot-anomaly-card-count-bg-color': '#f54d42', // 能耗异常卡片数量背景色
    '--iot-anomaly-energycode-select-bg-color': 'rgba(255, 255, 255, .12)', // 能耗异常分类分项类型背景
    '--iot-anomaly-hide-card-item-bg-color': '#1a1a1a', // 隐藏卡片背景色
    '--iot-anomaly-contrast-line-bg-shadow-color': '#ffcac7', // 对比异常浅色背景色
    '--iot-anomaly-rank-value-bg-color': 'rgba(245,77,66,.04)', // 数值按钮背景色
    '--iot-anomaly-content-box-shadow-color': 'rgb(0, 0, 0, 0.05)', // 内容区域左侧阴影
    '--iot-anomaly-energycode-icon-bg-color': 'rgba(255, 255, 255, .12)', // 分类分项icon
    '--iot-anomaly-general-bg-color': 'rgba(245,77,66,.04)', // 普通异常背景色
    '--iot-anomaly-serious-bg-color': '#f54d42', // 严重异常背景色
    '--iot-anomaly-card-border-color': '#dce8ff', // 卡片边框

    /**
     * element-plus
     */
    '--el-color-primary': '#333',
    '--el-text-color-regular': 'rgba(255, 255, 255, 0.85)',
    '--el-table-border': '1px solid rgb(23, 26, 28)', // 表格边框
    '--el-color-white': 'rgb(0, 0, 0)',
    '--el-color-black': 'rgb(255, 255, 255)',
    '--el-table-header-font-color': 'rgb(255, 255, 255)',
    '--el-table-border-color': 'rgb(23, 26, 28)',
    '--el-color-primary-light-9': 'rgb(40 40 40)',
    '--el-tree-node-hover-background-color': '#f5f7fa',
    '--el-datepicker-border-color': 'rgba(255, 255, 255, 0.35)',
    '--el-datepicker-inner-border-color': 'rgba(255, 255, 255, 0.35)',
    '--el-datepicker-inrange-background-color': '#727578',
    // '--el-text-color-placeholder': '#fff',
  },
};

export default themeOptions;
