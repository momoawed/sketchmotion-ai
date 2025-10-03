import React, { useState, useEffect } from 'react';
import { LoaderIcon, FilmIcon, DownloadIcon, DocumentTextIcon, PencilRulerIcon, BuildingStorefrontIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { generateArchitecturalReport } from '../services/geminiService';
import ReportModal from './ReportModal';
import ElevationModal from './ElevationModal';
import TechnicalDrawingModal from './TechnicalDrawingModal';

interface ResultDisplayProps {
  sketchImage: File | null;
  sketchPreviewUrl: string | null;
  selectedImageUrl: string | null;
  generatedImageUrls: string[];
  onSelectImage: (url: string) => void;
  isLoading: boolean;
  error: string | null;
  generatedVideoUrl: string | null;
  isVideoLoading: boolean;
  videoError: string | null;
  onAnimateClick: () => void;
}

const downloadResource = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const ImagePanel: React.FC<{ title: string; imageUrl: string | null; onDownload?: () => void; children?: React.ReactNode; }> = ({ title, imageUrl, onDownload, children }) => {
    const { t } = useLanguage();
    return (
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col shadow-lg min-h-[300px] lg:min-h-0 relative">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700 dark:text-gray-300">{title}</h3>
            <div className="flex-grow flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-md overflow-hidden relative border-2 border-dashed border-gray-300 dark:border-gray-700">
                {imageUrl ? <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain transition-all duration-300" /> : children}
            </div>
            {onDownload && (
                <button
                    onClick={onDownload}
                    className="absolute top-4 right-4 z-20 p-2 bg-gray-200/50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`${t('download')} ${title}`}
                    title={`${t('download')} ${title}`}
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

const imageLoadingMessages = [
  "Analyzing architectural sketch...",
  "Defining primary structures...",
  "Applying textures and materials...",
  "Calculating realistic lighting...",
  "Casting shadows and reflections...",
  "Rendering final details...",
  "Polishing the final image...",
];

const videoLoadingMessages = [
  "Warming up the digital cameras...",
  "Choreographing camera movements...",
  "Rendering the first few frames...",
  "Adding ambient lighting and effects...",
  "This can take several minutes, please be patient.",
  "Assembling the final cut...",
  "Applying post-production polish...",
  "Almost there! Your animation is nearly ready.",
];

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
    sketchImage,
    sketchPreviewUrl, 
    selectedImageUrl,
    generatedImageUrls,
    onSelectImage,
    isLoading, 
    error,
    generatedVideoUrl,
    isVideoLoading,
    videoError,
    onAnimateClick
}) => {
  const { t } = useLanguage();
  const [currentVideoLoadingMessage, setCurrentVideoLoadingMessage] = useState(videoLoadingMessages[0]);
  const [currentImageLoadingMessage, setCurrentImageLoadingMessage] = useState(imageLoadingMessages[0]);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [isElevationModalOpen, setIsElevationModalOpen] = useState(false);
  const [isDraftingModalOpen, setIsDraftingModalOpen] = useState(false);


  useEffect(() => {
    let intervalId: number | undefined;
    if (isLoading) {
      setCurrentImageLoadingMessage(imageLoadingMessages[0]);
      intervalId = window.setInterval(() => {
        setCurrentImageLoadingMessage(prev => {
          const currentIndex = imageLoadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % imageLoadingMessages.length;
          return imageLoadingMessages[nextIndex];
        });
      }, 3000);
    }
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    let intervalId: number | undefined;
    if (isVideoLoading) {
      setCurrentVideoLoadingMessage(videoLoadingMessages[0]);
      intervalId = window.setInterval(() => {
        setCurrentVideoLoadingMessage(prev => {
          const currentIndex = videoLoadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % videoLoadingMessages.length;
          return videoLoadingMessages[nextIndex];
        });
      }, 4000);
    }
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isVideoLoading]);

  const handleDownloadImage = () => {
    if (selectedImageUrl) {
        downloadResource(selectedImageUrl, `ai-render-${Date.now()}.png`);
    }
  };

  const handleDownloadVideo = () => {
    if (generatedVideoUrl) {
      downloadResource(generatedVideoUrl, `ai-animation-${Date.now()}.mp4`);
    }
  };

  const handleGenerateReport = async () => {
      if (!sketchImage || !selectedImageUrl) {
          setReportError("Sketch and generated image are required to create a report.");
          return;
      }
      setIsReportLoading(true);
      setReportError(null);
      setReportContent(null);
      setIsReportModalOpen(true);

      try {
          const report = await generateArchitecturalReport(sketchImage, selectedImageUrl);
          setReportContent(report);
      } catch(e) {
          if (e instanceof Error) {
            setReportError(e.message);
          } else {
            setReportError('An unexpected error occurred while generating the report.');
          }
      } finally {
          setIsReportLoading(false);
      }
  }

  const renderAiContent = () => {
    if (isVideoLoading) {
      return (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex flex-col items-center justify-center z-10 p-4 text-center">
          <FilmIcon className="w-16 h-16 text-purple-400 animate-pulse"/>
          <p className="text-lg mt-4 text-purple-500 dark:text-purple-300 font-semibold">{t('animating_scene')}</p>
          <p className="text-sm mt-2 text-gray-500 dark:text-gray-400 min-h-[2.5rem] flex items-center justify-center">{currentVideoLoadingMessage}</p>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex flex-col items-center justify-center z-10 p-4 text-center">
          <LoaderIcon className="w-20 h-20"/>
          <p className="text-lg mt-4 text-blue-500 dark:text-blue-300 font-semibold">{t('rendering_vision')}</p>
          <p className="text-sm mt-2 text-gray-500 dark:text-gray-400 min-h-[2.5rem] flex items-center justify-center">{currentImageLoadingMessage}</p>
        </div>
      );
    }

    if (videoError) {
      return (
        <div className="p-4 text-center text-red-500 dark:text-red-400">
          <h4 className="font-bold mb-2">{t('animation_failed')}</h4>
          <p className="text-sm max-w-xs mx-auto">{videoError}</p>
        </div>
      );
    }
    if (error) {
       return (
        <div className="p-4 text-center text-red-500 dark:text-red-400">
          <h4 className="font-bold mb-2">{t('generation_failed')}</h4>
          <p className="text-sm max-w-xs mx-auto">{error}</p>
        </div>
      );
    }

    if (generatedVideoUrl) {
      return (
        <video 
            src={generatedVideoUrl} 
            controls 
            autoPlay 
            loop 
            className="max-w-full max-h-full object-contain"
        >
            Your browser does not support the video tag.
        </video>
      );
    }
    if (selectedImageUrl) {
      return null;
    }

    return (
      <div className="text-center text-gray-500 p-4">
        <p>{t('render_will_appear')}</p>
      </div>
    );
  };

  const isImageReady = !!selectedImageUrl && !isLoading;
  const isVideoReady = !!generatedVideoUrl && !isVideoLoading;
  
  let downloadHandler: (() => void) | undefined = undefined;
  if(isVideoReady) {
    downloadHandler = handleDownloadVideo;
  } else if (isImageReady && !videoError) {
    downloadHandler = handleDownloadImage;
  }
    
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <ImagePanel title={t('your_sketch')} imageUrl={sketchPreviewUrl}>
              <p className="text-gray-500 px-4 text-center">{t('upload_to_begin')}</p>
          </ImagePanel>
          
          <ImagePanel 
            title={t('ai_render')}
            imageUrl={selectedImageUrl && !generatedVideoUrl && !videoError ? selectedImageUrl : null}
            onDownload={downloadHandler}
          >
            {renderAiContent()}
          </ImagePanel>
        </div>

        {generatedImageUrls.length > 1 && !isLoading && !isVideoLoading && !error && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-3 text-center text-gray-700 dark:text-gray-300">{t('variations_result_title')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {generatedImageUrls.map((url, index) => (
                        <div 
                            key={index}
                            className={`relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${selectedImageUrl === url ? 'ring-4 ring-purple-500 shadow-xl' : 'ring-2 ring-transparent hover:ring-purple-400'}`}
                            onClick={() => onSelectImage(url)}
                        >
                            <img src={url} alt={`Variation ${index + 1}`} className="w-full h-full object-cover aspect-square" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {isImageReady && !isVideoReady && !videoError && !isVideoLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                  onClick={onAnimateClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 text-md font-bold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                  <FilmIcon className="w-5 h-5" />
                  <span>{t('animate_scene')}</span>
              </button>
              <button
                  onClick={handleGenerateReport}
                  disabled={isReportLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 text-md font-bold text-white bg-teal-600 rounded-lg shadow-lg hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 disabled:bg-teal-600/50 disabled:cursor-wait"
                  >
                  <DocumentTextIcon className={`w-5 h-5 ${isReportLoading ? 'animate-spin' : ''}`} />
                  <span>{isReportLoading ? t('generating_report') : t('generate_architectural_report')}</span>
              </button>
              <button
                  onClick={() => setIsElevationModalOpen(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 text-md font-bold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                  >
                  <PencilRulerIcon className="w-5 h-5" />
                  <span>{t('generate_elevation_sketch')}</span>
              </button>
               <button
                  onClick={() => setIsDraftingModalOpen(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 text-md font-bold text-white bg-orange-600 rounded-lg shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105"
                  >
                  <BuildingStorefrontIcon className="w-5 h-5" />
                  <span>{t('ai_drafting_tool')}</span>
              </button>
          </div>
        )}
      </div>
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportContent={reportContent}
        isLoading={isReportLoading}
        error={reportError}
      />
      <ElevationModal
        isOpen={isElevationModalOpen}
        onClose={() => setIsElevationModalOpen(false)}
        generatedImageUrl={selectedImageUrl}
      />
       <TechnicalDrawingModal
        isOpen={isDraftingModalOpen}
        onClose={() => setIsDraftingModalOpen(false)}
        generatedImageUrl={selectedImageUrl}
      />
    </>
  );
};

export default ResultDisplay;