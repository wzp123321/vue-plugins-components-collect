export default class UpdateApplicationStatusRequest {
	// id,主键
	id: string = '';
	// 状态: false-下线 true-上线
	status: boolean = false;
}