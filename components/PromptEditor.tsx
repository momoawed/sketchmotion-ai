import React, { useState } from 'react';
import { EXAMPLE_PROMPTS, STYLE_PRESETS, SCENE_PRESETS } from '../constants';
import { ExamplePrompt, ScenePreset } from '../types';
import { WandIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface PromptEditorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  isSketchUploaded: boolean;
  isPromptLoading: boolean;
  onGeneratePrompt: () => void;
  refinementInstruction: string;
  setRefinementInstruction: (instruction: string) => void;
  isRefiningPrompt: boolean;
  onRefinePrompt: () => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ 
  prompt, 
  setPrompt, 
  isLoading,
  isSketchUploaded,
  isPromptLoading,
  onGeneratePrompt,
  refinementInstruction,
  setRefinementInstruction,
  isRefiningPrompt,
  onRefinePrompt,
}) => {
  const { t } = useLanguage();
  const [promptMode, setPromptMode] = useState<'manual' | 'ai'>('manual');

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setPromptMode('manual');
  };
  
  const handlePresetClick = (keywords: string) => {
    setPrompt(prev => prev.trim() ? `${prev.trim()}, ${keywords}` : keywords);
    setPromptMode('manual');
  };

  const handleScenePresetClick = (prompt: string) => {
    setPrompt(prompt);
    setPromptMode('manual');
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{t('describe_vision_title')}</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4 p-1 bg-gray-200 dark:bg-gray-700/50 rounded-lg">
        <button
            onClick={() => {
                setPromptMode('manual');
                setPrompt('');
            }}
            disabled={isLoading}
            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-700 focus:ring-blue-500 ${
                promptMode === 'manual' 
                ? 'bg-white dark:bg-gray-800 shadow-md text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
            }`}
        >
            {t('write_prompt_manually')}
        </button>
        <button
            onClick={() => {
                setPromptMode('ai');
                onGeneratePrompt();
            }}
            disabled={!isSketchUploaded || isLoading}
            className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-700 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                promptMode === 'ai' && !isPromptLoading
                ? 'bg-white dark:bg-gray-800 shadow-md text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
            }`}
        >
            <WandIcon className={`w-4 h-4 ${isPromptLoading ? 'animate-spin' : ''}`} />
            <span>{isPromptLoading ? t('generating') : t('generate_prompt_with_ai')}</span>
        </button>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value)
          setPromptMode('manual');
        }}
        placeholder={t('prompt_placeholder')}
        className="w-full h-40 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-gray-800 dark:text-gray-200 resize-y"
        disabled={isLoading}
      />

      {prompt && !isLoading && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t('refine_with_ai')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('refine_instruction')}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder={t('refine_placeholder')}
              value={refinementInstruction}
              onChange={(e) => setRefinementInstruction(e.target.value)}
              className="flex-grow p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-gray-800 dark:text-gray-200"
              disabled={isLoading}
            />
            <button
              onClick={onRefinePrompt}
              disabled={!refinementInstruction.trim() || isLoading}
              className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
            >
              <WandIcon className={`w-4 h-4 ${isRefiningPrompt ? 'animate-spin' : ''}`} />
              <span>{isRefiningPrompt ? t('refining') : t('refine')}</span>
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">{t('add_style_keywords')}</h3>
        <div className="flex flex-wrap gap-2">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset.keywords)}
              className="px-3 py-1.5 bg-gray-200 hover:bg-green-500 text-gray-700 hover:text-white dark:bg-gray-700 dark:hover:bg-green-600 dark:text-gray-300 dark:hover:text-white text-sm rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              title={preset.keywords}
            >
              + {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">{t('try_an_example')}</h3>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example: ExamplePrompt) => (
            <button
              key={example.id}
              onClick={() => handleExampleClick(example.prompt)}
              className="px-3 py-1.5 bg-gray-200 hover:bg-blue-500 text-gray-700 hover:text-white dark:bg-gray-700 dark:hover:bg-blue-600 dark:text-gray-300 dark:hover:text-white text-sm rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">{t('try_a_scene_preset')}</h3>
        <div className="flex flex-wrap gap-2">
          {SCENE_PRESETS.map((preset: ScenePreset) => (
            <button
              key={preset.name}
              onClick={() => handleScenePresetClick(preset.prompt)}
              className="px-3 py-1.5 bg-gray-200 hover:bg-indigo-500 text-gray-700 hover:text-white dark:bg-gray-700 dark:hover:bg-indigo-600 dark:text-gray-300 dark:hover:text-white text-sm rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {t(preset.name as any, preset.name.replace(/_/g, ' '))}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;