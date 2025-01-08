// pages/api/login.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { setCookie } from '@fastgpt/service/support/permission/controller';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      // 转发登录请求到外部API
      const response = await axios.post('https://www.xiaoruiai.com:23000/api/support/user/account/loginByPassword', {
        username,
        password
      });

      if (response.data.code === 200) {
        setCookie(res,response.data.data.token)
        // 将响应数据返回给客户端
        res.status(200).json({
          code: 200,
          data: response.data.data
        });
      } else {
        res.status(401).json({
          code: response.data.code,
          message: response.data.message
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '服务器错误，请稍后再试'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
