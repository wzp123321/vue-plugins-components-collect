import { request } from '@/utils/request';

export const getAuthorize = (data: { cipher: string }) =>
  request({
    baseURL: '',
    url: '/gateway/v1/auth/authorize',
    method: 'post',
    data,
  });

export const getShare = (data: { cipher: string }) =>
  request({
    baseURL: '',
    url: '/gateway/v1/auth/share',
    method: 'post',
    data,
  });
