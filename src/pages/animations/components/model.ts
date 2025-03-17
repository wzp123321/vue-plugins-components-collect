import { CountDown, AnimationRecharge, AnimationRollingOver, AnimationSurround } from './index';
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
];
