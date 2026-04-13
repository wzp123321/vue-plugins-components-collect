import { number as testNumber, array as testArray, empty as testEmpty } from './test';
import config from '../config/config';
declare const uni: any;

type StyleObject = Record<string, string | number>;

function trim(str: string, pos: 'both' | 'left' | 'right' | 'all' = 'both'): string {
  const value = String(str);
  if (pos === 'both') return value.replace(/^\s+|\s+$/g, '');
  if (pos === 'left') return value.replace(/^\s*/, '');
  if (pos === 'right') return value.replace(/(\s*$)/g, '');
  return value.replace(/\s+/g, '');
}

function deepClone<T>(obj: T): T {
  if ([null, undefined, NaN, false].includes(obj as any)) return obj;
  if (typeof obj !== 'object' && typeof obj !== 'function') return obj;
  const result: any = testArray(obj) ? [] : {};
  for (const key in obj as any) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = (obj as any)[key];
      result[key] = typeof val === 'object' ? deepClone(val) : val;
    }
  }
  return result;
}

export function bem(
  name: string,
  fixed: (string | undefined | null)[] = [],
  change: [string, boolean][] = [],
  customClass?: string | Record<string, boolean>
): string {
  const prefix = `tsm-${name}--`;
  const classes: Record<string, boolean> = {};
  fixed.forEach(item => {
    if (item) classes[prefix + item] = true;
  });
  change.forEach(([className, condition]) => {
    if (condition) classes[prefix + className] = true;
  });
  if (customClass) {
    if (typeof customClass === 'string') classes[customClass] = true;
    else Object.assign(classes, customClass);
  }
  return Object.keys(classes).join(' ');
}

export function getPx(value: string | number, unit = false): number | string {
  if (testNumber(value)) return unit ? `${value}px` : Number(value);
  const stringValue = String(value);
  if (/(rpx|upx)$/.test(stringValue)) {
    const px = uni.upx2px(parseInt(stringValue));
    return unit ? `${px}px` : Number(px);
  }
  const px = parseInt(stringValue);
  return unit ? `${px}px` : px;
}

export function sys(): any {
  return uni.getSystemInfoSync();
}

export function addStyle(
  customStyle: string | StyleObject,
  target: 'object' | 'string' = 'object'
): string | StyleObject {
  if (
    testEmpty(customStyle) ||
    (typeof customStyle === 'object' && target === 'object') ||
    (typeof customStyle === 'string' && target === 'string')
  ) {
    return customStyle;
  }
  if (target === 'object') {
    const styleArray = trim(String(customStyle)).split(';');
    const style: StyleObject = {};
    for (let i = 0; i < styleArray.length; i++) {
      if (!styleArray[i]) continue;
      const item = styleArray[i].split(':');
      style[trim(item[0])] = trim(item[1]);
    }
    return style;
  }
  let output = '';
  if (Object.prototype.toString.call(customStyle) === '[object Object]') {
    Object.entries(customStyle).forEach(([key, val]) => {
      output += `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${val};`;
    });
  }
  return trim(output);
}

export function addUnit(value: string | number = 'auto', unit = ''): string {
  let currentUnit = unit;
  if (!currentUnit) currentUnit = config.unit || 'px';
  let currentValue: string | number = value;
  if (currentUnit === 'rpx' && testNumber(String(currentValue))) currentValue = Number(currentValue) * 2;
  const normalized = String(currentValue);
  return testNumber(normalized) ? `${normalized}${currentUnit}` : normalized;
}

export function deepMerge(
  targetOrigin: Record<string, any>,
  source: Record<string, any> = {}
): Record<string, any> | false {
  const target = deepClone(targetOrigin);
  if (typeof target !== 'object' || typeof source !== 'object') return false;
  for (const prop in source) {
    if (!Object.prototype.hasOwnProperty.call(source, prop)) continue;
    if (prop in target) {
      if (source[prop] == null) target[prop] = source[prop];
      else if (typeof target[prop] !== 'object') target[prop] = source[prop];
      else if (typeof source[prop] !== 'object') target[prop] = source[prop];
      else if (target[prop].concat && source[prop].concat) target[prop] = target[prop].concat(source[prop]);
      else target[prop] = deepMerge(target[prop], source[prop]) as any;
    } else {
      target[prop] = source[prop];
    }
  }
  return target;
}

export default {
  bem,
  getPx,
  sys,
  addStyle,
  addUnit,
  deepMerge,
};
