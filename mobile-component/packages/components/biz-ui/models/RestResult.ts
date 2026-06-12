export default class RestResult<T> {
	// 
	data: Nullable<T>;
	// 
	errcode: Nullable<string>;
	// 
	errmsg: Nullable<string>;
	// 
	secretFields: Nullable<string[]>;
}