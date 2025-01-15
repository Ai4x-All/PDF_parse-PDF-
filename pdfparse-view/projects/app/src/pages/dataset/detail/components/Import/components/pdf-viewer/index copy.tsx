
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
 const router = useRouter();





  // 请求定位信息
  useEffect(() => {
    const handlePosition = async () => {
      console.log('previewUrl11111111', previewUrl);

      try {
        // 使用 for...of 循环来处理异步请求  

        const response = await axios({
          url: 'https://www.xxx.com:xxx/parse_layout_info',
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


// 封装搜索函数
function performSearchInIframe(keyword: string) {
  // 获取 iframe 的 window
  const iframeWindow:any = iframeRef.current?.contentWindow;
  if (!iframeWindow) {
      console.error('无法获取 iframe 的 window');
      return;
  }
  if (iframeWindow && iframeWindow.PDFViewerApplication.eventBus) {
    // 触发搜索事件
    iframeWindow.PDFViewerApplication.eventBus.dispatch("find", {
        // source: null, // 事件源，可以是触发搜索操作的元素或对象
        type: "", // 搜索类型，通常为空字符串
        query: keyword, // 搜索关键词
        caseSensitive: false, // 是否区分大小写
        entireWord: false, // 是否匹配整个单词
        highlightAll: true, // 是否高亮显示所有匹配项
        findPrevious: false, // 是否查找上一个匹配项
        matchDiacritics: true // 是否匹配变音符号
    });
    console.log('搜索完成');
} else {
    console.error('PDFViewerApplication 或 eventBus 未初始化');
}
  console.log('搜索完成');
  
}

  return (
    <>
      <Box style={{
        display: "flex",
        // bg: "red",
        height: "100%",
      }}>

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

           
            src={`/DPFjs/web/viewer.html?file=${encodeURIComponent(`http://localhost:3000${pdfUrl}`)}`}
         
          ></iframe>
        ) : null}
      </Box>

    </>
  );
};

export default PDFViewer;
