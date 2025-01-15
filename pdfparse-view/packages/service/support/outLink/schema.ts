import { connectionMongo, getMongoModel } from '../../common/mongo';
const { Schema } = connectionMongo;
import { OutLinkSchema as SchemaType } from '@fastgpt/global/support/outLink/type';
import {
  TeamCollectionName,
  TeamMemberCollectionName
} from '@fastgpt/global/support/user/team/constant';
import { AppCollectionName } from '../../core/app/schema';

const OutLinkSchema = new Schema({
  shareId: {
    type: String,
    required: true
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: TeamCollectionName,
    required: true
  },
  tmbId: {
    type: Schema.Types.ObjectId,
    ref: TeamMemberCollectionName,
    required: true
  },
  appId: {
    type: Schema.Types.ObjectId,
    ref: AppCollectionName,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  usagePoints: {
    type: Number,
    default: 0
  },
  lastTime: {
    type: Date
  },
  responseDetail: {
    type: Boolean,
    default: false
  },
  limit: {
    maxUsagePoints: {
      type: Number,
      default: -1
    },
    expiredTime: {
      type: Date
    },
    QPM: {
      type: Number,
      default: 1000
    },
    hookUrl: {
      type: String
    }
  },
  app: {
    type: Object // could be FeishuAppType | WecomAppType | ...
  },
  immediateResponse: {
    type: String
  },
  defaultResponse: {
    type: String
  },
  appStorePublished: {
    type: Boolean,
    default: false // 应用市场发布开关，默认值为 false
  },
  published: {
    name: {
      type: String, // 应用的别名
    },
    types: {
      type: [String], // 字符串数组，存储分类标签
      default: [] // 默认值为空数组
    },
    description: {
      type: String, // 应用的描述
    },
    image: {
      type: String, // 应用的图片URL
    }
  },
  digitalMan: {
    imageUrl: {
      type: String
    },
    enable: {
      type: Boolean,
      default: false
    }
  }
});

try {
  OutLinkSchema.index({ shareId: -1 });
} catch (error) {
  console.log(error);
}

export const MongoOutLink = getMongoModel<SchemaType>('outlinks', OutLinkSchema);
