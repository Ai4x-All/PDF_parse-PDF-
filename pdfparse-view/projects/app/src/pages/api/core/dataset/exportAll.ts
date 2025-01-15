import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export const config = {
  api: {
    responseLimit: '100mb', // 设置响应限制
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 确保是 GET 请求
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Only GET requests are allowed' });
    }

    // 获取 Cookie 中的 token
    const { token } = req.cookies;

    // 如果 token 不存在，返回错误
    if (!token) {
      return res.status(400).json({ message: 'Token not found in cookies' });
    }

    // 解构 req.query 以获取 datasetId
    const { datasetId } = req.query;

    // 检查 datasetId 是否存在
    if (!datasetId) {
      return res.status(400).json({ message: 'datasetId is required' });
    }

    // 构造目标 API 的 URL
    const targetUrl = `https://www.xiaoruiai.com:23000/api/core/dataset/exportAll?datasetId=${datasetId}`;

    // 使用 axios 发送 GET 请求，将参数传递到目标 API
    const response = await axios.get(targetUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `fastgpt_token=${token}`, // 手动设置 Cookie
      },
      responseType: 'stream', // 确保流式处理大文件
      withCredentials: true, // 确保跨域请求时发送 Cookie
    });

    // 将 CSV 流式返回给客户端
    response.data.pipe(res);
  } catch (error) {
    console.error('Error forwarding request:', error);

    // 捕获并返回 axios 错误
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        message: 'Error forwarding request',
        error: error.response?.data || error.message,
      });
    } else {
      res.status(500).json({ message: 'Error forwarding request', error: error });
    }
  }
}
