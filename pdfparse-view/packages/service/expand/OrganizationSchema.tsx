import { connectionMongo, getMongoModel } from '../common/mongo';
import { Organization } from '@fastgpt/global/common/expand/type';
const { Schema } = connectionMongo;

export const organizationCollectionName = 'organizations_team';

const OrganizationSchema = new Schema({
  teamID: {
    type: String,
    required: true,
    unique: true,
  },
  rolesStructure: {
    type: String,
    required: true,
    default: '{}',
  },
  createTime: {
    type: Date,
    default: () => new Date(),
  }
});


export const MongoOrganization = getMongoModel<Organization>(
  organizationCollectionName,
  OrganizationSchema
);
