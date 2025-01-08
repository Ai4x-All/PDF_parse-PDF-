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

  const categories = props.stats.map((stat: any) => stat.category);
  const values = props.stats.map((stat: any) => parseFloat(stat.average) * 100);
  const indicators = categories.map((category: any) => ({
    name: category,
    max: 100, 
  }));

  const option = {
    title: {
      text: props.title,
      left: 'center',
    },
    
    legend: {
      data: ['Allocated Budget'],
      top: '10%',
    },
    radar: {
      indicator: indicators ,
      center: ['50%', '64%'],
    },
    series: [
      {
        name: 'Budget vs spending',
        type: 'radar',
        data: [
          {
            value: values,
            name: 'Allocated Budget'
          },
        ]
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
      formatter: function (params:any) {
        // console.log('params', params);
        
        const category = params.name;

        const ratio = (params.value ).toFixed(2) + '%';

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
          }
        },
        labelLine: {
          lineStyle: {
            color: '#B8B8B8'
          },
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





const regFn = ({ markdownContent }: { markdownContent: string }) => {

  const preserveTableTags = (text: any) => {
    // 使用正则将 <table>, <tr>, <td>, </td>, </tr>, </table> 标签内容保留
    const tableRegex = /<(table|tr|td|\/(td|tr|table))[^>]*>.*?<\/(table|tr|td|\/(td|tr|table))>/gs;
    const tableMatches = text.match(tableRegex) || [];

    // 将所有表格相关的标签替换为占位符
    let modifiedText = text.replace(tableRegex, (match: any, index: any) => {
      return `__TABLE_${index}__`; // 使用占位符替代
    });

    return { modifiedText, tableMatches };
  };

  // Step 2: 对尖括号内容进行替换
  const replaceNonTableContent = (text: any) => {
    // 替换 <xxx> 为 &lt;xxx&gt;
    let replacedText = text.replace(/<([^>]+)>/g, '&lt;$1&gt;');

    // 替换 <<xxx>> 为 &lt;&lt;xxx&gt;&gt;
    replacedText = replacedText.replace(/<<([^>]+)>>/g, '&lt;&lt;$1&gt;&gt;');

    return replacedText;
  };

  // Step 3: 处理文本
  const { modifiedText, tableMatches } = preserveTableTags(markdownContent);
  const sanitizedContent = replaceNonTableContent(modifiedText);

  // Step 4: 恢复表格标签
  const finalContent = sanitizedContent.replace(/__TABLE_(\d+)__/g, (match: any, index: any) => {
    return tableMatches[index] || match; // 恢复表格标签
  });

  return finalContent
};

const MdViewer: React.FC<any> = ({
  pdfresponse, pdfUrl
}: { pdfUrl: any, pdfresponse: any }) => {
  const { previewUrl, setPreviewUrl, setpdfResponse, positioninfo, setPositioninfo } = useContextSelector(DatasetImportContext, (c) => c);
  const [totalstats, setTotalstats] = useState<any[]>([]);
  // 计算函数
  useEffect(() => {
    console.log('md文件中的positioninfo', positioninfo);
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
    <div >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <AllDataproportion title={'各模块解析比例'} width="50%" height="300px"
          stats={totalstats} />
        <Parsingratioofeachmodule  title={'pdf单模块解析成功率'} width="50%" height="300px"
          stats={totalstats} />
      </div>

      <LazyUrlMarkdown
        markdownClass={"relative"}
        content={pdfresponse}
      />
    </div>
  );
};
export default MdViewer;
