
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { goToNext, sources, setSources, previewUrl, setPreviewUrl,
    pdfresponse, positioninfo, setPositioninfo } = useContextSelector(DatasetImportContext, (v) => v);

  const toast = useToast()






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


    let pagecanvas = iframedocument.querySelectorAll('canvas');
    let layoutinfo = positioninfo.layout_info[canvasIndex];


    if (!layoutinfo || !canvas) return;

    let ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pagewidth = eval(layoutinfo.page_info.width);
    let pageheight = eval(layoutinfo.page_info.height);
    let orgwidth = canvas.width;
    let orgheight = canvas.height;

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
    // console.log(ctx, '绘画一次,位置是:', x0, y0, x1, y1, '页面长宽系数:', scaleXValue, scaleYValue);
    ctx.beginPath();
    ctx.moveTo(x0 * scaleXValue, y0 * scaleYValue);
    ctx.lineTo(x1 * scaleXValue, y0 * scaleYValue);
    ctx.lineTo(x1 * scaleXValue, y1 * scaleYValue);
    ctx.lineTo(x0 * scaleXValue, y1 * scaleYValue);
    ctx.closePath();
    switch (category) {
      case 'title':
        ctx.fillStyle = 'rgba(121, 124, 255, 0.3)';
        ctx.strokeStyle = 'rgba(121, 124, 255, 1)';
        break;
      case 'text':
        ctx.fillStyle = 'rgba(230, 113, 230, 0.15)';
        ctx.strokeStyle = 'rgba(230, 113, 230, 1)';
        break;
      case 'tableBody':
        ctx.fillStyle = 'rgba(241, 71, 41, 0.13)';
        ctx.strokeStyle = 'rgba(241, 71, 41, 0.13)';
      case 'table':
        ctx.fillStyle = 'rgba(241, 71, 41, 0.13)';
        ctx.strokeStyle = 'rgba(241, 71, 41, 0.13)';
        break;
      case "image":
        // ctx.fillStyle = 'rgba(230, 113, 230, 0.15)';
        // ctx.strokeStyle = 'rgba(230, 113, 230, 1)';
        ctx.fillStyle = 'rgba(149, 226, 115, 0.4)';
        ctx.strokeStyle = 'rgba(149, 226, 115, 1)';
        break;
      case "index":
        // ctx.fillStyle = 'rgba(230, 113, 230, 0.15)';
        // ctx.strokeStyle = 'rgba(230, 113, 230, 1)';
        ctx.fillStyle = 'rgba(255,220, 96, 0.4)';
        ctx.strokeStyle = 'rgba(250,200, 88, 1)';
        break;
      default:
        ctx.fillStyle = 'rgba(255,255,255, 0.2)';
        ctx.strokeStyle = 'rgba(255,255,255, 0.2)';
      // ctx.fillStyle = 'rgba(229, 185, 185, 0.8)';
      // ctx.strokeStyle = 'rgb(217, 163, 163)';

      // case 'InlineEquation':
      //   ctx.fillStyle = 'rgba(240, 240, 124, 0.4)';
      //   ctx.strokeStyle = 'rgba(240, 240, 124, 1)';
      //   break;
      // case 'OcrText':
      //   ctx.fillStyle = 'rgba(149, 226, 115, 0.4)';
      //   ctx.strokeStyle = 'rgba(149, 226, 115, 1)';
      //   break;
      // default:
      //   ctx.fillStyle = 'rgba(230, 113, 230, 0.4)';
      //   ctx.strokeStyle = 'rgba(230, 113, 230, 1)';
    }
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.save()
  }



  // 绘图逻辑
  useEffect(() => {
    if (!iframedocument || !positioninfo || !iframewindow || positioninfo.status !== 'completed') {
      return;
    }


    const handleWheel = (event: WheelEvent) => {
      // event.preventDefault(); 
      console.log('event:', event, `iframewindow`, iframewindow,);

      currentpage.current = (iframewindow.pdfViewer._currentPageNumber);

      let canvas = iframedocument.querySelectorAll('canvas')[currentpage.current - 1];
      let canvastwo = iframedocument.querySelectorAll('canvas')[currentpage.current];

      console.log(
        '%c当前canvas: %o\n%c当前页码: %d\n%ciframedocument: %o\n%c当前pdfUrl: %s\n%c包含的页码: %d\n%c当前绘画的坐标信息: %o',
        "color: red;", canvas,
        "color: red;", currentpage.current,
        "color: red;", iframedocument,
        "color: red;", pdfUrl,
        "color: red;", hasrenderedcanvas.current,
        "color: red;", positioninfo
      );
      if (!hasrenderedcanvas.current.includes(currentpage.current - 1)) {
        handleCanvasRender(canvas, currentpage.current - 1);
        handleCanvasRender(canvastwo, currentpage.current);
      }

      if (hasrenderedcanvas.current.includes(currentpage.current - 1)) {
        return;
      }

      hasrenderedcanvas.current.push(currentpage.current - 1);
      console.log('测试是否push了以渲染页数', hasrenderedcanvas.current);

      hasrenderedcanvas.current.push(currentpage.current);

    };
    const resetCanvasRender = () => {
      hasrenderedcanvas.current = [];
      console.log('重置canvas渲染, 清空hasrenderedcanvas.current:'
      );
    }
    const test = (event: any) => {
      console.log('测试触发test:', event);
    }
    const testing = (event: any) => {
      console.log('测试触发testing:', event);
    }

    if (iframeRef.current) {
      const iframeWindow = iframeRef.current.contentWindow;
      iframeWindow?.addEventListener('wheel', handleWheel);
      iframewindow?.eventBus.on('scalechanging', resetCanvasRender)
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
        <div style={{
          position:"absolute",
          top:'60px',
          // background: "red",
          left:0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          // width: "100px",
        }}>
          <div>
            <div style={{
              width: "30px",
              height: "15px",
              borderRadius: "3px",
              backgroundColor: "rgba(121, 124, 255, 0.5)",
              display: "inline-block",
            }}></div>
            <span style={{
              marginLeft: "10px",
              fontSize: "15px",
              color: "#999",
              boxSizing: "border-box",
            }}>title</span>
          </div>


          <div>
            <div style={{
              width: "30px",
              height: "15px",
              borderRadius: "3px",
              backgroundColor: "rgba(230, 113, 230, 0.35)",
              display: "inline-block",
            }}></div>
            <span style={{
              marginLeft: "10px",
              fontSize: "15px",
              boxSizing: "border-box",
              color: "#999",
            }}>text</span>
          </div>



          <div>
            <div style={{
              width: "30px",
              height: "15px",
              borderRadius: "3px",
              backgroundColor: "rgba(241, 71, 41, 0.33)",
              display: "inline-block",
            }}></div>
            <span style={{
              marginLeft: "10px",
              fontSize: "15px",
              color: "#999",
              boxSizing: "border-box",
            }}>table</span>
          </div>




          <div>
            <div style={{
              width: "30px",
              height: "15px",
              borderRadius: "3px",
              backgroundColor: "rgba(149, 226, 115, 0.6)",
              display: "inline-block",
            }}></div>
            <span style={{
              marginLeft: "10px",
              fontSize: "15px",
              color: "#999",
              boxSizing: "border-box",
            }}>image</span>
          </div>

        </div>
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
                '////', iframeRef.current?.contentWindow);
            }
            }
            // src={`/pdfjs-dist/web/viewer.html?file=${encodeURIComponent(`https://www.xiaoruiai.com:8208${pdfUrl}`)}`}
            src={`/pdfjs-dist/web/viewer.html?file=${encodeURIComponent(`http://localhost:3000${pdfUrl}`)}`}
          ></iframe>
        ) : null}
      </Box>

    </>
  );
};

export default PDFViewer;
