/**
 * 假数据工具：模拟大屏展示数据
 * 全部基于时间戳/随机数生成，便于每隔几秒轮换
 */

/** 0~max 之间的随机整数 */
const randInt = (max: number) => Math.floor(Math.random() * max);

/** 在区间内生成 count 个等差值，并叠加随机扰动 */
const buildSeries = (
  count: number,
  min: number,
  max: number,
  jitter = 0.2,
): number[] => {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const base = min + step * i;
    const noise = base * jitter * (Math.random() - 0.5) * 2;
    return Math.round(base + noise);
  });
};

/** 当日累计销售额（万元），随时间递增 */
export const getSalesTotal = () => 1280 + randInt(200);

/** KPI 卡片数据 */
export const getKpiCards = () => [
  {
    label: '今日销售额',
    value: getSalesTotal(),
    unit: '万',
    trend: 12.6,
    icon: '￥',
  },
  {
    label: '活跃用户数',
    value: 38620 + randInt(500),
    unit: '人',
    trend: 8.3,
    icon: 'U',
  },
  {
    label: '订单总数',
    value: 9420 + randInt(300),
    unit: '单',
    trend: -1.2,
    icon: 'O',
  },
  {
    label: '支付转化率',
    value: 68.4 + Math.random() * 2,
    unit: '%',
    trend: 3.4,
    icon: '%',
  },
  {
    label: '新增会员',
    value: 1280 + randInt(80),
    unit: '人',
    trend: 15.8,
    icon: 'M',
  },
  {
    label: '客单价',
    value: 156 + randInt(20),
    unit: '元',
    trend: 2.1,
    icon: 'A',
  },
];

/** 过去 7 日的访问与下单趋势（双折线） */
export const getUserTrend = () => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return {
    days,
    pv: buildSeries(7, 8000, 16000, 0.1),
    order: buildSeries(7, 1200, 2400, 0.12),
  };
};

/** 销售漏斗：浏览 -> 加购 -> 下单 -> 支付 */
export const getSalesFunnel = () => [
  { name: '浏览商品', value: 100000 },
  { name: '加入购物车', value: 58000 },
  { name: '提交订单', value: 32000 },
  { name: '完成支付', value: 21600 },
];

/** 业务来源分布（环形图） */
export const getSourceDist = () => [
  { name: '直接访问', value: 3200 },
  { name: '搜索引擎', value: 4800 },
  { name: '广告投放', value: 2100 },
  { name: '社交分享', value: 1700 },
  { name: '外部链接', value: 900 },
];

/** 区域销售分布（柱状图，模拟省份） */
export const getRegionData = () => ({
  regions: [
    '广东',
    '浙江',
    '江苏',
    '上海',
    '北京',
    '四川',
    '山东',
    '湖北',
    '福建',
    '河南',
  ],
  values: buildSeries(10, 200, 1200, 0.15),
});

/** 实时订单流（每次取不同种子以保证滚动） */
export const getRealtimeOrders = () => {
  const products = [
    '智能音箱 Pro',
    '蓝牙耳机 X3',
    '机械键盘 K2',
    '4K 显示器',
    '无线鼠标 M1',
    '电竞椅 V8',
    '智能手表 S5',
    '降噪耳机 NC',
    '扫地机器人 R9',
    '便携投影 P1',
  ];
  const cities = [
    '北京',
    '上海',
    '广州',
    '深圳',
    '杭州',
    '成都',
    '武汉',
    '南京',
    '苏州',
    '重庆',
  ];
  return Array.from({ length: 12 }, (_, i) => ({
    id: `ORD${Date.now().toString().slice(-6)}${i}`,
    product: products[randInt(products.length)],
    city: cities[randInt(cities.length)],
    amount: 99 + randInt(1800),
    status: ['已支付', '配送中', '已完成'][randInt(3)],
  }));
};

/** 热门商品 TOP 排行（带增长百分比） */
export const getTopProducts = () => [
  { name: '智能音箱 Pro', sales: 3250, growth: 28.6 },
  { name: '蓝牙耳机 X3', sales: 2860, growth: 19.2 },
  { name: '机械键盘 K2', sales: 2340, growth: 15.4 },
  { name: '4K 显示器', sales: 1980, growth: 9.8 },
  { name: '电竞椅 V8', sales: 1620, growth: 7.3 },
  { name: '智能手表 S5', sales: 1410, growth: 5.6 },
  { name: '降噪耳机 NC', sales: 1230, growth: 4.2 },
];

/** 支付方式占比（玫瑰图） */
export const getPayChannel = () => [
  { name: '微信支付', value: 4280 },
  { name: '支付宝', value: 3860 },
  { name: '银行卡', value: 1240 },
  { name: '云闪付', value: 320 },
  { name: '其他', value: 180 },
];

/** 整点实时活动（每 2 秒换一行） */
export const getActivityStream = () => {
  const events = [
    '用户 张** 购买了 智能音箱 Pro',
    '用户 李** 加入了会员',
    '用户 王** 提交了订单 ORD02341',
    '用户 赵** 完成了支付',
    '用户 刘** 申请了退款',
    '用户 陈** 评论了商品',
    '店铺 旗舰店A 发起了一场秒杀',
    '仓库 上海仓 出库 256 件',
  ];
  return events[randInt(events.length)];
};
