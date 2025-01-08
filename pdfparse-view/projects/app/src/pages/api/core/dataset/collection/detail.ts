import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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

    // 获取请求的 URL 参数
    const queryParams = new URLSearchParams(req.query as any).toString();

    // 构造目标 API 的 URL，并附加查询参数
    const targetUrl = `https://www.xiaoruiai.com:23000/api/core/dataset/collection/detail?${queryParams}`;
    console.log(targetUrl);

    // 使用 axios 发送 GET 请求
    const response = await axios.get(targetUrl, {
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `fastgpt_token=${token}` // 手动设置 Cookie
        },
        withCredentials: true // 确保跨域请求时发送 Cookie
    });
    console.log('Request Headers:', response.config.headers);
    console.log('response.data:', response.data);
    // 返回目标 API 的响应
    return res.status(200).json(response.data);
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
