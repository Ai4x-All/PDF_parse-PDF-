import React, { useEffect, useRef } from 'react';  
import * as echarts from 'echarts';  

interface EchartsProps {  
  option: any; 
  width?: string | number;
  height?: string | number; 
}  

const Echarts: React.FC<EchartsProps> = ({ option, width = '100%', height = '400px' }) => {  
  const box = useRef<HTMLDivElement>(null);  
  const chartRef = useRef<echarts.ECharts | null>(null); // 使用 useRef 存储 ECharts 实例

  useEffect(() => {  
    if (box.current) {  
      // 初始化 ECharts 实例
      const myChart = echarts.init(box.current);  
      chartRef.current = myChart; // 存储实例
      console.log(option);  

      if (option != null) {  
        console.log('option不为空', option);
        
        myChart.setOption(option);  
      } else {  
        console.log("没有传过来");  
      }  
    }  
  }, []); // 空依赖数组，仅在组件挂载时初始化

  useEffect(() => {
    if (chartRef.current && option != null) {
      chartRef.current.setOption(option);
    }
  }, [option]); // 当 option 变化时更新图表

  // 清理函数，组件卸载时释放资源
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
      }
    };
  }, []);

  // 返回图表的容器元素  
  return (  
    <div   
      ref={box}   
      id='main'   
      style={{ width, height }} // 使用传入的宽高  
    >  
      {/* 确保容器有宽高 */}  
    </div>  
  );  
};  

export default Echarts;