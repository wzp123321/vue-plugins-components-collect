import Pair from './Pair';
export default class MutablePair<L, R> extends Pair<L, R> {
	// 
	left: Nullable<L>;
	// 
	right: Nullable<R>;
}