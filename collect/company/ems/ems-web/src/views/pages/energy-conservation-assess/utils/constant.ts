import store from '@/store';
import { graphic } from 'echarts';

const conservationConstant = {
    light: {
        linearColor: new graphic.LinearGradient(
            0, 0, 0, 1,
            [
                { offset: 0, color: '#9DD2FF' },
                { offset: 1, color: '#2899FF' },
            ],
        ),
    },
    dark: {
        linearColor: new graphic.LinearGradient(
            0, 0, 0, 1,
            [
                { offset: 0, color: '#9DD2FF' },
                { offset: 1, color: '#2899FF' },
            ],
        ),
    },
};

export default conservationConstant[store.getters.theme];

