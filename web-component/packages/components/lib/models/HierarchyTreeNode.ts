export default class HierarchyTreeNode<T> {
	// 
	data: Nullable<T>;
	// 
	children: Nullable<HierarchyTreeNode<T>[]>;
}