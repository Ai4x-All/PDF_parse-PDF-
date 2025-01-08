import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export const config = {
  api: {
    responseLimit: '100mb' // 设置响应限制
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

    // 获取查询参数中的 token
    const { token: queryToken } = req.query as { token: string };

    // 构造目标 API 的 URL
    const targetUrl = `https://www.xiaoruiai.com:23000/api/common/file/read`;

    // 使用 axios 发送 GET 请求，传递 token 和查询参数
    const response = await axios.get(targetUrl, {
      params: { token: queryToken }, // 将 queryToken 作为查询参数传递
      headers: {
        'Cookie': `fastgpt_token=${token}`, // 手动设置 Cookie 传递后端 token
      },
      responseType: 'stream' // 确保响应是流类型
    });

    // 设置响应头
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', response.headers['cache-control']);
    res.setHeader('Content-Disposition', response.headers['content-disposition']);

    // 将目标 API 的流响应传递给客户端
    response.data.pipe(res);

    response.data.on('error', () => {
      res.status(500).end();
    });
    response.data.on('end', () => {
      res.end();
    });
  } catch (error) {
    console.error('Error forwarding request:', error);

    // 捕获并返回错误
    res.status(500).json({
      message: 'Error forwarding request',
      error: error,
    });
  }
}
