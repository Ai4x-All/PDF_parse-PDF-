import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChakraProvider } from '@chakra-ui/react';

import { AppProps } from 'next/app';
import Layout from '../components/Layout'; // 导入布局组件
import QueryClientContext from '@/web/context/QueryClient';
import ChakraUIContext from '@/web/context/ChakraUI';
import I18nContextProvider from '@/web/context/I18n';
import { appWithTranslation, useTranslation } from 'next-i18next';
import { useInitApp } from '@/web/context/useInitApp';
import NextHead from '@/components/common/NextHead';
import Script from 'next/script';
interface JwtPayload {
  exp: number; // exp 是过期时间的时间戳
}

// 手动解析 JWT 的函数
const parseJwt = (token: string): JwtPayload | null => {
  try {
    // 拿到 payload 部分（JWT 的第二部分）
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    // 将 payload 字符串转换为 JSON 对象
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('解析 token 时出错:', error);
    return null;
  }
};

function MyApp({ Component, pageProps }: AppProps) {
  const { feConfigs, scripts, title } = useInitApp();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const currentPath = router.pathname;

    // 排除 login 页面，不需要校验
    if (currentPath !== '/login') {
      const token = localStorage.getItem('token');

      if (token) {
        const decodedToken = parseJwt(token);

        if (decodedToken) {
          // 获取当前时间的时间戳（单位为秒）
          const currentTime = Math.floor(Date.now() / 1000);

          // 检查 token 是否过期
          if (decodedToken.exp < currentTime) {
            // token 已过期，清除 localStorage 中的 token 并重定向到登录页面
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
          }
        } else {
          // 如果 token 无法解析，清除 token 并跳转到登录页面
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      } else {
        // 如果没有 token，直接跳转到登录页面
        router.push('/login');
      }
    }
  }, [router]);

  return (
    <>
      <NextHead
        title={title}
        desc={
          feConfigs?.systemDescription ||
          process.env.SYSTEM_DESCRIPTION ||
          `${title}${t('app:intro')}`
        }
        icon={feConfigs?.favicon || process.env.SYSTEM_FAVICON}
      />
      {scripts?.map((item, i) => <Script key={i} strategy="lazyOnload" {...item}></Script>)}
      <QueryClientContext>
        <I18nContextProvider>
          <ChakraUIContext>
            {/* 检查是否是 /login 页面，只有非登录页面使用 Layout */}
            {router.pathname === '/login' ? (
              <Component {...pageProps} />  // 如果是登录页面，直接渲染组件，不使用 Layout
            ) : (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            )}
          </ChakraUIContext>
        </I18nContextProvider>
      </QueryClientContext>
    </>
  );
}


export default appWithTranslation(MyApp);
