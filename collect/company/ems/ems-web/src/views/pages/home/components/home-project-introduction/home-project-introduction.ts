import { defineComponent, reactive, toRefs, onMounted, toRef } from 'vue';
import ProjectIntroductionService from './services/home-project-introduction';
import { noConfigImg } from '@/config/config';
import { FGetStorageData } from '@/utils/token';
import ServiceConfig from '@/config/request';

import HomeComponentContainer from '../home-component-container/home-component-container.vue';

export interface ProjectIntroductionState {
  isLoading: boolean;
  isNoData: boolean;
  isNoDataMsg: string;
  isNoConfig: boolean;
  isNoConfigMsg: string;
  imageSrc: string;
  textIntroduction: string;
}
export default defineComponent({
  name: 'ProjectIntroduction',
  components: {
    'h-component-container': HomeComponentContainer,
  },
  props: {
    uid: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const title = toRef(props, 'title');

    const projectIntroductionState = reactive<ProjectIntroductionState>({
      isLoading: false,
      isNoData: false,
      isNoDataMsg: '暂无数据',
      isNoConfig: false,
      isNoConfigMsg: '暂未配置',
      imageSrc: '',
      textIntroduction: '',
    });
    /**
     * 初始化
     */
    onMounted(() => {
      getEnergyAnalyseData(props.uid);
    });
    const getEnergyAnalyseData = async (id: number) => {
      projectIntroductionState.isLoading = true;
      projectIntroductionState.isNoData = false;
      projectIntroductionState.isNoConfig = false;
      await ProjectIntroductionService.getProjectIntroduction(id)
        .then((res: HttpRequestModule.ResTemplate<ProjectIntroductionModule.IntroduceData>) => {
          if (res && res.code === 200) {
            if (res.data) {
              projectIntroductionState.textIntroduction = res?.data?.componentDescription;
              projectIntroductionState.imageSrc =
                res?.data?.componentPictureUri === null
                  ? ''
                  : ServiceConfig.BASE_URL +
                      '/file/downloadSingleFile/' +
                      res?.data?.componentPictureUri +
                      '.png?tenantCode=' +
                      FGetStorageData('energy-corpid') ?? '';
            } else {
              projectIntroductionState.isNoData = true;
              projectIntroductionState.isNoDataMsg = res.message ? res.message : '暂无数据';
            }
          } else {
            projectIntroductionState.isNoDataMsg = '暂未配置';
            projectIntroductionState.isNoConfig = true;
          }
          projectIntroductionState.isLoading = false;
        })
        .catch(() => {
          projectIntroductionState.isLoading = false;
          projectIntroductionState.isNoConfig = true;
        })
        .finally(() => {
          projectIntroductionState.isLoading = false;
        });
    };

    return {
      ...toRefs(projectIntroductionState),
      noConfigImg,
      title,
    };
  },
});
