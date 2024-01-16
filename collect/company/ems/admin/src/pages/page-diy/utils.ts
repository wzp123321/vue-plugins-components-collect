export interface LayoutItem {
    x: number;
    y: number;
    w: number;
    h: number;
    i: number;
}
import { cloneDeep } from 'lodash';
/**
 * 校验布局是否合法
 * 1.深拷贝数组，避免污染原数组
 * 2.拿到y的最大值 用于遍历
 * 3.拿到每个y的分数组 按照x升序排列
 * 4.如果数组长度为1判断w是否等于最大x
 * 5.如果数组长度不为1 遍历数组 判断每个元素的w是否等于下一个元素的x 累加w判断总和是否等于最大x
 * 6.如果合法则返回false
 * @param list
 * @returns
 */
export const verifyLayout = (list: LayoutItem[]): boolean => {
    let yList = list.map((item) => {
        return item.y;
    });
    yList = yList.sort((a, b) => {
        return a - b;
    });
    const newArr = cloneDeep(list);
    let flag = false;
    const maxY = yList[yList.length - 1];
    const maxX = 3;
    for (let i = 0; i <= maxY; i++) {
        let arr = newArr.filter((item: LayoutItem) => {
            return item.y === i;
        });
        console.log(arr, arr.length);
        if (arr && arr.length > 1) {
            let calValue = 0;
            arr = arr.sort((a: LayoutItem, b: LayoutItem) => {
                return a.x - b.x;
            });
            arr.forEach((childItem: LayoutItem, index: number) => {
                calValue += childItem.w;
                if (index !== arr.length - 1 && calValue !== arr[index + 1].x) {
                    flag = true;
                }
                if (index === arr.length - 1 && calValue !== maxX) {
                    flag = true;
                }
            });
        } else {
            if (arr[0].w !== maxX) {
                flag = true;
            }
        }
    }
    return flag;
};
