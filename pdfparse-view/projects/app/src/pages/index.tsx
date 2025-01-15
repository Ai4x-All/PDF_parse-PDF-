import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { serviceSideProps } from '@/web/common/utils/i18n';
import Loading from '@fastgpt/web/components/common/MyLoading';
import { hashStr } from '../utils/hash';
import axios from 'axios';
import { useToast } from '@fastgpt/web/hooks/useToast';
const HomePage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const handleLogin = async (username: any, password: any) => {
    try {
      // 将密码进行哈希处理
      const hashedPassword = hashStr(password);

      // 向 Next.js API 发送请求
      const response = await axios.post('/api/login', {
        username,
        password: hashedPassword  // 发送哈希后的密码
      });
      
      if (response.data.code === 200) {
        const { token, user } = response.data.data;

        // 保存 token 到 localStorage
        localStorage.setItem('token', token);

        // 保存用户信息到 localStorage
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dataset/detail?datasetId=673ee2f0023d46f87807b621&currentTab=import&source=fileLocal');
        // 跳转到首页
        // router.push('/');
      } else {
        toast({
          title: '登录失败',
          description: response.data.message || '用户名或密码错误',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    } catch (error) {
      toast({
        title: '网络错误',
        description: '无法连接服务器',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  useEffect(() => {
    handleLogin('pdf', 'pdf')
    // 重定向到 /dataset 页面
    // router.push('/dataset/detail?datasetId=673ee2f0023d46f87807b621');

  }, [router]);

  return <Loading></Loading>;
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default HomePage;
