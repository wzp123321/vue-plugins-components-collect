import { Component } from "vue"

export enum globalnavChooseMode {
    multiple = "multiple",
    single = "single"
}

export type globalnavMenuItem = {
    type: string,
    title: string,
    count: number,
    icon: Component,
    divided: boolean,
    checked: boolean,
    chooseMode?: globalnavChooseMode,
    list?: globalnavMenuItem[]
  }

  export type navUserinfo = {
    avatar?: string,
    nickname: string,
    organizationList?: globalnavMenuItem[],
    configList: globalnavMenuItem[]
}
  
export interface navProps {
    logo: string,
    navTitle: string,
    leftMenuConfig?: globalnavMenuItem[],
    rightMenuConfig?: globalnavMenuItem[],
    hospitalConfig?: globalnavMenuItem,
    userinfoConfig: navUserinfo
}