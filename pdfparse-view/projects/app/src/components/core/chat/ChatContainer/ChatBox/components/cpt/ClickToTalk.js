import { Button } from '@nextui-org/react';
import Image from 'next/image';
import micSvg from '@/assets/svgs/microphone.svg';
import pauseSvg from '@/assets/svgs/pause.svg';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import AudioWave from './AudioWave'
import { apiStopVoice } from "@/util/apiClient";

export default function ClickToTalk({
  className
}) {
  const [isTalking, setIsTalking] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const { startRecording, stopRecording, stopAudioPlayback, socketIsOpen ,messageId} = useAppStore();

  function startTalk() {
    setIsTalking(true);
    stopAudioPlayback();
    startRecording();
    setRecordingTime(0); // 重置录音时间
  }

  function stopTalk() {
    setIsTalking(false);
    stopRecording();
  }

  // 开始录音的函数
  function handleMouseDown() {
    console.log("录音键开始按下");
    if(messageId)
      apiStopVoice(messageId);
    setIsTalking(true);
    stopAudioPlayback();
    startRecording();
    setRecordingTime(0); // 重置录音时间
  }

  // 停止录音的函数
  function handleMouseUp() {
    console.log("录音键松开");
    setIsTalking(false);
    stopRecording();
  }

  // 根据 socketIsOpen 和 isTalking 状态设置按钮类
  const buttonClass = socketIsOpen
    ? isTalking
      ? "bg-red-200 w-16 h-16 animate-expandBorder" // 如果 socketIsOpen 为 true 且正在录音，则按钮为绿色并具有脉冲动画
      : "bg-green-200 w-16 h-16" // 如果 socketIsOpen 为 true 但不在录音，则按钮为绿色无动画
    : "bg-gray-500 w-16 h-16"; // 如果 socketIsOpen 为 false，则按钮为灰色无动画

  // 根据 socketIsOpen 和 isTalking 状态设置按钮类
  const statusMesage = socketIsOpen
    ? isTalking
      ? `语音输入中...${recordingTime}s`
      : "按住开始说话"
    : "正在连接服务器...";

  // 使用 useEffect 来更新录音时间
  useEffect(() => {
    let interval;
    if (isTalking) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1); // 每秒增加时间
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTalking]);

  return (
    <>
      <div className={className + ' mb-4 sm:mb-1 pl-20 '} style={{ paddingRight: '4rem' }}>
        <p className="font-light text-tiny absolute top-0">{statusMesage}</p>

        <button
          className={`${buttonClass} ${className} ml-2 rounded-full select-none touch-none`}
          style={{
            width: '60px',
            height: '60px',
            padding: '0',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 4px rgba(255, 255, 255, 0.8)',
            borderRadius: '50%',
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={(e) => { e.preventDefault(); handleMouseDown(e); }} // 防止长按的默认行为
          onTouchEnd={handleMouseUp}
        />

        {/* 当 isTalking 为 true 时显示额外内容 */}
        {isTalking && (
          <div className="absolute -top-20 -ml-10 h-20 w-48 p-2 rounded-2xl bg-default/20">
            <AudioWave isTalking={isTalking} />
          </div>
        )}

      </div>
    </>
  );

}
