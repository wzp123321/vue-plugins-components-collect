import { defineStore } from 'pinia';

const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    userName: null,
    logined: false, //是否登录
    uid: null,
    jianjie: null,
    auth: null, //登录的token
    showLoginForm: false, //显示登录/注册表单
  }),
});

export default useUserInfoStore;
