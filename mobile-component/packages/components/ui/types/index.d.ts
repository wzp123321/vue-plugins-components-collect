/// <reference path="./comps.d.ts" />
declare module '@zpackage/mobile-package/ui' {
  export function install(): void;
}

export {};

declare global {
  interface Uni {}
}

declare type image = (typeof import('../assets/**/*'))[];
