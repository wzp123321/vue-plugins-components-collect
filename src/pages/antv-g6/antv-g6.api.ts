export interface Antv_ITreeData {
  id: string;
  label: string;
  deep: number;
  children?: Antv_ITreeData[];
  position: 'left' | 'right' | undefined;
  coverUrl: string;
  size?: number[];
}

export const dataSource: Antv_ITreeData = {
  id: 'root',
  label: 'root',
  deep: 0,
  position: undefined,
  coverUrl: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
  children: [
    {
      id: 'c1',
      label: 'c1',
      position: 'right',
      deep: 1,
      coverUrl: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
      children: [
        {
          id: 'c1-1',
          position: 'right',
          label: 'c1-1',
          coverUrl:
            'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
          deep: 2,
        },
        {
          id: 'c1-2',
          position: 'right',
          label: 'c1-2',
          deep: 2,
          coverUrl:
            'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
          children: [
            {
              id: 'c1-2-1',
              position: 'right',
              label: 'c1-2-1',
              coverUrl:
                'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
              deep: 3,
            },
            {
              id: 'c1-2-2',
              position: 'right',
              label: 'c1-2-2',
              coverUrl:
                'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
              deep: 3,
            },
          ],
        },
      ],
    },
    {
      id: 'c2',
      deep: 1,
      position: 'right',
      coverUrl: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
      label: 'c2',
    },
    {
      id: 'c3',
      label: 'c3',
      deep: 1,
      position: 'right',
      coverUrl: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
      children: [
        {
          id: 'c3-1',
          position: 'right',
          label: 'c3-1',
          coverUrl:
            'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
          deep: 2,
        },
        {
          id: 'c3-2',
          label: 'c3-2',
          position: 'right',
          deep: 2,
          coverUrl:
            'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
          children: [
            {
              position: 'right',
              id: 'c3-2-1',
              label: 'c3-2-1',
              deep: 3,
              coverUrl:
                'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
            },
            {
              id: 'c3-2-2',
              label: 'c3-2-2',
              deep: 3,
              position: 'right',
              coverUrl:
                'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
            },
            {
              id: 'c3-2-3',
              position: 'right',
              label: 'c3-2-3',
              deep: 3,
              coverUrl:
                'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
            },
          ],
        },
        {
          id: 'c3-3',
          label: 'c3-3',
          position: 'right',
          deep: 2,
          coverUrl:
            'https://tse4-mm.cn.bing.net/th/id/OIP-C.59J1oz_Hl8ViPJeEYh-bJAHaHa?w=209&h=210&c=7&r=0&o=5&pid=1.7',
        },
      ],
    },
  ],
};
