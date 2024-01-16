/*
 * @Description: 权限配置
 * @Author: zpwan
 * @Date: 2022-06-28 15:57:32
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-07-21 15:53:25
 */
import { defineComponent, onMounted } from 'vue';

import pcContainer from './services/permission-configure-container.service';
import PermissionConfigureTree from './services/permission-configure-tree.service';

import PermissionConfigureTreeSelect from './pc-treeselect/pc-treeselect.vue';

import { FGetQueryParam } from '@/utils/index';
import { FSetSessionStorageData } from '@/utils/token';

export default defineComponent({
  name: 'PConfigurationPage',
  components: {
    'pc-tree-select': PermissionConfigureTreeSelect,
  },
  setup() {
    if (FGetQueryParam('tenantId')) {
      FSetSessionStorageData('energy-corpid', FGetQueryParam('tenantId'));
    }

    const areaTree: PermissionConfigureTree = new PermissionConfigureTree();
    const commercialTree: PermissionConfigureTree = new PermissionConfigureTree();
    const assessTree: PermissionConfigureTree = new PermissionConfigureTree();

    pcContainer.init().then(() => {
      areaTree.init(
        '区域树',
        pcContainer?.permissionDetail?.areaTree,
        pcContainer?.permissionDetail?.choosedTreeIdList4AreaTree,
      );
      commercialTree.init(
        '业态树',
        pcContainer?.permissionDetail?.formatTree,
        pcContainer?.permissionDetail?.choosedTreeIdList4FormatTree,
      );
      assessTree.init(
        '支路树',
        pcContainer?.permissionDetail?.branchTree,
        pcContainer?.permissionDetail?.choosedTreeIdList4BranchTree,
      );
    });

    /**
     * 提交
     */
    const handleSubmit = () => {
      const roleAreaTreeIds = areaTree.checkedList;
      const roleFormatTreeIds = commercialTree.checkedList;
      const roleBranchTreeIds = assessTree.checkedList;
      pcContainer.submit(roleAreaTreeIds, roleFormatTreeIds, roleBranchTreeIds);
    };

    return {
      areaTree,
      commercialTree,
      assessTree,
      pcContainer,

      handleSubmit,
    };
  },
});
