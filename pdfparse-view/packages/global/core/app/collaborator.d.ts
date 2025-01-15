import { UpdateClbPermissionProps } from '../../support/permission/collaborator';
import { PermissionValueType } from '../../support/permission/type';

export type UpdateAppCollaboratorBody = UpdateClbPermissionProps & {
  appId?: string;
  resourceId?: string;
  resourceType?: PerResourceTypeEnum;
};

export type AppCollaboratorDeleteParams = {
  resourceId: string;
  tmbId: string;
};
