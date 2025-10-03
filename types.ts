export interface ExamplePrompt {
  id: string;
  title: string;
  prompt: string;
}

export interface ScenePreset {
  name: string;
  prompt: string;
}

export interface StylePreset {
  name: string;
  keywords: string;
}

export interface VideoStylePreset {
  name: string;
  keywords: string;
}

export interface HistoryItem {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  style: string;
  imageUrl: string; // Data URL for the image thumbnail (for both image and video items)
  outputUrl: string; // Data URL for the full image or video blob URL
  timestamp: number;
}

export interface ModelViews {
  [key: string]: string;
}
