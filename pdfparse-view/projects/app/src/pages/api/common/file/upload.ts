import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data'; // 注意这里使用的是 Node.js 的 form-data 库

export const config = {
  api: {
    bodyParser: false, // 禁用默认的 body 解析器，因为我们需要手动处理 multipart/form-data
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error parsing form' });
    }

    const file = files.file as formidable.File; // 确保你上传的文件字段名为 "file"
    const bucketName = fields.bucketName as string;
    const metadata = fields.metadata ? JSON.parse(fields.metadata as string) : {};

    try {
      // 创建 FormData
      const formData = new FormData();
      formData.append('bucketName', bucketName);
      formData.append('metadata', JSON.stringify(metadata));

      // 使用 fs 读取文件为 buffer
      const fileBuffer = fs.readFileSync(file.filepath); // file.filepath 是 formidable 返回的路径
      formData.append('file', fileBuffer, { filename: file.originalFilename ?? 'unknown-filename' });


      // 获取 token
      const { token } = req.cookies;
      if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' });
      }

      // 发出请求
      const response = await axios.post('https://www.xiaoruiai.com:23000/api/common/file/upload', formData, {
        headers: {
          ...formData.getHeaders(),
          'Cookie': `fastgpt_token=${token}`, // 手动设置 Cookie
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // 返回目标服务器的响应给客户端
      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error('Error uploading file:', error);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      res.status(500).json({
        message: 'Error uploading file',
        error: error.message || error,
      });
    }
  });
}
