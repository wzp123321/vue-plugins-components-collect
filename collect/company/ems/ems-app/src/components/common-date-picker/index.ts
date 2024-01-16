import { fields } from './common-date-picker.api';

export function getDefaultStartValue(fieldsValue: string) {
  const year = new Date().getFullYear() - 150;
  switch (fieldsValue) {
    case fields.YEAR:
      return year.toString();
    case fields.MONTH:
      return year + '-01';
    default:
      return year + '-01-01';
  }
}

export function getDefaultEndValue(fieldsValue: string) {
  const year = new Date().getFullYear() + 150;
  switch (fieldsValue) {
    case fields.YEAR:
      return year.toString();
    case fields.MONTH:
      return year + '-12';
    default:
      return year + '-12-31';
  }
}

export function getYearStartEnd(startDate: string, endDate: string) {
  let year = new Date().getFullYear();
  let start = year - 150;
  let end = year + 150;
  if (startDate) {
    const _year = new Date(startDate).getFullYear();
    if (!isNaN(_year) && _year < start) {
      start = _year;
    }
  }
  if (endDate) {
    const _year = new Date(endDate).getFullYear();
    if (!isNaN(_year) && _year > end) {
      end = _year;
    }
  }

  return {
    start,
    end,
  };
}

export function _l10nColumn(fieldsValue: string, array: number[], normalize?: boolean) {
  switch (fieldsValue) {
    case fields.YEAR:
      return array;
    case fields.MONTH:
      return [array[1], array[0]];
    default:
      return normalize ? [array[2], array[0], array[1]] : [array[1], array[2], array[0]];
  }
}
