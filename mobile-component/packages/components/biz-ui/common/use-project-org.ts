import { computed } from 'vue';
import { type Item } from './types';
import OrganizationV3OpenApi from '../api/OrganizationV3OpenApi';
import OrgQd from '../models/OrgQd';
import { OrganizationIdentityTypeEnum } from '../models/OrganizationIdentityTypeEnum';

interface Props {
  http: any;
  tenantId: string;
  organizationId?: string;
  shareOrg?: boolean;
  // 院区id
  campusIds?: string[];
  // 组织属性
  orgIdentityType?: OrganizationIdentityTypeEnum[];
}

export const useProjectOrg = (props: Props) => {
  const getOrgQd = () => {
    const orgQd = {
      ...new OrgQd(),
      orgIdEq: props.organizationId,
      projectQd: {
        projectIdIn: props.campusIds,
        orgIdentityTypeIn: props.orgIdentityType,
      },
      includeSharedOrg: props.shareOrg,
    };
    return orgQd;
  };

  const getOrgList = computed(() => {
    if (!props.campusIds?.length) {
      return undefined;
    }
    return async () => {
      const params: OrgQd = getOrgQd();
      const res = await OrganizationV3OpenApi.queryOrganizationForListByOrgQd(props.http, props.tenantId, params).catch(
        () => {}
      );
      const list: Item[] = (res?.data || []).map((item: Item) => ({
        ...item,
        id: item.id!,
        name: item.name!,
        organizationId: item.id,
      }));
      return list;
    };
  });

  return { getOrgList, getOrgQd };
};
