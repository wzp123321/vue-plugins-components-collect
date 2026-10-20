export default class Request<T> {
	// 
	domain: Nullable<string>;
	// 
	tenant: Nullable<string>;
	// 
	namespace: Nullable<string>;
	// 
	app: Nullable<string>;
	// 
	timestamp: Nullable<number>;
	// 
	requestId: Nullable<string>;
	// 
	accessKeyId: Nullable<string>;
	// 
	signature: Nullable<string>;
	// 
	nonce: Nullable<string>;
	// 
	uid: Nullable<string>;
	// 
	attributes: Nullable<string>;
}