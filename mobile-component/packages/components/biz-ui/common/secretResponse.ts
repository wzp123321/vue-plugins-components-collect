import { SafetyService } from './safety';

const DOT = '&.&';
const LIST = '&L&';
declare type b = b[] | { [pro: string]: b } | string;
class Res {
  public data?: b;
  public secretFields: string[] = [];
}

enum SensitiveFieldType {
  object = 'object',
  list = 'list',
}

class SensitiveField {
  public name: string = '';
  public type?: SensitiveFieldType;
  public last = false;
}
/**
 * FIXME 本代码仅为逻辑用例，请自行完成代码的抽象
 */
export class secretResponse {
  constructor(res: Res) {
    this.resolve(res);
  }

  private resolve(res: Res) {
    //无敏感字段直接返回
    if (!res.secretFields) {
      return res.data;
    }
    if (res.secretFields === null || res.secretFields.length === 0) {
      return res.data;
    }
    // 有加密字段
    if (res.secretFields[0] === '@@@@@@@@@@') {
      this.resolveFieldTree(res);
    } else {
      for (let field of res.secretFields) {
        let fieldChain = this.getFieldChain(field);
        // this.resolveField(res, fieldChain, aesKey);//方式1：&.&表示对象取值，&L&表示数组类型
        this.resolveFieldV2(res, fieldChain); //方式2：&.&表示对象取值，数组类型通过代码进行判断
      }
    }
    return res.data;
  }

  /**
   *  加密字段数组返回 secretFields: ["@@@@@@@@@@"] 时，按照树的遍历来解密
   * @param obj
   * @param aesKey
   */
  private resolveFieldTree(obj: Res) {
    let temp: Res = obj;
    if (temp && temp.data) {
      if (temp.data instanceof Array) {
        this.dealTreeInnerData(temp.data as b[]);
      } else if (typeof temp.data === 'object') {
        this.dealTreeData(temp.data);
      }
    }
    return temp;
  }

  /**
   *  树递归
   * @param obj
   * @param aesKey
   */
  private dealTreeData(obj: { [pro: string]: b }) {
    let result = obj;
    let arrayKeys = Object.keys(result as object);
    //利用foreach循环遍历
    if (arrayKeys) {
      arrayKeys.forEach((key) => {
        let data = result[key];
        if (data) {
          if (data instanceof Array) {
            this.dealTreeInnerData(data as []);
          } else if (typeof data === 'object') {
            this.dealTreeData(data as {});
          } else {
            let encryptedStrData = String(data);
            if (encryptedStrData.substring(0, 10) === '@@@@@@@@@@') {
              let length = encryptedStrData.length;
              result[key] = this.decrypt(encryptedStrData.substring(10, length));
            }
          }
        }
      });
    }
  }

  /**
   *  树内部递归
   * @param list
   * @param aesKey
   */
  private dealTreeInnerData(list: b[]): void {
    let resultList: b[] = list;
    for (let k = 0; k < resultList.length; k++) {
      if (resultList[k] instanceof Array) {
        this.dealTreeInnerData(resultList[k] as []); //递归调用
      } else if (typeof resultList[k] === 'object') {
        this.dealTreeData(resultList[k] as {});
      } else {
        let encryptedStrInnerData = resultList[k].toString();
        if (encryptedStrInnerData.substring(0, 10) === '@@@@@@@@@@') {
          let length = encryptedStrInnerData.length;
          resultList[k] = this.decrypt(encryptedStrInnerData.substring(10, length));
        }
      }
    }
  }

  /**
   *  使用temp作为临时变量存储对象，数据逻辑为将指定字段铺平，当temp类型为array类型，需要进行对遍历
   * @param obj
   * @param fieldChain
   * @param aesKey
   */
  private resolveFieldV2(obj: Res, fieldChain: SensitiveField[]) {
    let temp: b = obj as {};

    for (let i = 0; i < fieldChain.length; i++) {
      const chain = fieldChain[i];
      if (i === fieldChain.length - 1) {
        //最后一层，进行解密替换
        if (temp) {
          if (temp instanceof Array) {
            temp.forEach((t) => {
              t = t as { [pro: string]: b };
              if (t && t[chain.name]) {
                if (t[chain.name] instanceof Array) {
                  for (let j = 0; j < (t[chain.name] as []).length; j++) {
                    (t[chain.name] as b[])[j] = this.decrypt((t[chain.name] as b[])[j] as string);
                  }
                } else {
                  t[chain.name] = this.decrypt(t[chain.name] as string);
                }
              }
            });
          } else {
            temp = temp as { [pro: string]: b };
            if (temp[chain.name]) {
              if (temp[chain.name] instanceof Array) {
                for (let j = 0; j < (temp[chain.name] as []).length; j++) {
                  (temp[chain.name] as b[])[j] = this.decrypt((temp[chain.name] as b[])[j] as string);
                }
              } else {
                temp[chain.name] = this.decrypt(temp[chain.name] as string);
              }
            }
          }
        }
      } else {
        if (temp) {
          if (temp instanceof Array) {
            let list: b[] = [];
            temp.forEach((t) => {
              if (t) {
                t = t as { [pro: string]: b };
                if (t[chain.name] && t[chain.name] instanceof Array) {
                  list.push(...(t[chain.name] as []));
                } else {
                  list.push(t[chain.name]);
                }
              }
            });
            temp = list;
          } else {
            temp = (temp as { [pro: string]: b })[chain.name];
          }
        }
      }
    }
  }

  private decrypt(encrypted: string) {
    if (encrypted) {
      let encryptedStr = encrypted.toString();
      if (encryptedStr.substring(0, 10) === '@@@@@@@@@@') {
        let length = encryptedStr.length;
        encrypted = encryptedStr.substring(10, length);
      }
      encrypted = SafetyService.decryptGcm(encrypted);
      return encrypted;
    } else {
      return encrypted;
    }
  }

  private getFieldChain(field: string): SensitiveField[] {
    let segments: SensitiveField[] = [];
    let dots = field.split(DOT);
    for (let i = 0; i < dots.length; i++) {
      const item = dots[i];
      let f = new SensitiveField();
      let l = item.split(LIST);
      if (l.length === 1) {
        f.name = item;
        f.type = SensitiveFieldType.object;
      } else if (l.length === 2) {
        f.name = l[0];
        f.type = SensitiveFieldType.list;
      } else {
        throw new Error('不合规的敏感字段：' + field);
      }
      if (i === dots.length - 1) {
        f.last = true;
      }
      segments.push(f);
    }
    return segments;
  }
}
