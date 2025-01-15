import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import RemarkMath from 'remark-math'; // Math syntax
import RemarkBreaks from 'remark-breaks'; // Line break
import RehypeKatex from 'rehype-katex'; // Math render
import RemarkGfm from 'remark-gfm'; // Special markdown syntax
import RehypeExternalLinks from 'rehype-external-links';
import RehypeRaw from 'rehype-raw'; // To allow raw HTML to be parsed

import styles from './index.module.scss';
import dynamic from 'next/dynamic';

import { Link, Button } from '@chakra-ui/react';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { useTranslation } from 'next-i18next';
import { EventNameEnum, eventBus } from '@/web/common/utils/eventbus';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { MARKDOWN_QUOTE_SIGN } from '@fastgpt/global/core/chat/constants';
import { CodeClassNameEnum } from './utils';

const CodeLight = dynamic(() => import('./CodeLight'), { ssr: false });
const MermaidCodeBlock = dynamic(() => import('./img/MermaidCodeBlock'), { ssr: false });
const MdImage = dynamic(() => import('./img/Image'), { ssr: false });
const EChartsCodeBlock = dynamic(() => import('./img/EChartsCodeBlock'), { ssr: false });

const ChatGuide = dynamic(() => import('./chat/Guide'), { ssr: false });
const QuestionGuide = dynamic(() => import('./chat/QuestionGuide'), { ssr: false });

const Markdown = ({
  source = '',
  showAnimation = false
}: {
  source?: string;
  showAnimation?: boolean;
}) => {
  const components = useMemo<any>(
    () => ({
      img: Image,
      pre: RewritePre,
      p: (pProps: any) => <p {...pProps} dir="auto" />,
      code: Code,
      a: A,
      base64img: ({ src }: any) => <MdImage src={src} />, // Handle base64img as custom component
    }),
    []
  );

  const formatSource = useMemo(() => {
    // Regex to match base64 images
    const base64ImageRegex = /!\[[\s\S]*?\]\((data:image\/[a-zA-Z]+;base64,[^\)]+)\)/g;


    const formattedSource = source
      .replace(/(http[s]?:\/\/[^\s，。]+)([。，])/g, '$1 $2') // Follow the link with a space
      .replace(/\n*(\[QUOTE SIGN\]\(.*\))/g, '$1') // Formatting for quotes
      .replace(base64ImageRegex, (match, p1) => {
        // Custom tag for base64 images that will be replaced by a custom component
        return `<base64img src="${p1}" />`; 
      });

    return formattedSource;
  }, [source]);

  return (
    <ReactMarkdown
      className={`markdown ${styles.markdown}
        
      ${showAnimation ? `${formatSource ? styles.waitingAnimation : styles.animation}` : ''}
    `}
      remarkPlugins={[RemarkMath, [RemarkGfm, { singleTilde: false }], RemarkBreaks]}
      rehypePlugins={[RehypeKatex, [RehypeExternalLinks, { target: '_blank' }], RehypeRaw]} // Allow raw HTML (e.g., base64img)
      components={components}
    >
      {formatSource}
    </ReactMarkdown>
  );
};

export default React.memo(Markdown);

/* Custom dom */
const Code = React.memo(function Code(e: any) {
  const { className, codeBlock, children } = e;
  const match = /language-(\w+)/.exec(className || '');
  const codeType = match?.[1];

  const strChildren = String(children);

  const Component = useMemo(() => {
    if (codeType === CodeClassNameEnum.mermaid) {
      return <MermaidCodeBlock code={strChildren} />;
    }
    if (codeType === CodeClassNameEnum.guide) {
      return <ChatGuide text={strChildren} />;
    }
    if (codeType === CodeClassNameEnum.questionGuide) {
      return <QuestionGuide text={strChildren} />;
    }
    if (codeType === CodeClassNameEnum.echarts) {
      return <EChartsCodeBlock code={strChildren} />;
    }

    return (
      <CodeLight className={className} codeBlock={codeBlock} match={match}>
        {children}
      </CodeLight>
    );
  }, [codeType, className, codeBlock, match, children, strChildren]);

  return Component;
});

const Image = React.memo(function Image({ src }: { src?: string }) {
  return <MdImage src={src} />;
});

const A = React.memo(function A({ children, ...props }: any) {
  const { t } = useTranslation();

  // empty href link
  if (!props.href && typeof children?.[0] === 'string') {
    const text = useMemo(() => String(children), [children]);

    return (
      <MyTooltip label={t('common:core.chat.markdown.Quick Question')}>
        <Button
          variant={'whitePrimary'}
          size={'xs'}
          borderRadius={'md'}
          my={1}
          onClick={() => eventBus.emit(EventNameEnum.sendQuestion, { text })}
        >
          {text}
        </Button>
      </MyTooltip>
    );
  }

  // quote link(未使用)
  if (children?.length === 1 && typeof children?.[0] === 'string') {
    const text = String(children);
    if (text === MARKDOWN_QUOTE_SIGN && props.href) {
      return (
        <MyTooltip label={props.href}>
          <MyIcon
            name={'core/chat/quoteSign'}
            transform={'translateY(-2px)'}
            w={'18px'}
            color={'primary.500'}
            cursor={'pointer'}
            _hover={{
              color: 'primary.700'
            }}
          />
        </MyTooltip>
      );
    }
  }

  return <Link {...props}>{children}</Link>;
});

function RewritePre({ children }: any) {
  const modifiedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { codeBlock: true });
    }
    return child;
  });

  return <>{modifiedChildren}</>;
}
