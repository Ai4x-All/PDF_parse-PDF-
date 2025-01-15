import { MongoDatasetData } from '@fastgpt/service/core/dataset/data/schema';
import {
  CreateDatasetDataProps,
  PatchIndexesProps,
  UpdateDatasetDataProps
} from '@fastgpt/global/core/dataset/controller';
import { insertDatasetDataVector } from '@fastgpt/service/common/vectorStore/controller';
import { getDefaultIndex } from '@fastgpt/global/core/dataset/utils';
import { jiebaSplit } from '@fastgpt/service/common/string/jieba';
import { deleteDatasetDataVector } from '@fastgpt/service/common/vectorStore/controller';
import { DatasetDataItemType } from '@fastgpt/global/core/dataset/type';
import { getVectorModel } from '@fastgpt/service/core/ai/model';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { ClientSession } from '@fastgpt/service/common/mongo';

/* insert data.
 * 1. create data id
 * 2. insert pg
 * 3. create mongo data
 */
export async function insertData2Dataset({
  teamId,
  tmbId,
  datasetId,
  collectionId,
  q,
  a = '',
  chunkIndex = 0,
  indexes,
  model,
  session,
  importStatusCode = 0
}: CreateDatasetDataProps & {
  model: string;
  session?: ClientSession;
  importStatusCode?: Number
}) {
  if (!q || !datasetId || !collectionId || !model) {
    return Promise.reject('q, datasetId, collectionId, model is required');
  }
  if (String(teamId) === String(tmbId)) {
    return Promise.reject("teamId and tmbId can't be the same");
  }

  const qaStr = getDefaultIndex({ q, a }).text;

  // empty indexes check, if empty, create default index
  indexes =
    Array.isArray(indexes) && indexes.length > 0
      ? indexes.map((index) => ({
          text: index.text,
          dataId: undefined,
          defaultIndex: index.text.trim() === qaStr
        }))
      : [getDefaultIndex({ q, a })];
  
  if (!indexes.find((index) => index.defaultIndex)) {
    indexes.unshift(getDefaultIndex({ q, a }));
  } else if (q && a && !indexes.find((index) => index.text === q)) {
    // push a q index
    indexes.push({
      defaultIndex: false,
      text: q
    });
  }
  indexes = addExtraIndexIfRequired(q,indexes, importStatusCode);
  indexes = indexes.slice(0, 1000);

  // insert to vector store
  const result = await Promise.all(
    indexes.map((item) =>
      insertDatasetDataVector({
        query: item.text,
        model: getVectorModel(model),
        teamId,
        datasetId,
        collectionId
      })
    )
  );

  // create mongo data
  const [{ _id }] = await MongoDatasetData.create(
    [
      {
        teamId,
        tmbId,
        datasetId,
        collectionId,
        q,
        a,
        fullTextToken: jiebaSplit({ text: qaStr }),
        chunkIndex,
        indexes: indexes?.map((item, i) => ({
          ...item,
          dataId: result[i].insertId
        }))
      }
    ],
    { session }
  );

  return {
    insertId: _id,
    tokens: result.reduce((acc, cur) => acc + cur.tokens, 0)
  };
}

/**
 * update data
 * 1. compare indexes
 * 2. insert new pg data
 * session run:
 *  3. update mongo data(session run)
 *  4. delete old pg data
 */
export async function updateData2Dataset({
  dataId,
  q = '',
  a,
  indexes,
  model
}: UpdateDatasetDataProps & { model: string }) {
  if (!Array.isArray(indexes)) {
    return Promise.reject('indexes is required');
  }
  const qaStr = getDefaultIndex({ q, a }).text;

  // patch index and update pg
  const mongoData = await MongoDatasetData.findById(dataId);
  if (!mongoData) return Promise.reject('core.dataset.error.Data not found');

  // remove defaultIndex
  let formatIndexes = indexes.map((index) => ({
    ...index,
    text: index.text.trim(),
    defaultIndex: index.text.trim() === qaStr
  }));
  if (!formatIndexes.find((index) => index.defaultIndex)) {
    const defaultIndex = mongoData.indexes.find((index) => index.defaultIndex);
    formatIndexes.unshift(defaultIndex ? defaultIndex : getDefaultIndex({ q, a }));
  }
  formatIndexes = formatIndexes.slice(0, 1000);

  // patch indexes, create, update, delete
  const patchResult: PatchIndexesProps[] = [];

  // find database indexes in new Indexes, if have not,  delete it
  for (const item of mongoData.indexes) {
    const index = formatIndexes.find((index) => index.dataId === item.dataId);
    if (!index) {
      patchResult.push({
        type: 'delete',
        index: item
      });
    }
  }
  for (const item of formatIndexes) {
    const index = mongoData.indexes.find((index) => index.dataId === item.dataId);
    // in database, update
    if (index) {
      // default index update
      if (index.defaultIndex && index.text !== qaStr) {
        patchResult.push({
          type: 'update',
          index: {
            //@ts-ignore
            ...index.toObject(),
            text: qaStr
          }
        });
        continue;
      }
      // custom index update
      if (index.text !== item.text) {
        patchResult.push({
          type: 'update',
          index: item
        });
        continue;
      }
      patchResult.push({
        type: 'unChange',
        index: item
      });
    } else {
      // not in database, create
      patchResult.push({
        type: 'create',
        index: item
      });
    }
  }

  // update mongo updateTime
  mongoData.updateTime = new Date();
  await mongoData.save();

  // insert vector
  const clonePatchResult2Insert: PatchIndexesProps[] = JSON.parse(JSON.stringify(patchResult));
  const insertResult = await Promise.all(
    clonePatchResult2Insert.map(async (item) => {
      // insert new vector and update dateId
      if (item.type === 'create' || item.type === 'update') {
        const result = await insertDatasetDataVector({
          query: item.index.text,
          model: getVectorModel(model),
          teamId: mongoData.teamId,
          datasetId: mongoData.datasetId,
          collectionId: mongoData.collectionId
        });
        item.index.dataId = result.insertId;
        return result;
      }
      return {
        tokens: 0
      };
    })
  );
  const tokens = insertResult.reduce((acc, cur) => acc + cur.tokens, 0);
  // console.log(clonePatchResult2Insert);
  await mongoSessionRun(async (session) => {
    // update mongo
    const newIndexes = clonePatchResult2Insert
      .filter((item) => item.type !== 'delete')
      .map((item) => item.index);
    // update mongo other data
    mongoData.q = q || mongoData.q;
    mongoData.a = a ?? mongoData.a;
    mongoData.fullTextToken = jiebaSplit({ text: mongoData.q + mongoData.a });
    // @ts-ignore
    mongoData.indexes = newIndexes;
    await mongoData.save({ session });

    // delete vector
    const deleteIdList = patchResult
      .filter((item) => item.type === 'delete' || item.type === 'update')
      .map((item) => item.index.dataId)
      .filter(Boolean);
    if (deleteIdList.length > 0) {
      await deleteDatasetDataVector({
        teamId: mongoData.teamId,
        idList: deleteIdList as string[]
      });
    }
  });

  return {
    tokens
  };
}

export const deleteDatasetData = async (data: DatasetDataItemType) => {
  await mongoSessionRun(async (session) => {
    await MongoDatasetData.findByIdAndDelete(data.id, { session });
    await deleteDatasetDataVector({
      teamId: data.teamId,
      idList: data.indexes.map((item) => item.dataId)
    });
  });
};


function addExtraIndexIfRequired(q: string, indexes: any[], importStatusCode: Number): any[] {
  if (importStatusCode === 1) {
    const qLines = q.split('\n').map(line => line.trim()).filter(line => line !== '');

    let buffer = '';
    let titleBuffer = ''; // 用于存储连续的标题行
    let isTitleLine = (line: string) => line.startsWith('#'); // 判断是否是标题行
    let insideTitleBlock = false; // 标识是否在连续的标题块中

    for (let i = 0; i < qLines.length; i++) {
      const currentLine = qLines[i];

      if (isTitleLine(currentLine)) {
        // 累积标题行
        if (!insideTitleBlock) {
          insideTitleBlock = true;
          titleBuffer = currentLine;
        } else {
          titleBuffer += '\n' + currentLine;
        }
        continue; // 跳过继续处理，直到遇到非标题行
      }

      // 遇到非标题行，结束当前标题块的累积，并保存
      if (insideTitleBlock) {
        indexes.push({
          text: titleBuffer,
          dataId: undefined,
          defaultIndex: false
        });
        titleBuffer = ''; // 清空 titleBuffer
        insideTitleBlock = false; // 重置状态
      }

      // 处理普通内容
      if (currentLine.length > 100) {
        if (buffer) {
          indexes.push({
            text: buffer,
            dataId: undefined,
            defaultIndex: false
          });
          buffer = '';
        }
        indexes.push({
          text: currentLine,
          dataId: undefined,
          defaultIndex: false
        });
        continue;
      }

      if (buffer.split('\n').length === 2 && currentLine.length < 10) {
        indexes.push({
          text: buffer,
          dataId: undefined,
          defaultIndex: false
        });
        buffer = '';
        continue;
      }

      buffer += (buffer ? '\n' : '') + currentLine;

      if (buffer.split('\n').length === 3) {
        indexes.push({
          text: buffer,
          dataId: undefined,
          defaultIndex: false
        });
        buffer = '';
      }
    }

    // 最后检查是否有未保存的标题块或普通块
    if (insideTitleBlock && titleBuffer) {
      indexes.push({
        text: titleBuffer,
        dataId: undefined,
        defaultIndex: false
      });
    }

    if (buffer) {
      const lastLine = buffer.split('\n').pop();
      if (lastLine && lastLine.length >= 10) {
        indexes.push({
          text: buffer,
          dataId: undefined,
          defaultIndex: false
        });
      }
    }
  }

  console.log("indexes", indexes);
  return indexes;
}












