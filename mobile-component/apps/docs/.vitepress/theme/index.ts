import DefaultTheme from 'vitepress/theme';
import type { EnhanceAppContext } from 'vitepress';
import Layout from './components/Layout.vue';
import ExampleSourceCode from './components/ExampleSourceCode.vue';
import './styles/custom.css';
export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('ExampleSourceCode', ExampleSourceCode);
  },
};
