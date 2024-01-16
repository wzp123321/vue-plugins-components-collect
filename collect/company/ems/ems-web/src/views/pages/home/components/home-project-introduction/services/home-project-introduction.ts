import { postRequest } from '@/services/request';

const ProjectIntroductionService = {
  /**
   * 项目介绍数据
   */
  async getProjectIntroduction(uId: number) {
    const res: HttpRequestModule.ResTemplate<ProjectIntroductionModule.IntroduceData> = await postRequest(
      '/portal/component/project',
      uId,
    );
    return res;
  },
};

export default ProjectIntroductionService;