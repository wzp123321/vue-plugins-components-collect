import dayjs from 'dayjs';

/**
 * 设置月份数据
 * @param {string|Date} date - 日期
 * @param {Array} customList - 自定义信息列表
 * @param {boolean} lunar - 是否显示农历
 * @param {Function} getLunar - 获取农历信息的函数
 * @returns {Array} 月份数据
 */
export const setMonth = (
  date: string | Date,
  customList: any[],
  lunar: boolean,
  getLunar: (date: string) => { IDayCn: string; IMonthCn: string }
) => {
  // 月初是周几
  const day = dayjs(date).date(1).day();
  const start = day === 0 ? 6 : day - 1;

  // 本月天数
  const days = Number(dayjs(date).endOf('month').format('D'));

  // 上个月天数
  const prevDays = Number(dayjs(date).endOf('month').subtract(1, 'month').format('D'));

  // 日期数据
  const arr: any[] = [];

  // 添加上月数据
  arr.push(
    ...new Array(start).fill(1).map((e, i) => {
      const day = prevDays - start + i + 1;

      return {
        value: day,
        disabled: true,
        date: dayjs(date).subtract(1, 'month').date(day).format('YYYY-MM-DD'),
      };
    })
  );

  // 添加本月数据
  arr.push(
    ...new Array(days).fill(1).map((e, i) => {
      const day = i + 1;

      return {
        value: day,
        date: dayjs(date).date(day).format('YYYY-MM-DD'),
      };
    })
  );

  // 添加下个月
  arr.push(
    ...new Array(42 - days - start).fill(1).map((e, i) => {
      const day = i + 1;

      return {
        value: day,
        disabled: true,
        date: dayjs(date).add(1, 'month').date(day).format('YYYY-MM-DD'),
      };
    })
  );

  // 分割数组
  const month: any[] = [];
  for (let n = 0; n < arr.length; n += 7) {
    month.push(
      arr.slice(n, n + 7).map((e, i) => {
        e.index = i + n;

        // 自定义信息
        const custom = customList.find(c => c.date === e.date);

        // 农历
        if (lunar) {
          const { IDayCn, IMonthCn } = getLunar(e.date);
          e.lunar = IDayCn === '初一' ? IMonthCn : IDayCn;
        }

        return {
          ...e,
          ...custom,
        };
      })
    );
  }

  return month;
};
