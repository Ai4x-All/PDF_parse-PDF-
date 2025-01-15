import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: true, // 确保 Next.js 会自动解析 req.body
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 确保是 DELETE 请求
    if (req.method !== 'DELETE') {
      return res.status(405).json({ message: 'Only DELETE requests are allowed' });
    }

    // 获取 Cookie 中的 token
    const { token } = req.cookies;

    // 如果 token 不存在，返回错误
    if (!token) {
      return res.status(400).json({ message: 'Token not found in cookies' });
    }

    // 解构 req.query 以获取 datasetId
    const { id: datasetId } = req.query as { id: string };

    // 检查 datasetId 是否存在
    if (!datasetId) {
      return res.status(400).json({ message: 'datasetId is required' });
    }

    // 构造目标 API 的 URL
    const targetUrl = `https://www.xiaoruiai.com:23000/api/core/dataset/delete`;

    // 使用 axios 发送 DELETE 请求，传递 datasetId 作为 params
    const response = await axios.delete(targetUrl, {
      params: { id: datasetId }, // 将 datasetId 作为查询参数传递
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `fastgpt_token=${token}`, // 手动设置 Cookie
      },
      withCredentials: true, // 确保跨域请求时发送 Cookie
    });

    // 返回目标 API 的响应
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding request:', error);

    // 捕获并返回 axios 错误
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        message: 'Error forwarding request',
        error: error.response?.data || error.message,
      });
    } else {
      return res.status(500).json({ message: 'Error forwarding request', error });
    }
  }
}
