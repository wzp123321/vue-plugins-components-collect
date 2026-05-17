/*
 * @Author: wzp123321 wanzhipengx@163.com
 * @Date: 2024-01-29 21:28:41
 * @LastEditors: wzp123321 wanzhipengx@163.com
 * @LastEditTime: 2024-01-29 21:37:37
 * @FilePath: \vue-plugins-components-collect\src\demo\tree-select-transfer\utils\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const mapArrayFlat = () => {
  const list = [
    {
      id: 1,
      name: '1231',
      children: [
        {
          id: 2,
          name: '21231',
          children: [
            {
              id: 4,
              name: '12331',
              children: [
                {
                  id: 1,
                  name: '1231',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  console.log(list.flat(Infinity));
};
