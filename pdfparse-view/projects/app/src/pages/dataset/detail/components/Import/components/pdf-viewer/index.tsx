
import axios from "axios";
import React, { use, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DatasetImportContext, ImportFormType } from '../../Context';
import PDFViewerMemo from "../../components/pdf-viewer";
import { useContextSelector } from "use-context-selector";
import { Box, useToast } from "@chakra-ui/react";
import { getDocument } from 'pdfjs-dist';
import styled from 'styled-components';
import { useLatest } from "ahooks";
import { bg } from "date-fns/locale";
import Draggable from "react-draggable"
import { useRouter } from 'next/router';
// 定义组件状态接口
interface PDFViewerState {
  page: number;
}

// 定义 Bbox 接口
interface Bbox {
  type: "title" | "text" | "discarded" | "image";
  bbox: [number, number, number, number];
  color: any;
}

// 定义 ExtractLayerItem 接口
interface ExtractLayerItem {
  preproc_blocks: Bbox[];
  page_idx: number;
  page_size: [number, number];
  discarded_blocks: Bbox[];
}







// 定义 PDFViewer 组件
const PDFViewer = ({
  onChange,
  pdfUrl,
  onPdfLoaded
}: {
  onChange: (state: PDFViewerState) => void;
  pdfUrl: string,
  onPdfLoaded: any
}) => {

  const { goToNext, sources, setSources, previewUrl, setPreviewUrl,
    pdfresponse, positioninfo, setPositioninfo,iframeRef } = useContextSelector(DatasetImportContext, (v) => v);
  const toast = useToast()
 const router = useRouter();

  // 请求定位信息
  useEffect(() => {
    const handlePosition = async () => {
      console.log('previewUrl11111111', previewUrl);

      try {
        // 使用 for...of 循环来处理异步请求  

        const response = await axios({
          url: 'https://www.xiaoruiai.com:8203/parse_layout_info',
          method: 'get',
          params: { parse_id: previewUrl[0].id } // 使用当前 item  
        });
        let localposition

        console.log('----定位结果:', response.data,
        );
        setPositioninfo(response.data); // 如果只有一个响应需要保留，考虑在这里处理  

      } catch (error) {
        console.log('error:', error);
      }
    };


    if (previewUrl.length > 0) {
      handlePosition();
    }
  }, [previewUrl]); // 依赖于 previewUrl  




  const [iframedocument, setIframedocument] = useState<any>(null)
  const [iframewindow, setIframewindow] = useState<any>(null)
  const [canvasIndex, setCanvasIndex] = useState<any>(1);
  const currentpage = useRef<any>(0);
  const hasrenderedcanvas = useRef<any>([]);


  function handleCanvasRender(canvas: any, canvasIndex: any) {

    // setIframedocument(iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document || null);
    let pagecanvas = iframedocument.querySelectorAll('canvas');
    let testcanvas = iframedocument.querySelectorAll('.canvasWrapper')
    let testcanvas_canvas = iframedocument.querySelectorAll('.canvasWrapper canvas')
    console.log('pagecanvas111', pagecanvas);
    console.log('testcanvas', testcanvas);
    console.log('testcanvas_canvas', testcanvas_canvas);

    let layoutinfo = positioninfo.layout_info[canvasIndex];


    if (!layoutinfo || !canvas) return;

    let ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pagewidth = eval(layoutinfo.page_info.width);
    let pageheight = eval(layoutinfo.page_info.height);
    let orgwidth = canvas.width;
    let orgheight = canvas.height;
    console.log('----测试一下事业以后的pdf系数:', orgwidth, '/', pagewidth, '??????'
      , orgheight, '/', pageheight,
    );

    let scaleXValue = orgwidth / pagewidth;
    let scaleYValue = orgheight / pageheight;

    // 绘制颜色  
    layoutinfo.layout_dets.forEach((item: any) => {
      let bbox = item.bbox;
      let category = item.category;

      fillColor(ctx, bbox, scaleXValue, scaleYValue, category);
    });
  }

  function fillColor(
    ctx: any,
    [x0, y0, x1, y1]: [number, number, number, number],
    scaleXValue: number,
    scaleYValue: number,
    category: string
  ) {
    // console.log(ctx, '绘画一次,位置是:', x0, y0, x1, y1, '类别:',category,
    //   '页面长宽系数:', scaleXValue, scaleYValue);
    ctx.beginPath();
    ctx.moveTo(x0 * scaleXValue, y0 * scaleYValue);
    ctx.lineTo(x1 * scaleXValue, y0 * scaleYValue);
    ctx.lineTo(x1 * scaleXValue, y1 * scaleYValue);
    ctx.lineTo(x0 * scaleXValue, y1 * scaleYValue);
    ctx.closePath();
    switch (category) {
      case '标题':
        ctx.fillStyle = 'rgba(241, 213, 241, 0.4)';
        ctx.strokeStyle = 'rgba(230, 113, 230, 1)';
        break;
      // case '标题':
      //   ctx.fillStyle = 'rgba(121, 124, 255, 0.3)';
      //   ctx.strokeStyle = 'rgba(121, 124, 255, 1)';
      //   break;
      // case '文本':
      //   ctx.fillStyle = 'rgba(230, 113, 230, 0.15)';
      //   ctx.strokeStyle = 'rgba(230, 113, 230, 1)';
      //   break;
      case '文本':
        ctx.fillStyle = 'rgba(210, 221, 243, 0.4)';
        ctx.strokeStyle = 'rgba(136, 169, 235,1)';
        break;
      case 'tableBody':
        ctx.fillStyle = 'rgba(241, 71, 41, 0.13)';
        ctx.strokeStyle = 'rgba(241, 71, 41, 0.13)';
      case '表格':
        ctx.fillStyle = 'rgba(243,250,247, 0.4)';
        ctx.strokeStyle = 'rgba( 76,186,135, 1)';
        break;
      // case '表格':
      //   ctx.fillStyle = 'rgba(241, 71, 41, 0.13)';
      //   ctx.strokeStyle = 'rgba(241, 71, 41, 0.13)';
      //   break;
      case "图片":
        ctx.fillStyle = 'rgba(243, 228, 217, 0.4)';
        ctx.strokeStyle = 'rgba(246,189,149, 1)';
        break;
      // case "图片":
      //   ctx.fillStyle = 'rgba(149, 226, 115, 0.4)';
      //   ctx.strokeStyle = 'rgba(149, 226, 115, 1)';
      //   break;
      case "index":

        ctx.fillStyle = 'rgba(255,220, 96, 0.4)';
        ctx.strokeStyle = 'rgba(250,200, 88, 1)';
        break;
      default:
        ctx.fillStyle = 'rgba(255,255,255, 0.2)';
        ctx.strokeStyle = 'rgba(255,255,255, 0.2)';
    }
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.save()
  }

// 封装搜索函数
// function performSearchInIframe(keyword: string) {
//   // 获取 iframe 的 window
//   const iframeWindow:any = iframeRef.current?.contentWindow;
//   if (!iframeWindow) {
//       console.error('无法获取 iframe 的 window');
//       return;
//   }
//   if (iframeWindow && iframeWindow?.PDFViewerApplication?.eventBus) {
//     // 触发搜索事件
//     iframeWindow.PDFViewerApplication.eventBus.dispatch("find", {
//         // source: null, // 事件源，可以是触发搜索操作的元素或对象
//         type: "", // 搜索类型，通常为空字符串
//         query: keyword, // 搜索关键词
//         caseSensitive: false, // 是否区分大小写
//         entireWord: false, // 是否匹配整个单词
//         highlightAll: true, // 是否高亮显示所有匹配项
//         findPrevious: false, // 是否查找上一个匹配项
//         matchDiacritics: true // 是否匹配变音符号
//     });
//     console.log('搜索完成');
// } else {
//     console.error('PDFViewerApplication 或 eventBus 未初始化');
// }
//   console.log('搜索完成');
// }

  // 绘图逻辑
  useEffect(() => {
    if (!iframedocument || !positioninfo || !iframewindow || positioninfo.status !== 'completed') {
      return;
    }


    const handleWheel = (event: WheelEvent) => {
      console.log('event:', event, `iframewindow`, iframewindow,);

      currentpage.current = (iframewindow.pdfViewer._currentPageNumber);
      setIframedocument(iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document || null);


      let canvas = (iframedocument.querySelectorAll('.page')[currentpage.current - 1]?.childNodes[0] as any)?.querySelector('canvas');
      let canvastwo = (iframedocument.querySelectorAll('.page')[currentpage.current]?.childNodes[0] as any)?.querySelector('canvas');

      console.log('iframeRef.current?.contentDocument', iframeRef.current?.contentDocument,
        '+++++++++++++', (iframeRef.current?.contentDocument?.querySelectorAll('.page').length as any));
      console.log('---测试一下当前和下一个canvas', canvas, canvastwo,
        '还有当前的页码', currentpage.current - 1,
        '总', iframedocument.querySelectorAll('.page').length,
      );

      if (!hasrenderedcanvas.current.includes(currentpage.current - 1)) {
        console.log('渲染当前页为:', currentpage.current - 1, currentpage.current);

        handleCanvasRender(canvas, currentpage.current - 1);
        handleCanvasRender(canvastwo, currentpage.current);
      }

      if (hasrenderedcanvas.current.includes(currentpage.current - 1)) {
        return;
      }
      if (hasrenderedcanvas.current.some((num: number) => num < currentpage.current - 10)) {
        hasrenderedcanvas.current = hasrenderedcanvas.current.filter((num: number) => num >= currentpage.current - 10);
      }
      hasrenderedcanvas.current.push(currentpage.current - 1);
      console.log('测试是否push了已渲染页数', hasrenderedcanvas.current);

      hasrenderedcanvas.current.push(currentpage.current);

    };
    const resetCanvasRender = () => {
      hasrenderedcanvas.current = [];
      console.log('重置canvas渲染, 清空hasrenderedcanvas.current:'
      );
    }

    // 绑定滚轮事件  
    if (iframeRef.current) {
      const iframeWindow = iframeRef.current.contentWindow;
      iframeWindow?.addEventListener('wheel', handleWheel);
      iframewindow?.eventBus?.on('scalechanging', resetCanvasRender)
    }

    return () => {
      hasrenderedcanvas.current = [];
      if (iframeRef.current) {
        const iframeWindow = iframeRef.current.contentWindow;
        iframeWindow?.removeEventListener('wheel', handleWheel);
        
      }
    };
  }, [iframedocument, iframewindow, positioninfo, positioninfo,]);




  return (
    <>
      <Box style={{
        display: "flex",
        // bg: "red",
        height: "100%",
      }}>

        <Draggable>
          <div style={{
            position: "absolute",
            top: '60px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)', // 半透明背景色  
            backdropFilter: 'blur(4px)', // 模糊效果  
            left: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            cursor: 'move',
            padding: "10px",
            // width: "100px",
          }}>

             
            <div>
              <div style={{
                width: "30px",
                height: "15px",
                borderRadius: "3px",
                backgroundColor: "rgba(230, 113, 230, 0.6)",
                display: "inline-block",
              }}></div>
              <span style={{
                marginLeft: "10px",
                fontSize: "15px",
                color: "#999",
                boxSizing: "border-box",
              }}>标题</span>
            </div>


            <div>
              <div style={{
                width: "30px",
                height: "15px",
                borderRadius: "3px",
                backgroundColor: "rgba(136, 169, 235,0.6)",
                display: "inline-block",
              }}></div>
              <span style={{
                marginLeft: "10px",
                fontSize: "15px",
                boxSizing: "border-box",
                color: "#999",
              }}>文本</span>
            </div>



            <div>
              <div style={{
                width: "30px",
                height: "15px",
                borderRadius: "3px",
                backgroundColor: "rgba( 76,186,135, 0.4)",
                display: "inline-block",
              }}></div>
              <span style={{
                marginLeft: "10px",
                fontSize: "15px",
                color: "#999",
                boxSizing: "border-box",
              }}>表格</span>
            </div>




            <div>
              <div style={{
                width: "30px",
                height: "15px",
                borderRadius: "3px",
                backgroundColor: "rgba(246,189,149, 0.6)",
                display: "inline-block",
              }}></div>
              <span style={{
                marginLeft: "10px",
                fontSize: "15px",
                color: "#999",
                boxSizing: "border-box",
              }}>图片</span>
            </div>

          </div>
        </Draggable>

        {pdfUrl ? (
          <iframe
            ref={iframeRef}
            style={{
              height: "100%",
              flex: 1,
            }}
            onLoad={() => {
              onPdfLoaded(false)
              setIframedocument(iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document || null);
              setIframewindow((iframeRef.current?.contentWindow as any)?.PDFViewerApplication);
              console.log('加载好了,此时的ref:', iframeRef.current?.contentDocument,
                '////', iframeRef.current?.contentWindow,'测试有事件吗:::',(iframeRef.current?.contentWindow as any)?.PDFViewerApplication.eventBus);
                if(!(iframeRef.current?.contentWindow as any)?.PDFViewerApplication.eventBus){
                  console.log('没有事件');
                  
                  router.push('/dataset/detail?datasetId=673ee2f0023d46f87807b621&currentTab=import&source=fileLocal');
                }
            }
            }

            // src={`/pdfjs-dist/web/viewer.html?file=${encodeURIComponent(`https://www.xiaoruiai.com:8208${pdfUrl}`)}`}
            src={`/DPFjs/web/viewer.html?file=${encodeURIComponent(`http://localhost:3000${pdfUrl}`)}`}
            // src={`/pdfjs-dist/web/viewer.html?file=${encodeURIComponent(`http://localhost:3000${pdfUrl}`)}`}
          ></iframe>
        ) : null}
      </Box>

    </>
  );
};

export default PDFViewer;
