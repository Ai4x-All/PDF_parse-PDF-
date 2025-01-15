import Avatar from '@fastgpt/web/components/common/Avatar';
import { Box } from '@chakra-ui/react';
import { useTheme } from '@chakra-ui/system';
import React from 'react';

const ChatAvatar = ({ src, type }: { src?: string; type: 'Human' | 'AI' | any }) => {
  const theme = useTheme();
  return (
    <Box
      w={['38px', '38px']}
      h={['38px', '38px']}
      // p={'2px'}
      borderRadius={'10px'}
      border={theme.borders.base}
      boxShadow={'0 0 5px rgba(0,0,0,0.1)'}
    // bg={type === 'Human' ? 'white' : 'white'}
    >
      <Avatar src={src} w={'100%'} h={'100%'} borderRadius={'sm'} />
    </Box>
  );
};

export default React.memo(ChatAvatar);
