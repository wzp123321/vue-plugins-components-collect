import {
  CountDown,
  AnimationRecharge,
  AnimationRollingOver,
  AnimationSurround,
  AnimationLightSwitch,
  AnimationLottery,
  AnimationClickHeart,
  AnimationAddShoppingTrolley,
} from './index';
export const customComponents: { description: string; component: any }[] = [
  {
    description: '倒数动画',
    component: CountDown,
  },
  {
    description: '电量动画',
    component: AnimationRecharge,
  },
  {
    description: '卡片翻转',
    component: AnimationRollingOver,
  },
  {
    description: '环绕',
    component: AnimationSurround,
  },
  {
    description: '红绿灯切换',
    component: AnimationLightSwitch,
  },
  {
    description: '幸运大抽奖',
    component: AnimationLottery,
  },
  {
    description: '点击小红心',
    component: AnimationClickHeart,
  },
  {
    description: '加入购物车',
    component: AnimationAddShoppingTrolley,
  },
];
