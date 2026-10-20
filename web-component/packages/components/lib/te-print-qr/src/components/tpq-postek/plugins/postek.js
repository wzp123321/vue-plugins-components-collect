var printparamsJsonArray = [];
var url = 'http://127.0.0.1:888/postek/print';

/*清空数据*/
function clean() {
  printparamsJsonArray = [];
}

/**
 *@description  日志功能
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description 开启日志功能,并指定log生成路径
 * @param {String} filePath 指定生成的日志的路径
 */
function PTK_OpenLogMode(filePath) {
  printparamsJsonArray.push({ PTK_OpenLogMode: filePath });
}

/**
 * @description 关闭日志功能
 */
function PTK_CloseLogMode() {
  printparamsJsonArray.push({ PTK_CloseLogMode: '' });
}

/**
 * @@description 打印机通讯
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description  打开USB通讯端口
 * @param {Number} px USB端口号，取值范围1-255；PC只连接一台打印机是取值255即可，有多台时请使用PTK_GetAllPrinterUSBInfo获取
 */
function PTK_OpenUSBPort(px) {
  printparamsJsonArray.push({ PTK_OpenUSBPort: px });
}

/**
 * @description 关闭USB通讯端口；打开端口打印完后需要关闭端口
 */
function PTK_CloseUSBPort() {
  printparamsJsonArray.push({ PTK_CloseUSBPort: '' });
}

/**
 * @description 连接打印机网络
 * @param {String} IPAddress 打印机IP地址
 * @param {Number} Port 打印机网络端口
 */
function PTK_Connect(IPAddress, Port) {
  printparamsJsonArray.push({ PTK_Connect: IPAddress + ',' + Port });
}

/**
 * @description 连接打印机网络，可以设置连接超时时间
 * @param {String} IPAddress 打印机ip地址
 * @param {Number} Port 打印机网络端口
 * @param {Number} time 超时时间
 */
function PTK_Connect_Timer(IPAddress, Port, time) {
  printparamsJsonArray.push({ PTK_Connect_Timer: IPAddress + ',' + Port + ',' + time });
}

/**
 * @description 关闭打印机网络端口
 */
function PTK_CloseConnect() {
  printparamsJsonArray.push({ PTK_CloseConnect: '' });
}

/**
 * @description 打开一个串口
 * @param {Number} port 串口端口号,取值范围1~255
 * @param {Number} bRate 打印机的串口波特率,取值为9600,19200,38400,57600
 */
function PTK_OpenSerialPort(port, bRate) {
  printparamsJsonArray.push({ PTK_OpenSerialPort: port + ',' + bRate });
}

/**
 * @description  关闭已打开的串口
 */
function PTK_CloseSerialPort() {
  printparamsJsonArray.push({ PTK_CloseSerialPort: '' });
}

/**
 * @description  打开一个打印机驱动;驱动端口仅支持发送数据到打印机，不能从打印机读取数据。
 * @param {String} printerName 打印机名称
 */
function PTK_OpenPrinter(printerName) {
  printparamsJsonArray.push({ PTK_OpenPrinter: printerName });
}

/**
 * @description 关闭已经打开的打印机驱动
 */
function PTK_ClosePrinter() {
  printparamsJsonArray.push({ PTK_ClosePrinter: '' });
}

/**
 * @description 打开一个并口
 * @param {Number} port 并口端口号，取值范围1~3
 */
function PTK_OpenParallelPort(port) {
  printparamsJsonArray.push({ PTK_OpenParallelPort: port });
}

/**
 * @description 创建一个文件，发送到打印机的数据将被写入到该文件。备注:每次调用会重新创建文件，覆盖上一次的内容。
 * @param {Number} fn  要创建的文件路径
 */
function PTK_OpenTextPort(fn) {
  printparamsJsonArray.push({ PTK_OpenTextPort: fn });
}

/**
 * @description  关闭已打开的文件
 */
function PTK_CloseTextPort() {
  printparamsJsonArray.push({ PTK_CloseTextPort: '' });
}

/**
 * @description 创建一个缓冲区，发送到打印机的内容将写到缓冲区，并打开一个USB端口;调用PTK_WriteBuffToPrinter会将缓冲区的内容一次性发送到打开的端口
 * @param {Number} portNum USB端口号。取值范围1~255
 */
function PTK_OpenUSBPort_Buff(portNum) {
  printparamsJsonArray.push({ PTK_OpenUSBPort_Buff: portNum });
}

/**
 * @description 创建一个缓冲区，发送到打印机的内容将写到缓冲区，并打开一个驱动端口;调用PTK_WriteBuffToPrinter会将缓冲区的内容一次性发送到打开的端口
 * @param {String} 打印机名称
 */
function PTK_OpenPrinter_Buff(portNum) {
  printparamsJsonArray.push({ PTK_OpenPrinter_Buff: portNum });
}

/**
 * @description 释放缓冲区，关闭打开的端口
 */
function PTK_CloseBuffPort() {
  printparamsJsonArray.push({ PTK_CloseBuffPort: '' });
}

/**
 * @description 将缓冲区的内容发送到打开的端口;在缓冲区中请不要调用有读取数据功能的API函数，否则会导致端口阻塞
 */
function PTK_WriteBuffToPrinter() {
  printparamsJsonArray.push({ PTK_WriteBuffToPrinter: '' });
}

/**
 * @description 创建一个缓冲区，发送到打印机的内容将写到缓冲区，并打开一个网络端口;调用PTK_WriteBuffToPrinter会将缓冲区的内容一次性发送到打开的端口
 * @param {String} IPAddr 打印机的IP地址
 * @param {String} netPort 打印机的网络端口（一般为9100
 * @param {Number} time_sec 设置连接等待的最大时间，单位秒
 */
function PTK_Connect_Timer_Buff(IPAddr, netPort, time_sec) {
  printparamsJsonArray.push({ PTK_Connect_Timer_Buff: IPAddr + ',' + netPort + ',' + time_sec });
}

/**
 * @description 发送文件内容到打印机
 * @param {String} FilePath 要发送的文件所在路径
 */
function PTK_SendFile(FilePath) {
  printparamsJsonArray.push({ PTK_SendFile: FilePath });
}

/**
 * @description 发送指令数据到打印机
 * @param {String} data 指令数据
 * @param {Number} datalen 指令数据长度
 */
function PTK_SendCmd(data, datalen) {
  printparamsJsonArray.push({ PTK_SendCmd: data + ',' + datalen });
}

/**
 * @description  发送数据到打印机
 * @param {Number} charset 数据格式；取值0或1 0-GBK 1-UTF-8
 * @param {String} data  数据内容
 */
function PTK_SendString(charset, data) {
  printparamsJsonArray.push({ PTK_SendString: charset + ',' + data });
}

/**
 * @description 用于获取当前所有用USB连接的打印机的USB端口信息;只支持用USB读取，读取前需连接USB线并打开打印机。此函数不需要打开一组端口即可调用
 * @param {String} USBInfo 端口信息名称
 * @param {Number} infoSize USBInfo的空间大小
 */
function PTK_GetAllPrinterUSBInfo(USBInfo, infoSize) {
  printparamsJsonArray.push({ PTK_GetAllPrinterUSBInfo: USBInfo + ',' + infoSize });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 打印机设置
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description 命令打印机打印自检页
 */
function PTK_PrintConfiguration() {
  printparamsJsonArray.push({ PTK_PrintConfiguration: '' });
}

/**
 * @description 命令打印机执行标签定位校准
 */
function PTK_MediaDetect() {
  printparamsJsonArray.push({ PTK_MediaDetect: '' });
}

/**
 * @description  命令打印机进纸固定长度;◆ 不是所有的机型都有这个功能
 * @param {Number} feedLen 前进的长度 ，参数类型为 正 整数
 */
function PTK_UserFeed(feedLen) {
  printparamsJsonArray.push({ PTK_UserFeed: feedLen });
}

/**
 * @description 命令打印机退纸固定长度;◆ 不是所有的机型都有这个功能
 * @param {Number} feedLen ：后退的长度 ，参数类型为 正 整数
 */
function PTK_UserBackFeed(feedLen) {
  printparamsJsonArray.push({ PTK_UserBackFeed: feedLen });
}

/**
 * @description 命令打印机打开 FLASH存储，调用与存储相关的 API函数，数据会被存储到打印机 FLASH中。◆ 存储成功的数据断电不丢失
 */
function PTK_EnableFLASH() {
  printparamsJsonArray.push({ PTK_EnableFLASH: '' });
}

/**
 * @description 关闭数据存储到打印机 FLASH
 */
function PTK_DisableFLASH() {
  printparamsJsonArray.push({ PTK_DisableFLASH: '' });
}

/**
 * @description  命令打印机打印一张空白标签
 */
function PTK_FeedMedia() {
  printparamsJsonArray.push({ PTK_FeedMedia: '' });
}

/**
 * @description 设置切纸频率。◆ 只支持配切刀打印机
 * @param {Number} page 切纸频率 。 参数类型为整数
 */
function PTK_CutPage(page) {
  printparamsJsonArray.push({ PTK_CutPage: page });
}

/**
 * @description 设置切纸频率；掉电无效 。◆ 只支持配切刀打印机
 * @param {Number} page 切纸频率 。 参数类型为整数
 */
function PTK_CutPageEx(page) {
  printparamsJsonArray.push({ PTK_CutPageEx: page });
}

/**
 * @description 设置打印的坐标原点；不推荐使用
 * @param {Number} px 横轴坐标
 * @param {Number} py 纵轴坐标
 */
function PTK_SetCoordinateOrigin(px, py) {
  printparamsJsonArray.push({ PTK_SetCoordinateOrigin: px + ',' + py });
}

function PTK_GetUtilityInfo(infoNum, data, dataSize) {
  printparamsJsonArray.push({ PTK_GetUtilityInfo: infoNum + ',' + data + ',' + dataSize });
}

function PTK_GetAllPrinterInfo(infoNum, fileflag, data, dataSize) {
  printparamsJsonArray.push({ PTK_GetAllPrinterInfo: infoNum + ',' + fileflag + ',' + data + ',' + dataSize });
}

/**
 * @description 通过USB中断实时获取打印机状态，解析见开发手册-打印机状态代码解析
 * @param {String} status 自定义打印机状态名称
 */
function PTK_ErrorReport_USBInterrupt(status) {
  printparamsJsonArray.push({ PTK_ErrorReport_USBInterrupt: status });
}

function PTK_GetPrinterName(PrinterName) {
  printparamsJsonArray.push({ PTK_GetPrinterName: PrinterName });
}

function PTK_GetPrinterDPI(dpi) {
  printparamsJsonArray.push({ PTK_GetPrinterDPI: dpi });
}

function PTK_GetPrinterKey_USB(printerKey) {
  printparamsJsonArray.push({ PTK_GetPrinterKey_USB: printerKey });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 标签设置
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description 清除打印机中的缓冲内容;建议在打印内容之前使用它以防止打印机有残留数据导致打印失败。不能在储存表单的过程中使用，否则会创建表单失败
 */
function PTK_ClearBuffer() {
  printparamsJsonArray.push({ PTK_ClearBuffer: '' });
}

/**
 * @description  设置当前标签打印速度;不同机型的最大打印速度存在差异，若设置值超出该机型的最大打印速度则不生效
 * @param {Number} px 打印速度。取值请参考开发手册
 */
function PTK_SetPrintSpeed(px) {
  printparamsJsonArray.push({ PTK_SetPrintSpeed: px });
}

/**
 * @description 设置当前标签打印方向
 * @param {String} direct 取值为B或T； T -> 从顶部开始打印   B -> 从底部开始打印
 */
function PTK_SetDirection(direct) {
  printparamsJsonArray.push({ PTK_SetDirection: direct });
}

/**
 * @description 设置当前标签打印黑度
 * @param {Number} id 标签打印黑度。取值：0 – 20的正整数，值越大打印黑度越深。
 */
function PTK_SetDarkness(id) {
  printparamsJsonArray.push({ PTK_SetDarkness: id });
}

/**
 * @description 设置当前标签高度、定位间隙\黑标\穿孔的高度、定位偏移。具体介绍请参考开发手册
 * @param {Number} lheight 标签的高度，以点(dots)为单位。取值：0 - 65535的正整数
 * @param {Number} gapH 标签间的定位间隙\黑标\穿孔的高度，以点(dots)为单位。取值：0 – 65535的正整数。当gap=0时，设置标签为连续纸；当实际标签不是连续纸而gap设置为0时会出现打印内容偏移的现象
 * @param {Number} gapOffset 标签间隙\黑线\穿孔定位偏移值，以点(dots)为单位，参数类型为正整数
 * @param {Boolean} bFlag 定位偏移值（gapOffset）是否有效；true - 有效，false - 无效
 */
function PTK_SetLabelHeight(lheight, gapH, gapOffset, bFlag) {
  printparamsJsonArray.push({ PTK_SetLabelHeight: lheight + ',' + gapH + ',' + gapOffset + ',' + bFlag });
}

/**
 * @description 设置当前标签的宽度
 * @param {Number} lwidth 标签的宽度，以点(dots)为单位。取值：0 – 65535的正整数
 */
function PTK_SetLabelWidth(lwidth) {
  printparamsJsonArray.push({ PTK_SetLabelWidth: lwidth });
}

/**
 * @description 	命令打印机开始打印标签内容
 * @param {Number} Number 打印标签的数量。取值：1 – 65535的正整数
 * @param {Number} cpnumber 每张标签的复制份数。取值：1 – 65535的正整数
 */
function PTK_PrintLabel(Number, cpnumber) {
  printparamsJsonArray.push({ PTK_PrintLabel: Number + ',' + cpnumber });
}

/**
 * @description 	命令打印机开始打印一张标签内容，打印完后读取当前打印机状态.仅支持固件版本为7.60以上打印机;不能和PTK_PrintLabe	l一起使用
 * @param {String} data 自定义状态码名称
 * @param {Number} dataSize 状态码的数据长度，参数类型为正整数；最小为6
 */
function PTK_PrintLabelFeedback(data, dataSize) {
  printparamsJsonArray.push({ PTK_PrintLabelFeedback: data + ',' + dataSize });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 打印文字
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description 用打印机内置字体编辑一行文本;
 * @param {Number} px 文本横坐标,以点(dots)为单位，参数类型为正整数;px的值超出标签的宽度文本内容将会被截掉
 * @param {Number} py 文本纵坐标,以点(dots)为单位，参数类型为正整数;y的值超出标签的高度文本内容将会被截掉
 * @param {Number} pdirec 文本方向，参数值及说明如下:0 - 正常; 1 - 旋转90; 2 - 旋转180; 3 - 旋转270°
 * @param {String} pFont 字体名称。取值：1 – 6的正整数或A - Z;1 - 5: 打印机内置5种西文点阵字体;6:打印机内置黑体;A-Z:用户下载字体名称，打印机出厂无内置A-Z字体
 * @param {Number} pHorizontal 水平放大系数（点阵）或字体宽度（矢量）。参数类型为正整数
 * @param {Number} pVertical 垂直放大系数（点阵）或字体高度（矢量）。参数类型为正整数
 * @param {String} ptext 文本样式，参数值及说明如下：N - 白底黑字，R - 黑底白字
 * @param {String} pstr 文本数据
 */
function PTK_DrawText(px, py, pdirec, pFont, pHorizontal, pVertical, ptext, pstr) {
  printparamsJsonArray.push({
    PTK_DrawText:
      px + ',' + py + ',' + pdirec + ',' + pFont + ',' + pHorizontal + ',' + pVertical + ',' + ptext + ',' + pstr,
  });
}

/**
 * @param {Number} px 文本横坐标,以点(dots)为单位，参数类型为正整数;px的值超出标签的宽度文本内容将会被截掉
 * @param {Number} py 文本纵坐标,以点(dots)为单位，参数类型为正整数;y的值超出标签的高度文本内容将会被截掉
 * @param {Number} pdirec 文本方向，参数值及说明如下:0 - 正常; 1 - 旋转90; 2 - 旋转180; 3 - 旋转270°
 * @param {String} pFont 字体名称。取值：1 – 6的正整数或A - Z;1 - 5: 打印机内置5种西文点阵字体;6:打印机内置黑体;A-Z:用户下载字体名称，打印机出厂无内置A-Z字体
 * @param {Number} pHorizontal 水平放大系数（点阵）或字体宽度（矢量）。参数类型为正整数
 * @param {Number} pVertical 垂直放大系数（点阵）或字体高度（矢量）。参数类型为正整数
 * @param {Number} ptext 文本样式，参数值及说明如下：N - 白底黑字，R - 黑底白字
 * @param {String} pstr 文本数据
 * @param {Boolean} varible 当前字符串是否包含变量
 */
function PTK_DrawTextEx(px, py, pdirec, pFont, pHorizontal, pVertical, ptext, pstr, varible) {
  printparamsJsonArray.push({
    PTK_DrawTextEx:
      px +
      ',' +
      py +
      ',' +
      pdirec +
      ',' +
      pFont +
      ',' +
      pHorizontal +
      ',' +
      pVertical +
      ',' +
      ptext +
      '                                    ,' +
      pstr +
      ',' +
      varible,
  });
}

/**
 * @description 调用windows的字体库，打印一行TrueType字体；推荐使用PTK_DrawText_TrueType
 * @param {Number} x 文本横坐标,以点(dots)为单位，参数类型为正整数;x的值超出标签的宽度文本内容将会被截掉
 * @param {Number} y 文本纵坐标,以点(dots)为单位，参数类型为正整数;y的值超出标签的高度文本内容会被截掉
 * @param {Number} FHeight 字符高度,以点(dots)为单位，参数类型为正整数
 * @param {Number} FWidth 字符宽度,以点(dots)为单位，参数类型为正整数;打印正常比例的字体，需此值设置为0
 * @param {String} FType 字体类型名称，例：宋体
 * @param {Number} Fspin 文本方向。取值：1 – 8的正整数，参数值及说明如下: 1—居左0°, 2—居左90°, 3—居左180°, 4—居左270° 5—居中0°, 6—居中90°, 7—居中180°, 8—居中270°
 * @param {Number} FWeight 文本粗细，参数值及说明如下:400 - 标准，100 - 非常细，200 - 极细，300 - 细，500 - 中等,600 - 半粗，700 - 粗，800 - 特粗，900 - 黑体
 * @param {Number} FItalic 倾斜设置，参数值及说明如下:0 - 正常 ，1 - 将文字变为斜体
 * @param {Number} FUnline 下划线设置，参数值及说明如下: 0 - 正常，1 - 为文字添加下划线
 * @param {Number} FStrikeOut 删除线设置，参数值及说明如下:0 - 正常，1 - 为文字添加删除线
 * @param {String} id_name 自定义文本名称
 * @param {String} data 文本数据
 */
function PTK_DrawTextTrueTypeW(
  x,
  y,
  FHeight,
  FWidth,
  FType,
  Fspin,
  FWeight,
  FItalic,
  FUnline,
  FStrikeOut,
  id_name,
  data
) {
  printparamsJsonArray.push({
    PTK_DrawTextTrueTypeW:
      x +
      ',' +
      y +
      ',' +
      FHeight +
      ',' +
      FWidth +
      ',' +
      FType +
      ',' +
      Fspin +
      ',' +
      FWeight +
      ',' +
      FItalic +
      ',' +
      FUnline +
      ',' +
      FStrikeOut +
      ',' +
      id_name +
      ',' +
      data,
  });
}

/**
 * @description 调用windows的字体库，打印一行TrueType字体；
 * @param {Number} x 文本横坐标,以点(dots)为单位，参数类型为正整数;x的值超出标签的宽度文本内容将会被截掉
 * @param {Number} y 文本纵坐标,以点(dots)为单位，参数类型为正整数;y的值超出标签的高度文本内容会被截掉
 * @param {Number} FHeight 字符高度,以点(dots)为单位，参数类型为正整数
 * @param {Number} FWidth 字符宽度,以点(dots)为单位，参数类型为正整数;打印正常比例的字体，需此值设置为0
 * @param {String} FType 字体类型名称，例：宋体
 * @param {Number} Fspin 文本方向。取值：1 – 8的正整数，参数值及说明如下: 1—居左0°, 2—居左90°, 3—居左180°, 4—居左270° 5—居中0°, 6—居中90°, 7—居中180°, 8—居中270°
 * @param {Number} FWeight 文本粗细，参数值及说明如下:400 - 标准，100 - 非常细，200 - 极细，300 - 细，500 - 中等,600 - 半粗，700 - 粗，800 - 特粗，900 - 黑体
 * @param {Number} FItalic 倾斜设置，参数值及说明如下:0 - 正常 ，1 - 将文字变为斜体
 * @param {Number} FUnline 下划线设置，参数值及说明如下: 0 - 正常，1 - 为文字添加下划线
 * @param {Number} FStrikeOut 删除线设置，参数值及说明如下:0 - 正常，1 - 为文字添加删除线
 * @param {String} data 文本数据
 */
function PTK_DrawText_TrueType(x, y, FHeight, FWidth, FType, Fspin, FWeight, FItalic, FUnline, FStrikeOut, data) {
  printparamsJsonArray.push({
    PTK_DrawText_TrueType:
      x +
      ',' +
      y +
      ',' +
      FHeight +
      ',' +
      FWidth +
      ',' +
      FType +
      ',' +
      Fspin +
      ',' +
      FWeight +
      ',' +
      FItalic +
      ',' +
      FUnline +
      ',' +
      FStrikeOut +
      ',' +
      data,
  });
}

function PTK_DrawText_TrueType_AutoFeedLine(
  x,
  y,
  FHeight,
  FWidth,
  FType,
  Fspin,
  FWeight,
  FItalic,
  FUnline,
  FStrikeOut,
  lineMaxWidth,
  lineMaxNum,
  lineGapH,
  middleSwitch,
  codeFormat,
  data
) {
  printparamsJsonArray.push({
    PTK_DrawText_TrueType_AutoFeedLine:
      x +
      ',' +
      y +
      ',' +
      FHeight +
      ',' +
      FWidth +
      ',' +
      FType +
      ',' +
      Fspin +
      ',' +
      FWeight +
      ',' +
      FItalic +
      ',' +
      FUnline +
      ',' +
      FStrikeOut +
      ',' +
      lineMaxWidth +
      ',' +
      lineMaxNum +
      ',' +
      lineGapH +
      ',' +
      middleSwitch +
      ',' +
      codeFormat +
      ',' +
      data,
  });
}

/**
 * @description 调用Windows字体库编辑多行文本;支持自动换行，垂直打印
 * @param {Number} x 文本横坐标,以点(dots)为单位，参数类型为正整数;x的值超出标签的宽度文本内容将会被截掉
 * @param {Number} y 文本纵坐标,以点(dots)为单位，参数类型为正整数;y的值超出标签的高度文本内容会被截掉
 * @param {Number} FHeight 字符高度,以点(dots)为单位，参数类型为正整数
 * @param {Number} FWidth 字符宽度,以点(dots)为单位，参数类型为正整数;打印正常比例的字体，需此值设置为0
 * @param {String} FType 字体类型名称，例：宋体
 * @param {Number} Fspin 文本方向。取值：1 – 8 的正整数，参数值及说明如下:1—水平0°, 2—水平90°, 3—水平180°, 4—水平270°;5—垂直0°, 6—垂直90°, 7—垂直180°, 8—垂直270°
 * @param {Number} FWeight 文本粗细，参数值及说明如下:400 - 标准，100 - 非常细，200 - 极细，300 - 细，500 - 中等,600 - 半粗，700 - 粗，800 - 特粗，900 - 黑体
 * @param {Number} FItalic 倾斜设置，参数值及说明如下:0 - 正常 ，1 - 将文字变为斜体
 * @param {Number} FUnline 下划线设置，参数值及说明如下: 0 - 正常，1 - 为文字添加下划线
 * @param {Number} FStrikeOut 删除线设置，参数值及说明如下:0 - 正常，1 - 为文字添加删除线
 * @param {Number} lineMaxWidth 设置单行的最大字符数，超过这个字符数将自动换行，参数类型为正整数。当Fspin为水平方向时，1个中文字符为2个字符；当Fspin为垂直方向时，1个中文字符为1个字符；当值为0时，不做限制
 * @param {Number} lineMaxNum 最大换行数，参数类型为正整数；当值为0时，不做限制
 * @param {Number} lineGapH 行间隙，单位dots，参数类型为正整数；当值为0时，不做限制
 * @param {Number} middleSwitch 文本居中选择，参数值及说明如下：0 - 不居中, 1 - 水平居中, 2 - 垂直居中, 3 - 水平垂直居中
 * @param {String} data 文本数据
 */
function PTK_DrawText_TrueTypeEx(
  x,
  y,
  FHeight,
  FWidth,
  FType,
  Fspin,
  FWeight,
  FItalic,
  FUnline,
  FStrikeOut,
  lineMaxWidth,
  lineMaxNum,
  lineGapH,
  middleSwitch,
  data
) {
  printparamsJsonArray.push({
    PTK_DrawText_TrueTypeEx:
      x +
      ',' +
      y +
      ',' +
      FHeight +
      ',' +
      FWidth +
      ',' +
      FType +
      ',' +
      Fspin +
      ',' +
      FWeight +
      ',' +
      FItalic +
      ',' +
      FUnline +
      ',' +
      FStrikeOut +
      ',' +
      lineMaxWidth +
      ',' +
      lineMaxNum +
      ',' +
      lineGapH +
      ',' +
      middleSwitch +
      ',' +
      data,
  });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 打印图片
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description 打印已存储在打印机RAM或FLASH存储器里的图形名称清单
 */
function PTK_PcxGraphicsList() {
  printparamsJsonArray.push({ PTK_PcxGraphicsList: '' });
}

/**
 * @description 删除打印机存储的图片
 * @param {String} pid 打印机内部存储的图形名称，最大长度为16个字符;当pcxname=*时，删除打印机内的所有图形
 */
function PTK_PcxGraphicsDel(pid) {
  printparamsJsonArray.push({ PTK_PcxGraphicsDel: pid });
} // 删除存储在 打印机 RAM或 FLASH存储器里的一个或所有图形

/**
 * @description 打印保存在打印机中的图片
 * @param {Number} px X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} py y坐标，以点(dots)为单位，参数类型为正整数
 * @param {String} gname 打印机内部存储的图形名称，最大长度为16个字符
 */
function PTK_DrawPcxGraphics(px, py, gname) {
  printparamsJsonArray.push({ PTK_DrawPcxGraphics: px + ',' + py + ',' + gname });
}

/**
 * @description 通过图形路径打印图形
 * @param {Number} x X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} y y坐标，以点(dots)为单位，参数类型为正整数
 * @param {String} GraphicsName 打印机内部存储的图形名称，最大长度为16个字符
 * @param {String} filePath 图形文件路径(支持网络路径)。目前支持的格式：bmp, jpg, png, tif, ico, pcx
 * @param {Number} ratio  缩放倍数，参数类型为浮点型;只有当该参数为0时，width和height才生效
 * @param {Number} width 指定图形的宽度(单位：dot)，参数类型为正整数.当该参数为0时，图形的宽为原始宽度
 * @param {Number} height 指定图形的高度(单位：dot)，参数类型为正整数.当该参数为0时，图形的宽为原始高度
 * @param {Number} iDire 旋转角度。取值：0 – 5的正整数，参数值及说明如下:0 - 0°，1 - 90°，2 - 180°，3 - 270°，4 - 垂直镜面翻转，5 - 水平镜面翻转
 */
function PTK_AnyGraphicsPrint(x, y, GraphicsName, filePath, ratio, width, height, iDire) {
  printparamsJsonArray.push({
    PTK_AnyGraphicsPrint:
      x + ',' + y + ',' + GraphicsName + ',' + filePath + ',' + ratio + ',' + width + ',' + height + ',' + iDire,
  });
}

/**
 * @param {Number} px X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} py y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} imageType 图片格式。目前支持的格式： 1：bmp	3：jpg	4：png	5：ico	6：tif	8：pcx
 * @param {Number} ratio  缩放倍数，参数类型为浮点型;只有当该参数为0时，width和height才生效
 * @param {Number} width 指定图形的宽度(单位：dot)，参数类型为正整数.当该参数为0时，图形的宽为原始宽度
 * @param {Number} height 指定图形的高度(单位：dot)，参数类型为正整数.当该参数为0时，图形的宽为原始高度
 * @param {Number} iDire 旋转角度。取值：0 – 5的正整数，参数值及说明如下:0 - 0°，1 - 90°，2 - 180°，3 - 270°，4 - 垂直镜面翻转，5 - 水平镜面翻转
 * @param {String} imageBuffer base64图片数据,不建议使用数据长度超过1,900,000的数据，当图片数据过大时建议打印多张时分批打印。
 */
function PTK_AnyGraphicsPrint_Base64(px, py, imageType, ratio, width, height, iDire, imageBuffer) {
  printparamsJsonArray.push({
    PTK_AnyGraphicsPrint_Base64:
      px + ',' + py + ',' + imageType + ',' + ratio + ',' + width + ',' + height + ',' + iDire + ',' + imageBuffer,
  });
}

/**
 * @description  存储一个PCX格式的图形到打印机
 * @param {String} pcxname 自定义图形的名称，最大长度为16个字符；当图形存储到打印机后，用户在PTK_DrawPcxGraphics（）中使用此名称才能将图形读取出来打印
 * @param {String} pcxpath PCX图形文件在PC机存储器里的路径
 */
function PTK_PcxGraphicsDownload(pcxname, pcxpath) {
  printparamsJsonArray.push({ PTK_PcxGraphicsDownload: pcxname + ',' + pcxpath });
} // 存储一个 PCX格式的图形到打印机

/**
 * @description 打印储存在打印机的图形
 * @param {Number} px X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} py  y坐标，以点(dots)为单位，参数类型为正整数
 * @param {String} filename 储存在打印机的图形名称
 */
function PTK_PrintPCX(px, py, filename) {
  printparamsJsonArray.push({ PTK_PrintPCX: px + ',' + py + ',' + filename });
} // 函数是打印一个 函数是打印一个 PCXPCXPCX格式的图形。

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 打印线条
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description 画一个矩形(空心)在标签上
 * @param {Number} px  矩形起始点X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} py 矩形起始点y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} thickness 矩形边框的粗细，以点(dots)为单位，参数类型为正整数
 * @param {Number} pEx 矩形终点X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} pEy 矩形终点y坐标，以点(dots)为单位，参数类型为正整数
 */
function PTK_DrawRectangle(px, py, thickness, pEx, pEy) {
  printparamsJsonArray.push({ PTK_DrawRectangle: px + ',' + py + ',' + thickness + ',' + pEx + ',' + pEy });
}

/**
 * @description 画一条直线，相交做异或处理
 * @param {Number} px 直线起始点X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} py 直线起始点y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} length 直线的长度，以点(dots)为单位，参数类型为正整数
 * @param {Number} heigth 直线的垂直高度，以点(dots)为单位，参数类型为正整数
 */
function PTK_DrawLineXor(px, py, length, heigth) {
  printparamsJsonArray.push({ PTK_DrawLineXor: px + ',' + py + ',' + length + ',' + heigth });
}

/**
 * @description 	画一条直线，相交做或处理
 * @param {Number} px 直线起始点X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} py 直线起始点y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} length 直线的长度，以点(dots)为单位，参数类型为正整数
 * @param {Number} heigth 直线的垂直高度，以点(dots)为单位，参数类型为正整数
 */
function PTK_DrawLineOr(px, py, length, heigth) {
  printparamsJsonArray.push({ PTK_DrawLineOr: px + ',' + py + ',' + length + ',' + heigth });
}

/**
 * @description 画一条斜线，如果相交做或处理
 * @param {Number} px  斜线起始点X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} py  斜线起始点y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} thickness 斜线边框的粗细，以点(dots)为单位，参数类型为正整数
 * @param {Number} pEx 斜线终点X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} pEy 斜线终点y坐标，以点(dots)为单位，参数类型为正整数
 */
function PTK_DrawDiagonal(px, py, thickness, pEx, pEy) {
  printparamsJsonArray.push({ PTK_DrawDiagonal: px + ',' + py + ',' + thickness + ',' + pEx + ',' + pEy });
}

/**
 * @description 画一条白色直线
 * @param {Number} px 白色直线起始点X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} py 白色直线起始点y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} length 白色直线的长度，以点(dots)为单位，参数类型为正整数
 * @param {Number} heigth 白色直线的垂直高度，以点(dots)为单位，参数类型为正整数
 */
function PTK_DrawWhiteLine(px, py, length, heigth) {
  printparamsJsonArray.push({ PTK_DrawWhiteLine: px + ',' + py + ',' + length + ',' + heigth });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 打印二维码
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description 编辑QR码;如需兼容所有打印机固件版本请用PTK_DrawBar2D_QREx
 * @param {Number} x QR码X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} y QR码y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} w 宽度，以点(dots)为单位，参数类型为正整数。此参数暂时失效，请输入0
 * @param {Number} v QR码版本号。取值：0 – 40的正整数，参数值及说明如下：版本1为21*21的矩阵，每增加一个版本号，矩阵的大小增加4个模块(Module)。版本号与对应的矩阵如下：0:自动匹配(QR的大小将随着数据的变化而变化)；1: 21* 21；2: 25* 25……40: 177* 177；QR的边长L(以dots为单位)与版本号的关系：L=r*(21+4*(v-1))
 * @param {Number} o 旋转方向。取值：0 – 3的正整数，参数值及说明如下：0 - 0°，1 - 90°，2 - 180°，3 - 270°
 * @param {Number} r 放大倍数。取值：0 – 99的正整数
 * @param {Number} m 保留参数，请输入0
 * @param {Number} g QR码纠错等级。取值：0 – 3的正整数，参数值及说明如下：0 - L级，1 - M级，2 - Q1级，3 - H1级
 * @param {Number} s QR码掩模图形。取值0 – 8，参数值及说明如下：0 - 掩模图形000 1 - 掩模图形001 2 - 掩模图形010 3 - 掩模图形011 4 - 掩模图形100 5 - 掩模图形101 6 - 掩模图形110 7 - 掩模图形111 8 - 自动选择掩模图形
 * @param {String} QRData QR码内容数据, 对于符合条码，条码内容中应使用'|'字符将两部分内容分开。数据中应用标识符应使用中括号[],如[01],应用标识符后紧跟的数据应夫妇应用标识符对应的数据格式，否则无法生成有效条码。
 */
function PTK_DrawBar2D_QR(x, y, w, v, o, r, m, g, s, QRData) {
  printparamsJsonArray.push({
    PTK_DrawBar2D_QR: x + ',' + y + ',' + w + ',' + v + ',' + o + ',' + r + ',' + m + ',' + g + ',' + s + ',' + QRData,
  });
}

/**
 * @description 编辑GS1 QR码
 * @param {Number} x GS1 QR码X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} y GS1 QR码y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} v GS1 QR码版本号，QR码版本对应QR码图形大小。取值范围：1~40。0 - 自动匹配（默认值）1 - 21*212 - 25*25 ……40 - 177*177
 * @param {Number} o 旋转方向。取值：0 – 3的正整数，参数值及说明如下：0 - 0°，1 - 90°，2 - 180°，3 - 270°
 * @param {Number} r 放大倍数
 * @param {Number} g GS1 QR码纠错等级。取值：0 – 3的正整数，参数值及说明如下：0 - L级，1 - M级，2 - Q1级，3 - H1级
 * @param {Number} s GS1 QR码掩模图形。取值0 – 8，参数值及说明如下：0-自动选择掩膜图形 1 - 掩模图形000 2 - 掩模图形001 3 - 掩模图形010 4 - 掩模图形011 5 - 掩模图形100 6 - 掩模图形101 7 - 掩模图形110 8 - 掩模图形111
 * @param {String} GS1QRData QR码内容数据, 对于符合条码，条码内容中应使用'|'字符将两部分内容分开。数据中应用标识符应使用中括号[],如[01],应用标识符后紧跟的数据应夫妇应用标识符对应的数据格式，否则无法生成有效条码。
 */
function PTK_DrawBar_GS1QR(x, y, v, o, r, g, s, GS1QRData) {
  printparamsJsonArray.push({
    PTK_DrawBar_GS1QR: x + ',' + y + ',' + v + ',' + o + ',' + r + ',' + g + ',' + s + ',' + GS1QRData,
  });
}

/**
 * @description 编辑QR码
 * @param {Number} x QR码X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} y QR码y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} o 旋转方向。取值：0 – 3的正整数，参数值及说明如下：0 - 0°，1 - 90°，2 - 180°，3 - 270°
 * @param {Number} r 放大倍数。取值：0 – 99的正整数
 * @param {Number} g QR码纠错等级。取值：0 – 3的正整数，参数值及说明如下：0 - L级，1 - M级，2 - Q1级，3 - H1级
 * @param {Number} sQR码掩模图形。取值0 – 8，参数值及说明如下：0 - 掩模图形000 1 - 掩模图形001 2 - 掩模图形010 3 - 掩模图形011 4 - 掩模图形100 5 - 掩模图形101 6 - 掩模图形110 7 - 掩模图形111 8 - 自动选择掩模图形
 * @param {Number} v QR码版本号。取值：0 – 40的正整数，参数值及说明如下：版本1为21*21的矩阵，每增加一个版本号，矩阵的大小增加4个模块(Module)。版本号与对应的矩阵如下：0:自动匹配(QR的大小将随着数据的变化而变化)；1: 21* 21；2: 25* 25……40: 177* 177；QR的边长L(以dots为单位)与版本号的关系：L=r*(21+4*(v-1))
 * @param {String} QRName 自定义QR码名称，最大长度为16个字符
 * @param {String} QRData QR码内容数据
 */
function PTK_DrawBar2D_QREx(x, y, o, r, g, s, v, QRName, QRData) {
  printparamsJsonArray.push({
    PTK_DrawBar2D_QREx: x + ',' + y + ',' + o + ',' + r + ',' + g + ',' + s + ',' + v + ',' + QRName + ',' + QRData,
  });
}

/**
 * @description 编辑汉信码
 * @param {Number} x 汉信码X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} y 汉信码y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} w 宽度，以点(dots)为单位;此参数暂时失效，请输入0
 * @param {Number} v 高度，以点(dots)为单位;此参数暂时失效，请输入0
 * @param {Number} o 旋转方向。取值：0 – 3的正整数，参数值及说明如下:0 - 0°，1：90°，2 - 180°，3 - 270°
 * @param {Number} r 放大倍数。取值：0 – 30的正整数
 * @param {Number} m 汉信码编码模式,取值：0 – 6的正整数，参数值及说明如下:0 - 数字模式 1 - TEXT模式 2 - 二进制模式 3 - 常用汉字1区模式编码 4 - 常用汉字2区模式编码 5 - GB 18030双字节区模式 6 - GB 18030四字节模式编码
 * @param {Number} g 汉信码纠错等级。取值：0 – 3的正整数，参数值及说明如下:0 - L1级，1 - L2级，2 - L3级，3 - L4级
 * @param {Number} s 汉信码掩模图形。取值0 – 3的正整数，参数值及说明如下:0 - 掩模图形00  1 - 掩模图形01 2 - 掩模图形10 3 - 掩模图形11
 * @param {String} HXData 汉信码内容数据
 */
function PTK_DrawBar2D_HANXIN(x, y, w, v, o, r, m, g, s, HXData) {
  printparamsJsonArray.push({
    PTK_DrawBar2D_HANXIN:
      x + ',' + y + ',' + w + ',' + v + ',' + o + ',' + r + ',' + m + ',' + g + ',' + s + ',' + HXData,
  });
}

/**
 * @description 编辑PDF417码.如需兼容所有打印机固件版本请用PTK_DrawBar2D_Pdf417Ex
 * @param {Number} x Pdf417码X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} y Pdf417码y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} w 宽度，以点(dots)为单位.此参数暂时失效，请输入0
 * @param {Number} v 高度，以点(dots)为单位.此参数暂时失效，请输入0
 * @param {Number} s 错误校正等级。取值：0 – 8的正整数
 * @param {Number} c 资料压缩等级。取值0或1.此参数暂时失效，请输入0
 * @param {Number} X 模组宽度，以点(dots)为单位。取值：2 – 9的正整数
 * @param {Number} Y 模组高度，以点(dots)为单位。取值：4 – 99的正整数
 * @param {Number} r 最大行数。取值：3 – 90的正整数
 * @param {Number} l 最大列数。取值：1 – 30的正整数
 * @param {Number} t 截取标志。取值：0或1，参数值及说明如下.0- 不截取，1 - 截取
 * @param {Number} o 旋转方向。取值：0 – 3的正整数，参数值及说明如下:0 - 0°，1 - 90°，2 - 180°，3 - 270°
 * @param {String} pdf417Data DF417码内容数据. 在参数X、Y、r、l固定且数据量不超过r和l所能容纳的最大数据量的情况下，pdf417打印出来的大小固定。PDF417码宽高计算公式如下:   宽： (l*17+69)*X   高： r*Y
 */
function PTK_DrawBar2D_Pdf417(x, y, w, v, s, c, X, Y, r, l, t, o, pdf417Data) {
  printparamsJsonArray.push({
    PTK_DrawBar2D_Pdf417:
      x +
      ',' +
      y +
      ',' +
      w +
      ',' +
      v +
      ',' +
      s +
      ',' +
      c +
      ',' +
      X +
      ',' +
      Y +
      ',' +
      r +
      ',' +
      l +
      ',' +
      t +
      ',' +
      o +
      ',' +
      pdf417Data,
  });
}

/**
 * @description 编辑PDF417码
 * @param {Number} x Pdf417码X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} y Pdf417码y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} w 宽度，以点(dots)为单位.此参数暂时失效，请输入0
 * @param {Number} v 高度，以点(dots)为单位.此参数暂时失效，请输入0
 * @param {Number} s 错误校正等级。取值：0 – 8的正整数
 * @param {Number} c 资料压缩等级。取值0或1.此参数暂时失效，请输入0
 * @param {Number} px 模组宽度，以点(dots)为单位。取值：2 – 9的正整数
 * @param {Number} py 模组高度，以点(dots)为单位。取值：4 – 99的正整数
 * @param {Number} r 最大行数。取值：3 – 90的正整数
 * @param {Number} l 最大列数。取值：1 – 30的正整数
 * @param {Number} t 截取标志。取值：0或1，参数值及说明如下.0- 不截取，1 - 截取
 * @param {Number} o 旋转方向。取值：0 – 3的正整数，参数值及说明如下:0 - 0°，1 - 90°，2 - 180°，3 - 270°
 * @param {String} pdf417Data DF417码内容数据. 在参数X、Y、r、l固定且数据量不超过r和l所能容纳的最大数据量的情况下，pdf417打印出来的大小固定。PDF417码宽高计算公式如下:   宽： (l*17+69)*X   高： r*Y
 */
function PTK_DrawBar2D_Pdf417Ex(x, y, w, v, s, c, px, py, r, l, t, o, pdf417Data) {
  printparamsJsonArray.push({
    PTK_DrawBar2D_Pdf417Ex:
      x +
      ',' +
      y +
      ',' +
      w +
      ',' +
      v +
      ',' +
      s +
      ',' +
      c +
      ',' +
      px +
      ',' +
      py +
      ',' +
      r +
      ',' +
      l +
      ',' +
      t +
      ',' +
      o +
      ',' +
      pdf417Data,
  });
}

/**
 * @description  编辑MaxiCode码
 * @param {Number} x MaxiCode码X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} y MaxiCode码y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} m 符号体系模式。取值：2 – 4的正整数，参数值及说明如下:2 - 结构化载体信息  3 - 结构化载体信息  4 - 标准符号
 * @param {Number} u 是否为UPS格式。取值：0 或 1，参数值及说明如下:1 - UPS格式数据  0 - 非UPS格式数据
 * @param {String} mcData MaxiCode码内容数据
 */
function PTK_DrawBar2D_MaxiCode(x, y, m, u, mcData) {
  printparamsJsonArray.push({ PTK_DrawBar2D_MaxiCode: x + ',' + y + ',' + m + ',' + u + ',' + mcData });
}

/**
 * @description 编辑Data Matrix码
 * @param {Number} x DATAMATRIX码X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} y DATAMATRIX码y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} w 宽度，以点(dots)为单位.此参数暂时失效，请输入0
 * @param {Number} h 高度，以点(dots)为单位.此参数暂时失效，请输入0
 * @param {Number} o 旋转方向。取值：0 – 3的正整数.0 - 0°，1 - 90°，2 - 180°，3 - 270°
 * @param {Number} m 放大倍数，参数类型为正整数
 * @param {String} dmData：Data Matrix码数据内容
 */
function PTK_DrawBar2D_DATAMATRIX(x, y, w, h, o, m, dmData) {
  printparamsJsonArray.push({
    PTK_DrawBar2D_DATAMATRIX: x + ',' + y + ',' + w + ',' + h + ',' + o + ',' + m + ',' + dmData,
  });
}

/**
 * @description 编辑 GS1 Data Matrix码
 * @param {*} x GS1 DATAMATRIX码X坐标，以点(dots)为单位，参数类型为正整数
 * @param {*} y GS1 DATAMATRIX码y坐标，以点(dots)为单位，参数类型为正整数
 * @param {*} symbolSize 方框内容大小, 取值范围：1~30。
 * @param {*} r 放大倍数，参数类型为正整数
 * @param {*} o 旋转方向。取值：0 – 3的正整数.0 - 0°，1 - 90°，2 - 180°，3 - 270°
 * @param {*} GS1dmXData  GS1 Data Matrix码数据内容, 对于符合条码，条码内容中应使用'|'字符将两部分内容分开。数据中应用标识符应使用中括号[],如[01],应用标识符后紧跟的数据应夫妇应用标识符对应的数据格式，否则无法生成有效条码。
 */
function PTK_DrawBar2D_GS1_DATAMATRIX(x, y, symbolSize, r, o, GS1dmXData) {
  printparamsJsonArray.push({
    PTK_DrawBar2D_GS1_DATAMATRIX: x + ',' + y + ',' + symbolSize + ',' + r + ',' + o + ',' + GS1dmXData,
  });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 打印一维码
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description 编辑一维条码
 * @param {Number} px 一维码X坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} py 一维码y坐标，以点(dots)为单位，参数类型为正整数
 * @param {Number} pdirec 旋转方向。取值：0 – 3的正整数，参数值及说明如下:0 - 0°，1 - 90°，2 - 180°，3 - 270°
 * @param {String} pCode  条码类型。取值详见开发手册
 * @param {Number} pHorizontal 设置条码中窄单元的宽度,以点(dots)为单位，参数类型为正整数
 * @param {Number} pVertical 设置条码中宽单元的宽度,以点(dots)为单位，参数类型为正整数
 * @param {Number} pbright 设置条码高度,以点(dots)为单位，参数类型为正整数
 * @param {String} humanReadable 供人识别符。取值：N或B，参数值及说明如下：N - 不显示供认识别符  B - 显示工人识别符
 * @param {String} Data 一维码内容数据
 */
function PTK_DrawBarcode(px, py, pdirec, pCode, pHorizontal, pVertical, pbright, humanReadable, Data) {
  printparamsJsonArray.push({
    PTK_DrawBarcode:
      px +
      ',' +
      py +
      ',' +
      pdirec +
      ',' +
      pCode +
      ',' +
      pHorizontal +
      ',' +
      pVertical +
      ',' +
      pbright +
      ',' +
      humanReadable +
      ',' +
      Data,
  });
}

function PTK_DrawBarcodeEx(px, py, pdirec, pCode, NarrowWidth, pHorizontal, pVertical, pbright, ptext, pstr, Varible) {
  printparamsJsonArray.push({
    PTK_DrawBarcodeEx:
      px +
      ',' +
      py +
      ',' +
      pdirec +
      ',' +
      pCode +
      ',' +
      NarrowWidth +
      ',' +
      pHorizontal +
      ',' +
      pVertical +
      ',' +
      pbright +
      ',' +
      ptext +
      ',' +
      pstr +
      ',' +
      Varible,
  });
}

/**
 * @description 编辑GS1 Databar
 * @param {*} px GS1 Databar X坐标，以点(dots)为单位，参数类型为正整数
 * @param {*} py GS1 Databar y坐标，以点(dots)为单位，参数类型为正整数
 * @param {*} symbologyType GS1 Databar 类型
 * @param {*} magnificationFactor 放大系数，范围为1~10，默认值为1
 * @param {*} separatorHeight 分隔符高度，以点(dots)为单位。
 * @param {*} barcodeHeight 条码高度，以点(dots)为单位
 * @param {*} SegmentWidth 分段宽度，仅适用于GS1 DataBar Expanded，其它类型该参数缺省，以点(dots)为单位
 * @param {*} orientation 旋转方向。取值：0 – 3的正整数，参数值及说明如下:0 - 0°，1 - 90°，2 - 180°，3 - 270°
 * @param {*} Data GS1 Databar内容数据，对于符合条码，条码内容中应使用'|'字符将两部分内容分开。数据中应用标识符应使用中括号[],如[01],应用标识符后紧跟的数据应夫妇应用标识符对应的数据格式，否则无法生成有效条码。
 */
function PTK_DrawBarcode_GS1(
  px,
  py,
  symbologyType,
  magnificationFactor,
  separatorHeight,
  barcodeHeight,
  SegmentWidth,
  orientation,
  Data
) {
  printparamsJsonArray.push({
    PTK_DrawBarcode_GS1:
      px +
      ',' +
      py +
      ',' +
      symbologyType +
      ',' +
      magnificationFactor +
      ',' +
      separatorHeight +
      ',' +
      barcodeHeight +
      ',' +
      SegmentWidth +
      ',' +
      orientation +
      ',' +
      Data,
  });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 打印表单及相关
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description 说明：获取储存在FLASH的表单、字体或者图形名称。只能获取FLASH的，不能获取RAM里的。仅支持USB读取
 * @param {String} tempName 自定义获取数据名称
 * @param {Number} listBuffSize 数据长度
 * @param {Number} TempType 要获取的名字清单类型；0：表单  1：字体  2：图形
 */
function PTK_GetStorageList(tempName, listBuffSize, TempType) {
  printparamsJsonArray.push({ PTK_GetStorageList: tempName + ',' + listBuffSize + ',' + TempType });
}

/**
 * @description 打印已存储在打印机RAM或FLASH存储器里的表单名称清单
 */
function PTK_FormList() {
  printparamsJsonArray.push({ PTK_FormList: '' });
}

/**
 * @description 删除打印机中存储的表单。
 * @param {String} pid 打印机中存储的表单名称，不超过16字节
 */
function PTK_FormDel(pid) {
  printparamsJsonArray.push({ PTK_FormDel: pid });
}

/**
 * @description 通知打印机开始存储一个表单到打印机中
 * @param {String} pid 命名打印机中存储的表单名称，不超过16字节
 */
function PTK_FormDownload(pid) {
  printparamsJsonArray.push({ PTK_FormDownload: pid });
}

/**
 * @description 通知打印机表单存储结束
 */
function PTK_FormEnd() {
  printparamsJsonArray.push({ PTK_FormEnd: '' });
}

/**
 * @description  运行一个表单，相当于将表单内容中的API函数全部执行一次
 * @param {String} pid 印机中存储的表单名称，不超过16字节
 */
function PTK_ExecForm(pid) {
  printparamsJsonArray.push({ PTK_ExecForm: pid });
}

/**
 * @description 在打印机中定义一个变量
 * @param {Number} pid 变量ID号码，取值范围：00—99;
 * @param {Number} pmax 最大字符个数，取值范围：1—99
 * @param {String} porder 对齐方式，L—左对齐，R—右对齐，C—居中，N—不对齐;
 * @param {String} pmsg 提示内容，将会在KDU或打印机的LCD显示。
 */
function PTK_DefineVariable(pid, pmax, porder, pmsg) {
  printparamsJsonArray.push({ PTK_DefineVariable: pid + ',' + pmax + ',' + porder + ',' + pmsg });
}

/**
 * @description  在打印机中定义一个序列号
 * @param {Number} id 序列号ID号码，取值范围：0—9;
 * @param {Number} maxNum 序列号最大位数，取值范围：1—40；
 * @param {String} ptext 对齐方式，L—左对齐，R—右对齐，C—居中，N—不对齐;
 * @param {String} pstr  序列号的变化规律；由”+”或”-”加上一个数字，再加上一个变化标志（D –十进制，B –二进制，O – 八进制，H –十六进制组成：“+1”=每次增加1, 默认按照十进制计算：如1234，1235，1236，…；“+3D”=每次增加3，按照十进制计算，同上；“-1B”=每次减少1，按照二进制计算：如1111，1110，1101，…；“-4O”=每次减少4，按照八进制计算：如1234，1230，1224，…；“-6H”=每次减少6，按照十六进制计算：如1234，122E，1228，…；
 * @param {String} pMsg 提示内容，将会在KDU或打印机的LCD显示。
 */
function PTK_DefineCounter(id, maxNum, ptext, pstr, pMsg) {
  printparamsJsonArray.push({ PTK_DefineCounter: id + ',' + maxNum + ',' + ptext + ',' + pstr + ',' + pMsg });
}

/**
 * @description 打印机开始给变量或序列号赋初始值
 */
function PTK_Download() {
  printparamsJsonArray.push({ PTK_Download: '' });
}

/**
 * @description 按定义顺序初始化变量或序列号
 * @param {String} pstr 要设置的初始值的字符串
 */
function PTK_DownloadInitVar(pstr) {
  printparamsJsonArray.push({ PTK_DownloadInitVar: pstr });
}

/**
 * @description  命令打印机开始打印标签，在表单中使用，结合序列号或变量使用。
 * @param {Number} Number 打印标签的数量，取值范围：1—65535；
 * @param {Number} cpnumber 每张标签的复制份数，取值范围：1—65535；
 */
function PTK_PrintLabelAuto(Number, cpnumber) {
  printparamsJsonArray.push({ PTK_PrintLabelAuto: Number + ',' + cpnumber });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 超高频RFID标签读写及相关（UHF）
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description RFID标签探测校准
 */
function PTK_RFIDCalibrate() {
  printparamsJsonArray.push({ PTK_RFIDCalibrate: '' });
}

/**
 * @description 写超高频RFID标签数据；RFID写入和读取之前必须进行RFID校准，否则会RFID读取和打印失败（打印机会报RFID打印出错并在标签上打印void0的字样）。注意：不是每次写入RFID数据之前都需要进行RFID探测校准，一种规格的标签只需要进行一次即可。
 * 换不同规格的RFID标签打印时也需要进行RFID校准
 * RFID探测校准：G系列：长按进纸（FEED）键一键校准  TXR系列：按测纸键一键校准 若不能一键校准可能是版本过低，进入液晶屏菜单找到“RFID探测校准”进行校准；若校准过程中提示纸张检测出错，请检查标签纸是否安装正确，有必要的时候根据标签的定位类型移动纸张探测器的位置和选定正确的探测方式（黑标定位 - 反射，穿孔定位 — 穿透）；若多次提示校准失败，可将标签换一个方向后尝试再次校准
 *手动设置RFID探测偏移 将标签芯片到标签底部边缘的距离L设置到RFID偏移 当自动校准值写入RFID失败或无法一键校准时可用此方式设置RFID偏移
 *RFID写入失败时，标签标签打印的错误标识解析 VOID0:扫描不到RFID标签。可能的原因：1、标签芯片是坏的 2、读功率太小 3、RFID偏移值偏差太大  4、没有做RFID探测校准； VOID1:写入RFID数据失败。可能的原因：1、RFID偏移值偏差大 2、写入的数据位数不符合要求（可2的倍数或4的倍数等等尝试）3、当前标签被锁定 4、当前标签以被写过一次，不能被再次写入； VOID2:扫描不到新的RFID标签；VOID3:扫描到多张RFID标签。可调小读功率或者重新做RFID探测校准
 * @param {Number} nRWMode RFID读写方式。取值：0 或 1，参数值及说明如下：0 - 读RFID数据（预留，暂不生效）1 - 写RFID数据
 * @param {Number} nWForm 数据写入格式。取值：0 或1，数值及说明如下：0 - HEX  1 - ASCII
 * @param {Number} nStartBlock 写入起始块，参数类型为正整数
 * @param {Number} nWDataNum 写入数据字节数，参数类型为正整数
 * @param {Number} nWArea 写入区域。参数类型及说明如下： 0 - Reserved（保留区）；1 - EPC； 3 - USER；
 * @param {String} Data 超高频RFID待写入数据
 */
function PTK_RWRFIDLabel(nRWMode, nWForm, nStartBlock, nWDataNum, nWArea, Data) {
  printparamsJsonArray.push({
    PTK_RWRFIDLabel: nRWMode + ',' + nWForm + ',' + nStartBlock + ',' + nWDataNum + ',' + nWArea + ',' + Data,
  });
}

/**
 * @description  写超高频RFID标签数据，RFID 数据不会被PTK_ClearBuffer()清除
 * @param {Number} nRWMode RFID读写方式。取值：0 或 1，参数值及说明如下：0 - 读RFID数据（预留，暂不生效）1 - 写RFID数据
 * @param {Number} nWForm 数据写入格式。取值：0 或1，数值及说明如下：0 - HEX  1 - ASCII
 * @param {Number} nStartBlock 写入起始块，参数类型为正整数
 * @param {Number} nWDataNum 写入数据字节数，参数类型为正整数
 * @param {Number} nWArea 写入区域。参数类型及说明如下： 0 - Reserved（保留区）；1 - EPC； 3 - USER；
 * @param {String} Data 超高频RFID待写入数据
 */
function PTK_RWRFIDLabelEx(nRWMode, nWForm, nStartBlock, nWDataNum, nWArea, Data) {
  printparamsJsonArray.push({
    PTK_RWRFIDLabelEx: nRWMode + ',' + nWForm + ',' + nStartBlock + ',' + nWDataNum + ',' + nWArea + ',' + Data,
  });
}

/**
 * @description 设置RFID标签密码和锁定RFID标签
 * @param {Number} OperationMode 操作方式。取值：0 – 4的正整数，参数值及说明如下：0 - 解锁 1 - 锁定 2 - 完全解锁 3 - 完全锁定 4 - 密码写入
 * @param {Number} OperationnArea 操作区域。取值：0 – 4的正整数，参数值及说明如下： 0 - 销毁密码区 1 - 访问密码区 2 - EPC 3 - TID 4 - USER
 * @param {String} password 访问密码，格式限定为8位
 */
function PTK_SetRFLabelPWAndLockRFLabel(OperationMode, OperationnArea, password) {
  printparamsJsonArray.push({ PTK_SetRFLabelPWAndLockRFLabel: OperationMode + ',' + OperationnArea + ',' + password });
}

/**
 * @description 编码RFID的PC值或国标的编码头
 * @param {String} PCValue RFID的PC值或国标的编码头，数据格式为16进制。
 */
function PTK_EncodeRFIDPC(PCValue) {
  printparamsJsonArray.push({ PTK_EncodeRFIDPC: PCValue });
}

/**
 * @description  超高频RFID标签读写设置
 * @param {Number} ReservationParameters 预留参数，默认值为0
 * @param {Number} ReadWriteLocation RFID读写位置,默认为0，单位mm。取值：0 – 999的正整数
 * @param {Number} ReadWriteArea 预留参数，默认值为0
 * @param {Number} MaxErrNum 读写错误重试次数。取值：0 – 9的正整数，默认1
 * @param {Number} ErrProcessingMethod 预留参数，默认值为0
 */
function PTK_SetRFID(ReservationParameters, ReadWriteLocation, ReadWriteArea, MaxErrNum, ErrProcessingMethod) {
  printparamsJsonArray.push({
    PTK_SetRFID:
      ReservationParameters +
      ',' +
      ReadWriteLocation +
      ',' +
      ReadWriteArea +
      ',' +
      MaxErrNum +
      ',' +
      ErrProcessingMethod,
  });
}

/**
 * @description 读取超高频RFID标签数据。支持串口、USB、网络读取 若读取数据超时请检查是否进行了RFID探测校准 其它值请查看msg信息。  读取到的数  若有ERROR标识，则表示没有读到合适的数据  错误码格式：ERROR+错误区域+错误代码（例：ERROR+TID+EPC0003） 错误码解析：0003:无法读取新标签的TID   0004:读到写入失败  0005:读取写过的标签的TID，但无法读取新标签的TID   0006:重新盘点到多张新标签
 * @param {Number} DataBlock 选择读取数据区域。参数值及说明如下 ： 0 - TID； 1 - EPC； 2 - TID+EPC； 3 - USER
 * @param {Number} RFPower 设置读功率，单位dBm。取值： 0 – 30的正整数。设置为0时，默认读功率为23dBm
 * @param {Number} bFeed 读取后是否向前走一张标签。取值：0或1，参数值及说明如下：  0 - 读取后不走出该标签  1 - 读取后走出该标签
 * @param {String} dataName 自定义读取数据的名称
 * @param {Number} dataSize 读取数据的长度，参数类型为正整数
 */
function PTK_ReadRFIDLabelData(DataBlock, RFPower, bFeed, dataName, dataSize) {
  printparamsJsonArray.push({
    PTK_ReadRFIDLabelData: DataBlock + ',' + RFPower + ',' + bFeed + ',' + dataName + ',' + dataSize,
  });
}

/**
 * @description 打印一张标签，并返回RFID数据。 读取到的数据若有ERROR标识，则表示没有读到合适的数据 错误码格式：ERROR+错误区域+错误代码（例：ERROR+TID+EPC0003）错误码解析：0003:无法读取新标签的TID   0004:读到写入失败  0005:读取写过的标签的TID，但无法读取新标签的TID   0006:重新盘点到多张新标签
 * @param {Number} DataBlock 选择读取数据区域。参数值及说明如下： 0 - TID； 1 -  EPC； 2 -  TID+EPC； 3 - USER
 * @param {String} dataName 自定义读取数据的名称
 * @param {Number} dataSize 读取数据的长度，参数类型为正整数
 */
function PTK_RFIDEndPrintLabel(DataBlock, dataName, dataSize) {
  printparamsJsonArray.push({ PTK_RFIDEndPrintLabel: DataBlock + ',' + dataName + ',' + dataSize });
}

/**
 * @description 打印一张标签，并返回RFID数据和打印机的状态 ；仅支持V7.61以上固件；读取到的数据若有ERROR标识，则表示没有读到合适的数据。错误码格式：ERROR+错误区域+错误代码（例：ERROR+TID+EPC0003 ）错误码解析：0003:无法读取新标签的TID   0004:读到写入失败  0005:读取写过的标签的TID，但无法读取新标签的TID   0006:重新盘点到多张新标签
 * @param {Number} DataBlock 选择读取数据区域。参数值及说明如下： 0 - TID； 1 -  EPC； 2 -  TID+EPC； 3 - USER
 * @param {String} dataName 自定义读取数据的名称
 * @param {Number} dataSize 读取数据的长度，参数类型为正整数
 * @param {String} printerStatus 自定义打印机状态名称 。返回数据格式为W1XXXX，XXXX为打印机状态代码
 * @param {Number} statusSize 打印机状态数据长度，参数类型为正整数
 */
function PTK_RFIDEndPrintLabelFeedBack(DataBlock, dataName, dataSize, printerStatus, statusSize) {
  printparamsJsonArray.push({
    PTK_RFIDEndPrintLabelFeedBack: DataBlock + ',' + dataName + ',' + dataSize + ',' + printerStatus + ',' + statusSize,
  });
}

/**
 * @description  设置读取RFID数据时标签前进到最佳读写位置时的速度
 * @param {Number} speed 标签前进到最佳读写位置时的速度
 */
function PTK_SetReadRFIDForwardSpeed(speed) {
  printparamsJsonArray.push({ PTK_SetReadRFIDForwardSpeed: speed });
}

/**
 * @description 设置读取RFID数据时标签回退到打印线时的速度
 * @param {Number} speed 标签回退到打印线时的速度
 */
function PTK_SetReadRFIDBackSpeed(speed) {
  printparamsJsonArray.push({ PTK_SetReadRFIDBackSpeed: speed });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 高频RFID标签读写及相关（HF）
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description  写高频RFID标签数据。RFID写入和读取之前必须进行RFID校准（进行校准前请先设置高频RFID标签的协议），否则会RFID读取和打印失败（打印机会报RFID打印出错并在标签上打印void0的字样）。注意：不是每次写入RFID数据之前都需要进行RFID探测校准，一种规格的标签只需要进行一次即可。换不同规格的RFID标签打印时也需要进行RFID校准。RFID探测校准：长按进纸（FEED）键一键校准	若校准过程中提示纸张检测出错，请检查标签纸是否安装正确，有必要的时候根据标签的定位类型移动纸张探测器的位置和选定正确的探测方式（黑标定位 - 反射，穿孔定位 — 穿透）若多次提示校准失败，可将标签换一个方向或检查高频RFID的协议设置，然后尝试再次校准
 * @param {String} RWMode RFID读写方式。参数取值及说民如下：  R - 读RFID数据（预留，暂不生效）   W - 写RFID数据
 * @param {Number} StartBlock 写入起始块，参数类型为正整数
 * @param {Number} BlockNum  写入块的个数，参数类型为正整数
 * @param {String} Data  高频RFID待写入数据
 * @param {Number} Varible FID数据是否为序列号。取值：0 或1，参数值及说明如下：0 - 常量数据   1 - 序列号数据，预留参数，暂时无效
 */
function PTK_RWHFLabel(RWMode, StartBlock, BlockNum, Data, Varible) {
  printparamsJsonArray.push({ PTK_RWHFLabel: RWMode + ',' + StartBlock + ',' + BlockNum + ',' + Data + ',' + Varible });
}

/**
 * @description 高频RFID标签读写设置
 * @param {String} WForm: 读写数据类型。参数值及说明如下：A - ASCII H - HEX  默认为ASCII 格式
 * @param {Number} ProtocolType 协议类型。参数值及说明如下：1 - ISO 15693 协议 2 - ISO 14443 协议 3-NTAG
 * @param {Number} MaxErrNumd 读写错误重试次数。取值：0 – 9的正整数，默认3
 */
function PTK_SetHFRFID(WForm, ProtocolType, MaxErrNumd) {
  printparamsJsonArray.push({ PTK_SetHFRFID: WForm + ',' + ProtocolType + ',' + MaxErrNumd });
}

/**
 * @description 读取高频RFID标签数据。支持串口、USB、网络读取。若读取数据超时请检查是否进行了RFID探测校准。 读取到的数据若有ERROR标识，则表示没有读到合适的数据  错误码格式：ERROR+ BLOCK+ERRORTYPE（例：ERROR+BLOCK+0001）ERRORTYPE解析：0001：没有一个BLOCK数据读取成功。0002：能读到UID ,但过滤失败；即重复读到同一张高频RFID标签数据
 * @param {Number} StartBlock 读取起始块，参数类型为正整数
 * @param {Number} BlockNum 读取块的个数，参数类型为正整数。读取的数据为从StartBlock开始到StartBlock+BlockNum-1块的数据
 * @param {String} pFeed 读取后是否向前走一张标签，取值：Y或N，参数值及说明如下：  Y - 读取后走出该标签    N - 读取后不走出该标签
 * @param {String} dataName 自定义读取数据的名称
 * @param {Number} dataSize 读取数据的长度，参数类型为正整数
 */
function PTK_ReadHFLabelData(StartBlock, BlockNum, pFeed, dataName, dataSize) {
  printparamsJsonArray.push({
    PTK_ReadHFLabelData: StartBlock + ',' + BlockNum + ',' + pFeed + ',' + dataName + ',' + dataSize,
  });
}

/**
 * @description  读取高频RFID标签的UID。支持串口、USB、网络读取。若读取数据超时请检查是否进行了RFID探测校准。读取到的数据若有ERROR标识，则表示没有读到合适的数据。错误码格式：ERROR+UID+ERRORTYPE（例：EERROR+UID+0001）ERRORTYPE解析：0001：读UID失败。0002：能读到UID ,但过滤失败；即重复读到同一张高频RFID标签数据
 * @param {String} pFeed 读取后是否向前走一张标签，取值：Y或N，参数值及说明如下：  Y - 读取后走出该标签    N - 读取后不走出该标签
 * @param {String} dataName 自定义读取数据的名称
 * @param {Number} dataSize 读取数据的长度，参数类型为正整数
 */
function PTK_ReadHFLabeUID(pFeed, dataName, dataSize) {
  printparamsJsonArray.push({ PTK_ReadHFLabeUID: pFeed + ',' + dataName + ',' + dataSize });
}

/**
 * @description 清除缓存中的UID数据记录
 */
function PTK_ClearUIDBuffers() {
  printparamsJsonArray.push({ PTK_ClearUIDBuffers: '' });
}

/**
 * @description  置高频标签AFI的值
 * @param {Number} nAFIValue 要设置的AFI的值
 */
function PTK_SetHFAFI(nAFIValue) {
  printparamsJsonArray.push({ PTK_SetHFAFI: nAFIValue });
}

/**
 * @description  设置高频标签DSFID的值
 * @param {Number} nDSFIDValue 要设置的DSFID的值
 */
function PTK_SetHFDSFID(nDSFIDValue) {
  printparamsJsonArray.push({ PTK_SetHFDSFID: nDSFIDValue });
}

/**
 * @description  设置高频标签EAS的值
 * @param {String} EAS 要设置的EAS的值,取值：’E’或’R’.
 */
function PTK_SetHFEAS(EAS) {
  printparamsJsonArray.push({ PTK_SetHFEAS: EAS });
}

/**
 * @description  高频标签解密。注意：电子标签为HF 13.56M频段,且符合ISO 14443A协议的标签。
 * @param {Number} key 选择keyA或者keyB进行解密。 1 - keyA  	2 - keyB
 * @param {Number} nStartBlock 校验起始块。
 * @param {Number} nBlockNum  校验块数。
 * @param {String} VerifyPassword 解密密码(十六进制)；默认值为FFFFFFFFFFFF。
 */
function PTK_HFDecrypt(key, nStartBlock, nBlockNum, VerifyPassword) {
  printparamsJsonArray.push({ PTK_HFDecrypt: key + ',' + nStartBlock + ',' + nBlockNum + ',' + VerifyPassword });
}

/**
 * @description  高频标签锁定。注意：电子标签为HF 13.56M频段,且符合ISO 14443A协议的标签。
 * @param {Number} nStartBlock 设置锁定的起始块。（注：14443A协议设置范围有一个限制，即3*n（n为0/1/2/3/…）的块不能作为起始块）
 * @param {Number} nBlockNum 设置锁定的块数
 * @param {String} keyA 设置锁定的keyA密码。
 * @param {String} keyB 设置锁定的keyB密码。
 * @param {String} nControlByte  设置控制字，格式为十六进制。当设置为NULL时，默认值为FF078069
 */
function PTK_LockHFLabel(nStartBlock, nBlockNum, keyA, keyB, nControlByte) {
  printparamsJsonArray.push({
    PTK_LockHFLabel: nStartBlock + ',' + nBlockNum + ',' + keyA + ',' + keyB + ',' + nControlByte,
  });
}

/**
 * @description   锁定15693标签 AFI/DSFID
 * @param {String} Identifier 锁定标识符。L-锁定AFI，U - 锁定DSFID
 */
function PTK_LockHFIdentifier(Identifier) {
  printparamsJsonArray.push({ PTK_LockHFIdentifier: Identifier });
}

/**
 * @description 锁定15693/NTAG块
 * @param {Number} nStartBlock 设置锁定的起始块
 * @param {Number} nBlockNum 设置锁定的块数
 */
function PTK_LockHFBlock(nStartBlock, nBlockNum) {
  printparamsJsonArray.push({ PTK_LockHFBlock: nStartBlock + ',' + nBlockNum });
}

/**
 * @description  设置密钥
 * @param {Number} lockType 锁定设置。1 - 表示修改密钥后锁定；0 - 表示不锁定
 * @param {String} keyA KeyA值
 * @param {String} keyB keyB值
 * @param {String} keyFx keyFx值
 */
function PTK_SetHFKey(lockType, keyA, keyB, keyFx) {
  printparamsJsonArray.push({ PTK_SetHFKey: lockType + ',' + keyA + ',' + keyB + ',' + keyFx });
}

/**
 * @description  设置校验/修改/锁定CRC口令
 * @param {Number} lockType 锁定设置。1 - 表示校验成功且修改完CRC口令后对CRC口令进行锁定；0 - 表示不锁定CRC口令
 * @param {String} oldCRCCommand 旧CRC口令，用于校验，格式为16进制数
 * @param {String} newCRCCommand 新CRC口令，用于校验，格式为16进制数
 */
function PTK_SetHFCRCCommand(lockType, oldCRCCommand, newCRCCommand) {
  printparamsJsonArray.push({ PTK_SetHFCRCCommand: lockType + ',' + oldCRCCommand + ',' + newCRCCommand });
}

/**
 * @description  设置校验/修改私有模式口令
 * @param {Number} lockType 锁定设置。	1 - 表示校验成功且修改完私有模式口令后对私有模式口令进行锁定；0 - 表示不锁定私有模式口令
 * @param {Number} oldPrivateCommand 旧私有模式口令，用于校验，格式为16进制数
 * @param {Number} newPrivateCommand 新私有模式口令，用于校验，格式为16进制数
 */
function PTK_SetHFPrivateCommand(lockType, oldPrivateCommand, newPrivateCommand) {
  printparamsJsonArray.push({ PTK_SetHFPrivateCommand: lockType + ',' + oldPrivateCommand + ',' + newPrivateCommand });
}

/**
 * @description 设置用户区锁定
 * @param {Number} lockType 锁定设置。	1 - 使能锁定；0 - 不使能锁定。
 * @param {Number} nStartBlock 锁定起始块
 * @param {Number} nBlockNum 锁定块数
 */
function PTK_LockHFUser(lockType, nStartBlock, nBlockNum) {
  printparamsJsonArray.push({ PTK_LockHFUser: lockType + ',' + nStartBlock + ',' + nBlockNum });
}

/**
 * @description 设置用户区锁定
 * @param {String} CFG_Set_0x10 CFG Set 0x10功能参数，格式为十六进制
 */
function PTK_SetHFCFG10(CFG_Set_0x10) {
  printparamsJsonArray.push({ PTK_SetHFCFG10: CFG_Set_0x10 });
}

/**
 * @description  设置用户区锁定
 * @param {String} CFG_Set_0x80 CFG Set 0x80功能参数，格式为十六进制
 */
function PTK_SetHFCFG80(CFG_Set_0x80) {
  printparamsJsonArray.push({ PTK_SetHFCFG80: CFG_Set_0x80 });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

/**
 * @@description 兼容API 旧版本
 * =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=
 */

/**
 * @description 打开通讯端口
 * @param {Number} px
 */
function OpenPort(px) {
  printparamsJsonArray.push({ OpenPort: px });
}

/**
 * @description 关闭通讯端口
 */
function ClosePort() {
  printparamsJsonArray.push({ ClosePort: '' });
}

/**
 * @description 设置PC机上串口的传输波特率
 * @param {Number} BaudRate 串口波特率
 * @param {Number} HandShake 是否使用硬件握手
 */
function SetPCComPort(BaudRate, HandShake) {
  printparamsJsonArray.push({ SetPCComPort: BaudRate + ',' + HandShake });
}

/**
 * @description  将打印机复位
 */
function PTK_Reset() {
  printparamsJsonArray.push({ PTK_Reset: '' });
}

/**
 * @description  打印存储在RAM或FLASH存储器里的软字体的名称清单
 */
function PTK_SoftFontList() {
  printparamsJsonArray.push({ PTK_SoftFontList: '' });
}

/**
 * @description 删除存储在RAM或FLASH存储器里的一个或所有的软字体
 * @param {String} pid 软字体ID，取值范围：A—Z或 * ；如果pid = ‘*’,打印机将删除存储在RAM或FLASH存储器里所有的软字体
 */
function PTK_SoftFontDel(pid) {
  printparamsJsonArray.push({ PTK_SoftFontDel: pid });
}

/**
 * @description  取消打印回转功能
 */
function PTK_DisableBackFeed() {
  printparamsJsonArray.push({ PTK_DisableBackFeed: '' });
}

/**
 * @description  设置打印回转功能
 * @param {Number} distance 回转距离,以点(dots)为单位
 */
function PTK_EnableBackFeed(distance) {
  printparamsJsonArray.push({ PTK_EnableBackFeed: distance });
}

/**
 * @description  设置打印机的工作状态
 * @param {Number} state  D：设置打印机为热感印(热传导)状态；P：设置打印机为连续送纸状态(缺省)；L：设置打印机为打印一张标签后，暂停等待用户确定再打印下一张标签；(确定方式：1.按”FEED”键；2.在安装剥纸器情况下，当用户取走标签后自动打印下一张标签)；CN: 切纸状态，仅在切纸频率设置为0时有效，单次打印任务结束失效，N为打印数量，取值范围：1~30000，N缺省时打印一张切一张；N有效时打印完N张标签后切下标签，N: 设置打印机为安装剥纸器状态。注意: 1.	切纸刀与剥纸器不能同时安装；2.	如果打印机状态设置不正确时，打印机前面板的READY指示灯将闪烁，请参考打印机用户手册的故障排除章节。
 */
function PTK_SetPrinterState(state) {
  printparamsJsonArray.push({ PTK_SetPrinterState: state });
}

/**
 * @description 取消错误反馈
 */
function PTK_DisableErrorReport() {
  printparamsJsonArray.push({ PTK_DisableErrorReport: '' });
}

/**
 * @description  设置错误反馈
 */
function PTK_EnableErrorReport() {
  printparamsJsonArray.push({ PTK_EnableErrorReport: '' });
}

/**
 * @description  要求打印机立刻反馈错误报告
 */
function PTK_FeedBack() {
  printparamsJsonArray.push({ PTK_FeedBack: '' });
}

/**
 * @description 读取打印机端口内数据
 * @param {String} dataName 自定义数据名称
 * @param {Number} dataSize 读取数据长度
 */
function PTK_ReadData(dataName, dataSize) {
  printparamsJsonArray.push({ PTK_ReadData: dataName + ',' + dataSize });
}

function PTK_ErrorReport(wPort, rPort, BaudRate, HandShake, TimeOut) {
  printparamsJsonArray.push({
    PTK_ErrorReport: wPort + ',' + rPort + ',' + BaudRate + ',' + HandShake + ',' + TimeOut,
  });
}

function PTK_ErrorReportNet(PrintIPAddress, PrintetPort) {
  printparamsJsonArray.push({ PTK_ErrorReportNet: PrintIPAddress + ',' + PrintetPort });
}

function PTK_ErrorReportUSB(USBport) {
  printparamsJsonArray.push({ PTK_ErrorReportUSB: USBport });
}

/**
 * @description  调整打印文字字间距
 * @param {Number} gap 字间距调节值，以点(dots)为单位.取值范围为-99 — 99.
 */
function PTK_SetFontGap(gap) {
  printparamsJsonArray.push({ PTK_SetFontGap: gap });
}

function PTK_SetBarCodeFontName(Name, FontW, FontH) {
  printparamsJsonArray.push({ PTK_SetBarCodeFontName: Name + ',' + FontW + ',' + FontH });
}

/**
 * @description  将下载到打印机的字体与PTK_DrawText使用的字体ID  A~Z匹配
 * @param {Number} StoreType  下载字体在打印机中的存储位置，0：SDRAM,  1：FLASH.
 * @param {String} Fontname  重命名下载字体ID，取值范围：A-Z
 * @param {String} DownloadFontName 下载字体在打印机中的名称
 */
function PTK_RenameDownloadFont(StoreType, Fontname, DownloadFontName) {
  printparamsJsonArray.push({ PTK_RenameDownloadFont: StoreType + ',' + Fontname + ',' + DownloadFontName });
}

function PTK_SetCharSets(BitValue, CharSets, CountryCode) {
  printparamsJsonArray.push({ PTK_SetCharSets: BitValue + ',' + CharSets + ',' + CountryCode });
}

function PTK_ReadRFTagDataNet(IPAddress, Port, nFeedbackPort, nRFPower, bFeed, strRFData) {
  printparamsJsonArray.push({
    PTK_ReadRFTagDataNet: IPAddress + ',' + Port + ',' + nFeedbackPort + ',' + nRFPower + ',' + bFeed + ',' + strRFData,
  });
}

function PTK_ReadRFTagDataUSB(usbPort, nDataBlock, nRFPower, bFeed, strRFData) {
  printparamsJsonArray.push({
    PTK_ReadRFTagDataUSB: usbPort + ',' + nDataBlock + ',' + nRFPower + ',' + bFeed + ',' + strRFData,
  });
}

function PTK_ReadHFTagUIDUSB(usbPort, pFeed, readbuffer) {
  printparamsJsonArray.push({ PTK_ReadHFTagUIDUSB: usbPort + ',' + pFeed + ',' + readbuffer });
}

/**
 * @description  设置打印机的撕纸偏移和定位偏移
 * @param {Number} tear_offset 撕纸偏移，单位为 mm
 * @param {Number} tph_offset 定位偏移，单位为 mm
 */
function PTK_SetTearAndTphOffset(tear_offset, tph_offset) {
  printparamsJsonArray.push({ PTK_SetTearAndTphOffset: tear_offset + ',' + tph_offset });
}

function PTK_AnyGraphicsDownload(pcxname, filename, ratio, width, height, iDire) {
  printparamsJsonArray.push({
    PTK_AnyGraphicsDownload: pcxname + ',' + filename + ',' + ratio + ',' + width + ',' + height + ',' + iDire,
  });
}
function PTK_GetErrState() {
  printparamsJsonArray.push({ PTK_GetErrState: '' });
}

function PTK_GetInfo() {
  printparamsJsonArray.push({ PTK_GetInfo: '' });
}

/**
 * @description  打印已存储在打印机RAM或FLASH存储器里的图形名称清单
 */
function PTK_BinGraphicsList() {
  printparamsJsonArray.push({ PTK_BinGraphicsList: '' });
}

/**
 * @description  删除存储在打印机中的bin图形
 * @param {String} pid 打印机内部存储的图形名称，最大长度为16个字符
 */
function PTK_BinGraphicsDel(pid) {
  printparamsJsonArray.push({ PTK_BinGraphicsDel: pid });
}

function PTK_RecallBinGraphics(px, py, name) {
  printparamsJsonArray.push({ PTK_RecallBinGraphics: px + ',' + py + ',' + name });
}

function PTK_GetUSBID(USBDeviceSerial) {
  printparamsJsonArray.push({ PTK_GetUSBID: USBDeviceSerial });
}

//*=^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^= =^-^=

function Status_M(Msg) {
  var status_t = parseInt(Msg.toString().replace('W10', ''));
  var status;
  switch (status_t) {
    case 0:
      status = '无错误';
      break;
    case 1:
      status = '语法错误';
      break;
    case 4:
      status = '正在打印中';
      break;
    case 82:
      status = '碳带检测出错';
      break;
    case 83:
      status = '标签检测出错';
      break;
    case 86:
      status = '切刀检测出错';
      break;
    case 87:
      status = '打印头未关闭';
      break;
    case 88:
      status = '暂停状态';
      break;
    case 108:
      status = '设置RFID写数据的方式和内容区域执行失败，输入参数错误';
      break;
    case 109:
      status = 'RFID标签写入数据失败，已达到重试次数';
      break;
    case 110:
      status = '写入RFID数据失败，但未超过重试次数';
      break;
    case 111:
      status = 'RFID标签校准失败';
      break;
    case 112:
      status = '设置RFID读取数据的方式和内容区域执行失败，输入参数错误';
      break;
    case 116:
      status = '读取RFID标签数据失败';
      break;
    default:
      status = '未知错误';
      break;
  }
  return status;
}
