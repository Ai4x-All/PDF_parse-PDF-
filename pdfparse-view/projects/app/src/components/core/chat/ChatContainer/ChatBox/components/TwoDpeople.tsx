// 'use client'

import SpeakerControl from './cpt/SpeakerControl';
import MicrophoneControl from './cpt/MicrophoneControl';
import LanguageModelControl from './cpt/LanguageModelControl';
import ShareButton from './cpt/ShareButton';
import SettingsButton from './cpt/SettingsButton';
import Image from 'next/image';
import React, { useRef, useEffect, useState } from 'react';
import SrsRtcWhipWhepAsync from './cpt/srs.sdk';
import { log } from 'console';
import { Box } from '@chakra-ui/react';
export default function SettingBar({ peopleheight = 0, zimu, setPeopleplay, lastStable, setLastStable }: {
    peopleheight?: any,
    zimu?: any, setPeopleplay?: any,
    lastStable?: any,
    setLastStable?: any
}) {
    // const { character, isPlaying ,setIsPlaying,audioContext} = useAppStore();

    const [streamUrl, setStreamUrl] = useState('');
    const [ipAddress, setIpAddress] = useState('60.177.101.234'); // 初始化默认 IP 地址
    const _domain = 'service.xiaoruiai.com';
    const videoRef = useRef<any>(null);
    const playIconRef = useRef<any>(null);
    const [firstPlay, setFirstPlay] = useState(true);
    const [sdk, setSdk] = useState<any>(null); // 用于保存 SDK 实例

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
                const sdkInstance: any = SrsRtcWhipWhepAsync();
                setSdk(sdkInstance);
                console.log('SDK loaded:', sdkInstance);
            } else {
                console.error('SDK not found or not yet loaded.');
            }
        };

        loadSdk();
    }, []);
    const handlePlay = () => {
        if (videoRef && videoRef.current)
            videoRef.current.play();
    };

    const handlePause = () => {
        if (videoRef && videoRef.current)
            videoRef.current.pause();
    };

    // Function to handle playing the stream
    const startStream = () => {
        if (firstPlay && sdk) {
            setPeopleplay(true)
            sdk.play(streamUrl)
                .then((session: { sessionid: any; }) => {
                    console.log('Streaming started, session ID:', session.sessionid);
                    if (videoRef.current) {
                        videoRef.current.srcObject = sdk.stream; // Set stream to video element
                        videoRef.current.play(); // Play the video
                    }
                })
                .catch((error: any) => {
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

    const chunkSize = 20;
    let totalChunks = Math.ceil(zimu.length / chunkSize);
    const [currenttIndex, setCurrenttIndex] = useState(0);
    const currentIndex = useRef(0);
    const [currentText, setCurrentText] = useState('');
    const [chunkslg, setChunkslg] = useState(zimu.length); // 监控字幕长度
    const prevValueRef = useRef(chunkslg); // 用于存储上一个值  
    const [isStable, setIsStable] = useState(false); // 用于确定值是否稳定  
    const [chongzhi, setChongzhi] = useState(false); // 用于重置字幕
    const [showzimu, setShowzimu] = useState(false); // 用于显示字幕
    // 将 zimu 切成 chunks  
    const chunks = Array.from({ length: totalChunks }, (_, i) =>
        zimu.slice(i * chunkSize, (i + 1) * chunkSize) // 将每个 chunk 转换为字符串  
    );
    useEffect(() => {
        console.log('字幕长度变化:', zimu.length);
        setChunkslg(zimu);
    }, [zimu]);
    useEffect(() => {
        // 监听 value 的变化  
        console.log('chunkslg的值(是否正在动态变化):::::::::::::', chunkslg, 'prevValueRef的值::', prevValueRef);
        if (chunkslg !== prevValueRef.current) {


            prevValueRef.current = chunkslg; // 更新上一个值  
            console.log('在变!!!!并更新值:', chunkslg, prevValueRef.current);
            // setIsStable(true);
            if (!isStable && lastStable == false) {
                console.log('稳定了!!!!');

                setIsStable(true);
            }

        }
    }, [chunkslg]);
    useEffect(() => {
        const delay = 5000; // 延迟后启动定时器  
        const intervalDuration = 3400; // 每 4 秒更新一次  
        let timerId: any;
        let timeoutId: any;
        console.log(isStable, '进入useEffect..............', lastStable);
        if (isStable && chunkslg.length > 0 && lastStable == false) {
            
            console.log("chunkslg.length", chunkslg.length)
            const startTimer = () => {
                timerId = setInterval(() => {
                    // setCurrentIndex(prevIndex => prevIndex + 1);
                    if (currentIndex.current >= totalChunks) {
                        console.log('关闭');
                        clearInterval(timerId);
                        // clearTimeout(timeoutId);
                        // setCurrentIndex(0);
                        currentIndex.current = 0;
                        setChongzhi(true);
                        setLastStable(false);
                        setChunkslg([]);
                        setIsStable(false);
                        setShowzimu(false);
                    } else {
                        currentIndex.current++;
                        setCurrenttIndex(currentIndex.current);
                        console.log('启动遍历定时器,当前index为:', currentIndex, totalChunks);
                    }
                }, intervalDuration);
            };
            console.log('定时器的判断', currentIndex, 'totalChunks', totalChunks);
            if (currentIndex.current <= totalChunks && prevValueRef && !lastStable) {
                console.log('进入定时器');
                setLastStable(true);
                setTimeout(() => {
                    startTimer();
                    setShowzimu(true);
                }, delay);
            }
        }
    }, [isStable, currentIndex.current, chunkslg]);
    // }, [isStable, chunkslg]);
    // }, [totalChunks]); 
    // }, [totalChunks,currentIndex]); 

    useEffect(() => {
        // console.log('展示文字:::',currentText);
        console.log('设置文字前', chunks.length, chongzhi);

        if (chunks.length > 0) {
            console.log('设置文字');

            setCurrentText(chunks[currentIndex.current]); // 每次 currentIndex 改变时更新 currentText  
            if (chongzhi) {
                setCurrentText('')
                setChongzhi(false)
            }

        }
    }, [currenttIndex, chunks]); // 依赖于 currentIndex 和 chunks  
    // }, [currenttIndex, chunks]); // 依赖于 currentIndex 和 chunks  
    ;
    return (
        <>
            <div>
                <div className='flex justify-center text-center text-2xl mt-4'>
                    <div
                        id="videoContainer"
                        style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '100%',
                            //   height: '751px',
                            height: peopleheight == 1 ? '270px' : '80vh',
                            backgroundColor: 'white',
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
                                backgroundColor: '#A7BAEB',
                                margin: 0,
                                padding: 0,
                                display: 'block',
                            }}
                        >
                        </video>
                        {
                            (showzimu) && (
                                <Box position='absolute' w={'600px'} height={'50px'} 
                                color={'#E7E7E7'}
                                    bottom={'20px'} zIndex={1000} fontSize={"30px"}
                                    left={"50%"} transform={"translateX(-50%)"}
                                    textAlign={"center"} lineHeight={"50px"}
                                    overflow={"hidden"}
                                >

                                    {currentText}
                                </Box>
                            )
                        }

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

            </div>
        </>
    );
}
