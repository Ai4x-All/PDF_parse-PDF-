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
  const chartData = positioninfo.parse_table_score.toFixed(2) * 100
  const nomatch = 100 - positioninfo.parse_table_score.toFixed(2) * 100

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




const Imgcpt = (props: any) => {
  const { previewUrl, setPreviewUrl, setpdfResponse, positioninfo, setPositioninfo } = useContextSelector(DatasetImportContext, (c) => c);
  const [table, setTable] = useState<any[]>([]);

  useEffect(() => {
    console.log('我在img组件查看positioninfo', positioninfo);
    positioninfo.layout_info.forEach((item: any) => {
      item.layout_dets.forEach((val: any) => {
        if (val.category === "table" && !table.includes(val.content)) {
          setTable(prev => [...prev, val.content])
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
        // paddingTop: '200px',

        zIndex: 1,
      }}>


        {table && table.map((tableHtml: any, index) => (
          <>
            <div className="card">
              <div style={{
                marginTop: '10px',
                marginBottom: '10px',

              }} dangerouslySetInnerHTML={{ __html: tableHtml }} />
            </div>
          </>
        ))}

      </div>
    </ImgWrapper>
  );
}

const ImgWrapper = styled.div`
  .card{

  }
  table {  
    width: 100%; /* 满宽度 */  
    border-collapse: collapse; /* 合并边框 */  
  }  
  
  th, td {  
    border: 1px solid #ddd; /* 边框颜色 */  
    padding: 12px; /* 内边距 */  
    text-align: left; /* 文本对齐 */  
  }  
  
  th {  
    background-color: #f2f2f2; /* 表头背景色 */  
    font-weight: bold; /* 加粗 */  
  }  
  
  tr:nth-child(even) {  
    background-color: #f9f9f9; /* 偶数行背景色 */  
  }  
  
  tr:hover {  
    background-color: #f1f1f1; /* 鼠标悬停行的背景色 */  
  }  
  
  td {  
    vertical-align: middle; /* 垂直对齐 */  
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
          zIndex: 999,
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
