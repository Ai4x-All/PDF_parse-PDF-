import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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

    // 解构查询参数
    const { id: dataId } = req.query as { id: string };

    if (!dataId) {
      return res.status(400).json({ message: 'Missing data ID' });
    }

    // 构造目标 API 的 URL
    const targetUrl = `https://www.xiaoruiai.com:23000/api/core/dataset/data/delete`;

    // 使用 axios 发送 DELETE 请求
    const response = await axios.delete(targetUrl, {
      params: { id: dataId }, // 将 dataId 作为查询参数传递
      headers: {
        'Cookie': `fastgpt_token=${token}`, // 手动设置 Cookie 传递后端 token
      },
      withCredentials: true, // 确保跨域请求时发送 Cookie
    });

    // 返回目标 API 的响应
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error forwarding request:', error);

    // 捕获并返回错误
    res.status(500).json({
      message: 'Error forwarding request',
      error: error,
    });
  }
}
