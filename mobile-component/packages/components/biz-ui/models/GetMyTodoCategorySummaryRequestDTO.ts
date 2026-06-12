export default class GetMyTodoCategorySummaryRequestDTO {
	// 员工id（无Authorization时必填）
	employeeId: Nullable<string>;
	// 业务分类编码
	businessCategoryCode: Nullable<string>;
}