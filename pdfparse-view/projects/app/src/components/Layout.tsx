import { Box, Flex, Link, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Heading, Icon, IconButton, useMediaQuery } from '@chakra-ui/react';
import { ReactNode, useState } from 'react';
import { FiMenu, FiBookOpen } from 'react-icons/fi'; // 使用 react-icons
import { useRouter } from 'next/router'; // 用于获取当前路径
import { FiMessageCircle,FiShoppingCart  } from 'react-icons/fi'; // 导入对话图标
interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const currentPath = router.asPath;  // 使用 asPath 获取完整路径，包括查询参数
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 控制菜单展开/收起
  const [isMobile] = useMediaQuery('(max-width: 990px)'); // 检测是否为手机端视图

  // 判断是否选中
  const isLinkActive = (href: string) => currentPath === href;

  // 判断是否处于知识库的页面
  const isKnowledgePage = currentPath.startsWith('/dataset/detail');

  // 切换菜单展开/收起状态
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // 关闭菜单
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Flex height="100vh" maxH="100vh" p={isMobile ? 2 : 5} position="relative">
      {/* 手机端时的左上角菜单按钮 */}
      {isMobile && (
        <>
          <IconButton
            icon={<FiMenu />}
            aria-label="Open menu"
            position="fixed"
            top="10px"
            left="10px"
            zIndex="overlay"
            onClick={toggleMenu}
            bg="blue.600"
            color="white"
            _hover={{ bg: 'blue.400' }}
          />

          {/* 点击菜单外部时关闭菜单的透明遮罩层 */}
          {isMenuOpen && (
            <Box
              position="fixed"
              top="0"
              left="0"
              width="100vw"
              height="100vh"
              bg="rgba(0, 0, 0, 0.3)" // 半透明遮罩层
              zIndex="overlay"
              onClick={closeMenu} // 点击遮罩层时关闭菜单
            />
          )}

          {/* 悬浮的导航菜单 */}
          <Box
            position="fixed"
            top="0"
            left="0"
            w="250px"
            h="100vh"
            bgGradient="linear(to-b, blue.400, purple.400)"  // 蓝白紫渐变背景
            color="white"
            p={5}
            zIndex="overlay"
            boxShadow="lg"
            borderRadius="0 20px 20px 0"
            display={isMenuOpen ? 'block' : 'none'}
          >
            <Heading as="h2" size="lg" mb={8} textAlign="center" fontWeight="bold" fontFamily="sans-serif">
              文档问答知识库管理
            </Heading>
            <VStack align="stretch" spacing={4}>

              <Link 
                href="/dataset/detail?datasetId=673ee2f0023d46f87807b621" 
                p={2} 
                pl={4}
                borderRadius="12px" // 圆角更大
                _hover={{ bg: 'whiteAlpha.300' }} 
                bg={currentPath.includes('datasetId=673ee2f0023d46f87807b621') ? 'whiteAlpha.300' : 'transparent'}
                display="flex"
                alignItems="center"
                justifyContent="start"
              >
                <Icon as={FiBookOpen} mr={3} boxSize={6} color="lightblue" />
                PDF文档知识库
              </Link>

              {/* <Accordion allowToggle defaultIndex={isKnowledgePage ? [0] : [0]}>
                <AccordionItem border="none">
                  <AccordionButton _hover={{ bg: 'whiteAlpha.300' }} _focus={{ boxShadow: 'outline' }}>
                    <Box flex="1" textAlign="left" display="flex" alignItems="center">
                      <Icon as={FiBookOpen} mr={3} boxSize={6} color="lightblue" /> 
                      知识库管理
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <VStack align="stretch" spacing={3}>
                      <Link href="/dataset/detail?datasetId=6704a0338af61dbe0fc819b1" p={2} borderRadius="8px" _hover={{ bg: 'whiteAlpha.300' }} bg={currentPath.includes('datasetId=6704a0338af61dbe0fc819b1') ? 'whiteAlpha.300' : 'transparent'}>
                        英文知識庫
                      </Link>
                      <Link href="/dataset/detail?datasetId=67049b2d8af61dbe0fc80b4b" p={2} borderRadius="8px" _hover={{ bg: 'whiteAlpha.300' }} bg={currentPath.includes('datasetId=67049b2d8af61dbe0fc80b4b') ? 'whiteAlpha.300' : 'transparent'}>
                        中文知識庫
                      </Link>
                      <Link href="/dataset/detail?datasetId=66fa090a8af61dbe0fc57bde" p={2} borderRadius="8px" _hover={{ bg: 'whiteAlpha.300' }} bg={currentPath.includes('datasetId=66fa090a8af61dbe0fc57bde') ? 'whiteAlpha.300' : 'transparent'}>
                        韓語知識庫
                      </Link>
                      <Link href="/dataset/detail?datasetId=66f919598af61dbe0fc4f17f" p={2} borderRadius="8px" _hover={{ bg: 'whiteAlpha.300' }} bg={currentPath.includes('datasetId=66f919598af61dbe0fc4f17f') ? 'whiteAlpha.300' : 'transparent'}>
                        日語知識庫
                      </Link>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion> */}
              {/* 店铺管理菜单项 */}
              
              {/* <Link
                href="/app/detail?appId=673c64fa06d212d099a51df8"
                p={2}
                pl={4}
                borderRadius="12px" // 圆角更大
                _hover={{ bg: 'whiteAlpha.300' }} // 鼠标悬停时的背景色
                bg={currentPath.includes('/app/detail') ? 'whiteAlpha.300' : 'transparent'} // 当前页面背景色
                display="flex"
                alignItems="center"
                justifyContent="start"
              >
                <Icon as={FiMessageCircle} mr={3} boxSize={6} color="lightgreen" />
                对话日志
              </Link> */}
            </VStack>
          </Box>
        </>
      )}

      
      {/* 右侧内容区域 */}
      <Box flex="1" height="100%" overflow="auto" css={{
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#e2e8f0',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#3182CE',
          borderRadius: '10px',
          border: '2px solid #e2e8f0',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#2b6cb0',
        },
      }}>
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
