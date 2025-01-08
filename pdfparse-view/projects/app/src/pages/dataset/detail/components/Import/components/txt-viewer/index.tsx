import React, { useEffect, useState } from 'react'
import Echarts from "@/components/Echarts";
import { useContextSelector } from 'use-context-selector';
import { DatasetImportContext } from '../../Context';
import { background } from '@chakra-ui/react';
import styled from 'styled-components';
import Draggable from 'react-draggable'

const AllData = (props: any) => {
  const { positioninfo } = useContextSelector(DatasetImportContext, (c) => c);
  if (!positioninfo) return null;
  const chartData = positioninfo.parse_text_score.toFixed(2) * 100
  const nomatch = 100 - positioninfo.parse_text_score.toFixed(2) * 100
  const option = {
    // backgroundColor: 'rgba(0,0,',
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




const Imgcpt = (props: any) => {
  const { previewUrl, setPreviewUrl, setpdfResponse, positioninfo, setPositioninfo } = useContextSelector(DatasetImportContext, (c) => c);
  const [textval, setTextval] = useState<any[]>([]);

  useEffect(() => {
    console.log('我在img组件查看positioninfo', positioninfo);
    positioninfo.layout_info.forEach((item: any) => {
      item.layout_dets.forEach((val: any) => {
        if (val.category === 'title' || val.category === 'text' && !textval.includes(val.content)) {
          setTextval(prev => [...prev, val.content])
        }
      });
    });

  }, [positioninfo])
  return (
    <ImgWrapper>

      <div style={{
        // backgroundColor: 'red',
        display: 'flex',
        flexDirection: 'column',
        alignItems: ' flex-start',
        justifyContent: ' center',
        width: '100%',
        paddingLeft: '10px',
        paddingRight: '20px',

      }}>


        {textval && textval.map((val, index) => (
          <>
            <div className="card">
              {val.trim()}

            </div>

          </>
        ))}

      </div>
    </ImgWrapper>
  );
}

const ImgWrapper = styled.div`  

  .card{
    padding: 3px 0;
  }
    `;




export default function index() {
  return (
    <div>
      <div style={{
        height: '60px',
        width: '100%',
      }}></div>
      <Draggable>
        <div style={{
          position: 'absolute',
          // top: '0px',
          // left: '0px',
          width: '20%',
          height: '200px',
          boxShadow: '15px 15px 30px #bebebe, -15px -15px 30px #ffffff',
          padding: '10px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)', // 半透明背景色  
          backdropFilter: 'blur(4px)', // 模糊效果  
          cursor: 'move',
          right:'0px',
        }}>
          <AllData width={'100%'} height="100%" />
        </div>
      </Draggable>
      <Imgcpt />
    </div>
  )
}
