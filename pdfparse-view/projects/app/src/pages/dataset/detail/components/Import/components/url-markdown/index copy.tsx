import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import styles from "./index.module.scss";
import { useEffect, useRef, useState } from "react";
import cls from "classnames";
import React from "react";


interface IMarkdownProps {
  content?: string;
  markdownClass?: string;
  markdownId?: string;
}

const LazyUrlMarkdown: React.FC<IMarkdownProps> = ({
  content,
  markdownClass = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [sanitizedContent, setSanitizedContent] = useState<string>("");

  useEffect(() => {
    if (content) {
      // 用 &lt; &gt; 替换掉内容中的 <<  
      // const sanitized = content;  
      // const sanitized = content.replace(/<<([^>]+)>>/g, '&lt;&lt;\$1&gt;&gt;').replace(/<([^>]+)>/g, '&lt;$1&gt;');;  
      const sanitized = content
      setSanitizedContent(sanitized); // 更新状态  
      console.log('sanitizedContent111', sanitizedContent);
    }
  }, [content, sanitizedContent]);


  // 用于存储被点击元素的 ID  
  const [clickedElement, setClickedElement] = useState<string | any>(null);

  const handleElementClickref = useRef<any>('')

  // 为元素生成唯一 ID  
  const generateId = (element: any) => {
    return element.toString().replace(/\s+/g, '-');
  };
  const MemoizedH1 = React.memo(({ id, children, clickedElement, setClickedElement }: any) => (
    <h1
      className={` ${clickedElement === id ? styles.H1textborder : ''}`}
      onClick={() => { setClickedElement(id); }}
    >
      {children}
    </h1>
  ));

  const MemoizedP = React.memo(({ id, children, clickedElement, setClickedElement }: any) => (
    <p
      className={` ${clickedElement === id ? styles.Ptextborder : ''}  `}
      onClick={() => { setClickedElement(id); }}
    >
      {children}
    </p>
  ));

  const MemoizedTable = React.memo(({ id, children, clickedElement, setClickedElement }: any) => (
    <table
      className={` ${clickedElement === id ? styles.TABLEtextborder : ''}`}
      onClick={() => { setClickedElement(id); }}
    >
      {children}
    </table>
  ));

  const MemoizedImg = React.memo(({ id, children, clickedElement, ...props }: any) => (
    <img
      // className={` ${clickedElement === id ? styles.IMGtextborder : ``}`}
      onClick={(event) => {
        console.log('img clicked', id,'-----',clickedElement,'=====',clickedElement==id);
        
        const parentElement = event.currentTarget.parentElement
         event.stopPropagation();
         if(clickedElement == id){
          if (parentElement) {  
            parentElement.classList.add(styles.IMGtextborder); // 添加类名  
          }  
         }
         setClickedElement(id);
        
         }}
      {...props}
    />
  ));

  return (
    <div ref={ref} className="md-container">
      <div className={styles.mdViewerWrap}>
        <ReactMarkdown

          className={cls("bg-white text-[0.75rem]", markdownClass)}
          remarkPlugins={[
            remarkMath,
            [remarkGfm, { singleTilde: false }],

          ]}
          rehypePlugins={[[rehypeKatex, { strict: "ignore" }], rehypeRaw]}
          components={{
            h1: (props) => {
              const id = generateId(props.children);
              return (
                <MemoizedH1 id={id} clickedElement={clickedElement} setClickedElement={setClickedElement}>
                  {props.children}
                </MemoizedH1>
              );
            },
            p: (props) => {
              const id = generateId(props.children);
              return (
                <MemoizedP id={id} clickedElement={clickedElement} setClickedElement={setClickedElement}>
                  {props.children}
                </MemoizedP>
              );
            },
            table: (props) => {
              const id = generateId((props.node as any)?.position.start.offset);
              return (
                <MemoizedTable id={id} clickedElement={clickedElement} setClickedElement={setClickedElement}>
                  {props.children}
                </MemoizedTable>
              );
            },
            img: (props) => {
              const id = generateId(props.src?.toString());
              return (
                <MemoizedImg id={id} clickedElement={clickedElement} {...props} />
              );
            }
          }}
        >
          {sanitizedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default LazyUrlMarkdown;