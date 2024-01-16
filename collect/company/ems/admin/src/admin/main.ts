import { createApp } from 'vue';
import App from './app.vue';

import { ElTree, ElCheckbox, ElLoading } from 'element-plus';

import '../../../style/global.css';
import 'element-plus/dist/index.css';
import '../assets/less/main.less';
import '../assets/less/common-ui-reset.less';

// 创建全局应用
const app = createApp(App);
app.component(ElTree.name, ElTree);
app.component(ElCheckbox.name, ElCheckbox);
app.use(ElLoading);
app.mount('#app');
