import { ensureLang } from '../utils/lang'
import guideLocale from '../i18n/pages/guide.json'
import componentLocale from '../i18n/pages/component.json'
import mobileComponentLocale from '../i18n/mobile/pages/component.json'
import mobileGuideLocale from '../i18n/mobile/pages/guide.json'
import toolsLocale from '../i18n/pages/tools.json'
import mobileToolsLocale from '../i18n/mobile/pages/tools.json'

function getGuideSidebar() {
  return Object.fromEntries(
    Object.entries(guideLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang)),
    ])
  )
}

function getComponentsSideBar() {
  return Object.fromEntries(
    Object.entries(componentLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, '/component')),
    ])
  )
}

function getMobileComponentsSideBar() {
  return Object.fromEntries(
    Object.entries(mobileComponentLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, '/mobile/component')),
    ])
  )
}

function getMobileGuideSidebar() {
  return Object.fromEntries(
    Object.entries(mobileGuideLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, '/mobile/guide')),
    ])
  )
}

function getToolsSideBar() {
  return Object.fromEntries(
    Object.entries(toolsLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang)),
    ])
  )
}

function getMobileToolsSideBar() {
  return Object.fromEntries(
    Object.entries(mobileToolsLocale).map(([lang, val]) => [
      lang,
      Object.values(val).map((item) => mapPrefix(item, lang, '/mobile')),
    ])
  )
}

// return sidebar with language configs.
// this might create duplicated data but the overhead is ignorable
const getSidebars = () => {
  return {
    '/guide/': getGuideSidebar(),
    '/component/': getComponentsSideBar(),
    '/mobile/component/': getMobileComponentsSideBar(),
    '/mobile/guide/': getMobileGuideSidebar(),
    '/tools/': getToolsSideBar(),
    '/mobile/tools/': getMobileToolsSideBar(),
  }
}

type Item = {
  text: string
  children?: Item[]
  link?: string
}

function mapPrefix(item: Item, lang: string, prefix = '') {
  if (item.children && item.children.length > 0) {
    return {
      ...item,
      children: item.children.map((child) => mapPrefix(child, lang, prefix)),
    }
  }
  return {
    ...item,
    link: `${ensureLang(lang)}${prefix}${item.link}`,
  }
}

export const sidebars = getSidebars()
