// 修改应用实例上下线状态
export default class ModifyApplicationStatusRequest {
	// id,主键
	id: string = '';
	// 状态: false-下线 true-上线
	status: boolean = false;
}