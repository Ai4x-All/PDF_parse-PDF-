import {
  UpdateAppCollaboratorBody,
  AppCollaboratorDeleteParams
} from '@fastgpt/global/core/app/collaborator';
import { DELETE, GET, POST } from '@/web/common/api/request';
import { CollaboratorItemType } from '@fastgpt/global/support/permission/collaborator';
import axios from 'axios';

export const getCollaboratorList = async (resourceId: string): Promise<CollaboratorItemType[]> => {
  try {
    // 使用 Axios 发送 GET 请求，并将参数作为查询字符串传递
    const response = await axios.get<CollaboratorItemType[]>('/api/pro/resourcePermission/listByResourceId', {
      params: { resourceId } // 将 resourceId 作为查询参数
    });

    // 打印调试信息，确保返回的数据正确
    console.log('Fetched collaborator data:', response.data);

    // 返回响应中的数据
    return response.data;
  } catch (error) {
    console.error('Error fetching collaborator list:', error);

    // 返回空数组，表示未获取到协作者列表
    return [];
  }
};

export const postUpdateAppCollaborators = (body: UpdateAppCollaboratorBody) =>
  POST('/pro/resourcePermission/createOrUpdate', body);

export const deleteAppCollaborators = (params: AppCollaboratorDeleteParams) =>
  POST('/pro/resourcePermission/delete', { ...params });
