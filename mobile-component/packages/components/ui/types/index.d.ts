/// <reference path="./comps.d.ts" />
declare module '@tiansu/ts-mobile-ui' {
  export function install(): void;
}

export {};

declare global {
  interface Uni {}
}

declare type image = (typeof import('../assets/**/*'))[];
