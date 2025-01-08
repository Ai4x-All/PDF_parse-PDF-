import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { UploadImgProps } from '@fastgpt/global/common/file/api';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '16mb', // 保持与原有配置相同的请求体大小限制
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 获取 cookie 中的 token
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    // 直接将 req.body 赋值给一个常量 body
    const body = req.body as UploadImgProps;

    



    // 将请求转发到目标服务器
    const response = await axios.post('https://www.xiaoruiai.com:23000/api/common/file/uploadImage', body, {
      headers: {
        'Content-Type': 'application/json', // 设置适当的请求头
        'Cookie': `fastgpt_token=${token}`, // 手动设置 Cookie
      },
    });

    // 将目标服务器的响应返回给客户端
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
}
