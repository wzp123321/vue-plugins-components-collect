import axios from 'axios';
/**
 * url:请求打印服务器地址
 */
var url = 'http://127.0.0.1:888/postek/print';

/**
 * 函数的功能及参数请参考POSTEK.js或者开发文档
 */
export async function print_usb(seletcData) {
  console.log(32333, '打印开始', seletcData);
  PTK_OpenUSBPort(255); //打开打印机USB端口
  await printContent(seletcData); //打印内容
  PTK_CloseUSBPort(); //关闭USB端口
  printing(); //请求数据并打印
}

function print_net() {
  PTK_Connect_Timer('199.9.10.162', 9100, 5); //打开打印机网络端口
  printContent(); //打印内容
  PTK_CloseConnect(); //关闭USB端口
  printing(); //请求数据并打印
}

/*
 *mm:点，毫米转为点，由打印机分辨率决定，默认为300
 * 打印机分辨DPI=203时， mm=8
 * 打印机分辨DPI=300时， mm=12
 * 打印机分辨DPI=600时， mm=24
 */
var mm = 12;
async function printContent(propsConfig, arr) {
  PTK_ClearBuffer(); //*清空缓存
  PTK_SetDarkness(10); //设置打印黑度 取值范围 0-20
  PTK_SetPrintSpeed(4); //设置打印速度
  PTK_SetDirection('B'); //设置打印方向
  PTK_SetLabelHeight(35 * mm, 24, 0, false); //*设置标签高度、间隙及偏移
  PTK_SetLabelWidth(65 * mm); //*设置标签宽度，一定要准确，否则会导致打印内容位置不准确

  for (const item of arr) {
    await printSingle(propsConfig, item);
  }
}

async function printSingle(propsConfig, item) {
  const imgUrl = window.location.protocol + '//' + window.location.host + item.qrCodeImg;
  let baseCode = await getUrlBase64(imgUrl);
  base64 = baseCode.replace('data:image/png;base64,', '');
  PTK_AnyGraphicsPrint_Base64(15 * mm, 4 * mm, 4, 0, 19 * mm, 19 * mm, 0, base64); //打印base64图片

  //########## 测试代码
  //   PTK_DrawBar2D_QREx(15 * mm, 4 * mm, 0, 5, 3, 5, 8, '123', '十点多世纪大道文化较为'); //打印二维码
  //   let imgNetUrl = 'https://www.baidu.com/img/flexible/logo/pc/result.png';
  //   PTK_AnyGraphicsPrint(45 * mm, 4 * mm, 'img', imgUrl, 0, 28 * mm, 28 * mm, 0);
  //   PTK_AnyGraphicsPrint(45 * mm, 4 * mm, 'picture1', imgNetUrl, 0, 28 * mm, 28 * mm, 0); //通过路径打印二维码图片

  //############

  PTK_DrawText_TrueType(37 * mm, 4 * mm, 2.5 * mm, 0, '宋体', 1, 400, 0, 0, 0, `${propsConfig.fieldName1}：`); //打印文字
  PTK_DrawText_TrueType(50 * mm, 4 * mm, 2.5 * mm, 0, '宋体', 1, 400, 0, 0, 0, item.code || '-'); //打印文字
  PTK_DrawText_TrueType(37 * mm, 9 * mm, 2.5 * mm, 0, '宋体', 1, 400, 0, 0, 0, `${propsConfig.fieldName1}：`); //打印文字
  PTK_DrawText_TrueType(50 * mm, 9 * mm, 2.5 * mm, 0, '宋体', 1, 400, 0, 0, 0, item.deptName || '-'); //打印文字
  PTK_DrawText_TrueType(37 * mm, 14 * mm, 2.5 * mm, 0, '宋体', 1, 400, 0, 0, 0, `${propsConfig.fieldName1}：`); //打印文字
  PTK_DrawText_TrueType(50 * mm, 14 * mm, 2.5 * mm, 0, '宋体', 1, 400, 0, 0, 0, item.majorName || '-'); //打印文字
  PTK_DrawText_TrueType(37 * mm, 19 * mm, 2.5 * mm, 0, '宋体', 1, 400, 0, 0, 0, `${propsConfig.fieldName1}：`); //打印文字
  PTK_DrawText_TrueType(50 * mm, 19 * mm, 2.5 * mm, 0, '宋体', 1, 400, 0, 0, 0, item.activeDate || '-'); //打印文字
  PTK_DrawText_TrueType(15 * mm, 24 * mm, 2.5 * mm, 0, '宋体', 1, 400, 0, 0, 0, `${propsConfig.fieldName1}：`); //打印文字
  PTK_DrawText_TrueType(28 * mm, 24 * mm, 2.5 * mm, 0, '宋体', 1, 400, 0, 0, 0, item.name || '-'); //打印文字
  PTK_DrawText_TrueType(15 * mm, 28 * mm, 3 * mm, 0, '宋体', 1, 400, 0, 0, 0, `${propsConfig.fieldName1}：`); //打印文字

  let rfidCode = stringToHex(item.code ? item.code : 0);
  let len = rfidCode.length / 2;
  //字节数非偶数，后面补两个0
  if (len % 2 !== 0) {
    rfidCode = String(rfidCode) + '00';
    len = len + 1;
  }
  console.log('允许跨域打印', rfidCode, len);
  PTK_RWRFIDLabelEx(1, 0, 0, len, 1, rfidCode); //写RFID数据 具体参数请查看文档 			      写数据之前确保RFID标签已经校准成功
  PTK_PrintLabel(1, 1); //打印，必须要执行这一行，否则不会打印
}

function printing() {
  var data = {};
  data.reqParam = '1';
  data.printparams = JSON.stringify(printparamsJsonArray);
  // jQuery.support.cors = true; //适用于IE浏览器
  clean(); //此函数必须使用
  // $.ajax({
  //   type: 'POST',
  //   url: url,
  //   data: data,
  //   dataType: 'json',
  //   timeout: 5000, // in milliseconds
  //   headers: {
  //     'Access-Control-Allow-Origin': '*',
  //   },
  //   success: function (result) {
  //     if (result.retval == '0') {
  //       alert('运行成功！');
  //     } else {
  //       alert('存在错误，返回结果：' + result.msg);
  //     }
  //   },
  //   error: function (request, status, err) {
  //     alert('请求失败，请检查参数是否正确或服务是否开启');
  //   },
  // });

  axios
    .post(url, data, {
      withCredentials: true, // 是否携带跨域请求中的凭据
      headers: {
        'Access-Control-Allow-Origin': 'http://example.com', // 允许的跨域访问的域名
      },
    })
    .then((result) => {
      // 处理响应
      if (result.retval == '0') {
        alert('运行成功！');
      } else {
        alert('存在错误，返回结果：' + result.msg);
      }
    })
    .catch((error) => {
      // 处理错误
      alert('请求失败，请检查参数是否正确或服务是否开启');
    });
}

/**
 * @param url 图片路径,图片转base64
 */
function getUrlBase64(url) {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let img = new Image();
    img.crossOrigin = 'Anonymous'; //解决Canvas.toDataURL 图片跨域问题
    img.src = url;
    img.onload = function () {
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0, img.width, img.height); //参数可自定义
      const dataURL = canvas.toDataURL('image/png', 1); //获取Base64编码
      resolve(dataURL);
      canvas = null; //清除canvas元素
      img = null; //清除img元素
    };
    img.onerror = function () {
      reject(new Error('Could not load image at ' + url));
    };
  });
}

/**
 *
 * @param {*} str 字符串unicode转16进制
 * @returns
 */
function stringToHex(str) {
  var val = '';
  for (var i = 0; i < str.length; i++) {
    val += str.charCodeAt(i).toString(16);
  }
  return val;
}
