export type TwoDimensionArray = [string[], string[]];
export type ThreeDimensionArray = [string[], string[], string[]];

export type State = {
  valueSync: undefined | number | string | number[];
  visible: boolean;
  contentVisible: boolean;
  popover: null | {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  valueChangeSource: string;
  timeArray: [] | TwoDimensionArray;
  dateArray: [] | ThreeDimensionArray;
  valueArray: number[];
  oldValueArray: number[];
};

export const fields = {
  YEAR: 'year',
  MONTH: 'month',
  DAY: 'day',
};
