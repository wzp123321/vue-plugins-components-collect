<template>
  <el-form :model="projectProduction" :rules="rules" ref="ruleForm" v-loading="loading" @submit.native.prevent>
    <el-form-item label="项目标题" prop="componentTitle">
      <el-input
        v-inputFilter:search="{ allowSpace: false }"
        v-model.trim="projectProduction.componentTitle"
        :maxlength="18"
        placeholder="请输入项目标题"
      ></el-input>
    </el-form-item>
    <el-form-item label="项目简介" prop="componentDescription">
      <el-input
        v-model.trim="projectProduction.componentDescription"
        :rows="2"
        :maxlength="200"
        type="textarea"
        v-inputFilter:search
        placeholder="请输入项目简介"
      />
    </el-form-item>
    <el-form-item label="项目封面(最大限制5M)">
      <iot-file-upload :imageUrl="imgUrl" v-model:file="file" @uploadFile="getFile"></iot-file-upload>
    </el-form-item>
    <el-form-item style="text-align: center" v-show="!loading">
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </el-form-item>
  </el-form>
</template>
<script lang="ts">
/**
 * 项目介绍
 */
import { computed, defineComponent, ref, onMounted } from 'vue';
import useCurrentInstance from '../../../../utils/use-current-instance';
import { ElForm } from 'element-plus';
import { useStore } from 'vuex';
import IotFileUpload from '../../../../components/iot-file-upload/iot-file-upload';
import productSetting from '../../../../services/view/page-diy/project-production-setting/index';
import { FGetSessionStorageData } from '@/utils/token';
interface homeOptionData {
  componentCode: string;
  h: number;
  i: number;
  id: number;
  moved: boolean;
  name: string;
  sketchMap: string;
  w: number;
  x: number;
  y: number;
}
export default defineComponent({
  name: 'ProjectProductionSetting',
  components: { IotFileUpload },
  props: {
    projectProductionId: {
      type: Number,
    },
  },
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const store = useStore();
    const projectProductionId = computed(() => {
      props.projectProductionId;
    });
    const ruleForm = ref(ElForm);
    let homeOptionData = ref<any>({});
    const projectProduction = ref<{
      componentTitle: string;
      componentDescription: string;
    }>({
      componentTitle: '',
      componentDescription: '',
    });
    let imgUrl = ref<string>('');

    const loading = ref<boolean>(false);
    // 校验规则
    const rules = {
      componentTitle: [
        {
          required: true,
          message: '请输入项目标题',
          trigger: 'blur',
        },
      ],
      componentDescription: [
        {
          required: true,
          message: '请输入项目简介',
          trigger: 'blur',
        },
      ],
    };
    // 图片
    // const file = ref<File>(new File([], '', undefined));
    let file: any;
    const getFile = (data: File | null) => {
      file = data;
    };
    const getList = async () => {
      try {
        loading.value = true;
        const res = await productSetting.getInitData(homeOptionData.value.id);
        if (res?.code == 200 && res?.success) {
          if (res?.data) {
            projectProduction.value.componentTitle = res.data.componentTitle;
            projectProduction.value.componentDescription = res.data.componentDescription;
            imgUrl.value =
              import.meta.env.VITE_BASE_URL +
                '/file/downloadSingleFile/' +
                res.data.componentPictureUri +
                '.png?tenantCode=' +
                (FGetSessionStorageData('energy-corpid') as string) ?? '';
          }
        }
      } catch (err) {
        if (!(err as any)?.code?.includes('4f0')) {
          proxy.$message.error('查询项目介绍失败');
        }
      } finally {
        loading.value = false;
      }
    };
    // 上传前
    const onBeforeUpload = () => {};
    // 提交
    const onSubmit = async () => {
      try {
        ruleForm.value.validate(async (valid: boolean) => {
          if (valid) {
            let formData = new FormData(); // FormData 对象
            formData.append('file', file); // 文件对象
            formData.append('componentCode', homeOptionData.value.componentCode);
            formData.append('id', homeOptionData.value.id);
            formData.append('componentTitle', projectProduction.value.componentTitle);
            formData.append('componentDescription', projectProduction.value.componentDescription);
            const res = await productSetting.saveData(formData);
            if (res.code === 200 && res.success) {
              context.emit('closeDialog');
              return proxy.$message.success(res.message);
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                return proxy.$message.error(res.message);
              }
            }
          } else {
            return false;
          }
        });
      } catch (err) {
        console.log(err);
        return proxy.$message.error('提交失败');
      }
    };
    onMounted(async () => {
      homeOptionData.value = store.state.homeOption;
      await getList();
    });
    return {
      projectProduction,
      file,
      rules,
      loading,
      projectProductionId,
      imgUrl,
      ruleForm,

      onBeforeUpload,
      onSubmit,
      getFile,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.el-form-item) {
  margin-bottom: 22px !important;
}
</style>
