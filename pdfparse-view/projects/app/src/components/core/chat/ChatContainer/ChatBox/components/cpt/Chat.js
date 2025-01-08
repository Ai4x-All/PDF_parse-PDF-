import {
  RiThumbUpLine,
  RiThumbDownLine
} from 'react-icons/ri';
import { Button } from '@nextui-org/button';
import { useAppStore } from '@/lib/store';
import { useState, useRef, useEffect } from 'react';
import { Avatar } from '@nextui-org/avatar';
import ReactMarkdown from 'react-markdown';
export default function Chat() {
  const { chatContent, interimChat } = useAppStore();
  const messageEndRef = useRef(null);
  const { character } = useAppStore();
  const character_image_url = character.image_url;
  const MyImageRenderer = ({ alt, src, title }) => {
    return <img src={src} alt={alt} title={title} width="70%" />;
  };
  const [lastAssistantContent, setLastAssistantContent] = useState(null); // 保存最新的内容
  useEffect(() => {
    console.log(chatContent);
    // 筛选出 message_type 为 'assistant' 的消息
    const assistantMessages = chatContent.filter(message => message.message_type === 'assistant');

    // 获取最后一个 'assistant' 的 content 值
    const newLastAssistantContent = assistantMessages[assistantMessages.length - 1]?.content;

    
    // 只在新内容和旧内容不相同时才发送请求
    if (newLastAssistantContent && newLastAssistantContent !== lastAssistantContent) {
      console.log("==", newLastAssistantContent);
      setLastAssistantContent(newLastAssistantContent); // 更新状态

      // 构造请求的 body 或其他数据
      const data = { content: newLastAssistantContent.replace(/\*/g, "") };

      // 发送 POST 请求
      fetch('https://service.xiaoruiai.com:19012/metahuman-stream-talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // 发送 JSON 格式数据
        },
        body: JSON.stringify(data), // 将数据转为 JSON 字符串
      })
      .then(response => response.json()) // 处理响应
      .then(result => {
        console.log('成功向本地服务metahuman-stream API发送数据:', result);
      })
      .catch(error => {
        console.error('向本地服务metahuman-stream API发送数据时出错:', error);
      });
    }
    messageEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: 'center',
      inline: 'nearest'
    })
  }, [chatContent, lastAssistantContent])

  function formatTimestamp(timestamp) {
    // 创建一个新的 Date 对象
    
    const date = new Date(Number(timestamp));

    const getzf = num => {
      if (parseInt(num) < 10) {
        num = '0' + num;
      }
      return num;
    };
  
    // 获取年、月、日、时、分、秒
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
  
    // 格式化时间为 "YYYY-MM-DD HH:mm:ss" 格式
    const formattedTime = getzf(month) + '月' + getzf(day) + '日 ' + getzf(hour) + ':' + getzf(minute);
    
    return formattedTime;
  }

  return (
    <div className={`flex flex-col gap-5 overflow-y-auto min-h-25`}>
      {
        [...chatContent, interimChat].sort((a, b) => {
          if (!a) {
            return 1;
          } else if (!b) {
            return -1;
          } else {
            return a.timestamp - b.timestamp;
          }
        })?.map((line) => {
          if (line && line.hasOwnProperty('message_type') && line.message_type === 'assistant') {
            return (
              <div
                key={line.hasOwnProperty('timestamp') ? line.timestamp: 0}
                className="flex flex-row self-start items-start md:items-stretch w-fit z-1"
              >
                
                <Avatar
                  name={character.name}
                  src={character_image_url}
                  classNames={{
                    base: "flex-none z-1 w-8 h-8 mt-3"
                  }}
                />
                <div className="m-2 bg-white w-fit max-w-[480px] py-2 px-5 font-light rounded-3xl md:mr-3 rounded-bl-none bg-real-navy/20 break-words overflow-wrap-break-word overflow-hidden">
                  <div className='text-black/50  text-tiny'>{formatTimestamp(line.timestamp)}</div>
                  <ReactMarkdown components={{ img: MyImageRenderer }}>{line.content}</ReactMarkdown>
                  </div>
                {/* <div><Button
                  isIconOnly
                  hide
                  radius="full"
                  variant="light"
                  className="text-black/50 hover:text-black hover:bg-button min-w-fit md:min-w-10 md:h-10"
                >
                  <RiThumbUpLine size="1.5em"/>
                </Button>
                <Button
                  isIconOnly
                  hide
                  radius="full"
                  variant="light"
                  className="text-black/50 hover:text-black hover:bg-button min-w-fit md:min-w-10 md:h-10"
                >
                  <RiThumbDownLine size="1.5em"/>
                </Button>
                </div> */}
              </div>
            );
          } else if (line && line.hasOwnProperty('message_type') && line.message_type === 'user') {
            return (
              <div
                key={line.timestamp}
                className="self-end"
              >
                <div className="chat-text m-2 w-fit max-w-[450px] py-2 px-5 font-light flex-none rounded-3xl rounded-br-none break-words overflow-wrap-break-word overflow-hidden">
                <p className='text-black/50 text-tiny'>{formatTimestamp(line.timestamp)}</p>
                <ReactMarkdown>{line.content}</ReactMarkdown>
                </div>
              </div>
            )
          }
        })
      }
      <div ref={messageEndRef}></div>
    </div>
  );
}
