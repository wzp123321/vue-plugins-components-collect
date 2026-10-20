import * as vIcon from '@arco-iconbox/vue-te-side';
import { createVNode } from 'vue';
    type Props = {
    name: string;
};
//将下划线，横线的名称转为驼峰，且首字母转为大写
function getCamelCase (str: string) {
if (!str) {
    return '';
}
str = 'Icon' + str.slice(0, 1).toUpperCase() + str.slice(1);
return str.replace (/[-_](\w)/g, function (all, letter) {
    return letter.toUpperCase();
});
}
const Icon = (props: Props) => {
    const { name } = props;
    const iconName = getCamelCase(name);
    return createVNode(vIcon[iconName]);
};
export default Icon;    