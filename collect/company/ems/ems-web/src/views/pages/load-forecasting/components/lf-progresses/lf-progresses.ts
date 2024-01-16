import { defineComponent, ref, reactive } from 'vue';

export default defineComponent({
  props: {
    practical: {
      default: 0,
    },
    product: {
      default: 0,
    },
    unit: {
      default: 'kWh',
    },
  },
  setup(props) {
    const img = require('../../../../../assets/img/energy-conservation-assess/ec-blue.png'); //蓝色进度条图片
    const img1 = require('../../../../../assets/img/energy-conservation-assess/ec-red.png'); //红色进度条图片
    const practical: any = ref();
    practical.value = props.practical ? props.practical : '--';
    const product: any = ref();
    product.value = props.product ? props.product : '--';
    const unit = ref<string>();
    unit.value = props.unit;
    // unit.value='t'
    const practical_temp = practical.value;
    const product_temp = product.value;
    const widthNum = ref<any>(); //通过widthNum来判断2套进度条样式
    const width: any = ref();
    const color = ref();
    if (product.value === '--' || practical.value === '--') {
      widthNum.value = 0;
    } else {
      widthNum.value = (
        (parseFloat(practical.value) / parseFloat(product.value)) *
        100
      ).toFixed(2);
    }
    if (!(widthNum.value > 0)) {
      //不为负数
      widthNum.value = 0;
    }
    if (product.value === '--' || practical.value === '--') {
      width.value = 0;
    } else {
      width.value =
        ((parseFloat(practical_temp) / parseFloat(product_temp)) * 100).toFixed(
          2,
        ) + '%'; //计算宽度
    }
    const maxLeft = () => {
      if (widthNum.value >= 100) {
        width.value = 100 + '%';
      }
    };
    maxLeft();
    const bgcolor = (value: any) => {
      if (value <= 0 || !value) {
        color.value = '';
      } else if (value > 0 && value < 100) {
        color.value = `linear-gradient(to right,rgb(43, 255, 193) 0%,
        rgb(24, 144, 255) 100%
      )
      `;
      } else {
        color.value = `linear-gradient(
        to right,
        rgb(43, 255, 193) 0%,
        rgb(24, 144, 255) 50%,
        rgb(245, 34, 45) 100%
      )
      `;
      }
      return color.value;
    };
    const wid = reactive<any>({
      sty: {
        width: `calc(${width.value} - 20px)`,
        background: `${bgcolor(widthNum.value)}`,
      }, //动态的赋予style
      sty1: { left: width.value },
      // transform:widthNum.value<100?`translate(-50%, -46%)`:`translate(-60%, -46%)`
    });
    const formatData = (val: any) => {
      console.log(val);
      if (typeof val === 'number') {
        // return thousandSeparation(val)
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        return val;
      }
    };
    return {
      practical,
      product,
      width,
      wid,
      widthNum,
      maxLeft,
      img,
      img1,
      unit,
      formatData,
    };
  },
});
