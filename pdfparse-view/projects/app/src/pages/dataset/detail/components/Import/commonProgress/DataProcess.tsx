import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Box,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Input,
  Button,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure
} from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import LeftRadio from '@fastgpt/web/components/common/Radio/LeftRadio';
import { TrainingModeEnum, TrainingTypeMap } from '@fastgpt/global/core/dataset/constants';
import { ImportProcessWayEnum } from '@/web/core/dataset/constants';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { Prompt_AgentQA } from '@fastgpt/global/core/ai/prompt/agent';
import Preview from '../components/Preview';
import MyTag from '@fastgpt/web/components/common/Tag/index';
import { useContextSelector } from 'use-context-selector';
import { DatasetImportContext, ImportFormType } from '../Context';
import { useToast } from '@fastgpt/web/hooks/useToast';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import { UseFormReturn } from 'react-hook-form';

function DataProcess({ showPreviewChunks = true }: { showPreviewChunks: boolean }) {
  const { t } = useTranslation();
  const { feConfigs } = useSystemStore();

  const {
    goToNext,
    processParamsForm,
    chunkSizeField,
    minChunkSize,
    showChunkInput,
    showPromptInput,
    maxChunkSize,
    priceTip,
    chunkSize
  } = useContextSelector(DatasetImportContext, (v) => v);
  const getValues = processParamsForm?.getValues || (() => ({}));
  const setValue = processParamsForm?.setValue || (() => {});
  const register = processParamsForm?.register || (() => {});
  const watch = processParamsForm?.watch || (() => {});

  
 


  const { toast } = useToast();
  const mode = watch('mode');
  const way = watch('way');

  const {
    isOpen: isOpenCustomPrompt,
    onOpen: onOpenCustomPrompt,
    onClose: onCloseCustomPrompt
  } = useDisclosure();

  const trainingModeList = useMemo(() => {
    const list = Object.entries(TrainingTypeMap);
    return list;
  }, []);

  const onSelectTrainWay = useCallback(
    (e: TrainingModeEnum) => {
      if (!feConfigs?.isPlus) {
        return toast({
          status: 'warning',
          title: t('common:common.system.Commercial version function')
        });
      }
      setValue('mode', e);
    },
    [feConfigs?.isPlus, setValue, t, toast]
  );

  // 处理选择处理方式时的逻辑
  const onSelectProcessWay = useCallback(
    (selectedWay: ImportProcessWayEnum) => {
      setValue('way', selectedWay);
      if (selectedWay === ImportProcessWayEnum.xiaorui) {
        // 如果选择了“小瑞导入”，则设置useParagraphOverlap为true
        setValue('useParagraphOverlap', true);
      } else {
        setValue('useParagraphOverlap', false);
      }
    },
    [setValue]
  );

  return (
    <Box h={'100%'} display={['block', 'flex']} fontSize={'sm'}>
      <Box
        flex={'1 0 0'}
        minW={['auto', '540px']}
        maxW={'600px'}
        h={['auto', '100%']}
        overflow={'auto'}
        pr={[0, 3]}
      >
        <Flex alignItems={'center'}>
          <MyIcon name={'common/settingLight'} w={'20px'} />
          <Box fontSize={'md'}>{t('common:core.dataset.import.Data process params')}</Box>
        </Flex>

        <Box display={['block', 'flex']} mt={4} alignItems={'center'}>
          <FormLabel flex={'0 0 100px'}>{t('common:core.dataset.import.Training mode')}</FormLabel>
          <LeftRadio
            list={trainingModeList.map(([key, value]) => ({
              title: t(value.label as any),
              value: key,
              tooltip: t(value.tooltip as any)
            }))}
            px={3}
            py={2}
            value={mode}
            onChange={onSelectTrainWay}
            defaultBg="white"
            activeBg="white"
            display={'flex'}
            flexWrap={'wrap'}
          />
        </Box>
        <Box display={['block', 'flex']} mt={5}>
          <FormLabel flex={'0 0 100px'}>{t('common:core.dataset.import.Process way')}</FormLabel>
          <LeftRadio
            list={[
              {
                title: '小瑞导入',
                desc: '只支持设置块大小和分隔符，并启用段落重叠',
                value: ImportProcessWayEnum.xiaorui,
                children: way === ImportProcessWayEnum.xiaorui && (
                  <Box mt={5}>
                    {showChunkInput && chunkSizeField && (
                      <Box>
                        <Flex alignItems={'center'}>
                          <Box>{t('common:core.dataset.import.Ideal chunk length')}</Box>
                          <MyTooltip
                            label={t('common:core.dataset.import.Ideal chunk length Tips')}
                          >
                            <MyIcon
                              name={'common/questionLight'}
                              ml={1}
                              w={'14px'}
                              color={'myGray.500'}
                            />
                          </MyTooltip>
                        </Flex>
                        <Box
                          mt={1}
                          css={{
                            '& > span': {
                              display: 'block'
                            }
                          }}
                        >
                          <MyTooltip
                            label={t('common:core.dataset.import.Chunk Range', {
                              min: minChunkSize,
                              max: maxChunkSize
                            })}
                          >
                            <NumberInput
                              size={'sm'}
                              step={100}
                              min={minChunkSize}
                              max={maxChunkSize}
                              value={chunkSize}
                              onChange={(e) => {
                                setValue(chunkSizeField, +e);
                              }}
                            >
                              <NumberInputField
                                min={minChunkSize}
                                max={maxChunkSize}
                                {...register(chunkSizeField, {
                                  min: minChunkSize,
                                  max: maxChunkSize,
                                  valueAsNumber: true
                                })}
                              />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </MyTooltip>
                        </Box>
                      </Box>
                    )}

                    <Box mt={3}>
                      <Box>
                        {t('common:core.dataset.import.Custom split char')}
                        <MyTooltip label={t('common:core.dataset.import.Custom split char Tips')}>
                          <MyIcon
                            name={'common/questionLight'}
                            ml={1}
                            w={'14px'}
                            color={'myGray.500'}
                          />
                        </MyTooltip>
                      </Box>
                      <Box mt={1}>
                        <Input
                          size={'sm'}
                          bg={'myGray.50'}
                          defaultValue={''}
                          placeholder="\n;======;==SPLIT=="
                          {...register('customSplitChar')}
                        />
                      </Box>
                    </Box>
                  </Box>
                )
              }

            ]}
            px={3}
            py={3}
            defaultBg="white"
            activeBg="white"
            value={way}
            w={'100%'}
            onChange={onSelectProcessWay}
          ></LeftRadio>
        </Box>
        <Box mt={5} pl={[0, '100px']}  gap={3}>
          {feConfigs?.show_pay && (
            <MyTooltip label={priceTip}>
              <MyTag colorSchema={'gray'} py={'6px'} borderRadius={'md'} px={3} whiteSpace={'wrap'}>
                {priceTip}
              </MyTag>
            </MyTooltip>
          )}
        </Box>
        <Flex mt={5} gap={3} justifyContent={'flex-end'}>
          <Button
            onClick={() => {
              goToNext();
            }}
          >
            {t('common:common.Next Step')}
          </Button>
        </Flex>
      </Box>
      {/* youce */}
      <Box flex={'1 0 0'} w={['auto', '0']} h={['auto', '100%']}  overflow={'auto'} pl={[0, 3]}>
        <Preview showPreviewChunks={showPreviewChunks} />
      </Box>

      {isOpenCustomPrompt && (
        <PromptTextarea
          defaultValue={getValues('qaPrompt')}
          onChange={(e) => {
            setValue('qaPrompt', e);
          }}
          onClose={onCloseCustomPrompt}
        />
      )}
    </Box>
  );
}

export default React.memo(DataProcess);

const PromptTextarea = ({
  defaultValue,
  onChange,
  onClose
}: {
  defaultValue: string;
  onChange: (e: string) => void;
  onClose: () => void;
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  return (
    <MyModal
      isOpen
      title={t('common:core.dataset.import.Custom prompt')}
      iconSrc="modal/edit"
      w={'600px'}
      onClose={onClose}
    >
      <ModalBody whiteSpace={'pre-wrap'} fontSize={'sm'} px={[3, 6]} pt={[3, 6]}>
        <Textarea ref={ref} rows={8} fontSize={'sm'} defaultValue={defaultValue} />
        <Box>{Prompt_AgentQA.fixedText}</Box>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={() => {
            const val = ref.current?.value || Prompt_AgentQA.description;
            onChange(val);
            onClose();
          }}
        >
          {t('common:common.Confirm')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
};
