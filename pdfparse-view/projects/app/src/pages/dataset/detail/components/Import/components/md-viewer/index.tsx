import { useEffect, useRef, useState } from "react";
import { Tooltip } from "antd";

import cls from "classnames";
import styles from "./index.module.scss";
import LazyUrlMarkdown from "../url-markdown";
import axios from "axios";
import { useContextSelector } from 'use-context-selector';
import { DatasetImportContext } from '../../Context';
import Echarts from "@/components/Echarts";
interface IMdViewerProps {

}
import React from 'react';


interface CategoryStat {
  count: number;
  totalScore: number;
}

interface CategoryStats {
  [category: string]: CategoryStat;
}
//雷达图
const Parsingratioofeachmodule = (props: any) => {
  console.log('此时props', props);

  const categories = props.stats.map((stat: any) => stat.category);
  console.log('categories', categories);

  const values = props.stats.map((stat: any) => parseFloat(stat.average) * 100);
  const indicators = props.stats.map((category: any, index: number) => ({
    name: categories[index],
    max: 100,
  }));
  console.log('indicators', indicators);

  const option = {
    title: {
      text: props.title,
      left: 'center',
    },

    legend: {
      data: ['模块解析率'],
      top: '10%',
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        console.log('模块解析率params', params);

        const data = params.data;
        let tooltipHtml = `<div>${params.name}</div>`;
        indicators.forEach((indicator: any, index: number) => {
          tooltipHtml += `<div>${indicator.name}: ${data.value[index].toFixed(2)}%</div>`;
        });
        return tooltipHtml;
      }
    },
    radar: {
      indicator: indicators,
      center: ['50%', '64%'],
    },
    series: [
      {
        name: 'Budget vs spending',
        type: 'radar',
        data: [
          {
            value: values,
            name: '模块解析率'
          },
        ],
        emphasis: {
          itemStyle: {
            color: '#FAC858'
          }
        },
        
      }
    ]
  };

  return (
    <Echarts option={option} width={props.width} height={props.height} />
  );
}

const AllDataproportion = (props: any) => {
  const chartData = props.stats.map((stat: any) => ({
    value: parseFloat(stat.ratio) * 100,
    name: stat.category
  }));
  const option = {
    // backgroundColor: 'rgba(191, 85, 85, 0.5)', 
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        // console.log('params', params);

        const category = params.name;

        const ratio = (params.value).toFixed(2) + '%';

        return `${category}<br/>页面占比: ${ratio}<br/>`;
      }
    },
    title: {
      text: `${props.title}`,
      left: 'center',
      top: 0,
      textStyle: {
        color: '#1F2351'
      }
    },

    legend: {
      top: '9%',
      left: 'center'
    },

    series: [
      {
        name: 'Access From',
        type: 'pie',
        display: 'inline-block',
        top: '14%',
        left: '0%',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          },
          // itemStyle: {
          //   shadowBlur: 10,
          //   shadowOffsetX: 0,
          //   shadowColor: 'rgba(0, 0, 0, 0.5)'
          // }
        },

        labelLine: {
          // lineStyle: {
          //   color: '#B8B8B8'
          // },
          smooth: 0.2,
          length: 10,
          length2: 20
        },
        data: chartData.sort((a: any, b: any) => a.value - b.value),
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

//总图
const AllData = (props: any) => {
  const {  positioninfo } = useContextSelector(DatasetImportContext, (c) => c);
  if (!positioninfo) return null;
  // console.log('测试position', positioninfo);
  
  const chartData = positioninfo.parse_score?.toFixed(2)*100
  const nomatch = 100-positioninfo.parse_score?.toFixed(2)*100
  const option = {
    title: {
      text:'解析总览',
      subtext:'基于各模块比例、单模块解析度计算',
      left: 'center'
    },
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
        
        left: '0%',
        type: 'pie',
        radius: '50%',
        data: [
          { value: chartData, name: '成功解析' },
          { value: nomatch, name: '未解析' },

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





const MdViewer: React.FC<any> = ({
  pdfresponse, pdfUrl
}: { pdfUrl: any, pdfresponse: any }) => {
  const { previewUrl, setPreviewUrl, setpdfResponse, positioninfo, setPositioninfo } = useContextSelector(DatasetImportContext, (c) => c);
  const [totalstats, setTotalstats] = useState<any[]>([]);
  // 计算函数
  useEffect(() => {
    if (!positioninfo) return
    const calculateCategoryStats = (data: any[]) => {
      if (!data || data.length === 0) {
        return [];
      }

      let totalItems: number = 0; // 总项数
      const categoryStatsobj: CategoryStats = {};
      data.forEach((val) => {
        totalItems += val.layout_dets.length; // 增加总项数  
        val.layout_dets.forEach((item: any) => {
          const { category, score } = item;
          if (!categoryStatsobj[category]) {
            categoryStatsobj[category] = { count: 0, totalScore: 0 };
          }
          categoryStatsobj[category].count += 1;
          categoryStatsobj[category].totalScore += score;
        });
      });

      const result = Object.entries(categoryStatsobj).map(([category, { count, totalScore }]: [any, any]) => {
        const ratio = (count / totalItems).toFixed(2);
        const average = (totalScore / count).toFixed(2);
        return { category, ratio, average };
      });

      return result;
    };

    // const stats = calculateCategoryStats(positioninfo.layout_info[0].layout_dets);  
    const stats = calculateCategoryStats(positioninfo.layout_info);
    setTotalstats(stats);
    console.log('---------计算后的数据', stats);

  }, [positioninfo]);


  return (
    <div style={{
      marginTop: '60px',
      
    }}>
      <AllData width={'100%'} height="350px"  />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>

        {totalstats.length > 0 && <AllDataproportion title={'PDF各模块比例'} width="50%" height="300px"
          stats={totalstats} />}
        {totalstats.length > 0 && <Parsingratioofeachmodule title={'PDF单模块解析成功率'} width="50%" height="300px"
          stats={totalstats} />}
        
      </div>

      <LazyUrlMarkdown
        markdownClass={"relative"}
        content={pdfresponse}
      />  
    </div>
  );
};
export default MdViewer;
