import React, { useEffect, useRef } from 'react';  
import * as echarts from 'echarts';  
interface EchartsProps {  
  option: any; 
  width?: string | number;
  height?: string | number; 
}  

const Echarts: React.FC<EchartsProps> = ({ option, width = '100%', height = '400px' }) => {  
  const box = useRef<HTMLDivElement>(null);  

  useEffect(() => {  
    if (box.current) {  
      // 初始化 ECharts 实例  
      const myChart = echarts.init(box.current);  
      console.log(option);  

      if (option != null) {  
        myChart.setOption(option);  
      } else {  
        console.log("没有传过来");  
      }  

      // 清理函数，组件卸载时释放资源  
      return () => {  
        myChart.dispose();  
      };  
    }  
  }, [option]);  

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