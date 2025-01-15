import React from 'react';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { getErrText } from '@fastgpt/global/common/error/utils';
import dynamic from 'next/dynamic';
import PageContainer from '@/components/PageContainer';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useTranslation } from 'next-i18next';
import MyBox from '@fastgpt/web/components/common/MyBox';
import {
  DatasetPageContext,
  DatasetPageContextProvider
} from '@/web/core/dataset/context/datasetPageContext';

import { useContextSelector } from 'use-context-selector';
import NextHead from '@/components/common/NextHead';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import AppContextProvider from './components/context';
const Logs = dynamic(() => import('./components/Logs/index'));

const Detail = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  return (
    <>
      <NextHead title={"對話日志"} />
      <PageContainer insertProps={{ bg: 'white' }}>
        <MyBox display={'flex'} flexDirection={['column', 'row']} h={'100%'} pt={[4, 0]}>
        <Logs />
        </MyBox>
      </PageContainer>
    </>
  );
};

const Provider = () => {
  return (
    <AppContextProvider>
      <Detail />
    </AppContextProvider>
  );
};

export async function getServerSideProps(context: any) {
    return {
      props: {
        ...(await serviceSideProps(context, ['app', 'chat', 'user', 'file', 'publish', 'workflow']))
      }
    };
  }
  
export default Provider;