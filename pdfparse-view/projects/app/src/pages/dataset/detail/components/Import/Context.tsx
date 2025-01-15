import { useRouter } from 'next/router';
import { SetStateAction, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { createContext, useContextSelector } from 'use-context-selector';
import { ImportDataSourceEnum, TrainingModeEnum } from '@fastgpt/global/core/dataset/constants';
import { useMyStep } from '@fastgpt/web/hooks/useStep';
import { Box, Button, Flex, IconButton } from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { TabEnum } from '../Slider';
import { ImportProcessWayEnum } from '@/web/core/dataset/constants';
import { UseFormReturn, useForm } from 'react-hook-form';
import { ImportSourceItemType } from '@/web/core/dataset/type';
import { Prompt_AgentQA } from '@fastgpt/global/core/ai/prompt/agent';
import { DatasetPageContext } from '@/web/core/dataset/context/datasetPageContext';

type TrainingFiledType = {
  chunkOverlapRatio: number;
  maxChunkSize: number;
  minChunkSize: number;
  autoChunkSize: number;
  chunkSize: number;
  showChunkInput: boolean;
  showPromptInput: boolean;
  charsPointsPrice: number;
  priceTip: string;
  uploadRate: number;
  chunkSizeField?: ChunkSizeFieldType;
};
type DatasetImportContextType = {
  importSource: ImportDataSourceEnum;
  parentId: string | undefined;
  activeStep: number;
  goToNext: () => void;
  positioninfo: any; setPositioninfo:any;
  pdfresponse: any;setpdfResponse:React.Dispatch<React.SetStateAction<any>>;
  processParamsForm: UseFormReturn<ImportFormType, any>;
  sources: ImportSourceItemType[];
  previewUrl: any[];
  setPreviewUrl: React.Dispatch<React.SetStateAction<any[]>>;
  setSources: React.Dispatch<React.SetStateAction<ImportSourceItemType[]>>;
  useParagraphOverlap: boolean;
  filereferenceCurentPage:any;
  setfilereferenceCurentPage:any;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  performSearchInIframe: (iframeRef: React.RefObject<HTMLIFrameElement>, keyword: string) => void; 
} & TrainingFiledType;

type ChunkSizeFieldType = 'embeddingChunkSize' | 'qaChunkSize';
export type ImportFormType = {
  mode: TrainingModeEnum;
  way: ImportProcessWayEnum;
  embeddingChunkSize: number;
  qaChunkSize: number;
  customSplitChar: string;
  qaPrompt: string;
  webSelector: string;
  useParagraphOverlap?: boolean;
};

export const DatasetImportContext = createContext<DatasetImportContextType>({
  previewUrl:[],

  setPreviewUrl: function (value: SetStateAction<any[]>): void {
    throw new Error('Function not implemented.');
  },

  importSource: ImportDataSourceEnum.fileLocal,
  goToNext: function (): void {
    throw new Error('Function not implemented.');
  },
  activeStep: 0,
  parentId: undefined,
  pdfresponse:[],
  setpdfResponse: function (value: SetStateAction<any[]>): void {
    throw new Error('Function not implemented.');
  }
  ,
  maxChunkSize: 0,
  minChunkSize: 0,
  showChunkInput: false,
  showPromptInput: false,
  sources: [],
  setSources: function (value: SetStateAction<ImportSourceItemType[]>): void {
    throw new Error('Function not implemented.');
  },
  chunkSize: 0,
  chunkOverlapRatio: 0,
  uploadRate: 0,
  // @ts-ignore
  processParamsForm: undefined,
  autoChunkSize: 0,
  charsPointsPrice: 0,
  priceTip: '',
  useParagraphOverlap: false,
  filereferenceCurentPage: [{
    name: 'Markdown结果',
    uuid: 0
  }], 
  setfilereferenceCurentPage: function (value: SetStateAction<any>): void {
    
  }
  ,
});

const DatasetImportContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null); 
  const router = useRouter();
  const [filereferenceCurentPage, setfilereferenceCurentPage] = useState<any[]>([{
    name: 'Markdown结果',
    uuid: 0
  }])
  const { source = ImportDataSourceEnum.fileLocal, parentId } = (router.query || {}) as {
    source: ImportDataSourceEnum;
    parentId?: string;
  };
  const [positioninfo, setPositioninfo] = useState<any>(null)
  const datasetDetail = useContextSelector(DatasetPageContext, (v) => v.datasetDetail);
  const [ pdfresponse,setpdfResponse] = useState<any[]>([]);

  const performSearchInIframeRef = useRef<HTMLIFrameElement>(null);

  const performSearchInIframe = (iframeRef: React.RefObject<HTMLIFrameElement>,keyword: any = null) => {  
    const iframeWindow:any = iframeRef.current?.contentWindow;  
    if (!iframeWindow) {  
      console.error('无法获取 iframe 的 window');  
      return;  
    }  
    if (iframeWindow && iframeWindow?.PDFViewerApplication?.eventBus) { 
      iframeWindow.PDFViewerApplication.eventBus.dispatch("find", {
        // source: null, // 事件源，可以是触发搜索操作的元素或对象
        type: "", // 搜索类型，通常为空字符串
        query: keyword, // 搜索关键词
        caseSensitive: false, // 是否区分大小写
        entireWord: false, // 是否匹配整个单词
        highlightAll: true, // 是否高亮显示所有匹配项
        findPrevious: false, // 是否查找上一个匹配项
        matchDiacritics: true // 是否匹配变音符号
    });
    console.log('搜索完成');
    } else {  
      console.error('PDFViewerApplication 或 eventBus 未初始化');  
    }  
  }; 



  // step
  const modeSteps: Record<ImportDataSourceEnum, { title: string }[]> = {
    [ImportDataSourceEnum.fileLocal]: [
      {
        title: t('common:core.dataset.import.Select file')
      },
      {
        title: t('common:core.dataset.import.File reference')
      },
      // {
      //   title: t('common:core.dataset.import.Data Preprocessing')
      // },
      // {
      //   title: t('common:core.dataset.import.Upload data')
      // }
    ],
    [ImportDataSourceEnum.fileLink]: [
      {
        title: t('common:core.dataset.import.Select file')
      },
      {
        title: t('common:core.dataset.import.Data Preprocessing')
      },
      {
        title: t('common:core.dataset.import.Upload data')
      }
    ],
    [ImportDataSourceEnum.fileCustom]: [
      {
        title: t('common:core.dataset.import.Select file')
      },
      {
        title: t('common:core.dataset.import.Data Preprocessing')
      },
      {
        title: t('common:core.dataset.import.Upload data')
      }
    ],
    [ImportDataSourceEnum.csvTable]: [
      {
        title: t('common:core.dataset.import.Select file')
      },
      {
        title: t('common:core.dataset.import.Data Preprocessing')
      },
      {
        title: t('common:core.dataset.import.Upload data')
      }
    ],
    [ImportDataSourceEnum.externalFile]: [
      {
        title: t('common:core.dataset.import.Select file')
      },
      {
        title: t('common:core.dataset.import.Data Preprocessing')
      },
      {
        title: t('common:core.dataset.import.Upload data')
      }
    ]
  };
  const steps = modeSteps[source];
  const { activeStep, goToNext, goToPrevious, MyStep } = useMyStep({
    defaultStep: 0,
    steps
  });

  const vectorModel = datasetDetail.vectorModel;
  const agentModel = datasetDetail.agentModel;

  const processParamsForm = useForm<ImportFormType>({
    defaultValues: {
      mode: TrainingModeEnum.chunk,
      way: ImportProcessWayEnum.xiaorui,
      embeddingChunkSize: vectorModel?.defaultToken || 512,
      qaChunkSize: Math.min(agentModel.maxResponse * 1, agentModel.maxContext * 0.7),
      customSplitChar: '',
      qaPrompt: Prompt_AgentQA.description,
      webSelector: '',
      useParagraphOverlap: false
    }
  });

  const [sources, setSources] = useState<ImportSourceItemType[]>([]);
  const [previewUrl, setPreviewUrl] = useState<any[]>([

    ]);

  // watch form
  const mode = processParamsForm.watch('mode');
  const way = processParamsForm.watch('way');
  const embeddingChunkSize = processParamsForm.watch('embeddingChunkSize');
  const qaChunkSize = processParamsForm.watch('qaChunkSize');
  const customSplitChar = processParamsForm.watch('customSplitChar');

  const modeStaticParams: Record<TrainingModeEnum, TrainingFiledType> = {
    [TrainingModeEnum.chunk]: {
      chunkSizeField: 'embeddingChunkSize' as ChunkSizeFieldType,
      chunkOverlapRatio: 0.2,
      maxChunkSize: vectorModel?.maxToken || 512,
      minChunkSize: 100,
      autoChunkSize: vectorModel?.defaultToken || 512,
      chunkSize: embeddingChunkSize,
      showChunkInput: true,
      showPromptInput: false,
      charsPointsPrice: vectorModel.charsPointsPrice,
      priceTip: t('common:core.dataset.import.Embedding Estimated Price Tips', {
        price: vectorModel.charsPointsPrice
      }),
      uploadRate: 150
    }
  };
  const selectModelStaticParam = modeStaticParams[mode];

  const wayStaticPrams = {
    [ImportProcessWayEnum.auto]: {
      chunkSize: selectModelStaticParam.autoChunkSize,
      customSplitChar: '',
      useParagraphOverlap: false
    },
    [ImportProcessWayEnum.custom]: {
      chunkSize: modeStaticParams[mode].chunkSize,
      customSplitChar,
      useParagraphOverlap: false
    },
    [ImportProcessWayEnum.xiaorui]: {
      chunkSize: modeStaticParams[mode].chunkSize,
      customSplitChar,
      useParagraphOverlap: true // 小瑞导入的方式，强制使用段落重叠
    }
  };
  const chunkSize = wayStaticPrams[way].chunkSize;

  const contextValue = {
    iframeRef,
    performSearchInIframe,
    importSource: source,
    parentId,
    activeStep,
    goToNext,
    pdfresponse,setpdfResponse,
positioninfo, setPositioninfo,
    processParamsForm,
    ...selectModelStaticParam,
    sources,
    setSources,
    previewUrl,
    setPreviewUrl,
    chunkSize,
    filereferenceCurentPage, setfilereferenceCurentPage,
    useParagraphOverlap: wayStaticPrams[way].useParagraphOverlap
  };

  const handleInterruptTasks = async () => {
    // try {
    //   const response = await fetch('https://service.xiaoruiai.com:8206/interrupt_tasks', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });

    //   const data = await response.json();
    //   if (data.status === 'interrupting') {
    //     // 在此处理中断任务后的逻辑
    //     console.log(data.message);
    //   }
    // } catch (error) {
    //   console.error('Failed to interrupt tasks:', error);
    // }

    // 跳转到目标Tab
    router.replace({
      query: {
        ...router.query,
        currentTab: 'collectionCard',
      },
    });
  };

  return (
    <DatasetImportContext.Provider value={contextValue}>
      <Flex>
        {activeStep === 0 ? (
          null
          // <Flex alignItems={'center'}>
          //   <IconButton
          //     icon={<MyIcon name={'common/backFill'} w={'14px'} />}
          //     aria-label={''}
          //     size={'smSquare'}
          //     w={'26px'}
          //     h={'26px'}
          //     borderRadius={'50%'}
          //     variant={'whiteBase'}
          //     mr={2}
          //     onClick={handleInterruptTasks}
          //   />
          //   {t('common:common.Exit')}
          // </Flex>
        ) : (
          <Button
            variant={'whiteBase'}
            leftIcon={<MyIcon name={'common/backFill'} w={'14px'} />}
            onClick={goToPrevious}
          >
            {t('common:common.Last Step')}
          </Button>
        )}
        <Box flex={1} />
      </Flex>
      {/* step */}
      <Box
        mt={4}
        mb={5}
        px={3}
        py={[2, 4]}
        bg={'myGray.50'}
        borderWidth={'1px'}
        borderColor={'borderColor.low'}
        borderRadius={'md'}
      >
        <Box maxW={['100%', '900px']} mx={'auto'}>
          <MyStep />
        </Box>
      </Box>
      {children}
    </DatasetImportContext.Provider>
  );
};

export default DatasetImportContextProvider;
