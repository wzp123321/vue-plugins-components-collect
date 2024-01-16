import { postRequest } from '../../request';
interface HttpType {
  loginName: string;
  password: string;
}
const Logins = {
  /**
   * 登录接口
   * @param params
   * @returns
   */
  async loginIn(params: HttpType) {
    const url = '/user/login';
    const res = await postRequest(url, params);
    return res;
  },
  /**
   * 登出
   * @param params
   * @returns
   */
  async loginOut() {
    const url = '/user/loginOut';
    const res = await postRequest(url);
    return res;
  },
};

export default Logins;
