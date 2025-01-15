import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import type { GetDatasetCollectionsProps } from '@/global/core/api/datasetReq';

export const config = {
  api: {
    bodyParser: true, // 确保 Next.js 会自动解析 req.body
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
    const {
      pageNum = 1,
      pageSize = 10,
      datasetId,
      parentId = null,
      searchText = '',
      selectFolder = false,
      filterTags = [],
      simple = false
    } = req.body as GetDatasetCollectionsProps; // 通过类型断言确保 req.body 的类型

    // 构造目标 API 的 URL
    const targetUrl = `https://www.xiaoruiai.com:23000/api/core/dataset/collection/list`;

    // 使用 axios 发送 POST 请求，传递解构后的 req.body
    const response = await axios.post(targetUrl, {
      pageNum,
      pageSize,
      datasetId,
      parentId,
      searchText,
      selectFolder,
      filterTags,
      simple
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `fastgpt_token=${token}`, // 手动设置 Cookie
      },
      withCredentials: true, // 确保跨域请求时发送 Cookie
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
