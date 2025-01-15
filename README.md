# PDF_parse-PDF-
用于解析各类PDF文件
项目本地跑流程:
1.根目录下执行pnpm install
2.继续执行cd .\projects\app
3.修改文件目录 pdfparse-view\projects\app\src\pages\dataset\detail\components\Import\components\pdf-viewer\index.tsx
中的代码 src={`/pdfjs-dist/web/viewer.html?file=${encodeURIComponent(`https://www.xiaoruiai.com:8208${pdfUrl}`)}`}
修改为 src={`/pdfjs-dist/web/viewer.html?file=${encodeURIComponent(`http://localhost:3000${pdfUrl}`)}`}
(服务器部署则相反)
4.继续执行pnpm dev