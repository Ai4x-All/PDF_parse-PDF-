
import {
  motion,
  useCycle,
  AnimatePresence
} from 'framer-motion';
import {
  Button,
  Select,
  SelectItem,
  SelectSection,
  Switch,
} from '@nextui-org/react';
import { RxHamburgerMenu, RxCross2 } from 'react-icons/rx';
import { IoMdTrash } from 'react-icons/io';  
import { BiSolidLockAlt } from 'react-icons/bi';
import styles from './HamburgerMenu.module.css';
import { useAppStore } from '@/lib/store';
import { useAuthContext } from '@/context/AuthContext';
import { useState,useEffect } from 'react';
import { getChatMessage ,deleteChatMessage} from '@/util/apiClient';
export default function HamburgerMenu() {
  const [open, cycleOpen] = useCycle(false, true);
  const [conversation_msg,setConversation_msg] = useState([]);
  const [isSelected,setIsSelectedg] = useState(false);
  const {
    models,
    selectedModel,
    handleModelChange,
    preferredLanguage,
    languageList,
    handleLanguageChange,
  } = useAppStore();
  const {conversation_list,setConversation_list,appendAPIChatContent,clearChatContent,setCharacter_template_id,character_template_id,closeSocket,connectSocket} = useAppStore();
  const [isButtonVisible, setButtonVisibility] = useState(false); // 控制按钮的显示与隐藏  
  const { stopAudioPlayback } = useAppStore();
  const sideVariants = {
    closed: {
      opacity: 0,
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1,
      }
    },
    open: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        staggerDirection: 1,
      }
    }
  };
  const { user } = useAuthContext();

  useEffect(() => {
    setConversation_msg(conversation_list)
  }, [conversation_list])
  // 历史记录选择操作
  async function changeConversation(id,title){
    stopAudioPlayback();
    setCharacter_template_id(id)
    cycleOpen()
    closeSocket();
    connectSocket(true,extractContentAfterLastAtSign(title))
    let content_all = await getChatMessage(id);
    if(content_all['message']){
      content_all['message'] = JSON.parse(content_all['message'])
      if(content_all['message'].length>0){
        clearChatContent()
        for (let key = 0; key<content_all['message'].length;key++) {
            const element = content_all['message'][key];
            appendAPIChatContent(replaceHashWithImgTag(element.fields['content']),new Date(element.fields['timestamp']).getTime(),element.fields['message_type'])
          }
      }
    }
  }
  function replaceHashWithImgTag(str){
    // 使用正则表达式匹配两个#号之间的内容，并且确保#号前后不是图片格式的一部分
    const regex = /(?<!\.)#([^#]+)#(?!\.\w+)/g;
    return str.replace(regex, (match, contentBetweenHashes) => {
      // 判断两个#号之间的内容是否为图片格式
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      const extension = contentBetweenHashes.split('.').pop().toLowerCase();
      const isImage = imageExtensions.includes(extension);
      // 如果是图片格式，则替换为img标签
      if (isImage) {
        return `![${contentBetweenHashes}](${contentBetweenHashes} "title")`;
      } else {
        // 如果不是图片格式，保持原样
        return match;
      }
    })
  }
  // 获取sessionId
  function extractContentAfterLastAtSign(input) {
    // 使用正则表达式匹配恰好两个@的情况
    const match = input.match(/^(.*@.*@).*/);
    if (match) {
      // 如果有两个@，取出最后一个@之后的内容
      return input.substring(match[1].length);
    } else {
      // 如果没有两个@，返回空字符串
      return '';
    }
  }

  
  const toggleButtonVisibility = () => {  
    setButtonVisibility(!isButtonVisible); // 切换按钮的显示状态  
  };

  // 删除按钮功能
  async function delete_conversation(id,event){
    // 停止冒泡事件
    event.stopPropagation()
    await deleteChatMessage(id);
    if(id == character_template_id){//删除当前的内容
      window.location.reload()
    }else{
      const newArray = conversation_list.filter((item) => item.id !== id);
      setConversation_list(newArray)
    }
  }

  function onValueChange(value){
    setIsSelectedg(value)
  }

  function formatTimestamp(timestamp) {
    // 创建一个新的 Date 对象
    console.log(timestamp);
    const date = new Date(timestamp);

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
    <>
    <AnimatePresence>
    {open && (
    <motion.aside
      className={styles.backdrop}
      initial={{ width: 0 }}
      animate={{ width: "100vw"}}
      exit={{
        width: 0,
        transition: {
          delay: 0.1,
          duration: 0.3
        }
      }}
    >
      <motion.div
        className={styles.menu}
        initial="closed"
        animate="open"
        exit="closed"
        variants={sideVariants}
      >
        
        <section className="text-white p-6 pt-20">
          
          <section className="hidden">
            <header className="text-sm font-light my-3">Large language model(LLM)</header>
            {user == null ? (
              <Select
                labelPlacement="outside"
                aria-label="model select"
                selectedKeys={selectedModel}
                disabledKeys={['locked', models[0].id]}
                onChange={handleModelChange}
                radius="sm"
                classNames={{
                  base: 'w-full',
                  trigger: 'bg-black/10 data-[hover=true]:bg-black/20',
                  value: 'font-light pl-4 text-base',
                  popover: 'bg-dropdown',
                }}
              >
                <SelectSection>
                  <SelectItem key={models[0].id} textValue={models[0].name}
                    classNames={{
                      base: 'data-[hover=true]:bg-default/40 data-[selectable=true]:focus:bg-default/40'
                    }}
                  >
                    <div className="font-light flex flex-col">
                      <span>{models[0].name}</span>
                      <span className="text-tiny blackspace-normal text-black/50">{models[0].tooltip}</span>
                    </div>
                  </SelectItem>
                </SelectSection>
                <SelectSection>
                  <SelectItem
                    key="locked"
                    classNames={{
                      selectedIcon: 'hidden'
                    }}
                  >
                    <span className="text-small flex flex-row items-center gap-1"><BiSolidLockAlt />Sign in needed</span>
                  </SelectItem>
                </SelectSection>
              </Select>
            ) : (
              <Select
                labelPlacement="outside"
                aria-label="model select"
                selectedKeys={selectedModel}
                onChange={handleModelChange}
                radius="sm"
                classNames={{
                  base: 'w-full',
                  trigger: 'bg-black/10 data-[hover=true]:bg-black/20',
                  value: 'font-light pl-4 text-base',
                  popover: 'bg-dropdown',
                }}
              >
                <SelectSection>
                {models.map((item) => (
                  <SelectItem key={item.id} textValue={item.name}
                    classNames={{
                      base: 'data-[hover=true]:bg-default/40 data-[selectable=true]:focus:bg-default/40 data-[selected=true]:pointer-events-none'
                    }}
                  >
                    <div className="font-light flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-tiny blackspace-normal text-black/50">{item.tooltip}</span>
                    </div>
                  </SelectItem>
                ))}
                </SelectSection>
              </Select>
            )}

          </section>
          <section>
            <header className="text-sm font-light my-3">选择语言</header>
            <Select
              labelPlacement="outside"
              aria-label="language select"
              selectedKeys={preferredLanguage}
              onChange={handleLanguageChange}
              radius="sm"
              classNames={{
                trigger: 'bg-black/10 data-[hover=true]:bg-black/20',
                value: 'font-light pl-4 text-base',
                popover: 'bg-dropdown',
              }}
            >
              <SelectSection>
            {languageList.map((item) => (
              <SelectItem key={item} textValue={item}
                classNames={{
                  base: 'data-[hover=true]:bg-default/40 data-[selectable=true]:focus:bg-default/40 data-[selected=true]:pointer-events-none'
                }}
              >
                <div className="font-light">{item}</div>
              </SelectItem>
            ))}
              </SelectSection>
            </Select>
          </section>
          <section>
            <header className="text-sm font-light my-3">更多选项</header>
            {/* <div className="flex flex-row gap-4 justify-between my-3">
              <p>启用搜索</p>
              <Switch
                size="sm"
                isSelected={enableGoogle}
                onValueChange={handleGoogle}
                aria-label="google search"
              />
            </div> */}
            {/* <div className="hidden flex flex-row gap-4 justify-between my-3">
              <p>Enable Quivr Second Brain</p>
              <Switch
                size="sm"
                isSelected={enableQuivr}
                onValueChange={handleQuivr}
                aria-label="google search"
              />
            </div> */}
              <Switch
                size="sm"
                isSelected={isSelected}
                onValueChange={onValueChange}
                aria-label="google search"
              /><span>启用历史记录</span>
          {
           isSelected&& <div>
            <header className="text-sm my-3">历史记录<span style={{userSelect:'none'}} className="float-right cursor-pointer" onClick={toggleButtonVisibility}>编辑</span></header> 
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ height: '30vh' }}>  
                {conversation_msg.map((line) => (  
                  <div className="p-2 rounded-lg hover:bg-red-500 hover:border-gray-500" key={line.id} onClick={()=>changeConversation(line.id,line.title)}>  
                    <div className="flex items-center justify-between">  
                      <div className="overflow-hidden font-6 line-3 cursor-pointer" style={{textOverflow:'ellipsis',whiteSpace:'nowrap'}}>  
                        {line.subscribe_msg}
                        <p>{formatTimestamp(line.created_at)}</p>
                      </div>
                      {isButtonVisible && (
                        <div className="float-right z-50 h-auto border-0 border-t-0 cursor-pointer" onClick={(event)=>delete_conversation(line.id,event)}><IoMdTrash style={{color:"#fff",fontSize: '20px'}}/></div> 
                      )}  
                    </div>  
                  </div>
                ))}  
              </div> 
           </div>
          }
          </section>
        </section>
      </motion.div>
    </motion.aside>
    )}
    </AnimatePresence>
    <Button
      isIconOnly
      variant="light"
      className="min-w-8 z-50"
      onPress={cycleOpen}
    >
      {open ? (
        <RxCross2 size="1.75em" color="white"/>
      ) : (
        <RxHamburgerMenu size="1.75em"/>
      )}
    </Button>
    </>
  );
}
