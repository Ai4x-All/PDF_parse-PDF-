import React, { use, useEffect, useState } from 'react'
import Echarts from "@/components/Echarts";
import { useContextSelector } from 'use-context-selector';
import { DatasetImportContext } from '../../Context';
import { background } from '@chakra-ui/react';
import styled from 'styled-components';

const Card = (props: any) => {
  const [processedData, setProcessedData] = useState<string[]>([]);

  useEffect(() => {
    console.log('props.codedata', props.codedata);

    // 强制将 props.codedata 转换为字符串  
    const codedataAsString = String(props.codedata.pdfresponse);

    const splitData = codedataAsString.split('#') // 使用转换后的字符串进行分割  
      .map((item) => item.replace(/\n/g, '').trim())
      .filter((item) => item); // 去除空项  
    setProcessedData(splitData); // 更新状态  
    console.log('splitData', splitData);

  }, [props.codedata]); // 依赖项为 props.codedata  
  return (
    <StyledWrapper>
      <div className="container">
        <div className="card">
          <div className="header">
            <p className="title">Terminal</p>
            {/* <button className="copy">  
              <svg className="w-[19px] h-[19px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="currentColor" viewBox="0 0 24 24">  
                <path fillRule="evenodd" d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z" clipRule="evenodd" />  
                <path fillRule="evenodd" d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z" clipRule="evenodd" />  
              </svg>  
            </button> */}
          </div>
          <div className="footer">
            {processedData.map((text, index) => (
              <div className="code" key={index}>
                <p className="text">
                  <span className="icon">
                    <svg className="w-[19px] h-[19px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={13} height={13} fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="m9 5 7 7-7 7" />
                    </svg>
                  </span>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container * {
    padding: 0;
    margin: 0;

  }

  .card {
    width: 100%;
    height: 100%;
    padding-bottom: 20px;
    
    background-color: #333842;
    border-radius: 10px;
    display: grid;
    grid-template-rows: 40px 1fr;
  }

  .card .header {
    display: flex;
    align-items: center;
    position: relative;

  }

  .card .header .title {
    color: #528BFF;
    font-size: 13px;
    padding: 2px 12px;
  }

  .card .header .copy {
    position: absolute;
    background: transparent;
    border: none;
    top: 61%;
    right: 1px;
    transform: translate(-50%, -50%);
    color: rgb(100, 116, 139);
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 100;
  }

  .card .header .copy:hover {
    color: rgb(148, 163, 184);
  }

  .card .header::before {
    content: "";
    position: absolute;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border: 1px solid #64748b4d;
    right: 1px;
    bottom: 0;
    background-color: #3B414D;
    width: 282px;
    height: 33px;
    z-index: 100;
  }

  .card .header::after {
    content: "";
    position: absolute;
    width: 22%;
    height: 1px;
    background-color: #7dd3fc;
    bottom: 0;
  }

  .card .footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    padding-left: 10px;
    padding-top: 10px;
    padding-right: 14px;


  }

  .card .footer .code {
    display: flex;
    align-items: center;
  }

  .card .footer .code .icon {
    color: rgb(244, 114, 182);
    padding-top: 3px;
    display: inline-block;
  }

  .card .footer .code .text {
    padding-left: 3px;
    color: #fff;
  }`;



const AllData = (props: any) => {
  const { positioninfo } = useContextSelector(DatasetImportContext, (c) => c);
  if (!positioninfo) return null;
  const chartData = positioninfo.parse_image_score.toFixed(2) * 100
  const nomatch = 100 - positioninfo.parse_image_score.toFixed(2) * 100
  const option = {
    // backgroundColor: 'red',
    left: '0px',
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        const category = params.name;
        const ratio = (params.value).toFixed(2) + '%';

        return `${category}占比: ${ratio}<br/>`;
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {

        name: 'Access From',
        left: '10px',
        top: '10px',

        type: 'pie',
        radius: '50%',
        data: [
          { value: chartData, name: '图片成功识别' },
          { value: nomatch, name: '未识别' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          smooth: 0.2,
          length: 10,
          length2: 20
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx: any) => Math.random() * 200
      }
    ]
  };
  return (

    <Echarts option={option} width={props.width} height={props.height} />


  );
}


export default function index(props: any) {
  useEffect(() => {
    console.log('aaaaaaaaaaa', props.pdfresponse)
  }, [props])
  return (
    <div>
      <div style={{
        height: '60px',
        width: '100%',
      }}></div>
      <div>
        <Card codedata={props} />
        {/* <AllData width={'40%'} height="200px"  /> */}
      </div>
    </div>
  )
}
