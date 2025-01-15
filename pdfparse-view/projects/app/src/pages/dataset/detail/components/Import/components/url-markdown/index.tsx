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
import { DatasetImportContext, ImportFormType } from '../../Context';
import { useContextSelector } from "use-context-selector";

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
  const { performSearchInIframe, iframeRef } = useContextSelector(DatasetImportContext, (v) => v);

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
    return element?.toString().replace(/\s+/g, '-');
  };
  const MemoizedH1 = React.memo(({ id, children, clickedElement, setClickedElement }: any) => (
    <h1
      className={` ${clickedElement === id ? styles.H1textborder : ''}`}
      onClick={() => {
        setClickedElement(id); console.log('children', children);
        performSearchInIframe(iframeRef, children);
      }}
    >
      {children}
    </h1>
  ));

  const MemoizedP = React.memo(({ id, children, clickedElement, setClickedElement }: any) => (

    <p
      className={` ${clickedElement === id ? styles.Ptextborder : ''}  `}
      onClick={() => {
        setClickedElement(id);
        let textContent = Array.isArray(children) ? children.flat(1).join(' ') : children;
        performSearchInIframe(iframeRef, textContent);
        console.log('p的children', children, '扁平化后', textContent);
      }}
    >
      {children}
    </p>
  ));

  const MemoizedTable = React.memo(({ id, children, clickedElement, setClickedElement }: any) => {
    const handleCellClick = (event: React.MouseEvent<HTMLTableCellElement>) => {
      const target = event.currentTarget; // 获取被点击的单元格
     

      const cellId:any = target.getAttribute('data-cell-id'); // 获取单元格的自定义 ID
      setClickedElement(cellId); // 处理点击表格的逻辑
      performSearchInIframe(iframeRef, cellId);
      console.log('被点击的单元格', target,'id', cellId);
    };

    const renderChildren: any = (children: React.ReactNode) => {
      return React.Children.map(children, (child: any) => {
        if (React.isValidElement(child)) {
          if (child.type === 'td' || child.type === 'th') {
            // 为 td 或 th 元素添加 onClick 事件处理器和 data-cell-id 属性
            return React.cloneElement(child as any, {
              onClick: handleCellClick,
              'data-cell-id': generateId(((child.props as any).children)),
              className: clickedElement === generateId(((child.props as any).children)) ? styles.TABLEtextbg : '',
            });
          } else if ((child.props as any).children) {
            // 递归处理嵌套的子元素
            return React.cloneElement(child, {}, renderChildren((child.props as any).children));
          }
        }
        return child;
      });
    };

    return (
      <table>
        {renderChildren(children)}
      </table>
    );
  });

  const MemoizedImg = React.memo(({ id, children, clickedElement, ...props }: any) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const handleImgClick = (event: React.MouseEvent<HTMLImageElement>) => {
      setClickedElement(id);
      event.stopPropagation();
    };
    useEffect(() => {
      console.log('测试useEffect工作没');
      if (imgRef.current) {
        console.log('测试useEffect工作没');
        const parentElement = imgRef.current.parentElement;
        if (clickedElement == id && parentElement) {
          console.log('Image clicked: ', clickedElement, '-----', id, '???', clickedElement == id);
          parentElement.classList.add(styles.IMGtextborder);
        } else if (parentElement) {
          parentElement.classList.remove(styles.IMGtextborder); // 可选：移除类名  
        }
      }
    }, [clickedElement, id]);
    return (
      <img
        ref={imgRef}
        onClick={handleImgClick}
        {...props}
      />
    )
  }

  );

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