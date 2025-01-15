import { UpdateClbPermissionProps } from '../../support/permission/collaborator';
import { PermissionValueType } from '../../support/permission/type';

export type UpdateDatasetCollaboratorBody = UpdateClbPermissionProps & {
  datasetId?: string;
  resourceId?: string;
  resourceType?: PerResourceTypeEnum;
};

export type DatasetCollaboratorDeleteParams = {
  resourceId: string;
  tmbId: string;
};
