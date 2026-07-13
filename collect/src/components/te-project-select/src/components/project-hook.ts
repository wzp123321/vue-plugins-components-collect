/**
 * 项目选择器 hook (简化复刻)
 */
import { computed, ref, type Ref } from 'vue';
import { searchProjects, mockProjects, type MockProject } from '../../../_mock/project';

export interface ProjectHookParams {
  searchValue: Ref<string>;
  multiple: Ref<boolean>;
  needAllProjects: Ref<boolean>;
  tenantId: string;
}

export const projectHook = (params: ProjectHookParams) => {
  const initFlag = ref(true);

  const allProjects = computed(() => searchProjects(params.searchValue.value));

  const selectedName = computed(() => {
    if (!params.needAllProjects.value) return '全部项目';
    return '请选择项目';
  });

  return {
    initFlag,
    allProjects,
    selectedName,
    rawProjects: mockProjects,
  };
};

export type { MockProject };
