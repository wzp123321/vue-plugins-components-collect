import { App } from 'vue';
import registerInputFilter from '@/components/directive/input-filter';
const registerInput = (app: App) => {
    app.use(registerInputFilter);
};
export default registerInput;
