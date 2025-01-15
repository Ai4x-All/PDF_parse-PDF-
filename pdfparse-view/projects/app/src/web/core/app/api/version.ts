import { PostPublishAppProps, PostRevertAppProps } from '@/global/core/app/api';
import { GET, POST, DELETE, PUT } from '@/web/common/api/request';
import { AppChatConfigType } from '@fastgpt/global/core/app/type';
import { AppVersionSchemaType } from '@fastgpt/global/core/app/version';
import { StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/node';
import { PaginationProps, PaginationResponse } from '@fastgpt/web/common/fetch/type';

export type getLatestVersionQuery = {
  appId: string;
};

export type getLatestVersionBody = {};

export type getLatestVersionResponse = {
  nodes: StoreNodeItemType[];
  edges: StoreEdgeItemType[];
  chatConfig: AppChatConfigType;
};
export const getAppLatestVersion = (data: getLatestVersionQuery) =>
  GET<getLatestVersionResponse>('/core/app/version/latest', data);

export const postPublishApp = (appId: string, data: PostPublishAppProps) =>
  POST(`/core/app/version/publish?appId=${appId}`, data);

export const getPublishList = (data: PaginationProps<{ appId: string }>) =>
  POST<PaginationResponse<AppVersionSchemaType>>('/core/app/version/list', data);

export const postRevertVersion = (appId: string, data: PostRevertAppProps) =>
  POST(`/core/app/version/revert?appId=${appId}`, data);
