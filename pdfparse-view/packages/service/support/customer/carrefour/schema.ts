import { connectionMongo, getMongoModel } from "common/mongo";

const { Schema } = connectionMongo;

export const shopCollectionName = 'shops';

const ShopSchema = new Schema({
  shopName: {
    type: String,
    required: true
  },
  keywords: {
    type: Object, 
    required: true
  },
  digitalHumanImageId: {
    type: String,
    required: true
  },
  backgroundId: {
    type: String,
    required: true
  },
  toneValue: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: () => new Date()
  }
});

try {
  ShopSchema.index({ updatedAt: -1 });
} catch (error) {
  console.log(error);
}

export const MongoShop = getMongoModel(shopCollectionName, ShopSchema);
