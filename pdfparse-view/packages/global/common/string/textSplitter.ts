import { getErrText } from '../error/utils';
import { replaceRegChars } from './tools';

export const CUSTOM_SPLIT_SIGN = '-----CUSTOM_SPLIT_SIGN-----';

type SplitProps = {
  text: string;
  chunkLen: number;
  overlapRatio?: number;
  customReg?: string[];
  useParagraphOverlap?: Boolean
};
export type TextSplitProps = Omit<SplitProps, 'text' | 'chunkLen'> & {
  chunkLen?: number;
};

type SplitResponse = {
  chunks: string[];
  chars: number;
};

// 判断字符串是否为markdown的表格形式
const strIsMdTable = (str: string) => {
  // 检查是否包含表格分隔符 |
  if (!str.includes('|')) {
    return false;
  }

  const lines = str.split('\n');

  // 检查表格是否至少有两行
  if (lines.length < 2) {
    return false;
  }

  // 检查表头行是否包含 |
  const headerLine = lines[0].trim();
  if (!headerLine.startsWith('|') || !headerLine.endsWith('|')) {
    return false;
  }

  // 检查分隔行是否由 | 和 - 组成
  const separatorLine = lines[1].trim();
  const separatorRegex = /^(\|[\s:]*-+[\s:]*)+\|$/;
  if (!separatorRegex.test(separatorLine)) {
    return false;
  }

  // 检查数据行是否包含 |
  for (let i = 2; i < lines.length; i++) {
    const dataLine = lines[i].trim();
    if (dataLine && (!dataLine.startsWith('|') || !dataLine.endsWith('|'))) {
      return false;
    }
  }

  return true;
};
const markdownTableSplit = (props: SplitProps): SplitResponse => {
  let { text = '', chunkLen } = props;
  const splitText2Lines = text.split('\n');
  const header = splitText2Lines[0];
  const headerSize = header.split('|').length - 2;

  const mdSplitString = `| ${new Array(headerSize > 0 ? headerSize : 1)
    .fill(0)
    .map(() => '---')
    .join(' | ')} |`;

  const chunks: string[] = [];
  let chunk = `${header}
${mdSplitString}
`;

  for (let i = 2; i < splitText2Lines.length; i++) {
    if (chunk.length + splitText2Lines[i].length > chunkLen * 1.2) {
      chunks.push(chunk);
      chunk = `${header}
${mdSplitString}
`;
    }
    chunk += `${splitText2Lines[i]}\n`;
  }

  if (chunk) {
    chunks.push(chunk);
  }

  return {
    chunks,
    chars: chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  };
};

const commonSplit = (props: SplitProps): SplitResponse => {
  let { text = '', chunkLen, overlapRatio = 0.2, customReg = [] } = props;

  const splitMarker = 'SPLIT_HERE_SPLIT_HERE';
  const codeBlockMarker = 'CODE_BLOCK_LINE_MARKER';
  const overlapLen = Math.round(chunkLen * overlapRatio);

  // replace code block all \n to codeBlockMarker
  text = text.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, function (match) {
    return match.replace(/\n/g, codeBlockMarker);
  });
  // replace invalid \n
  text = text.replace(/(\r?\n|\r){3,}/g, '\n\n\n');

  // The larger maxLen is, the next sentence is less likely to trigger splitting
  const stepReges: { reg: RegExp; maxLen: number }[] = [
    ...customReg.map((text) => ({
      reg: new RegExp(`(${replaceRegChars(text)})`, 'g'),
      maxLen: chunkLen * 1.4
    })),
    { reg: /^(#\s[^\n]+)\n/gm, maxLen: chunkLen * 1.2 },
    { reg: /^(##\s[^\n]+)\n/gm, maxLen: chunkLen * 1.2 },
    { reg: /^(###\s[^\n]+)\n/gm, maxLen: chunkLen * 1.2 },
    { reg: /^(####\s[^\n]+)\n/gm, maxLen: chunkLen * 1.2 },

    { reg: /([\n]([`~]))/g, maxLen: chunkLen * 4 }, // code block
    { reg: /([\n](?!\s*[\*\-|>0-9]))/g, maxLen: chunkLen * 2 }, // 增大块，尽可能保证它是一个完整的段落。 (?![\*\-|>`0-9]): markdown special char
    { reg: /([\n])/g, maxLen: chunkLen * 1.2 },
    // ------ There's no overlap on the top
    { reg: /([。]|([a-zA-Z])\.\s)/g, maxLen: chunkLen * 1.2 },
    { reg: /([！]|!\s)/g, maxLen: chunkLen * 1.2 },
    { reg: /([？]|\?\s)/g, maxLen: chunkLen * 1.4 },
    { reg: /([；]|;\s)/g, maxLen: chunkLen * 1.6 },
    { reg: /([，]|,\s)/g, maxLen: chunkLen * 2 }
  ];

  const customRegLen = customReg.length;
  const checkIsCustomStep = (step: number) => step < customRegLen;
  const checkIsMarkdownSplit = (step: number) => step >= customRegLen && step <= 3 + customRegLen;
  const checkIndependentChunk = (step: number) => step >= customRegLen && step <= 4 + customRegLen;
  const checkForbidOverlap = (step: number) => step <= 6 + customRegLen;

  // if use markdown title split, Separate record title
  const getSplitTexts = ({ text, step }: { text: string; step: number }) => {
    if (step >= stepReges.length) {
      return [
        {
          text,
          title: ''
        }
      ];
    }

    const isCustomStep = checkIsCustomStep(step);
    const isMarkdownSplit = checkIsMarkdownSplit(step);
    const independentChunk = checkIndependentChunk(step);

    const { reg } = stepReges[step];

    const splitTexts = text
      .replace(
        reg,
        (() => {
          if (isCustomStep) return splitMarker;
          if (independentChunk) return `${splitMarker}$1`;
          return `$1${splitMarker}`;
        })()
      )
      .split(`${splitMarker}`)
      .filter((part) => part.trim());

    return splitTexts
      .map((text) => {
        const matchTitle = isMarkdownSplit ? text.match(reg)?.[0] || '' : '';

        return {
          text: isMarkdownSplit ? text.replace(matchTitle, '') : text,
          title: matchTitle
        };
      })
      .filter((item) => item.text.trim());
  };

  /* Gets the overlap at the end of a text as the beginning of the next block */
  const getOneTextOverlapText = ({ text, step }: { text: string; step: number }): string => {
    const forbidOverlap = checkForbidOverlap(step);
    const maxOverlapLen = chunkLen * 0.4;

    // step >= stepReges.length: Do not overlap incomplete sentences
    if (forbidOverlap || overlapLen === 0 || step >= stepReges.length) return '';

    const splitTexts = getSplitTexts({ text, step });
    let overlayText = '';

    for (let i = splitTexts.length - 1; i >= 0; i--) {
      const currentText = splitTexts[i].text;
      const newText = currentText + overlayText;
      const newTextLen = newText.length;

      if (newTextLen > overlapLen) {
        if (newTextLen > maxOverlapLen) {
          const text = getOneTextOverlapText({ text: newText, step: step + 1 });
          return text || overlayText;
        }
        return newText;
      }

      overlayText = newText;
    }
    return overlayText;
  };

  const splitTextRecursively = ({
    text = '',
    step,
    lastText,
    mdTitle = ''
  }: {
    text: string;
    step: number;
    lastText: string;
    mdTitle: string;
  }): string[] => {
    const independentChunk = checkIndependentChunk(step);
    const isCustomStep = checkIsCustomStep(step);

    // oversize
    if (step >= stepReges.length) {
      if (text.length < chunkLen * 3) {
        return [text];
      }
      // use slice-chunkLen to split text
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += chunkLen - overlapLen) {
        chunks.push(`${mdTitle}${text.slice(i, i + chunkLen)}`);
      }
      return chunks;
    }

    // split text by special char
    const splitTexts = getSplitTexts({ text, step });

    const maxLen = splitTexts.length > 1 ? stepReges[step].maxLen : chunkLen;
    const minChunkLen = chunkLen * 0.7;
    const miniChunkLen = 30;
    // console.log(splitTexts, stepReges[step].reg);

    const chunks: string[] = [];
    for (let i = 0; i < splitTexts.length; i++) {
      const item = splitTexts[i];
      const currentTitle = `${mdTitle}${item.title}`;

      const currentText = item.text;
      const currentTextLen = currentText.length;
      const lastTextLen = lastText.length;
      const newText = lastText + currentText;
      const newTextLen = lastTextLen + currentTextLen;

      // newText is too large(now, The lastText must be smaller than chunkLen)
      if (newTextLen > maxLen) {
        // lastText greater minChunkLen, direct push it to chunks, not add to next chunk. (large lastText)
        if (lastTextLen > minChunkLen) {
          chunks.push(`${currentTitle}${lastText}`);
          lastText = getOneTextOverlapText({ text: lastText, step }); // next chunk will start with overlayText
          i--;

          continue;
        }

        // split new Text, split chunks must will greater 1 (small lastText)
        const innerChunks = splitTextRecursively({
          text: newText,
          step: step + 1,
          lastText: '',
          mdTitle: currentTitle
        });
        const lastChunk = innerChunks[innerChunks.length - 1];
        // last chunk is too small, concat it to lastText(next chunk start)
        if (!independentChunk && lastChunk.length < minChunkLen) {
          chunks.push(...innerChunks.slice(0, -1));
          lastText = lastChunk;
        } else {
          chunks.push(...innerChunks);
          // compute new overlapText
          lastText = getOneTextOverlapText({
            text: lastChunk,
            step
          });
        }
        continue;
      }

      // size less than chunkLen, push text to last chunk. now, text definitely less than maxLen
      lastText = newText;

      // markdown paragraph block: Direct addition; If the chunk size reaches, add a chunk
      if (
        isCustomStep ||
        (independentChunk && newTextLen > miniChunkLen) ||
        newTextLen >= chunkLen
      ) {
        chunks.push(`${currentTitle}${lastText}`);

        lastText = getOneTextOverlapText({ text: lastText, step });
      }
    }

    /* If the last chunk is independent, it needs to be push chunks. */
    if (lastText && chunks[chunks.length - 1] && !chunks[chunks.length - 1].endsWith(lastText)) {
      if (lastText.length < chunkLen * 0.4) {
        chunks[chunks.length - 1] = chunks[chunks.length - 1] + lastText;
      } else {
        chunks.push(`${mdTitle}${lastText}`);
      }
    } else if (lastText && chunks.length === 0) {
      chunks.push(lastText);
    }

    return chunks;
  };

  try {
    const chunks = splitTextRecursively({
      text,
      step: 0,
      lastText: '',
      mdTitle: ''
    }).map((chunk) => chunk?.replaceAll(codeBlockMarker, '\n') || ''); // restore code block

    const chars = chunks.reduce((sum, chunk) => sum + chunk.length, 0);

    return {
      chunks,
      chars
    };
  } catch (err) {
    throw new Error(getErrText(err));
  }
};

/**
 * text split into chunks
 * chunkLen - one chunk len. max: 3500
 * overlapLen - The size of the before and after Text
 * chunkLen > overlapLen
 * markdown
 */
export const splitText2Chunks = (props: SplitProps): SplitResponse => {
  let { text = '', useParagraphOverlap = false } = props;
  const start = Date.now();
  const splitWithCustomSign = text.split(CUSTOM_SPLIT_SIGN);

  const splitResult = splitWithCustomSign.map((item) => {
    if (strIsMdTable(item)) {
      return markdownTableSplit(props);
    }
    console.log("进入导入")
    // 根据useParagraphOverlap参数选择使用哪个分割函数
    if (useParagraphOverlap) {
      console.log("进入小瑞导入")
      return splitByTitleHierarchyWithContextAndMerging(props);
    } else {
      return commonSplit(props);
    }
  });

  return {
    chunks: splitResult.map((item) => item.chunks).flat(),
    chars: splitResult.reduce((sum, item) => sum + item.chars, 0)
  };
};

//小瑞切割
const splitByTitleHierarchyWithContextAndMerging = (props: SplitProps): SplitResponse => {
  let { text = '', chunkLen, overlapRatio = 0.2, customReg = [] } = props;
  console.log(chunkLen);
  const codeBlockMarker = 'CODE_BLOCK_LINE_MARKER';

  // 将代码块中的所有换行符替换为 codeBlockMarker，用于后续处理避免代码块中断
  text = text.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, function (match) {
    return match.replace(/\n/g, codeBlockMarker);
  });

  // 强制在图片的前后加上换行符，确保图片与其他部分分开
  text = text.replace(/(\!\[.*?\]\(.*?\))/g, '\n\n$1\n\n');

  // 将无效的换行符替换为三个换行符，确保段落的分割
  text = text.replace(/(\r?\n|\r){3,}/g, '\n\n\n');

  // 根据段落（用两个换行符分隔）分割文本
  let paragraphs = text.split('\n\n');

  // 存储分割后的标题块
  const titleBlocks: string[] = [];

  // 当前累积的文本块
  let currentChunk = '';
  let currentChunkLevel = 0; // 当前块的标题级别
  let titleStack: string[] = []; // 存储当前块的标题栈

  paragraphs.forEach((paragraph) => {
    // 恢复段落中的代码块标记为换行符
    paragraph = paragraph.replaceAll(codeBlockMarker, '\n');

    // 检查是否是标题，并更新标题栈
    const titleMatch = paragraph.match(/^(#{1,6})\s*(.*)/);
    if (titleMatch) {
      const level = titleMatch[1].length; // 标题级别（1-6）
      const title = titleMatch[2]; // 标题内容

      // 如果当前块不为空，将当前块存储到 titleBlocks 数组中
      if (currentChunk&&currentChunk !== titleStack.join('\n')) {
        const prospectiveChunk = titleStack.slice(0,-1).join('\n')+ '\n' + currentChunk;
        titleBlocks.push(prospectiveChunk);
        currentChunk = '';
      }

      // 更新当前块和标题栈
      currentChunk = paragraph;
      currentChunkLevel = level;
      titleStack[level - 1] = `${titleMatch[1]} ${title}`;
      titleStack.length = level; // 去除低级标题
    } else {
      // 添加段落到当前块
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  });

  // 如果最后一个块存在，将其存储到 titleBlocks 数组中
  if (currentChunk&&currentChunk !== titleStack.join('\n')) {
    const finalChunk = titleStack.slice(0,-1).join('\n') + '\n' + currentChunk;
    titleBlocks.push(finalChunk);
  }

  // 这里可以对 titleBlocks 进行进一步的处理或合并
  const chunks: string[] = [];
  for (let index = 0; index < titleBlocks.length; index++) {
    let combinedBlock = titleBlocks[index];
  
    // 尝试合并当前块与后续块
    while (combinedBlock.length < chunkLen && index < titleBlocks.length - 1) {
      const nextBlock = titleBlocks[index + 1];
  
      // 检查合并后的长度
      if (combinedBlock.length + nextBlock.length <= chunkLen) {
        combinedBlock += '\n\n' + nextBlock; // 合并当前块与下一个块
        index++; // 跳过下一个块，因为它已经被合并
      } else {
        break; // 如果合并后的长度超出限制，则不再合并
      }
    }
  
    // 如果合并后的块仍然超出 chunkLen，进行分割
    if (combinedBlock.length > chunkLen) {
      const splitChunks = splitWithContext(combinedBlock, chunkLen, overlapRatio);
      chunks.push(...splitChunks);
    } else {
      chunks.push(combinedBlock); // 如果合并后的长度未超出 chunkLen，则直接添加
    }
  };
  
  

  // 计算所有块的总字符数
  const chars = chunks.reduce((sum, chunk) => sum + chunk.length, 0);

  return {
    chunks,
    chars
  };
};


// 标题部分提取逻辑
const extractTitlePart = (text: string) => {
  const titleMatch = text.match(/^(#{1,6}\s.*?\n)+/);
  if (titleMatch) {
    return titleMatch[0];
  }
  return '';
};

// 主分割逻辑
const splitWithContext = (text: string, chunkLen: number, overlapRatio: number): string[] => {
  const chunks: string[] = [];
  let start = 0;
  let overlapLen = Math.floor(chunkLen * overlapRatio);

  let titlePart = extractTitlePart(text);
  let titlePartBack = titlePart;

  if (titlePart) {
    start = titlePart.length;
  }

  const tableRegEx = /\|.*\|/g;
  const tableMatches = [...text.matchAll(tableRegEx)];
  const tableHeaderRegEx = /\|\s*[\s\S]*?\|\s*\n\|\s*[-:]+\s*\|(?:\s*[-:]+\s*\|)*/g;

  while (start < text.length) {
    let end = Math.min(start + chunkLen - titlePart.length, text.length);

    const { chunk, end: newEnd, withinTable, tableHeader } = processTableData(text, start, end, tableMatches, tableRegEx, tableHeaderRegEx);
    end = newEnd;

    const endsWithTable = withinTable && chunk.match(tableRegEx);

    if (end < text.length) {
      if (!endsWithTable) {
        titlePart = titlePartBack;
        chunks.push(titlePart + chunk);
        start = end - overlapLen;
      } else {
        chunks.push(titlePart + chunk);
        start = end;
        if (withinTable && tableHeader) {
          titlePart = titlePartBack + `\n${tableHeader}`;
        }
      }
    } else {
      if (!endsWithTable) {
        titlePart = titlePartBack;
        chunks.push(titlePart + chunk);
      } else {
        chunks.push(titlePart + chunk);
      }
      break;
    }
  }

  return chunks;
};


// 表格处理相关逻辑
const processTableData = (text: string, start: number, end: number, tableMatches: RegExpMatchArray[], tableRegEx: RegExp, tableHeaderRegEx: RegExp) => {
  let withinTable = false;
  let tableStart = -1;
  let tableEnd = end;

  for (let i = 0; i < tableMatches.length; i++) {
    const match = tableMatches[i];
    if (start < match.index! && end > match.index!) {
      withinTable = true;
      tableStart = match.index!;
      break;
    }
  }

  if (withinTable) {
    for (let i = 0; i < tableMatches.length; i++) {
      const match = tableMatches[i];
      if (match.index! >= start && match.index! < end) {
        tableEnd = match.index! + match[0].length;
      } else if (match.index! >= end) {
        break;
      }
    }

    if (tableEnd > end) {
      const prospectiveChunk = text.slice(start, tableEnd);
      if (prospectiveChunk.length > (end - start)) {
        end = tableEnd;
      } else {
        end = tableEnd;
      }
    } else {
      end = tableEnd;
    }
  }

  const chunk = text.slice(start, end);
  const tableHeaderMatch = chunk.match(tableHeaderRegEx);
  const tableHeader = tableHeaderMatch ? tableHeaderMatch[0].split('\n').slice(-2).join('\n')  : '';


  return { chunk, end, withinTable, tableHeader };
};




