import { AppTarget } from './utils/appLauncher';

export type AssistantMode =
  | 'general'
  | 'writing'
  | 'coding'
  | 'prompts'
  | 'formatting'
  | 'translation'
  | 'learning'
  | 'advisor'
  | 'customPrompt';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode?: AssistantMode;
  isPinned?: boolean;
  isLocked?: boolean;
  generatedImage?: {
    url: string;
    prompt: string;
    aspectRatio: string;
  };
  appTarget?: AppTarget;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  isStarred?: boolean;
}

export interface PromptTemplate {
  id: string;
  titleEn: string;
  titleUr: string;
  category: AssistantMode;
  promptEn: string;
  promptUr: string;
  descriptionEn: string;
  descriptionUr: string;
  iconName: string;
}

export type UILanguage = 'en' | 'ur';

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  style?: string;
  lighting?: string;
  camera?: string;
}
