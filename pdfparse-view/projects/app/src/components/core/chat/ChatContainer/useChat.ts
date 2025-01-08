import { ChatSiteItemType } from '@fastgpt/global/core/chat/type';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PluginRunBoxTabEnum } from './PluginRunBox/constants';
import { ComponentRef as ChatComponentRef } from './ChatBox/type';

// 使用ChatBox组件
export const useChat = () => {
  // 创建ChatBox组件的引用
  const ChatBoxRef = useRef<ChatComponentRef>(null);

  // 创建聊天记录的状态
  const [chatRecords, setChatRecords] = useState<ChatSiteItemType[]>([]);
  // 创建表单的状态
  const variablesForm = useForm();
  // plugin
  // 创建插件运行框的标签状态
  const [pluginRunTab, setPluginRunTab] = useState<PluginRunBoxTabEnum>(PluginRunBoxTabEnum.input);

  // 重置聊天记录
  const resetChatRecords = useCallback(
    (props?: { records?: ChatSiteItemType[]; variables?: Record<string, any> }) => {
      const { records = [], variables = {} } = props || {};

      // 设置聊天记录
      setChatRecords(records);

      // 重置表单
      const data = variablesForm.getValues();
      for (const key in data) {
        data[key] = '';
      }

      variablesForm.reset({
        ...data,
        ...variables
      });

      // 重启聊天
      setTimeout(
        () => {
          ChatBoxRef.current?.restartChat?.();
        },
        ChatBoxRef.current?.restartChat ? 0 : 500
      );
    },
    [variablesForm, setChatRecords]
  );

  // 清空聊天记录
  const clearChatRecords = useCallback(() => {
    // 设置聊天记录为空
    setChatRecords([]);

    // 重置表单
    const data = variablesForm.getValues();
    for (const key in data) {
      variablesForm.setValue(key, '');
    }

    // 重启聊天
    ChatBoxRef.current?.restartChat?.();
  }, [variablesForm]);
  return {
    // 返回ChatBox组件的引用
    ChatBoxRef,
    // 返回聊天记录
    chatRecords,
    // 返回设置聊天记录的函数
    setChatRecords,
    // 返回表单
    variablesForm,
    // 返回插件运行框的标签
    pluginRunTab,
    // 返回设置插件运行框标签的函数
    setPluginRunTab,
    // 返回清空聊天记录的函数
    clearChatRecords,
    // 返回重置聊天记录的函数
    resetChatRecords
  };
};