/* eslint-disable consistent-return */
import { ref } from 'vue';
import type { AxiosInstance } from 'axios';
import { TeMessage } from '@tiansu/element-plus';
import { AddCommentModule } from '../alarm-detail.function';

export const useAddComment = (axiosInstance: AxiosInstance) => {
  const AddCommentFunction = new AddCommentModule();
  // const addCommentForm = ref({ alarmNature: EAlarmNature.其他, comment: '' });
  const addCommentForm = ref({ comment: '' });
  const submitAdd = async (
    recordId: number,
    type: string,
    userName: string,
  ) => {
    // 新增备注不填无法确认逻辑
    if (addCommentForm.value.comment === '') {
      TeMessage.error('请输入备注内容');
      return;
    }
    const obj = {
      comment: addCommentForm.value.comment,
      recordId,
      type,
      username: userName,
      // alarmNature: addCommentForm.value.alarmNature,
    };
    AddCommentFunction.addCommentQuery = obj;
    const res = await AddCommentFunction.addComment(axiosInstance);
    if (res) {
      addCommentForm.value.comment = '';
    }
    return res;
  };
  return { addCommentForm, submitAdd };
};
