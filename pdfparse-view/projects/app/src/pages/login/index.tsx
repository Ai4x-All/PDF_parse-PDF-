import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, useToast, Flex, VStack, Heading } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { hashStr } from '../../utils/hash'; // 导入 hashStr 函数

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const router = useRouter();

  const handleLogin = async () => {
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

        // 跳转到首页
        router.push('/');
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

  return (
    <Flex
      height="100vh"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
    >
      <Box
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="lg"
        width={["90%", "400px"]}
      >
        <VStack spacing={4}>
          <Heading as="h1" size="lg" textAlign="center" color="teal.500">
            登录
          </Heading>
          <FormControl isRequired>
            <FormLabel>用户名</FormLabel>
            <Input
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>密码</FormLabel>
            <Input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button
            width="full"
            mt={4}
            colorScheme="teal"
            onClick={handleLogin}
          >
            登录
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default LoginPage;
