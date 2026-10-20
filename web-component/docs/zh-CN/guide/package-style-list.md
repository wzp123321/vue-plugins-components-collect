## 样式表

### 1. 导入样式：
```js
import '@tiansu/ts-web-package/dist/styles/index.css';
```

### 2. 样式变量集合：

- 字体（font-family）：

| 变量名 | `--te-font-family-d-din` | `--te-font-family-d-din-bold` |
| :-: | :-: | :-: |
| value值 | `"d-din"`| `"d-din-bold"` |

- 间距（space）：

| 变量名 | <div style="width:110px">`--te-space-4`</div> | <div style="width:110px">`--te-space-8`</div> | <div style="width:120px">`--te-space-12`</div> | <div style="width:120px">`--te-space-16`</div> | <div style="width:120px">`--te-space-20`</div> | <div style="width:120px">`--te-space-24`</div> | <div style="width:120px">`--te-space-32`</div> | <div style="width:120px">`--te-space-40`</div> | <div style="width:120px">`--te-space-48`</div> | <div style="width:120px">`--te-space-64`</div> | <div style="width:120px">`--te-space-80`</div> | <div style="width:120px">`--te-space-96`</div> | <div style="width:130px">`--te-space-160`</div> |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| <div style="width:55px">value值</div> | `4px` | `8px` | `12px` | `16px` | `20px` | `24px` | `32px` | `40px` | `48px` | `64px` | `80px` | `96px` | `160px` |

- 字号（font-size）：

| 变量名 | <div style="width:160px">`--te-font-size-b12`</div> | <div style="width:160px">`--te-font-size-b14`</div> | <div style="width:160px">`--te-font-size-b16`</div> | <div style="width:160px">`--te-font-size-b20`</div> | <div style="width:160px">`--te-font-size-b28`</div> | <div style="width:160px">`--te-font-size-b40`</div> | <div style="width:160px">`--te-font-size-h16`</div> | <div style="width:160px">`--te-font-size-h20`</div> | <div style="width:160px">`--te-font-size-h24`</div> | <div style="width:160px">`--te-font-size-h32`</div> | <div style="width:170px">`--te-font-size-oh40`</div> | <div style="width:170px">`--te-font-size-oh48`</div> | 
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| <div style="width:55px">value值</div> | `12px` | `14px` | `16px` | `20px` | `28px` | `40px` | `16px` | `20px` | `24px` | `32px` | `40px` | `48px` |

- 阴影（box-shadow）：

| 变量名 | <div style="width:270px">`--te-box-shadow`</div> | <div style="width:275px">`--te-box-shadow-up`</div> | <div style="width:270px">`--te-box-shadow-left`</div> | <div style="width:270px">`--te-box-shadow-right`</div> | <div style="width:230px">`--te-box-shadow-lighter`</div> | <div style="width:230px">`--te-box-shadow-lighter-up`</div> | <div style="width:230px">`--te-box-shadow-lighter-left`</div> | <div style="width:230px">`--te-box-shadow-lighter-right`</div> | <div style="width:230px">`--te-box-shadow-light`</div> | <div style="width:240px">`--te-box-shadow-light-up`</div> | <div style="width:240px">`--te-box-shadow-light-left`</div> | <div style="width:230px">`--te-box-shadow-light-right`</div> | <div style="width:280px">`--te-box-shadow-dark`</div> | <div style="width:290px">`--te-box-shadow-dark-up`</div> | <div style="width:290px">`--te-box-shadow-dark-left`</div> | <div style="width:290px">`--te-box-shadow-dark-right`</div> | 
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| <div style="width:55px">value值</div> | 0px 2px 6px -3px rgba(0, 0, 0, 0.1), 0px 4px 12px rgba(0, 0, 0, 0.08), <br> 0px 6px 18px 6px rgba(0, 0, 0, 0.06) | 0px -2px 6px -3px rgba(0, 0, 0, 0.1), <br> 0px -4px 12px rgba(0, 0, 0, 0.08), <br> 0px -6px 18px 6px rgba(0, 0, 0, 0.06) | -2px 0px 6px -3px rgba(0, 0, 0, 0.1), <br> -4px 0px 12px rgba(0, 0, 0, 0.08), <br> -6px 0px 18px 6px rgba(0, 0, 0, 0.06) | 2px 0px 6px -3px rgba(0, 0, 0, 0.1), <br> 4px 0px 12px rgba(0, 0, 0, 0.08), <br> 6px 0px 18px 6px rgba(0, 0, 0, 0.06) | 0px 2px 6px rgba(0, 0, 0, 0.14) | 0px -2px 6px rgba(0, 0, 0, 0.14) | -2px 0px 6px rgba(0, 0, 0, 0.14) | 2px 0px 6px rgba(0, 0, 0, 0.14) | 0px 2px 6px rgba(0, 0, 0, 0.12), <br> 0px 4px 12px rgba(0, 0, 0, 0.1) | 0px -2px 6px rgba(0, 0, 0, 0.12), <br> 0px -4px 12px rgba(0, 0, 0, 0.1) | -2px 0px 6px rgba(0, 0, 0, 0.12), <br> -4px 0px 12px rgba(0, 0, 0, 0.1) | 2px 0px 6px rgba(0, 0, 0, 0.12), <br> 4px 0px 12px rgba(0, 0, 0, 0.1) | 0px 4px 12px -6px rgba(0, 0, 0, 0.08), <br> 0px 6px 18px rgba(0, 0, 0, 0.06), <br> 0px 8px 24px 12px rgba(0, 0, 0, 0.04) | 0px -4px 12px -6px rgba(0, 0, 0, 0.08), <br> 0px -6px 18px rgba(0, 0, 0, 0.06), <br> 0px -8px 24px 12px rgba(0, 0, 0, 0.04) | -4px 0px 12px -6px rgba(0, 0, 0, 0.08), <br> -6px 0px 18px rgba(0, 0, 0, 0.06), <br> -8px 0px 24px 12px rgba(0, 0, 0, 0.04) | 4px 0px 12px -6px rgba(0, 0, 0, 0.08), <br> 6px 0px 18px rgba(0, 0, 0, 0.06), <br> 8px 0px 24px 12px rgba(0, 0, 0, 0.04) |

### 3. 样式替换：

| 旧 | 新 |
| :-: | :-: |
| `--te-text-color-regular` | `--te-text-color-primary` |
| `--te-border-color-darker` | `--te-color-info` |
| `--te-border-color-dark` | `--te-border-color-component-hover` |
| `--te-border-color` | `--te-border-color-component` |
| `--te-border-color-light` | `--te-border-color-divider` |
| `--te-border-color-lighter` | `--te-border-color-divider-lighter` |
| `--te-border-color-extra-light` | - |
| `--te-color-primary-dark-2` | `--te-color-primary-active` |
| `--te-color-primary-light-3` | `--te-color-primary-hover` |
| `--te-color-primary-light-5` | `--te-color-primary-disabled` |
| `--te-color-primary-light-7` | `--te-color-primary-light-border` |
| `--te-color-primary-light-8` | `--te-color-primary-light-hover` |
| `--te-color-primary-light-9` | `--te-color-primary-light` |   
| `--te-color-danger-dark-2` | `--te-color-danger-active` |
| `--te-color-danger-light-3` | `--te-color-danger-hover` |
| `--te-color-danger-light-5` | `--te-color-danger-disabled` |
| `--te-color-danger-light-7` | `--te-color-danger-light-border` |
| `--te-color-danger-light-8` | `--te-color-danger-light-hover` |
| `--te-color-danger-light-9` | `--te-color-danger-light` |   
| `--te-color-success-dark-2` | `--te-color-success-active` |
| `--te-color-success-light-3` | `--te-color-success-hover` |
| `--te-color-success-light-5` | `--te-color-success-disabled` |
| `--te-color-success-light-7` | `--te-color-success-light-border` |
| `--te-color-success-light-8` | `--te-color-success-light-hover` |
| `--te-color-success-light-9` | `--te-color-success-light` |   
| `--te-color-warning-dark-2` | `--te-color-warning-active` |
| `--te-color-warning-light-3` | `--te-color-warning-hover` |
| `--te-color-warning-light-5` | `--te-color-warning-disabled` |
| `--te-color-warning-light-7` | `--te-color-warning-light-border` |
| `--te-color-warning-light-8` | `--te-color-warning-light-hover` |
| `--te-color-warning-light-9` | `--te-color-warning-light` |   
| `--te-color-info-dark-2` | `--te-color-info-active` |
| `--te-color-info-light-3` | `--te-color-info-hover` |
| `--te-color-info-light-5` | `--te-color-info-disabled` |
| `--te-color-info-light-7` | `--te-color-info-light-border` |
| `--te-color-info-light-8` | `--te-color-info-light-hover` |
| `--te-color-info-light-9` | `--te-color-info-light` |   
| `--te-disabled-border-color` | `--te-border-color-divider` |   
| `--te-disabled-bg-color` | `--te-bg-color-secondary` |   
| `--te-disabled-text-color` | `--te-text-color-placeholder` |   
| `--te-fill-color-darker` | `--te-bg-color-component-active` |   
| `--te-fill-color-dark` | `--te-bg-color-component` |   
| `--te-fill-color-light` | `--te-bg-color-secondary` |   
| `--te-fill-color-lighter` | `--te-bg-color-page` |   
| `--te-fill-color-extra-light` | - |   
| `--te-fill-color-blank` | `--te-bg-color-blank` |   