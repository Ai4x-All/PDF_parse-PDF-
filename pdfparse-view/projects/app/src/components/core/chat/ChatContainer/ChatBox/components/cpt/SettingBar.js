'use client'

import SpeakerControl from './SpeakerControl';
import MicrophoneControl from './MicrophoneControl';
import LanguageModelControl from './LanguageModelControl';
import ShareButton from './ShareButton';
import SettingsButton from './SettingsButton';
import { Avatar } from '@nextui-org/avatar';
import { useAppStore } from '@/lib/store';
import Image from 'next/image';
import React, { useRef, useEffect, useState } from 'react';
import SrsRtcWhipWhepAsync from './srs.sdk';
export default function SettingBar({
  isTextMode,
  isMute,
  toggleMute,
  disableMic,
  handleMic
}) {
  const { character, isPlaying ,setIsPlaying,audioContext} = useAppStore();
  const character_image_url = character.image_url;
  const character_video_url = character.video_url;
  const [streamUrl, setStreamUrl] = useState('');
  const [ipAddress, setIpAddress] = useState('60.177.101.234'); // 初始化默认 IP 地址
  const _domain = 'service.xiaoruiai.com';
  const videoRef = useRef(null);
  const playIconRef = useRef(null);
  const [firstPlay, setFirstPlay] = useState(true);
  const [sdk, setSdk] = useState(null); // 用于保存 SDK 实例

  // 解析域名到 IP 的函数
  const resolveDomainToIP = async () => {
    // const ipAddress = '125.120.11.230';
    // console.log('ipAddress:', ipAddress)
    // setIp(ipAddress);
    setStreamUrl(`https://www.xiaoruiai.com:11985/rtc/v1/whep/?app=live&stream=livestream`);

    // try {
    //     const response = await fetch('https://service.xiaoruiai.com:19100/resolve', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify({
    //         domain: _domain,
    //         type: 'A'
    //       })
    //     });

    //     if (!response.ok) {
    //       setStreamUrl(`http://${ipAddress}:1985/rtc/v1/whep/?app=live&stream=livestream`);
    //       throw new Error(`${_domain} 域名解析请求发送失败`);
    //     }

    //     const data = await response.json(); // 将返回的数据解析为 JSON

    //     const newIpAddress  = (Array.isArray(data) && data.length > 0) ? data[0] : ipAddress;

    //     console.log(_domain, ' ipAddress: ', newIpAddress );
        
    //     // 更新流 URL
    //     setIpAddress(newIpAddress);
    //     setStreamUrl(`http://${newIpAddress}:1985/rtc/v1/whep/?app=live&stream=livestream`);

    // } catch (error) {
    //     setStreamUrl(`http://${ipAddress}:1985/rtc/v1/whep/?app=live&stream=livestream`);
    //     console.error('解析域名失败:', error);
    // }
  };

  // 每分钟解析一次域名
  useEffect(() => {
      resolveDomainToIP(); // 初始解析
      // const interval = setInterval(resolveDomainToIP, 3600000); // 每 1 小时解析一次

      // return () => clearInterval(interval); // 清除定时器
  }, []);

  // 加载 SDK
  useEffect(() => {
    const loadSdk = async () => {
      if (SrsRtcWhipWhepAsync) {
        const sdkInstance = new SrsRtcWhipWhepAsync();
        setSdk(sdkInstance);
        console.log('SDK loaded:', sdkInstance);
      } else {
          console.error('SDK not found or not yet loaded.');
      }
    };

    loadSdk();
  }, []);

  useEffect(() => {
      if(isPlaying){
        handlePlay()
      }else{
        handlePause()
      }
    
  }, [isPlaying,audioContext]);

  // 根据 socketIsOpen 和 isTalking 状态设置按钮类
  const avatarClass = isPlaying&&audioContext
    ? "avatar-wrapper" // 如果正在播放语音，则显示动画
    : ""; // 无动画

  const handlePlay = () => {
    if(videoRef&&videoRef.current)
      videoRef.current.play();
  };

  const handlePause = () => {
    if(videoRef&&videoRef.current)
      videoRef.current.pause();
  };

  // Function to handle playing the stream
  const startStream = () => {
    if (firstPlay) {
        sdk.play(streamUrl)
            .then(session => {
                console.log('Streaming started, session ID:', session.sessionid);
                if (videoRef.current) {
                    videoRef.current.srcObject = sdk.stream; // Set stream to video element
                    videoRef.current.play(); // Play the video
                }
            })
            .catch(error => {
                console.error('Error starting stream:', error);
            });
        hidePlayIcon(); // Hide the play icon after stream starts
    }
  };

  // Show play icon initially
  const showPlayIcon = () => {
      if (playIconRef.current && firstPlay) {
          playIconRef.current.style.display = 'block';
      }
  };

  // Hide play icon after first play
  const hidePlayIcon = () => {
      if (playIconRef.current) {
          playIconRef.current.style.display = 'none';
          setFirstPlay(false); // Prevent showing the play icon again
      }
  };

  // Add event listeners to handle play and pause actions
  useEffect(() => {
      const videoElement = videoRef.current;

      const handlePlay = () => {
          hidePlayIcon(); // Hide play icon once the video starts playing
      };

      // Attach play event to the video element
      if (videoElement) {
          videoElement.addEventListener('play', handlePlay);
      }

      // Clean up event listener on component unmount
      return () => {
          if (videoElement) {
              videoElement.removeEventListener('play', handlePlay);
          }
      };
  }, [firstPlay]);

  // Show the play icon initially
  useEffect(() => {
      showPlayIcon();
  }, []);


  return (
    <>
      <div>
        <div className="flex justify-center text-center text-2xl mt-4">
          <span className="gap-2">{character.name}</span>
          <span className="flex gap-2">
            <SpeakerControl
              isMute={isMute}
              toggleMute={toggleMute}
            />
            <MicrophoneControl
              isDisabled={disableMic}
              handleMic={handleMic}
            />
          </span>
        </div>
        <div className='flex justify-center text-center text-2xl mt-4'>
          <div
              id="videoContainer"
              style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '100%',
                  maxWidth: '414px',
                  height: '232px',
                  backgroundColor: 'black',
              }}
          >
              {/* 视频元素 */}
              <video
                  id="webrtc_video"
                  ref={videoRef}
                  controls
                  autoPlay
                  style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      backgroundColor: 'black',
                      margin: 0,
                      padding: 0,
                      display: 'block',
                  }}
              ></video>
              {/* 播放图标 */}
              {firstPlay && (
                  <div
                      id="playIcon"
                      ref={playIconRef}
                      style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '40px solid white',
                          borderTop: '25px solid transparent',
                          borderBottom: '25px solid transparent',
                          cursor: 'pointer',
                          opacity: 0.8,
                          zIndex: 2, // 确保三角形在视频上方
                      }}
                      onClick={startStream} // 绑定点击事件
                  ></div>
              )}
          </div> 
        </div>
        <div className="pt-3 px-10 text-tiny justify-center items-center hidden sm:block" style={{ whiteSpace: 'pre-wrap' }}>
          <span>【简介】{character.subscribe_msg}</span>
        </div>
      </div>
    </>
  );
}
