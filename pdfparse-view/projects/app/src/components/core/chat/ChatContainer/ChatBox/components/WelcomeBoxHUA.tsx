import { Box, Card } from '@chakra-ui/react';
import React from 'react';
import { MessageCardStyle } from '../constants';
import Markdown from '@/components/Markdown';
import ChatAvatar from './ChatAvatar';
import { useContextSelector } from 'use-context-selector';
import { ChatBoxContext } from '../Provider';

const WelcomeBox = ({ welcomeText }: { welcomeText: string }) => {
  const appAvatar = useContextSelector(ChatBoxContext, (v) => v.appAvatar);

  return (
    <Box py={3}>
      {/* avatar */}
      <ChatAvatar src={appAvatar} type={'AI'} />
      {/* message */}
      <Box textAlign={'left'}>
        <Card
          order={2}
          mt={2}
          color= {'#F3F3F3'}
          bg={' rgba(0, 0, 0, 0.26)'}
          // boxShadow={'0 0 8px rgba(0,0,0,0.15)'}
          backdropFilter={'blur(10px)'}
          p={4}  // 增加内边距，为图标留出空间
        >
          <Markdown source={`~~~guide \n${welcomeText}`} />
        </Card>
      </Box>
    </Box>
  );
};

export default WelcomeBox;
