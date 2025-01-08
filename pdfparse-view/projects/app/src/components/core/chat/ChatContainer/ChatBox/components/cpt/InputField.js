import { useState } from 'react';
import { Button } from '@nextui-org/button';
import { Tooltip } from '@nextui-org/tooltip';
import { IoPaperPlaneOutline } from 'react-icons/io5';
import { FaRegKeyboard } from 'react-icons/fa';
import Image from 'next/image';
import talkSvg from '@/assets/svgs/talk.svg';
import ClickToTalk from './ClickToTalk';
import { useAppStore } from "@/lib/store";
import { apiStopVoice } from "@/util/apiClient";

export default function InputField() {
  const [text, setText] = useState('');
  const [isTextInput, setIsTextInput] = useState(false);
  const { sendOverSocket, appendUserChat } = useAppStore();
  const { stopAudioPlayback ,messageId} = useAppStore();

  function handleOnEnter() {
    if (text) {
      stopAudioPlayback();
      appendUserChat(text);
      sendOverSocket(text);
      if(messageId)
        apiStopVoice(messageId);
      //清空数据input框内容数据
      setText("");
    }
  }

  return (
    <div className="flex justify-center md:mx-auto md:w-unit-9xl lg:w-[892px]">
      {isTextInput && (
        <div className="flex flex-row justify-center gap-2 w-full pb-5 pt-4">
          <Tooltip content="Talk">
            <Button
              isIconOnly
              variant="bordered"
              radius="full"
              size="md"
              onPress={() =>
                setIsTextInput(false)
              }
            >
              <Image
                priority
                src={talkSvg}
                alt="talk button"
              />
            </Button>
          </Tooltip>
          <input
            style={{ backgroundColor: 'white', color: 'black', fontSize: '16px', fontFamily: '', border: 'none', outline: 'none', padding: '8px', width: '100%', boxSizing: 'border-box' }}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleOnEnter();
              }
            }}
            placeholder="请在此输入你想和我交流的内容～"
          />
          <Button
            size="md"
            variant="bordered"
            className="px-2 min-w-fit sm:min-w-16 sm:px-4 md:flex"
            onPress={handleOnEnter}
          >
            <IoPaperPlaneOutline size="1.5em" />
            <span className="lg:inline"></span>
          </Button>
        </div>
      )}
      {!isTextInput && (
        <div className="flex flex-row justify-between pt-4 pr-20">
          <div className="w-100">
            <Tooltip content="文本输入">
              <Button
                isIconOnly
                variant="bordered"
                radius="full"
                size="md"
                onPress={() =>
                  setIsTextInput(true)
                }
                className=""
              >
                <FaRegKeyboard />
              </Button>
            </Tooltip>
            <p className="font-light text-tiny">文本输入</p>
          </div>
          <div className='w-300'>
            <ClickToTalk className="text-center" />
          </div>
          <div></div> {/* 空的 div，用于保持布局 */}
        </div>

      )}
    </div>
  );
}
