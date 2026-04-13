/// <reference path="./comps.d.ts" />
declare module '@tiansu/ts-mobile-biz-ui' {
  export function install(): void;
}

export {};

declare global {
  interface Uni {
    $u?: {
      routeIntercept?: (config: Record<string, any>, resolve: (flag: boolean) => void) => void;
    };
  }
}
declare type UniToastRef = (typeof import('./tsm-toast'))['ToastRef'];
declare type UniCollapseRef = (typeof import('./tsm-collapse'))['CollapseRef'];
declare type UniMessageRef = (typeof import('./tsm-message'))['MessageRef'];
declare type UniInputRef = (typeof import('./tsm-input'))['InputRef'];
declare type UniUploadRef = (typeof import('./tsm-upload'))['UploadRef'];
declare type UniDatetimePickerRef = (typeof import('./tsm-datetime-picker'))['DatetimePickerRef'];
declare type UniPickerRef = (typeof import('./tsm-picker'))['PickerRef'];
declare type UniCalendarRef = (typeof import('./tsm-calendar'))['CalendarRef'];
declare type UniTextareaRef = (typeof import('./tsm-textarea'))['TextareaRef'];
declare type UniFormRef = (typeof import('./tsm-form'))['FormRef'];
