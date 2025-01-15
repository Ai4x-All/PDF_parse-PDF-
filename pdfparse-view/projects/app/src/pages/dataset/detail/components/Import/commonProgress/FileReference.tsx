import { Box, Button } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next';
import { useContextSelector } from 'use-context-selector';
import { DatasetImportContext, ImportFormType } from '../Context';
import PDFViewerMemo from "../components/pdf-viewer";
import MdViewer from "../components/md-viewer";
import IMGViewer from "../components/img-viewer";
import TBLViewer from "../components/tbl-viewer";
import TXTViewer from "../components/txt-viewer";
import JSONViewer from "../components/json-viewer";
import styled from 'styled-components';
import { MdBlurOn } from "react-icons/md";
import { MdDescription } from "react-icons/md";
import axios from 'axios';




const Eyecpt = () => {
  return (
    <Eye>
      <div className="loader" />
    </Eye>
  );
}

const Eye = styled.div`
  .loader {
    position: relative;
    width: 78px;
    height: 78px;
    border-radius: 50%;
    background: #fff;
    border: 8px solid #131a1d;
    overflow: hidden;
    box-sizing: border-box;
  }

  .loader::after {
    content: '';
    position: absolute;
    left: 0;
    top: -50%;
    width: 100%;
    height: 100%;
    background: #263238;
    z-index: 5;
    border-bottom: 8px solid #131a1d;
    box-sizing: border-box;
    animation: eyeShade 3s infinite;
  }

  .loader::before {
    content: '';
    position: absolute;
    left: 20px;
    bottom: 15px;
    width: 32px;
    z-index: 2;
    height: 32px;
    background: #111;
    border-radius: 50%;
    animation: eyeMove 3s infinite;
  }

  @keyframes eyeShade {
    0% {
      transform: translateY(0)
    }

    20% {
      transform: translateY(5px)
    }

    40% , 50% {
      transform: translateY(-5px)
    }

    60% {
      transform: translateY( -8px)
    }

    75% {
      transform: translateY( 5px)
    }

    100% {
      transform: translateY(10px)
    }
  }

  @keyframes eyeMove {
    0% {
      transform: translate(0 , 0)
    }

    20% {
      transform: translate(0px , 5px)
    }

    40% , 50% {
      transform: translate(0px , -5px)
    }

    60% {
      transform: translate(-10px , -5px)
    }

    75% {
      transform: translate(-20px , 5px)
    }

    100% {
      transform: translate(0 , 10px)
    }
  }`;






const Radio = ({ previewUrlprops, setPdfUrl, setMddata, pdfUrl }:
  { previewUrlprops: any, setPdfUrl: any, setMddata: any, pdfUrl: any }) => {
  const { goToNext, positioninfo, setPositioninfo, sources, setSources, previewUrl, setfilereferenceCurentPage, setPreviewUrl, pdfresponse } = useContextSelector(DatasetImportContext, (v) => v);
  useEffect(() => {
    console.log('previewUrlprops!!!', previewUrlprops, '-----', previewUrl);

    const dynamicStyles = previewUrlprops.map((_: any, index: any) => `
          .rd-${index + 1}:checked ~ .bar,
          .rd-${index + 1}:checked ~ .slidebar,
          .rd-${index + 1} + label:hover ~ .slidebar {
            transform: translateX(${index * 100}%) scaleX(1);
          }
        `).join(' ');


    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = dynamicStyles;
    document.head.appendChild(styleSheet);


    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [previewUrlprops]);
  const handlePreview = async (item: any, index: any) => {
    if (!item.url) return; // 如果没有 URL，则返回  
    if (pdfUrl === item.url) return;
    console.log('测试当前item.url');
    setfilereferenceCurentPage([{
      name: 'Markdown结果',
      uuid: 0
    }])

    setPdfUrl(item.url);
    sessionStorage.setItem('currentid', item.id);
    // 使用 forEach 遍历 pdfresponse  
    pdfresponse.forEach(async (i: any) => {
      if (i.id === item.id) {
        console.log('此i', i);
        setMddata(i.markdown);

        try {
          const response = await axios({
            url: 'https://www.xiaoruiai.com:8203/parse_layout_info',
            method: 'get',
            params: { parse_id: i.id } // 使用当前 item  
          });

          console.log('----定位结果:', response.data, '和当前id', item.id);
          setPositioninfo(response.data); // 更新位置状态  
        } catch (err) {
          console.error('请求错误:', err); // 打印错误信息，用于调试  
        }
      }
    });
  };
  const handlecheck = (item: any, index: any) => {

    let curid = sessionStorage.getItem('currentid');
    if (curid === item.id) {
      return true
    } else {
      return false
    }

  }

  return (
    <StyledWrapper>
      <div className="containerall">
        <MdBlurOn className='icon' />
        <input hidden className="mode" autoFocus={false} id="theme-mode" type="checkbox" />
        <div className="container">
          <div className="wrap">
            {
              previewUrl.map((item: any, index) => {
                return (
                  <>
                    <input hidden autoFocus={false} checked={handlecheck(item, index)} className={`rd-${index + 1}`}
                      name="radio" id={`rd-${index + 1}`} type="radio" />
                    <label style={{ zIndex: 1 }} onClick={() => handlePreview(item, index)} className="label" htmlFor={`rd-${index + 1}`} >
                      <span><MdDescription />{item.name}</span>
                    </label>
                  </>
                )
              })
            }
            <div className="bar" />
            <div className="slidebar" />
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
    .icon{
        position: absolute;
        top: -38px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 2rem;
        transition: all 0.5s linear;
        color: #B8B8B8;
    }
        .icon:hover{
            color:rgb(36, 34, 34);
            transform:translateX(-50%) scale(1.1);
        
        }
  /* theme-mode-style */
  .mode + .container {
    --color-pure: #000;
    --color-primary: #e8e8e8;
    --color-secondary: #212121;
    --muted: #b8b8b8;
  }
  .mode:checked + .container {
    --color-pure: #fff;
    --color-primary: #212121;
    --color-secondary: #fff;
    --muted: #383838;
  }
    .containerall{
     position: absolute;
     bottom: 0;
     left: 50%;
     transform: translate(-50%, 0);
     
    background-color: rgba(0, 0, 0, 0);
    width: 100%;
    height: 60px;
    }
  .container {
    background-color: transparent;
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  .container .theme {
    color: var(--color-secondary);
    background-color: var(--color-primary);
    position: relative;
    cursor: pointer;
    z-index: 9;
    -webkit-user-select: none;
    user-select: none;
    border: 1px solid var(--muted);
    border-radius: calc(var(--round) - var(--p-y));
    margin-left: calc(var(--p-x) * 2);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    transition: background-color 0.25s linear;
  }
  .container .theme:hover {
    background-color: var(--muted);
  }
  .container .theme::before {
    content: "";
    position: absolute;
    left: calc(var(--p-x) * -1);
    width: 1px;
    height: 100%;
    background-color: var(--muted);
  }
  .container .theme span {
    border: none;
    outline: none;
    background-color: transparent;
    padding: 0.125rem;
    border-radius: 9999px;
    align-items: center;
    justify-content: center;
  }
  .mode:checked + .container .theme span.light,
  .mode + .container .theme span.dark {
    display: none;
  }
  .mode + .container .theme span.light,
  .mode:checked + .container .theme span.dark {
    display: flex;
  }
  .container .theme svg {
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke: currentColor;
    fill: none;
    height: 22px;
    width: 22px;
  }

  /* main style */
  .wrap {
    --round: 10px;
    --p-x: 8px;
    --p-y: 4px;
    --w-label: 100px;
    display: flex;
    align-items: center;
    padding: var(--p-y) var(--p-x);
    position: relative;
    background: var(--color-primary);
    border-radius: var(--round);
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    bottom: 0px;
    z-index: 1;
  }

  .wrap input {
    height: 0;
    width: 0;
    position: absolute;
    overflow: hidden;
    display: none;
    visibility: hidden;
  }

  .label {
    cursor: pointer;
    outline: none;
    font-size: 0.875rem;
    letter-spacing: initial;
    font-weight: 500;
    color: var(--color-secondary);
    background: transparent;
    padding: 12px 16px;
    width: var(--w-label);
    min-width: var(--w-label);
    text-decoration: none;
    -webkit-user-select: none;
    user-select: none;
    transition: color 0.25s ease;
    outline-offset: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    -webkit-tap-highlight-color: transparent;
  }
  .label span {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wrap input[class*="rd-"]:checked + label {
    color: var(--color-pure);
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: absolute;
    transform-origin: 0 0 0;
    height: 100%;
    width: var(--w-label);
    z-index: 0;
    transition: transform 0.5s cubic-bezier(0.33, 0.83, 0.99, 0.98);
  }
  .bar::before,
  .bar::after {
    content: "";
    position: absolute;
    height: 4px;
    width: 100%;
    background: var(--color-secondary);
  }
  .bar::before {
    top: 0;
    border-radius: 0 0 9999px 9999px;
  }
  .bar::after {
    bottom: 0;
    border-radius: 9999px 9999px 0 0;
  }

  .slidebar {
    position: absolute;
    height: calc(100% - (var(--p-y) * 4));
    width: var(--w-label);
    border-radius: calc(var(--round) - var(--p-y));
    background: var(--muted);
    transform-origin: 0 0 0;
    z-index: 0;
    transition: transform 0.5s cubic-bezier(0.33, 0.83, 0.99, 0.98);
  }


    
  `;




const Loader = () => {
  return (
    <Loaderwrapper>
      <div className="loading">
        <div className="loading-box">
          <div className="grid">
            <div className="color l1" />
            <div className="color l2" />
            <div className="color l3" />
            <div className="color l4" />
            <div className="color l5" />
            <div className="color l6" />
          </div>
        </div>
      </div>
    </Loaderwrapper>
  );
}

const Loaderwrapper = styled.div`
    .loading {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      z-index: 9999;
      background-color: rgba(255, 255, 255, 1);
    }
    .loading-box {
      width: 650px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      position: relative;
    }
    .color {
      background-color: #eee;
      border-radius: 5px;
    }
    .grid {
      width: 100%;
      display: grid;
      grid-template-rows: 120px 120px 120px;
      grid-template-areas:
        "l1 l2 l3"
        "l1 l2 l4"
        "l6 l6 l5";
      gap: 10px;
    }
  
    .l1 {
      grid-area: l1;
      animation: Loading 6s 0s infinite linear;
    }
    .l2 {
      grid-area: l2;
      animation: Loading 5s 1s infinite linear;
    }
    .l3 {
      grid-area: l3;
      animation: Loading 4s 2s infinite linear;
    }
    .l4 {
      grid-area: l4;
      animation: Loading 3s 3s infinite linear;
    }
    .l5 {
      grid-area: l5;
      animation: Loading 2s 4s infinite linear;
    }
    .l6 {
      grid-area: l6;
      animation: Loading 1s 5s infinite linear;
    }
  
    @keyframes Loading {
      0% {
        background-color: #eee;
      }
      50% {
        background-color: #333;
      }
      100% {
        background-color: #eee;
      }
    }
  
    @media (max-width: 500px) {
      .loading-box {
        width: 90%;
      }
    }
    @media (max-width: 400px) {
      .grid {
        grid-template-rows: 80px 80px 80px;
      }
    }`;

const Tabbarcpt = () => {
  return (
    <Tabbar>

      <div className="radio-inputs">

        <label className="radio">
          <input name="radio" type="radio" onFocus={(e) => e.target.blur()} />
          <span className="name">First</span>
        </label>
        <label className="radio">
          <input name="radio" type="radio" onFocus={(e) => e.target.blur()} />
          <span className="name">Second</span>
        </label>
        <label className="radio">
          <input name="radio" type="radio" onFocus={(e) => e.target.blur()} />
          <span className="name">Third</span>
        </label>

      </div>
    </Tabbar>
  );
}

const Tabbar = styled.div`
      .radio-inputs {
      z-index: 98;
        position: absolute;
        display: flex;
        // flex-wrap: wrap;
        border-radius: 1rem;
        background: transparent;
        box-sizing: border-box;
        // box-shadow:
        //   5px 5px 15px rgba(0, 0, 0, 0.15),
        //   -5px -5px 15px rgba(255, 255, 255, 0.8);
        padding: 0.5rem;
        width: 500px;
        height: 80px;
        padding-left: 30px;
        font-size: 14px;
        gap: 0.5rem;
        left: -20px;
        
      }
    
      .radio-inputs .radio {
        flex: 1 1 auto;
        text-align: center;
        position: relative;
        top: 20px;
      }
    
      .radio-inputs .radio input {
        display: none;
        user-select: none;
      }
    
      .radio-inputs .radio .name {
        display: flex;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        border-radius: 0.7rem;
        border: none;
        padding: 0.7rem 0;
        color: #2d3748;
        font-weight: 500;
        font-family: inherit;
        background: linear-gradient(145deg, #ffffff, #e6e6e6);
        box-shadow:
          3px 3px 6px rgba(0, 0, 0, 0.1),
          -3px -3px 6px rgba(255, 255, 255, 0.7);
        transition: all 0.2s ease;
        overflow: hidden;
        user-select: none;
      }
    
      .radio-inputs .radio input:checked + .name {
        background: linear-gradient(145deg, #3b82f6, #2563eb);
        color: white;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        box-shadow:
          inset 2px 2px 5px rgba(0, 0, 0, 0.2),
          inset -2px -2px 5px rgba(255, 255, 255, 0.1),
          3px 3px 8px rgba(59, 130, 246, 0.3);
        transform: translateY(2px);
      }
    
      /* Hover effect */
      .radio-inputs .radio:hover .name {
        background: linear-gradient(145deg, #f0f0f0, #ffffff);
        transform: translateY(-1px);
        box-shadow:
          4px 4px 8px rgba(0, 0, 0, 0.1),
          -4px -4px 8px rgba(255, 255, 255, 0.8);
      }
    
      .radio-inputs .radio:hover input:checked + .name {
        transform: translateY(1px);
      }
    
      /* Animation */
      .radio-inputs .radio input:checked + .name {
        animation: select 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    
      /* Particles */
      .radio-inputs .radio .name::before,
      .radio-inputs .radio .name::after {
        content: "";
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
      }
    
      .radio-inputs .radio input:checked + .name::before,
      .radio-inputs .radio input:checked + .name::after {
        animation: particles 0.8s ease-out forwards;
      }
    
      .radio-inputs .radio .name::before {
        background: #60a5fa;
        box-shadow: 0 0 6px #60a5fa;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
      }
    
      .radio-inputs .radio .name::after {
        background: #93c5fd;
        box-shadow: 0 0 8px #93c5fd;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
      }
    
      /* Sparkles */
      .radio-inputs .radio .name::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background: radial-gradient(
          circle at var(--x, 50%) var(--y, 50%),
          rgba(59, 130, 246, 0.3) 0%,
          transparent 50%
        );
        opacity: 0;
        transition: opacity 0.3s;
      }
    
      .radio-inputs .radio input:checked + .name::after {
        opacity: 1;
        animation: sparkle-bg 1s ease-out forwards;
      }
    
      /* Multiple particles */
      .radio-inputs .radio input:checked + .name {
        overflow: visible;
      }
    
      .radio-inputs .radio input:checked + .name::before {
        box-shadow:
          0 0 6px #60a5fa,
          10px -10px 0 #60a5fa,
          -10px -10px 0 #60a5fa;
        animation: multi-particles-top 0.8s ease-out forwards;
      }
    
      .radio-inputs .radio input:checked + .name::after {
        box-shadow:
          0 0 8px #93c5fd,
          10px 10px 0 #93c5fd,
          -10px 10px 0 #93c5fd;
        animation: multi-particles-bottom 0.8s ease-out forwards;
      }
    
      @keyframes select {
        0% {
          transform: scale(0.95) translateY(2px);
        }
        50% {
          transform: scale(1.05) translateY(-1px);
        }
        100% {
          transform: scale(1) translateY(2px);
        }
      }
    
      @keyframes multi-particles-top {
        0% {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }
        40% {
          opacity: 0.8;
        }
        100% {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px) scale(0);
          box-shadow:
            0 0 6px transparent,
            20px -20px 0 transparent,
            -20px -20px 0 transparent;
        }
      }
    
      @keyframes multi-particles-bottom {
        0% {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }
        40% {
          opacity: 0.8;
        }
        100% {
          opacity: 0;
          transform: translateX(-50%) translateY(20px) scale(0);
          box-shadow:
            0 0 8px transparent,
            20px 20px 0 transparent,
            -20px 20px 0 transparent;
        }
      }
    
      @keyframes sparkle-bg {
        0% {
          opacity: 0;
          transform: scale(0.2);
        }
        50% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: scale(2);
        }
      }
    
      /* Ripple effect */
      .radio-inputs .radio .name::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          circle at var(--x, 50%) var(--y, 50%),
          rgba(255, 255, 255, 0.5) 0%,
          transparent 50%
        );
        opacity: 0;
        transition: opacity 0.3s;
      }
    
      .radio-inputs .radio input:checked + .name::before {
        animation: ripple 0.8s ease-out;
      }
    
      @keyframes ripple {
        0% {
          opacity: 1;
          transform: scale(0.2);
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 0;
          transform: scale(2.5);
        }
      }
    
      /* Glowing border */
      .radio-inputs .radio input:checked + .name {
        position: relative;
      }
    
      .radio-inputs .radio input:checked + .name::after {
        content: "";
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        background: linear-gradient(
          45deg,
          rgba(59, 130, 246, 0.5),
          rgba(37, 99, 235, 0.5)
        );
        -webkit-mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: border-glow 1.5s ease-in-out infinite alternate;
      }
    
      @keyframes border-glow {
        0% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }`;



const Tabbartwocpt = () => {
  const { setfilereferenceCurentPage } = useContextSelector(DatasetImportContext, (c) => c);
  const [selectedTab, setSelectedTab] = useState(null); // 追踪选中的标签  

  const handleTabClick = (name:any, uuid:any) => {
    setfilereferenceCurentPage([{ name, uuid }]);
    setSelectedTab(uuid); // 更新选中的标签  
  };

  return (
    <Tabbartwo>
      <div className="radio-inputs">
        <label className="radio" style={{ backgroundColor: selectedTab === 0 ? '#fff' : '#EEE', fontWeight: selectedTab === 0 ? 600 : 'normal',borderRadius:'0.5rem' }}>
          <input type="radio" name="radio" onClick={() => handleTabClick('Markdown结果', 0)} />
          <span className="name">Markdown结果</span>
        </label>
        <label className="radio" style={{ backgroundColor: selectedTab === 1 ? '#fff' : '#EEE', fontWeight: selectedTab === 1 ? 600 : 'normal',borderRadius:'0.5rem' }}>
          <input type="radio" name="radio" onClick={() => handleTabClick('图片', 1)} />
          <span className="name">图片</span>
        </label>
        <label className="radio" style={{ backgroundColor: selectedTab === 2 ? '#fff' : '#EEE', fontWeight: selectedTab === 2 ? 600 : 'normal',borderRadius:'0.5rem' }}>
          <input type="radio" name="radio" onClick={() => handleTabClick('表格', 2)} />
          <span className="name">表格</span>
        </label>
        <label className="radio" style={{ backgroundColor: selectedTab === 3 ? '#fff' : '#EEE', fontWeight: selectedTab === 3 ? 600 : 'normal',borderRadius:'0.5rem' }}>
          <input type="radio" name="radio" onClick={() => handleTabClick('文本', 3)} />
          <span className="name">文本</span>
        </label>
        <label className="radio" style={{ backgroundColor: selectedTab === 4 ? '#fff' : '#EEE', fontWeight: selectedTab === 4 ? 600 : 'normal',borderRadius:'0.5rem' }}>
          <input type="radio" name="radio" onClick={() => handleTabClick('原始JSON', 4)} />
          <span className="name">原始JSON</span>
        </label>
      </div>
    </Tabbartwo>
  );
};
const Tabbartwo = styled.div`
        .radio-inputs {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          border-radius: 0.5rem;
          background-color: #EEE;
          box-sizing: border-box;
          box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.06);
          padding: 0.25rem;
          width: 500px;
          font-size: 14px;
          left: 8px;
        }
      
        .radio-inputs .radio {
          flex: 1 1 auto;
          text-align: center;
        }
      
        .radio-inputs .radio input {
          display: none;
        }
      
        .radio-inputs .radio .name {
          display: flex;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          border: none;
          padding: .5rem 0;
          color: rgba(51, 65, 85, 1);
          transition: all .15s ease-in-out;
        }
      
        // .radio-inputs .radio input:checked + .name {
        //   background-color: #fff;
        //   font-weight: 600;
        // }
          
        
        `;



const Arrowdowncpt = () => {
  return (
    <Arrowdown>
      <div className="scrolldown" style={{ color: 'skyblue' }}>
        <div className="chevrons">
          <div className="chevrondown" />
          <div className="chevrondown" />
        </div>
      </div>
    </Arrowdown>
  );
}

const Arrowdown = styled.div`
          .scrolldown {
            --color: white;
            --sizeX: 30px;
            --sizeY: 50px;
            position: relative;
            width: var(--sizeX);
            height: var(--sizeY);
            margin-left: var(sizeX / 2);
            border: calc(var(--sizeX) / 10) solid var(--color);
            border-radius: 50px;
            box-sizing: border-box;
            margin-bottom: 16px;
            cursor: pointer;
          }
        
          .scrolldown::before {
            content: "";
            position: absolute;
            bottom: 30px;
            left: 50%;
            width: 6px;
            height: 6px;
            margin-left: -3px;
            background-color: var(--color);
            border-radius: 100%;
            animation: scrolldown-anim 2s infinite;
            box-sizing: border-box;
            box-shadow: 0px -5px 3px 1px #2a547066;
          }
        
          @keyframes scrolldown-anim {
            0% {
              opacity: 0;
              height: 6px;
            }
        
            40% {
              opacity: 1;
              height: 10px;
            }
        
            80% {
              transform: translate(0, 20px);
              height: 10px;
              opacity: 0;
            }
        
            100% {
              height: 3px;
              opacity: 0;
            }
          }
        
          .chevrons {
            padding: 6px 0 0 0;
            margin-left: -3px;
            margin-top: 48px;
            width: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        
          .chevrondown {
            margin-top: -6px;
            position: relative;
            border: solid var(--color);
            border-width: 0 3px 3px 0;
            display: inline-block;
            width: 10px;
            height: 10px;
            transform: rotate(45deg);
          }
        
          .chevrondown:nth-child(odd) {
            animation: pulse54012 500ms ease infinite alternate;
          }
        
          .chevrondown:nth-child(even) {
            animation: pulse54012 500ms ease infinite alternate 250ms;
          }
        
          @keyframes pulse54012 {
            from {
              opacity: 0;
            }
        
            to {
              opacity: 0.5;
            }
          }`;



const Downloadcpt = ({ pdfresponse }: { pdfresponse: any }) => {
  const handleDownload = () => {

    const blob = new Blob([pdfresponse], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DownloadWrapper>
      <button className="button" onClick={handleDownload} style={{ verticalAlign: 'middle' }}>
        <span>Download</span>
      </button>
    </DownloadWrapper>
  );
}

const DownloadWrapper = styled.div`
            .button {
              display: inline-block;
              border-radius: 7px;
              border: none;
              background: #1875ff;
              color: white;
              font-family: inherit;
              text-align: center;
              font-size: 13px;
              box-shadow: 0px 14px 56px -11px #1875ff;
              width: 10em;
              padding: 1em;
              transition: all 0.4s;
              cursor: pointer;
            }
            .button:active {  
               transform: scale(0.85); /* 按下时缩小 */  
              } 
            .button span {
              cursor: pointer;
              display: inline-block;
              position: relative;
              transition: 0.4s;
            }
          
            .button span:after {
              content: "Free";
              position: absolute;
              opacity: 0;
              top: 0;
              right: 50px;
              transition: 0.25s;
            }
          
            .button:hover span {
              padding-left: 2.55em;
            }
          
            .button:hover span:after {
              opacity: 4;
              right: 70px;
            }`;




export default function FileReference() {
  const { goToNext, sources, setSources, previewUrl, setPreviewUrl, pdfresponse, filereferenceCurentPage } = useContextSelector(DatasetImportContext, (v) => v);
  const [pdfUrl, setPdfUrl] = useState<any>(null);
  const [mddata, setMddata] = useState<any>(null);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  const onPdfLoaded = useCallback((data: any) => {
    setLoading(false);
  }, []);
  const onclickNext = useCallback(() => {
    goToNext();
  }, [goToNext]);

  useEffect(() => {
    console.log('previewUrl', previewUrl);
    if (previewUrl[0]?.url) { // 确保预览 URL 存在  
      setPdfUrl(previewUrl[0].url); // 更新 pdfUrl 状态  
      setMddata(pdfresponse[0].markdown);
      console.log('pdfUrl:', previewUrl[0].url);
    }
  }, [previewUrl]);

  return (
    <>

      {
        loading ? <Loader></Loader> : null
      }

      <div style={{
        height: '100%',
        overflow: 'hidden'
      }}>

        <Box textAlign={'right'} mt={0} h={'100%'} display={'flex'} flexDirection={'row'}  >
          <Box flex={'0 1 50%'} h={'100%'} overflow={'auto'} >
            {/* <div style={{
              height: '100%',
              position:'absolute',
              top:0,
              left:0,
              zIndex:1,
              background:'rgba(0,0,0,0.5)',
              width:'100%',
            }}>
            <Arrowdowncpt></Arrowdowncpt>
            </div> */}

            <PDFViewerMemo
              onChange={(p) => { }}
              pdfUrl={pdfUrl}
              onPdfLoaded={onPdfLoaded}
            />
          </Box>
          <Box w={'1px'} h={'100%'} border={'1px solid  #DCDCDC'}></Box>
          <Box flex={'0 1 50%'} ml={'10px'} h={'100%'} overflow={'auto'} style={{
            scrollbarColor: 'transparent transparent',
            scrollbarWidth: 'thin',
            // position: 'relative',

          }} >
            <div style={{
              position: 'absolute',
              zIndex: 999,
              // top: '-10px',
            }}>
              <Tabbartwocpt />
            </div>

            {
              filereferenceCurentPage && filereferenceCurentPage[0].uuid == 0 &&
              <MdViewer
                pdfUrl={pdfUrl}
                pdfresponse={mddata}
              />
            }
            {
              filereferenceCurentPage && filereferenceCurentPage[0].uuid == 1 &&
              <IMGViewer

              />
            }
            {
              filereferenceCurentPage && filereferenceCurentPage[0].uuid == 2 &&
              <TBLViewer />
            }
            {
              filereferenceCurentPage && filereferenceCurentPage[0].uuid == 3 &&
              <TXTViewer />
            }
            {
              filereferenceCurentPage && filereferenceCurentPage[0].uuid == 4 &&
              <JSONViewer
                pdfresponse={mddata}
              />
            }



          </Box>

          {/* 原始下一步 */}
          {/* <Button position={'absolute'} zIndex={'999'} bottom={'0px'} right={'0px'} onClick={onclickNext}>
            {t('common:common.Next Step')}
          </Button> */}

          <div style={{
            position: 'absolute',
            zIndex: 999,
            bottom: '0px',
            right: '0px',
          }}>
            <Downloadcpt pdfresponse={mddata} />
          </div>




        </Box>

      </div>
      < Radio previewUrlprops={previewUrl} setMddata={setMddata} pdfUrl={pdfUrl} setPdfUrl={setPdfUrl} />
    </>
  )
}
