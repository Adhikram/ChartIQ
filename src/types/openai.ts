import type { ChatCompletionContentPart } from 'openai/resources/chat/completions';

interface ImageUrl {
  url: string;
}

export interface ChatCompletionContentPartImage {
  type: 'image_url';
  image_url: ImageUrl;
}

export interface ChatCompletionContentPartText {
  type: 'text';
  text: string;
}

export type VisionContent = ChatCompletionContentPartText | ChatCompletionContentPartImage;

declare module 'openai/resources/chat/completions' {
  interface ChatCompletionContentPart extends VisionContent {}
} 