import { NS, USER_TOKEN_KEY, TENANT_INFO_KEY,TS_LOGIN_INFO } from "../constants";
import { decrypt, encrypt } from "./cryptoUtil";
type StorageType = "localStorage" | "sessionStorage";
type SerializeType = string | object | Array<unknown>;
const whitelist = [USER_TOKEN_KEY, TENANT_INFO_KEY,TS_LOGIN_INFO];

/**
 * 是否是公共key
 */
const isPublicKey = (key: string) => {
	return whitelist.includes(key);
};
/**
 * @description  反序列化
 * @param serializedJavascript
 * @returns
 */
const serialize = (json: SerializeType): string => {
	let data = "";
	try {
		data = JSON.stringify(json);
	} catch (error) {
		throw new Error("Data formatting error");
	}
	return data;
};
/**
 * @description  反序列化
 * @param serializedJavascript
 * @returns
 */
const deserialize = (str: string) => {
	let data = "";
	try {
		data = JSON.parse(str);
	} catch (error) {
		throw new Error("Data parsing error");
	}
	return data;
};

/**
 * @description 重新设置key
 * @param ns 命名空间
 * @param k 存储的key
 * @returns 命名空间组合后的key
 */
const setKey = (ns: string, k: string) => {
	if (isPublicKey(k)) return k;
	return `${ns}-${k}`;
};
/**
 * 重写storage
 */
export class StorageCus {
	private _instance: StorageCus | null;
	constructor(public _storage: Storage, public _namespace: string) {
		this._instance = null;
	}
	setItem(key: string, value: SerializeType) {
		const data = serialize(value); // 加密todo....
		const keyVal = setKey(this._namespace, key);
		this._storage.setItem(keyVal, encrypt(data));
	}
	getItem(key: string) {
		const keyVal = setKey(this._namespace, key);
		let data = this._storage.getItem(keyVal);
		try {
			data = data && deserialize(decrypt(data)); // 解密todo....
		} catch (error: unknown) {
			if (!(error as Error).message && !(error as Error).message.includes("Malformed")) {
				data = data && deserialize(data);
			}
		}
		return data;
	}
	removeItem(key: string) {
		this._storage.removeItem(key);
	}
	clear() {
		this._storage.clear();
	}
	key(index: number) {
		return this._storage.key(index);
	}
	get length() {
		return this._storage.length;
	}
}

export const createStorage = (type: StorageType = "localStorage", namespace = NS): StorageCus => {
	try {
		const oldStorage = window[type];
		if (!oldStorage) throw new Error("LocalStorage is not existing");
		return new StorageCus(oldStorage, namespace);
	} catch (error) {
		throw new Error(`${type} is not existing`);
	}
};
