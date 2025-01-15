import { GET, POST, PUT, DELETE } from '@/web/common/api/request';
import type { CreateQuestionGuideParams } from '@/global/core/ai/api.d';

export const postQuestionGuide = (
  data: CreateQuestionGuideParams & { language?: string }, // 为 data 添加可选的 language 参数
  cancelToken: AbortController
) => 
  POST<string[]>('/core/ai/agent/createQuestionGuide', data, { cancelToken });

