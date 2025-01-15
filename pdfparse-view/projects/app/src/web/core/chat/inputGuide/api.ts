import { GET, POST, DELETE, PUT } from '@/web/common/api/request';


export const getCountChatInputGuideTotal = (data: any) =>
  GET<any>(`/core/chat/inputGuide/countTotal`, data);
/**
 * Get chat input guide list
 */
export const getChatInputGuideList = (data: any) =>
  GET<any>(`/core/chat/inputGuide/list`, data);

export const queryChatInputGuideList = (data: any, url?: string) => {
  if (url) {
    return GET<any>(url, data, {
      withCredentials: !url
    });
  }
  return POST<any>(`/core/chat/inputGuide/query`, data);
};

export const postChatInputGuides = (data: any) =>
  POST<any>(`/core/chat/inputGuide/create`, data);
export const putChatInputGuide = (data: any) =>
  PUT(`/core/chat/inputGuide/update`, data);
export const delChatInputGuide = (data: any) =>
  POST(`/core/chat/inputGuide/delete`, data);
export const delAllChatInputGuide = (data: any) =>
  POST(`/core/chat/inputGuide/deleteAll`, data);
