import { h, render } from 'vue';
import WorkflowTaskDetail from './workflow-task-detail-doc.vue';
import { UrlOpenTypeEnum } from '../../models/UrlOpenTypeEnum';
import { MD5Util } from './md5-util';
import RestResult from '../../models/RestResult';
import UiActionDefinition from '../../models/UiActionDefinition';
import { MyTaskTypeEnum } from '../../models/MyTaskTypeEnum';
/**
 * 流程中心对外开放工具类
 */
export class TeWorkflowUtil {
  /**
   * 渲染任务详情组件到指定容器或body
   * @param el 详情页面父容器的id号或容器对象
   */
  private static renderToElement(
    tenantId: string,
    taskInstanceId: string,
    processInstanceId: string,
    identityType: string[],
    axios: any,
    el: string | HTMLElement | null | undefined
  ) {
    return new Promise<RestResult<string>>((resolve, reject) => {
      let content = document.body;
      if (el) {
        content = typeof el === 'string' ? document.getElementById(el)! : el;
      }
      let vnode = h(WorkflowTaskDetail, {
        tenantId: tenantId,
        body: el ? false : true,
        taskInstanceId: taskInstanceId,
        processInstanceId: processInstanceId,
        identityType: identityType,
        axios: axios,
        onCancle: (data: RestResult<string>) => {
          !el && render(null, content);
          reject(data);
        },
        onConfirm: (data: RestResult<string>) => {
          !el && render(null, content);
          resolve(data);
        },
      });
      //渲染组件vnode到content上
      render(vnode, content);
    });
  }
  /**
   * 打开任务详情，分两种情况
   * 1.任务详情页用的是平台提供的组件，以组件的方式渲染到页面中
   * 2.任务详情页用的是业务自己的页面，以新窗口的方式打开
   * @param tenantId 租户id
   * @param taskInstanceId 任务实例id
   * @param processInstanceId 流程实例id
   * @param axios 外部传入的axios实例，把项目中用于发请求的axios对象传进来即可，这样组件里面发的请求就会走项目中的拦截器。
   * @param uiAction 注册的uiAction
   * @param identityType 身份类型，可以是执行人(TODO)、发起人(STARTER)、抄送人(CC)，完成人(COMPLETED)。默认为执行人
   * @param appendTo dom对象或容器id，当用的是平台提供的任务详情组件，且此参数传了有效值，就会把任务详情组件渲染到该dom对象中，
   * 不传会把任务详情组件渲染到body元素下，传了无效值会报错。当用的是业务自己的任务详情页面时，就不传
   * @return 返回一个promise对象,resove状态对应流程操作成功，reject状态对应操作取消和操作失败
   */
  public static openTaskDetail(
    tenantId: string,
    taskInstanceId: string,
    processInstanceId: string,
    axios: any,
    uiAction: any,
    identityType: string[],
    appendTo: string | HTMLElement | null = null
  ) {
    return new Promise((resove, reject) => {
      identityType = identityType || [MyTaskTypeEnum.TODO];
      if (!uiAction || (uiAction as UiActionDefinition).openType === UrlOpenTypeEnum.COMPONENT) {
        //渲染平台组件
        this.renderToElement(tenantId, taskInstanceId, processInstanceId, identityType, axios, appendTo)
          .then((data) => {
            resove(data);
          })
          .catch((data) => {
            reject(data);
          });
      } else if ((uiAction as UiActionDefinition).openType === UrlOpenTypeEnum.POPUP) {
        //弹一个独立窗口打开业务页面
        let uia = uiAction as UiActionDefinition;
        if (uia.jumpUrl) {
          let url = this.setParams(uia.jumpUrl!, {
            processInstanceId: processInstanceId,
            taskInstanceId: taskInstanceId,
            identityType: identityType.join(','),
          });
          url = this.setSign(url);
          this.openUrl(url).then((data) => {
            resove({ data: '', errcode: data, errmsg: '' });
          });
        } else {
          reject('跳转页面地址jumpUrl不能为空');
          console.error('跳转页面地址jumpUrl不能为空');
        }
      } else {
        reject('暂不支持的打开方式：' + (uiAction as UiActionDefinition).openType);
        console.error('暂不支持的打开方式：' + (uiAction as UiActionDefinition).openType);
      }
    });
  }
  /**
   * 设置签名
   * @param uri 要跳转的完成的url
   * @returns 加上签名的url
   */
  private static setSign(url: string): string {
    if (url.indexOf('ts_sign=') > -1) {
      //如果已经包含ts_sign参数，则不再做签名
      return url;
    }
    let params = {};
    let uri: string = '';
    if (url.startsWith('http') || url.startsWith('https')) {
      //处理掉前面的ip，端口和协议
      uri = url.replace('http://', '').replace('https://', '');
      uri = uri.substring(uri.indexOf('/'));
    } else {
      uri = url;
    }
    uri = uri.startsWith('/') ? uri : '/' + uri; // 以'/' 开头
    let firstReg = uri.indexOf('?');
    if (firstReg > -1) {
      //url带参数的话，把参数解析程json对象，作为生成签名的参数
      let ss: string[] = uri.substring(firstReg + 1).split('&');
      uri = uri.substring(0, firstReg);
      for (let i = 0; i < ss.length; i++) {
        let ind = ss[i].indexOf('=');
        params[ss[i].substring(0, ind)] = ss[i].substring(ind + 1);
      }
    }
    return url + (firstReg > -1 ? '&' : '?') + 'ts_sign=' + MD5Util.signHttpMd5('GET', uri, params, null);
  }
  /**
   * 将param拼接到url后面
   * @param url 跳转的url
   * @param param url后面的参数
   * @return 拼接参数后url
   */
  private static setParams(url: string, params?: any): string {
    let paramsList = '';
    if (params) {
      for (let key in params) {
        if (paramsList) {
          paramsList = paramsList + '&' + key + '=' + params[key];
        } else {
          paramsList = paramsList + key + '=' + params[key];
        }
      }
    }
    url += paramsList ? (url.indexOf('?') > -1 ? '&' : '?') + paramsList : '';
    return url;
  }
  private static openUrl(url: string) {
    let h = window.innerHeight - 100;
    let w = window.innerWidth > 1200 ? 1200 : window.innerWidth;
    let top = window.outerHeight - window.innerHeight;
    let left = (window.innerWidth - w) / 2;
    let szFeatures = 'top=' + top + ',';
    szFeatures += 'left=' + left + ',';
    szFeatures += 'width=' + w + ',';
    szFeatures += 'height=' + h + ',';
    szFeatures += 'directories=no,';
    szFeatures += 'status=no,toolbar=no,location=no,';
    szFeatures += 'menubar=no,';
    szFeatures += 'scrollbars=yes,';
    szFeatures += 'resizable=yes'; //channelmode
    let openobj = window.open(url, '', szFeatures);
    return new Promise((resolve, reject) => {
      let loop = setInterval(() => {
        if (openobj?.closed) {
          clearInterval(loop);
          resolve('0');
        }
      }, 1000);
    });
  }

  /**
   * 创建流程
   * @param businessCategoryCode 业务分类
   * @param appInstanceId 应用id
   * @param name 流程名称
   * @param description 流程描述
   * @returns
   */
  public static createProcess(businessCategoryCode: string, appInstanceId: string, name: string, description?: string) {
    businessCategoryCode || console.error('业务分类不能传空');
    appInstanceId || console.error('应用id不能传空');
    name || console.error('流程名称不能传空');

    let url = '/hlmsWorkflow/processGraph/1';
    url = this.setParams(url, {
      businessCategoryCode: businessCategoryCode,
      appInstanceId: appInstanceId,
      name: name,
      description: description || '',
    });
    url = this.setSign(url);
    window.open(url);
  }
  /**
   * 编辑流程
   * @param processDefinitionId 流程定义id
   */
  public static editProcess(processDefinitionId: string) {
    processDefinitionId || console.error('流程id不能传空');
    let url = '/hlmsWorkflow/processGraph/1';
    url = this.setParams(url, {
      processDefinitionId: processDefinitionId,
    });
    url = this.setSign(url);
    window.open(url);
  }
  /**
   * 创建表单
   * @param businessCategoryCode 业务分类
   * @param appInstanceId 应用id
   * @param tenantId 租户id
   * @param name 表单名称
   * @returns
   */
  public static createForm(businessCategoryCode: string, appInstanceId: string, tenantId: string, name: string) {
    businessCategoryCode || console.error('业务分类不能传空');
    appInstanceId || console.error('应用id不能传空');
    name || console.error('表单名称不能传空');

    let url = '/hlmsWorkflow/formGraph/1';
    url = this.setParams(url, {
      businessCategoryCode: businessCategoryCode,
      appInstanceId: appInstanceId,
      name: name,
    });
    url = this.setSign(url);
    window.open(url);
  }
  /**
   * 编辑表单
   * @param formDefinitionId 表单定义id
   * @param tenantId 租户id
   */
  public static editForm(formDefinitionId: string, tenantId: string) {
    formDefinitionId || console.error('表单id不能传空');
    let url = '/hlmsWorkflow/formGraph/1';
    url = this.setParams(url, {
      formDefinitionId: formDefinitionId,
    });
    url = this.setSign(url);
    window.open(url);
  }
  private static getStorage(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}');
  }
}
