export default class TreeQd {
	// 树节点id等于，当不指定时，表示从根开始查询
	idEq: Nullable<string>;
	// 指定向下查询级数，当不传、或传<=0的值表示全量树，否则表示指定向下的n级
	levels: Nullable<number>;
}