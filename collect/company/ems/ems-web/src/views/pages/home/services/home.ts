import { postRequest } from '@/services/request';

const HomeServiceService = {
  /**
   * 获取布局数据
   */
  async getComponentPage() {
    const res: HttpRequestModule.ResTemplate<HomeModule.ComponentPage[]> = await postRequest(
      '/admin/componentPageConfig/queryComponentPage',
      {},
    );
    return res;
  },
};
export default HomeServiceService;
