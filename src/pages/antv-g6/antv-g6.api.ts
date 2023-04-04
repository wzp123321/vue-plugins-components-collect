export const tooltipStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  maxWidth: '240px',
  minHeight: '160px',
  borderRadius: '8px',
  padding: '10px',
  color: 'var(--color-default)',

  wordBreak: 'break-all;',
  wordWrap: 'break-word;',
  whiteSpace: 'pre-wrap',
};

export interface Antv_ITreeData {
  id: string;
  label: string;
  deep: number;
  children?: Antv_ITreeData[];
  position: 'left' | 'right' | undefined;
  isRoot: boolean;
  coverUrl: string;
  size?: number[];
  dynasty: string; // 朝代
  description: string;
}

export const dataSource: Antv_ITreeData = {
  id: 'root',
  label: '秦始皇',
  deep: 0,
  position: undefined,
  isRoot: true,
  coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
  dynasty: '秦',
  description:
    '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
  children: [
    {
      id: 'c1',
      label: '秦始皇',
      position: 'right',
      deep: 1,
      coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
      isRoot: false,
      dynasty: '秦',
      description:
        '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
      children: [
        {
          id: 'c1-1',
          position: 'right',
          label: '秦始皇',
          coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
          isRoot: false,
          deep: 2,
          description:
            '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
          dynasty: '秦',
        },
        {
          id: 'c1-2',
          position: 'right',
          label: '秦始皇',
          deep: 2,
          isRoot: false,
          coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
          dynasty: '秦',
          description:
            '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
          children: [
            {
              id: 'c1-2-1',
              position: 'right',
              dynasty: '秦',
              label: '秦始皇',
              coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
              isRoot: false,
              description:
                '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
              deep: 3,
            },
            {
              id: 'c1-2-2',
              position: 'right',
              dynasty: '秦',
              label: '秦始皇',
              coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
              isRoot: false,
              description:
                '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
              deep: 3,
            },
          ],
        },
      ],
    },
    {
      id: 'c2',
      isRoot: false,
      dynasty: '秦',
      deep: 1,
      position: 'right',
      coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
      description:
        '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
      label: '秦始皇',
    },
    {
      id: 'c3',
      label: '秦始皇',
      dynasty: '秦',
      isRoot: false,
      deep: 1,
      description:
        '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
      position: 'left',
      coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
      children: [
        {
          id: 'c3-1',
          position: 'left',
          label: '秦始皇',
          isRoot: false,
          dynasty: '秦',
          coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
          description:
            '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
          deep: 2,
        },
        {
          id: 'c3-2',
          label: '秦始皇',
          position: 'left',
          deep: 2,
          dynasty: '秦',
          description:
            '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
          isRoot: false,
          coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
          children: [
            {
              position: 'left',
              id: 'c3-2-1',
              description:
                '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
              label: '秦始皇',
              isRoot: false,
              dynasty: '秦',
              deep: 3,
              coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
            },
            {
              id: 'c3-2-2',
              label: '秦始皇',
              description:
                '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
              dynasty: '秦',
              deep: 3,
              position: 'left',
              isRoot: false,
              coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
            },
            {
              id: 'c3-2-3',
              position: 'left',
              dynasty: '秦',
              isRoot: false,
              description:
                '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
              label: '秦始皇',
              deep: 3,
              coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
            },
          ],
        },
        {
          id: 'c3-3',
          label: '秦始皇',
          description:
            '秦始皇嬴政（前259年—前210年），嬴姓，赵氏，名政（一说名“正”），又称赵政、祖龙，也有吕政一说（详见“人物争议-姓名之争”目录）。秦庄襄王和赵姬之子。 中国古代杰出的政治家、战略家、改革家，首次完成中国大一统的政治人物，也是中国第一个称皇帝的君主。',
          dynasty: '秦',
          position: 'left',
          isRoot: false,
          deep: 2,
          coverUrl: require('../../assets/images/g6/g6-emperor.jpg'),
        },
      ],
    },
  ],
};
