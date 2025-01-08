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
  const chartData = positioninfo.parse_image_score.toFixed(2) * 100
  const nomatch = 100 - positioninfo.parse_image_score.toFixed(2) * 100
  const option = {
    // backgroundColor: 'red',
    right: '0px',
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
  const [imageUrl, setImageUrl] = useState<any[]>([]);

  useEffect(() => {
    console.log('我在img组件查看positioninfo', positioninfo);
    positioninfo.layout_info.forEach((item: any) => {
      item.layout_dets.forEach((val: any) => {
        if (val.category === 'image' && !imageUrl.includes(val.content)) {
          setImageUrl(prev => [...prev, val.content])
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
        paddingLeft: '20px',
        paddingRight: '20px',
      }}>


        {imageUrl && imageUrl.map((link, index) => (
          <>
            <div className="card">
              <img
                key={index} // 为每个图片提供唯一的 key  
                src={link}
                alt={`Image ${index + 1}`}
                style={{ width: '200px' }} // 设定样式  
              />

            </div>

          </>
        ))}

      </div>
    </ImgWrapper>
  );
}

const ImgWrapper = styled.div`  
 .card {
  margin-top: 10px;
  margin-bottom: 10px;
    box-shadow: -8px -8px 15px rgba(255, 255, 255, .7),
          10px 10px 10px rgba(0, 0, 0, .2),
          inset 8px 8px 15px rgba(255, 255, 255, .7),
          inset 10px 10px 10px rgba(0, 0, 0, .2);
    display: flex;
    justify-content: flex-end; /* 让图片靠右对齐 */
    align-items: center;
    width: 300px; /* 或其他你想要的宽度 */
    height: 300px; /* 或其他你想要的高度 */
    padding-right: 10px; /* 可以根据需要调整右边距 */
  }

  .card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
