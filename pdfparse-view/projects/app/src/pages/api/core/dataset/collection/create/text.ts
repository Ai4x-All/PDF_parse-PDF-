import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 设置请求体的大小限制
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 确保是 POST 请求
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    // 获取 Cookie 中的 token
    const { token } = req.cookies;

    // 如果 token 不存在，返回错误
    if (!token) {
      return res.status(400).json({ message: 'Token not found in cookies' });
    }

    // 解构 req.body
    const { name, text, trainingType, chunkSize, chunkSplitter, qaPrompt, ...body } = req.body;

    // 构造目标 API 的 URL
    const targetUrl = `https://www.xiaoruiai.com:23000/api/core/dataset/collection/create/text`;

    // 使用 axios 发送 POST 请求，传递解构后的 req.body
    const response = await axios.post(targetUrl, {
      name,          // 将 name 传递到目标 API
      text,          // 将 text 传递到目标 API
      trainingType,  // 将 trainingType 传递到目标 API
      chunkSize,     // 将 chunkSize 传递到目标 API
      chunkSplitter, // 将 chunkSplitter 传递到目标 API
      qaPrompt,      // 将 qaPrompt 传递到目标 API
      ...body        // 传递其余的请求体参数
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `fastgpt_token=${token}`, // 手动设置 Cookie
      },
      withCredentials: true, // 确保跨域请求时发送 Cookie
    });

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
