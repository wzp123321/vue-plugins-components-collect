const url = {
  // 导出
  downLoad: {
    loadForecastingExport: '/forecast/exportExcelForecastData', // 负荷预测 导出
    energyConservationExport: '/saveenergyquota/downloadSaveEnergyQuotaTemplate', // 节能考核定额配置 导出
    energyRankingExportUrl: '/energyAnalyse/ExportExcelEnergyRanking', // 能耗排名导出
    energyContrastExportUrl: '/energyContrast/exportExcelEnergyContrast', // 能耗对比导出
    exportExcelEnergyAnalyse: '/energyAnalyse/exportExcelEnergyAnalyse', // 导出
    exportCorrelationAnalyseExcel: '/correlationAnalyse/exportCorrelationAnalyseExcel', // 关联分析前台导出
    exportDownloadKpiQuotaTemplate: '/kpiquota/downloadKpiQuotaTemplate', // kpi管理定额配置导出
    exportPeakStatistics: '/peakAnalyse/exportPeakStatistics', // 峰值分析 导出
    exportDownloadTreeTemplate: '/admin/tree/download/template',
    exportDownloadBenchmarkingCorrelationDataTemplate: '/admin/benchmarking/correlation/data/download/template', // 关联参数指标数据维护
    exportDownloadEnvironmentalMonitoringAnalysisUrl: '/environmental/assessment/exportEnvironmentalMonitoringAnalysis', // 环境监测分析
  },
  // 报告报表管理
  reportManagement: {
    queryListUrl: '/report/queryReportList', // 获取列表数据
    deleteUrl: '/report/deleteReport', // 删除
    uploadExcelReportData: '/report/uploadReport', // 上传报告报表
    downloadExcelReportData: '/report/batchDownloadReport', // 批量下载报告报表
    downloadItemExcelReportData: '/report/singleDownloadReport', // 下载单个报告报表
  },
  // 报告报表生成
  reportGeneration: {
    queryListUrl: '/reportCreate/getReportTypeList', // 获取数据
    updateFollowStatus: '/reportCreate/setFollowFlag', // 修改关注状态
    downloadReport: '/reportCreate/downloadReport', // 下载
    isFileUrl: '/reportCreate/existFlag', // 获取文件流前先判断是否有文件
  },
};
export default url;
