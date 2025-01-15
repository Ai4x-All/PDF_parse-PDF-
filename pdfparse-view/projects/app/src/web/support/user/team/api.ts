import { GET, POST, PUT, DELETE } from '@/web/common/api/request';
import { UpdateClbPermissionProps } from '@fastgpt/global/support/permission/collaborator';
import {
  CreateTeamProps,
  InviteMemberProps,
  InviteMemberResponse,
  UpdateInviteProps,
  UpdateTeamProps
} from '@fastgpt/global/support/user/team/controller.d';
import type { TeamTagItemType, TeamTagSchema } from '@fastgpt/global/support/user/team/type';
import {
  TeamTmbItemType,
  TeamMemberItemType,
  TeamMemberSchema
} from '@fastgpt/global/support/user/team/type.d';
import { FeTeamPlanStatusType, TeamSubSchema } from '@fastgpt/global/support/wallet/sub/type';
import axios from 'axios';

/* --------------- team  ---------------- */
export const getTeamList = async (status: `${TeamMemberSchema['status']}`): Promise<TeamTmbItemType[]> => {
  try {
    const response = await axios.get<TeamTmbItemType[]>(`/api/pro/team/getTeamList`, {
      params: { status }
    });
    
    // 使用 response.data 获取数据
    const teamList: TeamTmbItemType[] = response.data;
    console.log(teamList)
    // 如果 response 数据为 undefined，返回空数组，防止 React Query 报错
    return teamList || [];
  } catch (error) {
    console.error('Error fetching team list:', error);
    // 错误处理逻辑，确保不会返回 undefined
    return [];
  }
};

export const postCreateTeam = (data: CreateTeamProps) =>
  POST<string>(`/proApi/support/user/team/create`, data);
export const putUpdateTeam = (data: UpdateTeamProps) => PUT(`/support/user/team/update`, data);
export const putSwitchTeam = (teamId: string) =>
  PUT<string>(`/proApi/support/user/team/switch`, { teamId });

/* --------------- team member ---------------- */
export const getTeamMembers = async (): Promise<TeamMemberItemType[]> => {
  try {
    const response = await axios.get<TeamMemberItemType[]>(`/api/pro/user/team/member/list`);

    // 提取 response.data，确保返回 TeamMemberItemType[] 类型
    return response.data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    // 错误处理，返回空数组
    return [];
  }
};
export const postInviteTeamMember = (data: InviteMemberProps) =>
  POST<InviteMemberResponse>(`/proApi/support/user/team/member/invite`, data);
export const putUpdateMemberName = (name: string) =>
  PUT(`/proApi/support/user/team/member/updateName`, { name });
export const delRemoveMember = (tmbId: string) =>
  DELETE(`/proApi/support/user/team/member/delete`, { tmbId });
export const updateInviteResult = (data: UpdateInviteProps) =>
  PUT('/proApi/support/user/team/member/updateInvite', data);
export const delLeaveTeam = (teamId: string) =>
  DELETE('/proApi/support/user/team/member/leave', { teamId });

/* -------------- team collaborator -------------------- */
export const updateMemberPermission = (data: UpdateClbPermissionProps) => {
  // 将 tmbIds 改为 tmbId，并移除 tmbIds
  const { tmbIds, ...rest } = data; 
  const transformedData = {
    ...rest,
    tmbId: tmbIds // 将 tmbIds 重命名为 tmbId
  };

  // 发送 POST 请求
  return axios.post('/api/pro/resourcePermission/team/createOrUpdate', transformedData);
};
export const delMemberPermission = (tmbId: string) =>
  DELETE('/pro/resourcePermission/team/delete', { tmbId });

/* --------------- team tags ---------------- */
export const getTeamsTags = () => GET<TeamTagSchema[]>(`/proApi/support/user/team/tag/list`);
export const loadTeamTagsByDomain = (domain: string) =>
  GET<TeamTagItemType[]>(`/proApi/support/user/team/tag/async`, { domain });

/* team limit */
export const checkTeamExportDatasetLimit = (datasetId: string) =>
  GET(`/support/user/team/limit/exportDatasetLimit`, { datasetId });
export const checkTeamWebSyncLimit = () => GET(`/support/user/team/limit/webSyncLimit`);
export const checkTeamDatasetSizeLimit = (size: number) =>
  GET(`/support/user/team/limit/datasetSizeLimit`, { size });

/* plans */
export const getTeamPlanStatus = () =>
  GET<FeTeamPlanStatusType>(`/support/user/team/plan/getTeamPlanStatus`, { maxQuantity: 1 });
export const getTeamPlans = () =>
  GET<TeamSubSchema[]>(`/proApi/support/user/team/plan/getTeamPlans`);
