// pages/api/forwardRequest.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// 目标 API 的基础 URL
const TARGET_API_URL = 'https://www.xiaoruiai.com:23000/api/core/dataset/training/getQueueLen'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 从 URL query 中提取参数
    const { vectorModel, agentModel } = req.query as { vectorModel: string, agentModel: string };
    // 获取 Cookie 中的 token
    const { token } = req.cookies;
    // 如果 token 不存在，返回错误
    if (!token) {
      return res.status(400).json({ message: 'Token not found in cookies' });
    }

    if (!vectorModel || !agentModel) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // 构建目标 API 的 URL，将 query 参数添加到 URL 中
    const targetUrl = `${TARGET_API_URL}?vectorModel=${vectorModel}&agentModel=${agentModel}`;

    // 向目标 API 发送 GET 请求
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `fastgpt_token=${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Target API returned error: ${response.statusText}`);
    }

    // 获取目标 API 的响应数据
    const data = await response.json();

    // 将目标 API 的响应数据返回给客户端
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error forwarding request:', error);
    return res.status(500).json({ message: 'Error forwarding request', error: error });
  }
}
