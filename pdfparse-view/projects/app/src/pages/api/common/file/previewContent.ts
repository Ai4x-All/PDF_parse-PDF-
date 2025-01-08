import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: true, // 确保 Next.js 自动解析 req.body
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
    const { type, sourceId, isQAImport, selector } = req.body;

    // 构造目标 API 的 URL
    const targetUrl = `https://www.xiaoruiai.com:23000/api/common/file/previewContent`;

    // 使用 axios 发送 POST 请求，传递解构后的 req.body
    const response = await axios.post(targetUrl, {
      type,
      sourceId,
      isQAImport,
      selector,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `fastgpt_token=${token}`, // 手动设置 Cookie 传递后端 token
      },
      withCredentials: true, // 确保跨域请求时发送 Cookie
    });

    // 返回目标 API 的响应
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error forwarding request:', error);

    // 捕获并返回错误
    res.status(500).json({
      message: 'Error forwarding request',
      error: error,
    });
  }
}
