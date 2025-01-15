import React from 'react';
import { useTheme, type BoxProps } from '@chakra-ui/react';
import MyBox from '@fastgpt/web/components/common/MyBox';

const PageContainer = ({
  children,
  isLoading,
  insertProps = {},
  ...props
}: BoxProps & { isLoading?: boolean; insertProps?: BoxProps }) => {
  const theme = useTheme();
  return (
    // 用户输入框
    <MyBox h={'100%'} py={[0, '16px']} pr={[0, '16px']} {...props}>
      <MyBox
        isLoading={isLoading}
        h={'100%'}
        borderColor={'borderColor.base'}
        borderWidth={[0, 1]}
        boxShadow={'-2px 0 8px rgba(0, 0, 0, 0.05)'}
        overflow={'overlay'}
        bg={'myBg.500'}
        borderRadius={[0, '16px']}
        overflowX={'hidden'}
        {...insertProps}
      >
        {children}
      </MyBox>
    </MyBox>
  );
};

export default PageContainer;
