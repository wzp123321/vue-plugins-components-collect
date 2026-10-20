/**
 * 精确四舍五入
 * @param number 数字
 * @param precision 精度 0~20
 * @returns string 处理结果
 */
export function toFixed(number: number, precision: number): string {
  if (precision > 20 || precision < 0) {
    throw new RangeError("toFixed方法精度范围为0~20！");
  }

  const numberString = number.toString();
  const numberArr = numberString.split(".");

  // 整数 直接补0
  if (numberArr.length < 2) {
    return padNum(numberString, precision);
  }

  const intNum = numberArr[0];
  const deciNum = numberArr[1];
  const lastNum = deciNum[precision];

  // 满足精度
  if (deciNum.length === precision) {
    return numberString;
  }

  // 不满足且位数小于精度 需要补0
  if (deciNum.length < precision) {
    return padNum(numberString, precision);
  }

  // 不满足且位数大于精度 判断是否需要进位
  let result: string = intNum + "." + deciNum.slice(0, precision);

  if (parseInt(lastNum, 10) >= 5) {
    const times = Math.pow(10, precision);
    const changedInt = parseInt(result.replace(".", ""), 10);
    const isOver = 1 / changedInt < 0;
    if (isOver) {
      result = ((changedInt - 1) / times).toString();
    } else {
      result = ((changedInt + 1) / times).toString();
    }
    result = padNum(result.toString(), precision);
  }
  return result;
}

/**
 * 根据精度补0
 * @param number 数字
 * @param precision 精度 0~20
 * @returns string 处理结果
 */
function padNum(num: string, precision: number): string {
  const dotPos = num.indexOf(".");
  if (precision === 0) {
    return num;
  } else if (dotPos === -1) {
    // 整数
    num += ".";
    num += "0".repeat(precision);
  } else {
    // 小数
    const need = precision - (num.length - dotPos - 1);
    num += "0".repeat(need);
  }
  return num;
}
