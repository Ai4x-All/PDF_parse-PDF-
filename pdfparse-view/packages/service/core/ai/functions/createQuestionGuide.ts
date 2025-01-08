import type { ChatCompletionMessageParam } from '@fastgpt/global/core/ai/type.d';
import { getAIApi } from '../config';
import { countGptMessagesTokens } from '../../../common/string/tiktoken/index';
import { loadRequestMessages } from '../../chat/utils';

// 默认的中文提示
const getPromptQuestionGuide = (language: string) => {
  if (language === 'en') {
    return `You are an AI assistant. Your task is to predict my next question based on the conversation history.
You need to generate 3 possible questions to guide me in continuing the conversation. The requirements for the generated questions are:
1. The language in which the question is generated is English.
2. The length of each question should be less than 20 characters.
3. Return in JSON format: ["question1", "question2", "question3"].`;
  } else if (language === 'es') { // 西班牙语版本
    return `Eres un asistente IA. Tu tarea es predecir mi próxima pregunta en función del historial de conversación.
Necesitas generar 3 preguntas posibles para guiarme a continuar la conversación. Los requisitos para las preguntas generadas son:
1. El idioma en el que se genera la pregunta es español.
2. La longitud de cada pregunta debe ser inferior a 20 caracteres.
3. Devuelve en formato JSON: ["question1", "question2", "question3"].`;
  } else if (language === 'vi') { // 越南语版本
    return `Bạn là một trợ lý AI. Nhiệm vụ của bạn là dự đoán câu hỏi tiếp theo của tôi dựa trên lịch sử cuộc trò chuyện.
Bạn cần tạo ra 3 câu hỏi khả thi để hướng dẫn tôi tiếp tục cuộc trò chuyện. Các yêu cầu cho các câu hỏi được tạo ra là:
1. Ngôn ngữ của câu hỏi là tiếng Việt.
2. Độ dài của mỗi câu hỏi phải nhỏ hơn 20 ký tự.
3. Trả về định dạng JSON: ["question1", "question2", "question3"].`;
  } else { // 默认返回中文
    return `你是一个AI智能助手，你的任务是结合对话记录，推测我下一步的问题。
      你需要生成 3 个可能的问题，引导我继续提问，生成的问题要求：
      1. 生成问题的语言，为中文。
      2. 问题的长度应小于20个字符。
      3. 按 JSON 格式返回: ["question1", "question2", "question3"]。`;
  }
};


export async function createQuestionGuide({
  messages,
  model,
  language = 'zh' // 默认语言为中文
}: {
  messages: ChatCompletionMessageParam[];
  model: string;
  language?: string; // 添加可选的语言参数
}) {
  const promptQuestionGuide = getPromptQuestionGuide(language); // 根据语言生成提示

  const concatMessages: ChatCompletionMessageParam[] = [
    ...messages,
    {
      role: 'user',
      content: promptQuestionGuide
    }
  ];

  const ai = getAIApi({
    timeout: 480000
  });
  const data = await ai.chat.completions.create({
    model: model,
    temperature: 0.9,
    max_tokens: 200,
    messages: await loadRequestMessages({
      messages: concatMessages,
      useVision: false
    }),
    stream: false
  });

  const answer = data.choices?.[0]?.message?.content || '';

  const start = answer.indexOf('[');
  const end = answer.lastIndexOf(']');

  const tokens = await countGptMessagesTokens(concatMessages);

  if (start === -1 || end === -1) {
    return {
      result: [],
      tokens: 0
    };
  }

  const jsonStr = answer
    .substring(start, end + 1)
    .replace(/(\\n|\\)/g, '')
    .replace(/  /g, '');

  try {
    return {
      result: JSON.parse(jsonStr),
      tokens
    };
  } catch (error) {
    return {
      result: [],
      tokens: 0
    };
  }
}
