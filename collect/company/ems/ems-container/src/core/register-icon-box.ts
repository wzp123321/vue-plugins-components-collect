import {
  IconHome,
  IconDataLine,
  IconExamine,
  IconHosted,
  IconGreenEnergy,
  IconBrain,
  IconEnergy,
  IconAlarm,
  IconMonitor,
} from '@arco-iconbox/vue-te';
import { App } from 'vue';

/**
 * 注册iconbox
 * @param app
 */
const registerIconBox = (app: App) => {
  const components = [
    IconHome,
    IconDataLine,
    IconExamine,
    IconHosted,
    IconGreenEnergy,
    IconBrain,
    IconEnergy,
    IconAlarm,
    IconMonitor,
  ];
  components?.forEach((c) => {
    app.component(c.name, c);
  });
};

export default registerIconBox;
