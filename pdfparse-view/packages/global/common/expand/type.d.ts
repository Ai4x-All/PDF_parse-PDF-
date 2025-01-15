import { Document } from 'mongoose';

export interface Organization extends Document {
  teamID: string;
  rolesStructure: string;
  createTime: Date
}
