import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptEditor from './components/PromptEditor';
import ResultDisplay from './components/ResultDisplay';
import { generateRealisticScene, generateAnimationVideo, generatePromptFromSketch, refinePrompt, generateVideoPrompt } from './services/geminiService';
import { WandIcon, FilmIcon } from './components/icons';
import StyleSelector from './components/StyleSelector';
import { RENDER_STYLE_KEYS, STYLE_PROMPT_PREFIXES, VIDEO_STYLE_PRESETS, ANIMATION_CAMERA_SPEEDS, ANIMATION_CAMERA_TILTS } from './constants';
import { HistoryItem } from './types';
import History from './components/History';
import ErrorModal from './components/ErrorModal';
import { useLanguage, Language } from './contexts/LanguageContext';
import ThreeDModelGenerator from './components/ThreeDModelGenerator';

const MAX_HISTORY_ITEMS = 12;

const OptionGroup: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
  disabled: boolean;
}> = ({ label, options, selected, onChange, disabled }) => (
    <div className="text-left w-full">
        <label className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    disabled={disabled}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                        selected === option.value
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);

const App: React.FC = () => {
  const { language, t } = useLanguage();
  const [sketchImage, setSketchImage] = useState<File | null>(null);
  const [sketchPreviewUrl, setSketchPreviewUrl] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreviewUrl, setReferencePreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [renderStyle, setRenderStyle] = useState<string>(RENDER_STYLE_KEYS[0]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
  const [numberOfVariations, setNumberOfVariations] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showAnimatePrompt, setShowAnimatePrompt] = useState<boolean>(false);
  const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
  const [isRefiningPrompt, setIsRefiningPrompt] = useState<boolean>(false);
  const [refinementInstruction, setRefinementInstruction] = useState<string>('');
  const [isGeneratingVideoPrompt, setIsGeneratingVideoPrompt] = useState<boolean>(false);
  const [showQuotaErrorModal, setShowQuotaErrorModal] = useState<boolean>(false);

  // States for animation controls
  const [animationLength, setAnimationLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [cameraMovement, setCameraMovement] = useState<'pan' | 'zoom' | 'orbit'>('pan');
  const [ambientEffects, setAmbientEffects] = useState<boolean>(true);
  const [ambientSound, setAmbientSound] = useState<boolean>(true);
  const [animationInstruction, setAnimationInstruction] = useState<string>('');
  const [cameraSpeed, setCameraSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [cameraTilt, setCameraTilt] = useState<'none' | 'upward' | 'downward'>('none');
  const [subjectOfFocus, setSubjectOfFocus] = useState<string>('');
  const [videoStyle, setVideoStyle] = useState<string>(VIDEO_STYLE_PRESETS[0].name);

  // State for generation history
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
        const savedHistory = localStorage.getItem('generationHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    } catch (error) {
        console.error("Failed to load history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('generationHistory', JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const handleImageUpload = (file: File) => {
    setSketchImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSketchPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleReferenceUpload = (file: File) => {
    setReferenceImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
        setReferencePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearSketch = () => {
    setSketchImage(null);
    setSketchPreviewUrl(null);
    setPrompt('');
    setSelectedImageUrl(null);
    setGeneratedImageUrls([]);
    setGeneratedVideoUrl(null);
    setError(null);
    setVideoError(null);
  };

  const handleClearReference = () => {
    setReferenceImage(null);
    setReferencePreviewUrl(null);
  };


  const handleGeneratePrompt = async () => {
    if (!sketchImage) {
      setError("Please upload a sketch first to generate a prompt.");
      return;
    }
    setIsPromptLoading(true);
    setError(null);
    try {
      const generatedPrompt = await generatePromptFromSketch(sketchImage, referenceImage, language);
      setPrompt(generatedPrompt);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred while generating the prompt.');
      }
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleRefinePrompt = async () => {
    if (!sketchImage) {
      setError("Cannot refine without the original sketch.");
      return;
    }
    if (!prompt) {
      setError("Cannot refine an empty prompt.");
      return;
    }
    if (!refinementInstruction) {
      setError("Please provide a refinement instruction.");
      return;
    }
    setIsRefiningPrompt(true);
    setError(null);
    try {
      const refinedPrompt = await refinePrompt(sketchImage, referenceImage, prompt, refinementInstruction, language);
      setPrompt(refinedPrompt);
      setRefinementInstruction('');
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred while refining the prompt.');
      }
    } finally {
      setIsRefiningPrompt(false);
    }
  };

  const createVideoPromptString = (
    basePrompt: string,
    length: 'short' | 'medium' | 'long',
    movement: 'pan' | 'zoom' | 'orbit',
    effects: boolean,
    instruction: string,
    sound: boolean,
    videoStyleName: string,
    speed: 'slow' | 'medium' | 'fast',
    tilt: 'none' | 'upward' | 'downward',
    focusSubject: string,
    lang: Language
  ): string => {
      const isArabic = lang === 'ar';

      const lengthDesc = {
          short: isArabic ? '3 ثوانٍ' : '3 seconds',
          medium: isArabic ? '5 ثوانٍ' : '5 seconds',
          long: isArabic ? '8 ثوانٍ' : '8 seconds'
      };
      const movementDesc = {
          pan: isArabic ? 'مسح بانورامي سينمائي بطيء وثابت وسلس تمامًا عبر المشهد' : 'a slow, steady, and perfectly smooth cinematic pan across the scene',
          zoom: isArabic ? 'تقريب سينمائي بطيء فائق النعومة، سواء للداخل أو للخارج، بدون توقفات أو بدايات مفاجئة' : 'an ultra-smooth, slow cinematic zoom, either in or out, with no sudden stops or starts',
          orbit: isArabic ? 'دوران أنيق وبطيء وسلس حول الهيكل الأساسي، مع الحفاظ على سرعة ثابتة' : 'a graceful, slow, and fluid orbit around the primary structure, maintaining a consistent speed'
      };
      const speedDesc = {
          slow: isArabic ? 'بوتيرة بطيئة جدًا ومدروسة وأنيقة' : 'at a very slow, deliberate, and graceful pace',
          medium: isArabic ? 'بوتيرة طبيعية وثابتة' : 'at a natural, steady pace',
          fast: isArabic ? 'بوتيرة أسرع قليلاً وأكثر ديناميكية، مع الحفاظ على نعومة تامة' : 'at a slightly faster, more dynamic pace, while remaining perfectly smooth'
      };
      const tiltDesc = {
          none: '',
          upward: isArabic ? 'مع إمالة طفيفة للأعلى، مما يعطي إحساسًا بالفخامة' : 'with a subtle upward tilt, giving a sense of grandeur',
          downward: isArabic ? 'مع إمالة طفيفة للأسفل، كأنما تتم المراقبة من نقطة مراقبة أعلى' : 'with a subtle downward tilt, as if observing from a higher vantage point'
      };
      const videoStyleKeywords = VIDEO_STYLE_PRESETS.find(p => p.name === videoStyleName)?.keywords || '';

      let ambientDetails = '';
      if (effects) {
          const lowerCasePrompt = basePrompt.toLowerCase();
          const isInterior = ['room', 'interior', 'bedroom', 'reception', 'hall', 'غرفة', 'داخلي', 'استقبال', 'قاعة'].some(keyword => lowerCasePrompt.includes(keyword));
          const isExterior = ['house', 'villa', 'exterior', 'sky', 'pool', 'trees', 'lakeside', 'palace', 'garden', 'منزل', 'فيلا', 'خارجي', 'سماء', 'مسبح', 'أشجار', 'بحيرة', 'قصر', 'حديقة'].some(keyword => lowerCasePrompt.includes(keyword));

          if (isInterior && !isExterior) {
              ambientDetails = isArabic
                  ? `قم بتحريك المساحة الداخلية بتفاصيل دقيقة وواقعية للغاية لتعزيز الواقعية. قد تنجرف ذرات الغبار ببطء في أشعة الشمس. إذا كان هناك تلفزيون أو شاشة مرئية، فيجب أن تعرض محتوى متوهجًا بهدوء ومتغيرًا ببطء. إذا كان هناك شخص، فيجب أن يقوم بعمل خلفي بسيط وبطيء وطبيعي، مثل قلب صفحة أو المشي بلطف، مع التأكد من أنه ليس التركيز الأساسي. يجب أن تظل جميع العناصر المعمارية مثل الجدران والأثاث ثابتة تمامًا.`
                  : `Animate the interior space with extremely subtle and realistic details to enhance realism. Dust motes might drift lazily in sunbeams. If a television or screen is visible, it should display softly glowing, slowly changing content. If a person is present, they should perform a simple, slow, natural background action, like turning a page or gently walking, ensuring they are not the primary focus. All architectural elements like walls and furniture must remain absolutely static.`;
          } else {
              ambientDetails = isArabic
                  ? `قم بتحريك العناصر المحيطة بحركة فائقة النعومة والبطء والطبيعية لخلق جو هادئ. يجب أن تنجرف السحب بوتيرة جليدية عبر السماء. يجب أن تتأرجح أوراق الشجر والنباتات بلطف كما لو كانت في نسيم خفيف. إذا كان هناك أشخاص، فيجب أن يسيروا بوتيرة مريحة وطبيعية في الخلفية. إذا كان هناك ماء (مثل مسبح أو بحيرة)، فيجب أن يكون به تموجات لطيفة وواقعية، وليست أمواجًا كبيرة. بشكل حاسم، يجب أن تظل جميع المباني والهياكل المعمارية ثابتة تمامًا وغير متحركة.`
                  : `Animate ambient elements with extremely smooth, slow, and natural movement to create a serene atmosphere. Clouds should drift at a glacial pace across the sky. Foliage like tree leaves and plants should sway gently as if in a light breeze. If people are present, they should walk at a relaxed, natural pace in the background. If there is water (like a pool or lake), it should have gentle, realistic ripples, not large waves. Crucially, all buildings and architectural structures must remain completely static and unmoving.`;
          }
      }

      let soundDetails = '';
      if (sound) {
          const lowerCasePrompt = basePrompt.toLowerCase();
          const isInterior = ['room', 'interior', 'bedroom', 'reception', 'hall', 'غرفة', 'داخلي', 'استقبال', 'قاعة'].some(keyword => lowerCasePrompt.includes(keyword));
          const isExterior = ['house', 'villa', 'exterior', 'sky', 'pool', 'trees', 'lakeside', 'palace', 'garden', 'منزل', 'فيلا', 'خارجي', 'سماء', 'مسبح', 'أشجار', 'بحيرة', 'قصر', 'حديقة'].some(keyword => lowerCasePrompt.includes(keyword));

          if (isInterior && !isExterior) {
              soundDetails = isArabic
                  ? `يجب أن يتضمن الفيديو صوتًا واقعيًا خفيًا وعالي الجودة. قم بإنشاء نغمة غرفة داخلية مناسبة، مثل همهمة خافتة للتهوية أو أصوات مدينة بعيدة ومكتومة. يجب أن يعزز الصوت الشعور بالوجود والواقعية دون تشتيت الانتباه.`
                  : `The video must include subtle, high-quality, and realistic diegetic audio. Generate an appropriate interior room tone, such as the faint hum of ventilation or distant, muffled city sounds. The sound should enhance the feeling of presence and realism without being distracting.`;
          } else {
              soundDetails = isArabic
                  ? `يجب أن يتضمن الفيديو صوتًا واقعيًا خفيًا وعالي الجودة. بناءً على المشهد، قم بإنشاء أصوات محيطة مناسبة مثل حفيف أوراق الشجر اللطيف، أو طيور بعيدة، أو نسيم ناعم، أو تلاطم المياه اللطيف. يجب أن يكون الصوت طبيعيًا وغامرًا، مما يعزز الجو العام.`
                  : `The video must include subtle, high-quality, and realistic diegetic audio. Based on the scene, generate appropriate ambient sounds like the gentle rustling of leaves, distant birds, a soft breeze, or the gentle lapping of water. The sound should be natural and immersive, enhancing the atmosphere.`;
          }
      }

      const styleInstruction = videoStyleKeywords ? (isArabic ? `يجب أن يكون للفيديو النمط التالي: ${videoStyleKeywords}.` : `The video should have the following style: ${videoStyleKeywords}.`) : '';
      const focusInstruction = focusSubject.trim() ? (isArabic ? `يجب أن يكون موضوع التركيز الأساسي لحركة الكاميرا هو "${focusSubject}". تأكد من إبراز هذا الموضوع بأناقة.` : `The primary subject of focus for the camera movement should be "${focusSubject}". Ensure this subject is highlighted gracefully.`) : '';
      const customInstruction = instruction.trim() ? (isArabic ? `قم بتضمين هذه التعليمات المحددة من المستخدم للتحريك: "${instruction}".` : `Incorporate these specific user instructions for the animation: "${instruction}".`) : '';

      const mainInstruction = isArabic
          ? `قم بإنشاء فيديو تحريك واقعي وعالي الدقة بناءً على الصورة المقدمة، بطول تقريبي ${lengthDesc[length]}. ${styleInstruction} يجب أن تكون حركة الكاميرا ${movementDesc[movement]}، تتحرك ${speedDesc[speed]} ${tiltDesc[tilt]}. أعط الأولوية للنعومة والسلاسة المطلقة في كل حركة؛ يجب أن تكون كل حركة للكاميرا خالية تمامًا من أي تغييرات مزعجة أو مفاجئة أو غير طبيعية في السرعة أو الاتجاه. ${focusInstruction} ${ambientDetails} ${soundDetails} ${customInstruction} يجب أن يكون الإخراج النهائي فيديو سلسًا وأنيقًا وبجودة احترافية. النص المعماري الأصلي للسياق: ${basePrompt}`
          : `Generate a high-fidelity, photorealistic video animation based on the provided image, approximately ${lengthDesc[length]} long. ${styleInstruction} The camera movement should be ${movementDesc[movement]}, moving ${speedDesc[speed]} ${tiltDesc[tilt]}. Prioritize absolute smoothness and fluidity in all motion; all camera motion must be completely free of any jarring, sudden, or unnatural changes in speed or direction. ${focusInstruction} ${ambientDetails} ${soundDetails} ${customInstruction} The final output must be a seamless, graceful, and professional-quality video. Original architectural prompt for context: ${basePrompt}`;

      return mainInstruction;
  };

  const handleGenerateRender = async () => {
    if (!sketchImage) {
      setError('Please upload a sketch image.');
      return;
    }
    if (!prompt) {
        setError('Please provide a descriptive prompt.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedImageUrl(null);
    setGeneratedImageUrls([]);
    setGeneratedVideoUrl(null);
    setVideoError(null);
    setShowAnimatePrompt(false);

    try {
      const stylePrefix = STYLE_PROMPT_PREFIXES[renderStyle]?.[language] || '';
      const finalPrompt = `${stylePrefix} ${prompt}`;
      
      const generationPromises = Array.from({ length: numberOfVariations }).map(() => 
        generateRealisticScene(sketchImage, referenceImage, finalPrompt)
      );
      
      const imageUrls = await Promise.all(generationPromises);

      setGeneratedImageUrls(imageUrls);
      if (imageUrls.length > 0) {
        const firstImageUrl = imageUrls[0];
        setSelectedImageUrl(firstImageUrl);

        const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            type: 'image',
            prompt: prompt,
            style: renderStyle,
            imageUrl: firstImageUrl,
            outputUrl: firstImageUrl,
            timestamp: Date.now(),
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, MAX_HISTORY_ITEMS));
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred during image generation.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateVideoPrompt = async () => {
    if (!selectedImageUrl || !prompt) {
      setVideoError("Cannot generate a video prompt without a rendered image and original prompt.");
      return;
    }
    setIsGeneratingVideoPrompt(true);
    setVideoError(null);
    try {
      const [header, base64Data] = selectedImageUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1];
      if (!base64Data || !mimeType) throw new Error("Invalid generated image format.");

      const generatedInstruction = await generateVideoPrompt(base64Data, mimeType, prompt, language);
      setAnimationInstruction(generatedInstruction);

    } catch (e) {
      if (e instanceof Error) {
          setVideoError(e.message);
      } else {
          setVideoError('An unexpected error occurred while generating the video prompt.');
      }
    } finally {
      setIsGeneratingVideoPrompt(false);
    }
  };

  const handleGenerateVideo = async (
    length: 'short' | 'medium' | 'long',
    movement: 'pan' | 'zoom' | 'orbit',
    effects: boolean,
    instruction: string,
    sound: boolean,
    videoStyleName: string,
    speed: 'slow' | 'medium' | 'fast',
    tilt: 'none' | 'upward' | 'downward',
    focusSubject: string
  ) => {
    if (!selectedImageUrl || !prompt) {
        setVideoError("Cannot generate video without a rendered image and a prompt.");
        return;
    }
    setIsVideoLoading(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);
    try {
        const [header, base64Data] = selectedImageUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        if (!base64Data || !mimeType) throw new Error("Invalid generated image format.");
        
        const videoPrompt = createVideoPromptString(prompt, length, movement, effects, instruction, sound, videoStyleName, speed, tilt, focusSubject, language);
        
        const videoUrl = await generateAnimationVideo(base64Data, mimeType, videoPrompt);
        setGeneratedVideoUrl(videoUrl);

        const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            type: 'video',
            prompt: prompt,
            style: renderStyle,
            imageUrl: selectedImageUrl,
            outputUrl: videoUrl,
            timestamp: Date.now(),
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, MAX_HISTORY_ITEMS));

    } catch (e) {
        if (e instanceof Error) {
            if (e.message.includes('RESOURCE_EXHAUSTED')) {
                setShowQuotaErrorModal(true);
                setVideoError("You have exceeded the available API quota for video generation.");
            } else {
                setVideoError(e.message);
            }
        } else {
            setVideoError('An unexpected error occurred while generating the video.');
        }
    } finally {
        setIsVideoLoading(false);
    }
  };

  const handleConfirmAnimate = () => {
    setShowAnimatePrompt(false);
    handleGenerateVideo(animationLength, cameraMovement, ambientEffects, animationInstruction, ambientSound, videoStyle, cameraSpeed, cameraTilt, subjectOfFocus);
  }

  const handleCancelAnimate = () => {
      setShowAnimatePrompt(false);
  }

  const anyLoading = isLoading || isPromptLoading || isRefiningPrompt;
  const isGenerateDisabled = !sketchImage || !prompt || anyLoading;
  const isAnimationModalLoading = isVideoLoading || isGeneratingVideoPrompt;

  const getButtonText = () => {
      if (isLoading) return t('generating_scene');
      return t('generate_render_animation');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            <ImageUploader 
              onSketchUpload={handleImageUpload} 
              sketchPreviewUrl={sketchPreviewUrl}
              onClearSketch={handleClearSketch}
              onReferenceUpload={handleReferenceUpload}
              referencePreviewUrl={referencePreviewUrl}
              onClearReference={handleClearReference}
            />
            <StyleSelector 
              selectedStyle={renderStyle} 
              setSelectedStyle={setRenderStyle} 
              isLoading={anyLoading} 
              numberOfVariations={numberOfVariations}
              setNumberOfVariations={setNumberOfVariations}
            />
            <PromptEditor 
              prompt={prompt} 
              setPrompt={setPrompt} 
              isLoading={anyLoading}
              isSketchUploaded={!!sketchImage}
              isPromptLoading={isPromptLoading}
              onGeneratePrompt={handleGeneratePrompt}
              refinementInstruction={refinementInstruction}
              setRefinementInstruction={setRefinementInstruction}
              isRefiningPrompt={isRefiningPrompt}
              onRefinePrompt={handleRefinePrompt}
            />
            <div>
              <button
                onClick={handleGenerateRender}
                disabled={isGenerateDisabled}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:transform-none"
              >
                <WandIcon className="w-6 h-6" />
                <span>{getButtonText()}</span>
              </button>
               {error && !isLoading && !isPromptLoading && !isRefiningPrompt && <p className="text-red-500 dark:text-red-400 mt-4 text-center">{error}</p>}
            </div>
          </div>

          <div className="lg:sticky lg:top-8 flex flex-col gap-4">
            <ResultDisplay
              sketchImage={sketchImage}
              sketchPreviewUrl={sketchPreviewUrl}
              selectedImageUrl={selectedImageUrl}
              generatedImageUrls={generatedImageUrls}
              onSelectImage={setSelectedImageUrl}
              isLoading={isLoading}
              error={error}
              generatedVideoUrl={generatedVideoUrl}
              isVideoLoading={isVideoLoading}
              videoError={videoError}
              onAnimateClick={() => setShowAnimatePrompt(true)}
            />
          </div>
        </div>
        <ThreeDModelGenerator />
      </main>

      <History history={history} />

      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-200 dark:border-gray-800 mt-2">
        <p>{t('footer_text')}</p>
      </footer>
      
      {showQuotaErrorModal && (
        <ErrorModal onClose={() => setShowQuotaErrorModal(false)} />
      )}

      {showAnimatePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full transform transition-all animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-purple-600/20 rounded-full">
                       <FilmIcon className="w-10 h-10 text-purple-400" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t('animate_modal_title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">{t('animate_modal_description')}</p>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <OptionGroup 
                            label={t('animation_length')}
                            options={[
                                { value: 'short', label: t('animation_length_short') },
                                { value: 'medium', label: t('animation_length_medium') },
                                { value: 'long', label: t('animation_length_long') },
                            ]}
                            selected={animationLength}
                            onChange={(v) => setAnimationLength(v as any)}
                            disabled={isAnimationModalLoading}
                        />
                        <OptionGroup 
                            label={t('animation_style')}
                            options={VIDEO_STYLE_PRESETS.map(p => ({ value: p.name, label: p.name }))}
                            selected={videoStyle}
                            onChange={(v) => setVideoStyle(v)}
                            disabled={isAnimationModalLoading}
                        />
                         <OptionGroup 
                            label={t('camera_movement')}
                            options={[
                                { value: 'pan', label: t('camera_movement_pan') },
                                { value: 'zoom', label: t('camera_movement_zoom') },
                                { value: 'orbit', label: t('camera_movement_orbit') },
                            ]}
                            selected={cameraMovement}
                            onChange={(v) => setCameraMovement(v as any)}
                            disabled={isAnimationModalLoading}
                        />
                        <OptionGroup 
                            label={t('camera_speed')}
                            options={ANIMATION_CAMERA_SPEEDS.map(s => ({ value: s, label: t(`camera_speed_${s}` as any) }))}
                            selected={cameraSpeed}
                            onChange={(v) => setCameraSpeed(v as any)}
                            disabled={isAnimationModalLoading}
                        />
                        <OptionGroup 
                            label={t('camera_tilt')}
                            // Fix: Rename map parameter from `t` to `tilt` to avoid shadowing the translation function `t`.
                            options={ANIMATION_CAMERA_TILTS.map(tilt => ({ value: tilt, label: t(`camera_tilt_${tilt}` as any) }))}
                            selected={cameraTilt}
                            onChange={(v) => setCameraTilt(v as any)}
                            disabled={isAnimationModalLoading}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                          <label htmlFor="ambient-effects" className="text-md font-semibold text-gray-700 dark:text-gray-300">{t('ambient_effects')}</label>
                          <button
                              id="ambient-effects"
                              role="switch"
                              aria-checked={ambientEffects}
                              onClick={() => setAmbientEffects(!ambientEffects)}
                              disabled={isAnimationModalLoading}
                              className={`${ambientEffects ? 'bg-purple-600' : 'bg-gray-400 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                              <span className={`${ambientEffects ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                          </button>
                      </div>
                      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                          <label htmlFor="ambient-sound" className="text-md font-semibold text-gray-700 dark:text-gray-300">{t('ambient_sound')}</label>
                          <button
                              id="ambient-sound"
                              role="switch"
                              aria-checked={ambientSound}
                              onClick={() => setAmbientSound(!ambientSound)}
                              disabled={isAnimationModalLoading}
                              className={`${ambientSound ? 'bg-purple-600' : 'bg-gray-400 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                              <span className={`${ambientSound ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                          </button>
                      </div>
                    </div>
                     <div className="text-left w-full">
                        <label htmlFor="subject-of-focus" className="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('subject_of_focus')}</label>
                        <input
                            id="subject-of-focus"
                            type="text"
                            value={subjectOfFocus}
                            onChange={(e) => setSubjectOfFocus(e.target.value)}
                            placeholder={t('subject_of_focus_placeholder')}
                            className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-gray-800 dark:text-gray-200"
                            disabled={isAnimationModalLoading}
                        />
                    </div>
                    <div className="text-left w-full">
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="animation-instruction" className="block text-md font-semibold text-gray-700 dark:text-gray-300">{t('extra_instructions')}</label>
                            <button
                                onClick={handleGenerateVideoPrompt}
                                disabled={isAnimationModalLoading}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                                title={t('generate_with_ai')}
                            >
                                <WandIcon className={`w-4 h-4 ${isGeneratingVideoPrompt ? 'animate-spin' : ''}`} />
                                <span>{isGeneratingVideoPrompt ? t('generating') : t('generate_with_ai')}</span>
                            </button>
                        </div>
                        <textarea
                            id="animation-instruction"
                            value={animationInstruction}
                            onChange={(e) => setAnimationInstruction(e.target.value)}
                            placeholder={t('extra_instructions_placeholder')}
                            className="w-full h-24 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-gray-800 dark:text-gray-200 resize-y"
                            disabled={isAnimationModalLoading}
                        />
                        {videoError && !showQuotaErrorModal && <p className="text-red-500 dark:text-red-400 mt-2 text-xs">{videoError}</p>}
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={handleCancelAnimate}
                        className="px-8 py-3 text-md font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t('not_now')}
                    </button>
                    <button
                        onClick={handleConfirmAnimate}
                        disabled={isAnimationModalLoading}
                        className="px-8 py-3 text-md font-bold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700 transition-colors disabled:bg-purple-600/50 disabled:cursor-not-allowed"
                    >
                        {isVideoLoading ? t('animating') : t('animate_scene')}
                    </button>
                </div>
            </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
};

export default App;
