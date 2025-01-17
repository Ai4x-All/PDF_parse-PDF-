import React, { useState } from 'react';
import {
  Flex,
  Box,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  useDisclosure,
  ModalBody,
  HStack
} from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import { getAppChatLogs } from '@/web/core/app/api';
import dayjs from 'dayjs';
import { ChatSourceMap } from '@fastgpt/global/core/chat/constants';
import { AppLogsListItemType } from '@/types/app';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { addDays } from 'date-fns';
import { usePagination } from '@fastgpt/web/hooks/usePagination';
import DateRangePicker, { DateRangeType } from '@fastgpt/web/components/common/DateRangePicker';
import { useI18n } from '@/web/context/I18n';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../context';
import { cardStyles } from '../constants';

import dynamic from 'next/dynamic';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
const DetailLogsModal = dynamic(() => import('./DetailLogsModal'));

const Logs = () => {
  const { t } = useTranslation();
  const { appT } = useI18n();
  const { isPc } = useSystem();

  const appId = useContextSelector(AppContext, (v) => v.appId);

  const [dateRange, setDateRange] = useState<DateRangeType>({
    from: addDays(new Date(), -7),
    to: new Date()
  });

  const {
    isOpen: isOpenMarkDesc,
    onOpen: onOpenMarkDesc,
    onClose: onCloseMarkDesc
  } = useDisclosure();

  const {
    data: logs,
    isLoading,
    Pagination,
    getData,
    pageNum
  } = usePagination<AppLogsListItemType>({
    api: getAppChatLogs,
    pageSize: 20,
    params: {
      appId,
      dateStart: dateRange.from || new Date(),
      dateEnd: addDays(dateRange.to || new Date(), 1)
    }
  });

  const [detailLogsId, setDetailLogsId] = useState<string>();

  return (
    <Flex flexDirection={'column'} h={'100%'} w={'100%'}>
      {/* table */}
      <Flex
        flexDirection={'column'}
        {...cardStyles}
        mt={[0, 4]}
        px={[4, 8]}
        py={[4, 6]}
        flex={'1 0 0'}
      >
        <TableContainer mt={[0, 3]} flex={'1 0 0'} h={0} overflowY={'auto'}>
          <Table variant={'simple'} fontSize={'sm'}>
            <Thead>
              <Tr>
                <Th>{t('common:core.app.logs.Source And Time')}</Th>
                <Th>{appT('logs_title')}</Th>
                <Th>{appT('logs_message_total')}</Th>
               
              </Tr>
            </Thead>
            <Tbody fontSize={'xs'}>
              {logs.map((item) => (
                <Tr
                  key={item._id}
                  _hover={{ bg: 'myWhite.600' }}
                  cursor={'pointer'}
                  title={t('common:core.view_chat_detail')}
                  onClick={() => setDetailLogsId(item.id)}
                >
                  <Td>
                    <Box>{"調用"}</Box>
                    <Box color={'myGray.500'}>{dayjs(item.time).format('YYYY/MM/DD HH:mm')}</Box>
                  </Td>
                  <Td className="textEllipsis" maxW={'250px'}>
                    {item.title}
                  </Td>
                  <Td>{item.messageCount}</Td>
                  
                </Tr>
              ))}
            </Tbody>
          </Table>
          {logs.length === 0 && !isLoading && <EmptyTip text={appT('logs_empty')}></EmptyTip>}
        </TableContainer>

        <HStack w={'100%'} mt={3} justifyContent={'flex-end'}>
          <DateRangePicker
            defaultDate={dateRange}
            position="top"
            onChange={setDateRange}
            onSuccess={() => getData(1)}
          />
          <Pagination />
        </HStack>
      </Flex>

      {!!detailLogsId && (
        <DetailLogsModal
          appId={appId}
          chatId={detailLogsId}
          onClose={() => {
            setDetailLogsId(undefined);
            getData(pageNum);
          }}
        />
      )}
      <MyModal
        isOpen={isOpenMarkDesc}
        onClose={onCloseMarkDesc}
        title={t('common:core.chat.Mark Description Title')}
      >
        <ModalBody whiteSpace={'pre-wrap'}>{t('common:core.chat.Mark Description')}</ModalBody>
      </MyModal>
    </Flex>
  );
};

export default React.memo(Logs);
