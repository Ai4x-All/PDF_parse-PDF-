import ReactMarkdown from "react-markdown";  
import remarkMath from "remark-math";  
import rehypeKatex from "rehype-katex";  
import rehypeRaw from "rehype-raw";  
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";  
import remarkGfm from "remark-gfm";  
import styles from "./index.module.scss";  
import { useEffect, useRef, useState } from "react";  
import cls from "classnames";  


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
      const sanitized = content.replace(/<<([^>]+)>>/g, '&lt;&lt;\$1&gt;&gt;').replace(/<([^>]+)>/g, '&lt;$1&gt;');;  
      setSanitizedContent(sanitized); // 更新状态  
      console.log('sanitizedContent111', sanitizedContent);
      
    }  
    // if (content) {  
    //   const sanitized = content.replace(/<<([^>]+)>>/g, '&lt;&lt;\$1&gt;&gt;')  
    //                             .replace(/<([^>]+)>/g, '&lt;\$1&gt;')  
    //                             // 确保栏目符号不会被破坏  
    //                             .replace(/(\|)\s*([^\|]+)\s*(\|)/g, '\$1 \$2 \$3');  
    //   setSanitizedContent(sanitized);   
    //   console.log('sanitizedContent111', sanitized);  
    // }  
  }, [content,sanitizedContent]);  

  return (  
    <div ref={ref} className="min-h-[100px]">  
      <div className={styles.mdViewerWrap}>  
        <ReactMarkdown  

          className={cls("bg-white text-[0.75rem]", markdownClass)}  
          remarkPlugins={[  
            remarkMath,  
            [remarkGfm, { singleTilde: false }], 

          ]}  
          rehypePlugins={[[rehypeKatex, { strict: "ignore" }], rehypeRaw]}  
          components={{  
            code(props) {  
              const { children, className, node, ...rest } = props;  
              const match = /language-(\w+)/.exec(className || "");  
              return match ? (  
                <SyntaxHighlighter  
                  PreTag="div"  
                  className="rounded-md"  
                  // eslint-disable-next-line react/no-children-prop  
                  children={String(children).replace(/\n$/, "")}  
                  language={match[1]}  
                />  
              ) : (  
                <code  
                  {...rest}  
                  className="p-4 my-2 bg-[#f6f8fa] !bg-black rounded-md block"  
                >  
                  {children}  
                </code>  
              );  
            },  
          }}  
        >  
          {sanitizedContent} 
        </ReactMarkdown>  
      </div>  
    </div>  
  );  
};  

export default LazyUrlMarkdown;