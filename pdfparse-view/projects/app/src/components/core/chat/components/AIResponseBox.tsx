import Markdown from '@/components/Markdown';
import { CodeClassNameEnum } from '@/components/Markdown/utils';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box
} from '@chakra-ui/react';
import { ChatItemValueTypeEnum } from '@fastgpt/global/core/chat/constants';
import {
  AIChatItemValueItemType,
  ChatSiteItemType,
  UserChatItemValueItemType
} from '@fastgpt/global/core/chat/type';
import React, { useEffect, useState } from 'react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import Avatar from '@fastgpt/web/components/common/Avatar';

type props = {
  value: UserChatItemValueItemType | AIChatItemValueItemType;
  index: number;
  chat: ChatSiteItemType;
  isLastChild: boolean;
  isChatting: boolean;
  questionGuides: string[];
  getzimu?:any;
  peopleplay?:any
};
let sourceArr = '';

const AIResponseBox = ({ value, index, chat, isLastChild, isChatting, questionGuides,getzimu,peopleplay }: props) => {

  if (value.text) {
    let source = (value.text?.content || '').trim().replace(/\*/g, '');
    window?.parent.postMessage(source, 'http://114.217.53.234:9002/#/bomManifest');
    const [sourceaa, setSource] = useState<string>('');
    const [hasSentRequest, setHasSentRequest] = useState<boolean>(true);
    const [hassends, setHassends] = useState<boolean>(false);
    useEffect(() => {
      if (value.text) {
       
        if (source &&isLastChild && !isChatting&&peopleplay) {
          sourceArr = source;
          setHasSentRequest(false);
          if (!hasSentRequest) {
            
          }
          setHasSentRequest(false);
        }else{
          // console.log('6666666666666666错误了,没有发情请求的原因:666666666666666',
          //    source , '是否最后一条:',isLastChild ,'是否不在对话中:', !isChatting,'是否点击了播放:',peopleplay);
        }
      }
    }, [value.text, isChatting,peopleplay]); // 依赖 value.text、isChatting 和 isLastChild  
    useEffect(() => {
      const fetchData = async () => {
        // console.log('以下两点如果为true,准备发起语音请求!!', sourceArr, '2::', !hasSentRequest);
        if (sourceArr && !hasSentRequest&& !hassends) {
          console.log('!!!!!!!!!!!!!!!!!!!!!!!发起语音请求', hasSentRequest, '请求文本为::', sourceArr,'dierci~~', !hassends);
          try {
            const response = await fetch('https://service.xiaoruiai.com:19012/metahuman-stream-talk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: sourceArr,
              }),
            });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('成功向本地服务metahuman-stream API发送数据:', result);
            setHasSentRequest(true); // 设置请求已发送  
            setHassends(true);
            // console.log('请求结果???????????????:', response);
            if (response.statusText=='OK') {
              // console.log('请求成功!!!!!!!!!!!!!!!',sourceArr);
              getzimu(sourceArr);
              
            }
          } catch (error) {
            console.error('向本地服务metahuman-stream API发送数据时出错:', error);
          }
        }
      };
      const fetchTimeout = setTimeout(fetchData, 300);
      return () => clearTimeout(fetchTimeout);
    }, [hasSentRequest]);



    if (!source && chat.value.length > 1) return null;

    // computed question guide
    if (
      isLastChild &&
      !isChatting &&
      questionGuides.length > 0 &&
      index === chat.value.length - 1
    ) {
      source = `${source}
\`\`\`${CodeClassNameEnum.questionGuide}
${JSON.stringify(questionGuides)}`;
    }

    return (
      <Markdown
        source={source}
        showAnimation={isLastChild && isChatting && index === chat.value.length - 1}
      />
      // <Box></Box>
    );
  }
  if (value.type === ChatItemValueTypeEnum.tool && value.tools) {
    return (
      <Box>
        {value.tools.map((tool) => {
          const toolParams = (() => {
            try {
              return JSON.stringify(JSON.parse(tool.params), null, 2);
            } catch (error) {
              return tool.params;
            }
          })();
          const toolResponse = (() => {
            try {
              return JSON.stringify(JSON.parse(tool.response), null, 2);
            } catch (error) {
              return tool.response;
            }
          })();

          return (
            <Accordion key={tool.id} allowToggle>
              <AccordionItem borderTop={'none'} borderBottom={'none'}>
                <AccordionButton
                  w={'auto'}
                  bg={'white'}
                  borderRadius={'md'}
                  borderWidth={'1px'}
                  borderColor={'myGray.200'}
                  boxShadow={'1'}
                  pl={3}
                  pr={2.5}
                  _hover={{
                    bg: 'auto'
                  }}
                >
                  <Avatar src={tool.toolAvatar} w={'1.25rem'} h={'1.25rem'} borderRadius={'sm'} />
                  <Box mx={2} fontSize={'sm'} color={'myGray.900'}>
                    {tool.toolName}
                  </Box>
                  {isChatting && !tool.response && <MyIcon name={'common/loading'} w={'14px'} />}
                  <AccordionIcon color={'myGray.600'} ml={5} />
                </AccordionButton>
                <AccordionPanel
                  py={0}
                  px={0}
                  mt={3}
                  borderRadius={'md'}
                  overflow={'hidden'}
                  maxH={'500px'}
                  overflowY={'auto'}
                >
                  {toolParams && toolParams !== '{}' && (
                    <Box mb={3}>
                      <Markdown
                        source={`~~~json#Input${toolParams}`}
                      />
                    </Box>
                  )}
                  {toolResponse && (
                    <Markdown
                      source={`~~~json#Response${toolResponse}`}
                    />
                  )}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          );
        })}
      </Box>
    );
  }
  return null;
};

export default React.memo(AIResponseBox);
