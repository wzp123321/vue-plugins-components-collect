import { ref } from 'vue';
import axios from 'axios';

/** 基础 GET/POST 请求 hook */
export const useBasicRequest = () => {
  const getLoading = ref(false);
  const postLoading = ref(false);
  const result = ref('');

  const doGet = async () => {
    getLoading.value = true;
    try {
      // 使用公共测试API
      const res = await axios.get('https://jsonplaceholder.typicode.com/users/1', { timeout: 5000 });
      result.value = `✅ GET 成功：${res.data.name} | ${res.data.email}`;
    } catch {
      result.value = '❌ 请求失败（可能网络不通）';
    } finally {
      getLoading.value = false;
    }
  };

  const doPost = async () => {
    postLoading.value = true;
    try {
      const res = await axios.post(
        'https://jsonplaceholder.typicode.com/posts',
        { title: '测试', body: 'hello', userId: 1 },
        { timeout: 5000 },
      );
      result.value = `✅ POST 成功：id=${res.data.id}, title="${res.data.title}"`;
    } catch {
      result.value = '❌ 请求失败';
    } finally {
      postLoading.value = false;
    }
  };

  return { getLoading, postLoading, result, doGet, doPost };
}
