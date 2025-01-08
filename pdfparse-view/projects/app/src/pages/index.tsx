import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { serviceSideProps } from '@/web/common/utils/i18n';
import Loading from '@fastgpt/web/components/common/MyLoading';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // 重定向到 /dataset 页面
    // router.push('/dataset/detail?datasetId=673ee2f0023d46f87807b621');
    router.push('/dataset/detail?datasetId=673ee2f0023d46f87807b621&currentTab=import&source=fileLocal');
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
