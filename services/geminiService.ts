import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../contexts/LanguageContext";
import { ModelViews } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as base64 string."));
      }
    };
    reader.onerror = (error) => {
        reject(error);
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generatePromptFromSketch = async (sketchFile: File, referenceFile: File | null, language: Language): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const sketchPart = await fileToGenerativePart(sketchFile);
    // FIX: Explicitly type `parts` to allow both image and text parts.
    const parts: ({ inlineData: { data: string; mimeType: string; } } | { text: string })[] = [sketchPart];
    
    let textInstruction: string;

    if (referenceFile) {
        const referencePart = await fileToGenerativePart(referenceFile);
        parts.push(referencePart);
        textInstruction = language === 'ar'
        ? `أنت خبير في التصور المعماري. مهمتك هي دمج صورتين - رسم معماري وصورة مرجعية للنمط - في نص وصفي واحد وقوي لنموذج ذكاء اصطناعي لتوليد الصور.

١. **حلل الرسم المعماري:** أولاً، حدد بدقة العناصر المعمارية الأساسية من الرسم: شكل المبنى، هيكله، مخططه، مواضع النوافذ والأبواب، نوع السقف، والميزات الرئيسية. هذا هو المخطط الهيكلي.

٢. **حلل الصورة المرجعية لاستخلاص روحها:** هذه هي الخطوة الأكثر أهمية. تجاوز الوصف السطحي. يجب عليك تفسير *جوهر* و*أجواء* الصورة المرجعية بعمق. حدد:
    *   **الحالة المزاجية (Mood):** هل هي هادئة، درامية، دافئة، بسيطة، فخمة، غامضة؟
    *   **الإضاءة:** صف جودتها (ناعمة، قاسية، منتشرة)، لونها (دافئة، باردة، ذهبية)، واتجاهها. هل هو غروب الشمس؟ منتصف النهار؟ هل هي إضاءة سينمائية درامية؟
    *   **لوحة الألوان:** ما هي الألوان السائدة والبارزة؟ هل هي ترابية، أحادية اللون، زاهية، باهتة؟
    *   **الخامات والملامس:** كيف تبدو الأسطح؟ حدد الملامس الرئيسية مثل الخرسانة المصقولة الملساء، الحجر الخام، الزجاج اللامع، التشطيبات المطفأة، حبيبات الخشب الدافئة.
    *   **البيئة المحيطة:** كيف تساهم المناظر الطبيعية المحيطة في الشعور العام؟ (مثل: مساحات خضراء مورقة، صحراء قاحلة، سياق حضري كثيف).

٣. **ادمج وأنشئ النص:** الآن، اجمع تحليلاتك. اكتب فقرة واحدة متماسكة وغنية بالتفاصيل. يجب أن يصف النص النهائي المبنى من **الرسم المعماري** ولكن كما لو تم التقاطه من خلال عدسة **الصورة المرجعية**. ادمج الوصف المعماري مع الحالة المزاجية، الإضاءة، لوحة الألوان، والملامس التي استخلصتها من المرجع. الهدف هو إنشاء نص لا يجمع الميزات فحسب، بل يدمج هيكل الأول مع روح الثاني.`
        : `You are an expert architectural visualizer. Your task is to synthesize two images—an architectural sketch and a style reference photo—into a single, powerful descriptive prompt for an image generation AI.

1.  **Analyze the Sketch:** First, meticulously identify the core architectural elements from the sketch: the building's form, structure, layout, window/door placements, roof type, and key features. This is the structural blueprint.

2.  **Analyze the Reference Photo for its Soul:** This is the most critical step. Go beyond just a surface-level description. You must deeply interpret the *essence* and *atmosphere* of the reference photo. Identify:
    *   **The Mood:** Is it serene, dramatic, cozy, minimalist, opulent, mysterious?
    *   **The Lighting:** Describe its quality (soft, harsh, diffused), its color (warm, cool, golden), and its direction. Is it sunset? Midday? Is it dramatic cinematic lighting?
    *   **The Color Palette:** What are the dominant and accent colors? Are they earthy, monochromatic, vibrant, muted?
    *   **The Materiality & Textures:** What do the surfaces feel like? Identify key textures like smooth polished concrete, rough-hewn stone, gleaming glass, matte finishes, warm wood grains.
    *   **The Environment:** What does the surrounding landscape contribute to the feeling? (e.g., lush greenery, arid desert, dense urban context).

3.  **Synthesize and Generate:** Now, combine your analyses. Write a single, coherent, richly detailed paragraph. The final prompt must describe the building from the **sketch** but as if it were captured through the lens of the **reference photo**. Infuse the architectural description with the mood, lighting, color palette, and textures you extracted from the reference. The goal is a prompt that doesn't just combine features, but merges the structure of one with the soul of the other.`;
    } else {
        textInstruction = language === 'ar' 
        ? `حلل هذا الرسم المعماري وقم بإنشاء وصف تفصيلي باللغة العربية الفصحى يمكن استخدامه لإنشاء عرض واقعي له. 
        ركز على الطراز المعماري (مثل: حديث، كلاسيكي، متوسطي)، والعناصر الهيكلية الرئيسية (مثل: نوع السقف، النوافذ، الأعمدة، الشرفات)، والمواد (مثل: الجص، الخشب، الزجاج)، 
        واقترح تنسيقًا مثاليًا للمناظر الطبيعية (مثل: الأشجار، المسبح، الحديقة)، وإضاءة وجوًا مثاليًا (مثل: غروب الشمس، ضوء النهار الساطع، إضاءة درامية). 
        يجب أن يكون النص فقرة واحدة متماسكة ومناسبة لنموذج ذكاء اصطناعي لتوليد الصور.`
        : `Analyze this architectural sketch and generate a detailed, descriptive prompt that could be used to create a photorealistic render of it. 
        Focus on architectural style (e.g., modern, classical, Mediterranean), key structural elements (e.g., roof type, windows, columns, terraces), materials (e.g., stucco, wood, glass), 
        potential landscaping (e.g., trees, pool, garden), and suggest an ideal lighting and atmosphere (e.g., sunset, bright daylight, dramatic). 
        The prompt should be a single, coherent paragraph suitable for an image generation AI.`;
    }

    parts.push({ text: textInstruction });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: parts },
        });

        const promptText = response.text;
        if (!promptText) {
            throw new Error("AI did not return a valid prompt.");
        }
        return promptText;
    } catch (error) {
        console.error("Error calling Gemini API for prompt generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate prompt: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the prompt.");
    }
};

export const refinePrompt = async (
  sketchFile: File,
  referenceFile: File | null,
  currentPrompt: string,
  refinementInstruction: string,
  language: Language
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const sketchPart = await fileToGenerativePart(sketchFile);
  // FIX: Explicitly type `parts` to allow both image and text parts.
  const parts: ({ inlineData: { data: string; mimeType: string; } } | { text: string })[] = [sketchPart];
  
  let textInstruction: string;
  
  if (referenceFile) {
    const referencePart = await fileToGenerativePart(referenceFile);
    parts.push(referencePart);
    textInstruction = language === 'ar'
    ? `أنت مساعد ذكاء اصطناعي خبير متخصص في التصور المعماري. مهمتك هي مساعدة مستخدم على تحسين نص وصفي لإنشاء عرض واقعي.

قدم المستخدم أربع معلومات رئيسية:
١. رسم معماري (صورة).
٢. صورة مرجعية للنمط والمزاج.
٣. النص الوصفي الحالي.
٤. تعليمة محددة للتحسين.

هدفك هو إعادة كتابة النص الحالي وتحسينه بذكاء من خلال دمج تعليمة التحسين من المستخدم. يجب أن يكون النص الجديد:
- وصفًا دقيقًا ومخلصًا لهيكل الرسم المعماري ونمط الصورة المرجعية.
- يدمج طلب المستخدم بسلاسة.
- فقرة واحدة متماسكة وغنية بالتفاصيل.

**النص الحالي:**
"${currentPrompt}"

**تعليمة التحسين من المستخدم:**
"${refinementInstruction}"

أنشئ فقط نص الوصف الجديد والمحسن أدناه. لا تقم بتضمين أي عناوين أو مقدمات أو شروحات.`
    : `You are an expert AI assistant specializing in architectural visualization. Your task is to help a user refine a descriptive prompt for creating a photorealistic rendering.

The user has provided four key pieces of information:
1.  An architectural sketch (as an image).
2.  A reference photo for style and mood.
3.  The current descriptive prompt.
4.  A specific instruction for refinement.

Your goal is to intelligently rewrite and enhance the current prompt by incorporating the user's refinement instruction. The new prompt must:
-   Remain a faithful and accurate description of the original architectural sketch's structure and the reference photo's style.
-   Seamlessly integrate the user's request.
-   Be a single, coherent, and richly detailed paragraph.

**Current Prompt:**
"${currentPrompt}"

**User's Refinement Instruction:**
"${refinementInstruction}"

Generate only the new, refined prompt text below. Do not include any titles, preambles, or explanations.`;
  } else {
    textInstruction = language === 'ar'
    ? `أنت مساعد ذكاء اصطناعي خبير متخصص في التصور المعماري. مهمتك هي مساعدة مستخدم على تحسين نص وصفي لإنشاء عرض واقعي من رسم معماري.

قدم المستخدم ثلاث معلومات رئيسية:
١. رسم معماري (صورة).
٢. النص الوصفي الحالي.
٣. تعليمة محددة للتحسين.

هدفك هو إعادة كتابة النص الحالي وتحسينه بذكاء من خلال دمج تعليمة التحسين من المستخدم. يجب أن يكون النص الجديد:
- وصفًا دقيقًا ومخلصًا للرسم المعماري الأصلي.
- يدمج طلب المستخدم بسلاسة. على سبيل المثال، إذا كانت التعليمة "أضف حديقة"، فيجب عليك وصف حديقة تكمل طراز المبنى في الرسم.
- فقرة واحدة متماسكة وغنية بالتفاصيل.

**النص الحالي:**
"${currentPrompt}"

**تعليمة التحسين من المستخدم:**
"${refinementInstruction}"

أنشئ فقط نص الوصف الجديد والمحسن أدناه. لا تقم بتضمين أي عناوين أو مقدمات أو شروحات.`
    : `You are an expert AI assistant specializing in architectural visualization. Your task is to help a user refine a descriptive prompt for creating a photorealistic rendering from an architectural sketch.

The user has provided three key pieces of information:
1.  An architectural sketch (as an image).
2.  The current descriptive prompt.
3.  A specific instruction for refinement.

Your goal is to intelligently rewrite and enhance the current prompt by incorporating the user's refinement instruction. The new prompt must:
-   Remain a faithful and accurate description of the original architectural sketch.
-   Seamlessly integrate the user's request. For instance, if the instruction is "add a garden," you should describe a garden that complements the style of the building in the sketch.
-   Be a single, coherent, and richly detailed paragraph.

**Current Prompt:**
"${currentPrompt}"

**User's Refinement Instruction:**
"${refinementInstruction}"

Generate only the new, refined prompt text below. Do not include any titles, preambles, or explanations.`;
  }

  parts.push({ text: textInstruction });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
    });

    const refinedPromptText = response.text;
    if (!refinedPromptText) {
      throw new Error("AI did not return a valid refined prompt.");
    }
    return refinedPromptText;
  } catch (error) {
    console.error("Error calling Gemini API for prompt refinement:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to refine prompt: ${error.message}`);
    }
    throw new Error("An unknown error occurred while refining the prompt.");
  }
};

export const generateRealisticScene = async (sketchFile: File, referenceFile: File | null, prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const sketchPart = await fileToGenerativePart(sketchFile);
  // FIX: Explicitly type `parts` to allow both image and text parts.
  const parts: ({ inlineData: { data: string; mimeType: string; } } | { text: string })[] = [sketchPart];
  
  if(referenceFile) {
    const referencePart = await fileToGenerativePart(referenceFile);
    parts.push(referencePart);
  }
  
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        const base64ImageBytes = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }
    
    if (response.text) {
        throw new Error(`AI did not return an image. Response: ${response.text}`);
    }

    throw new Error("No image data found in the AI response.");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
};

export const generateAnimationVideo = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: {
                imageBytes: base64Image,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (operation.error) {
            const errorMessage = `Video generation failed: ${operation.error.message || 'Unknown API error'}`;
            console.error("Gemini Video Operation Error:", operation.error);
            throw new Error(errorMessage);
        }

        if (!downloadLink) {
            const errorMessage = "Video generation completed, but no download link was provided. This could be due to a content policy violation or an internal error.";
            console.error("Gemini Video Operation Error:", "No download link provided after successful operation.", operation);
            throw new Error(errorMessage);
        }

        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        
        if (!videoResponse.ok) {
            const errorBody = await videoResponse.text();
            console.error("Failed to download video:", errorBody);
            if (errorBody.includes('RESOURCE_EXHAUSTED')) {
                throw new Error('RESOURCE_EXHAUSTED');
            }
            throw new Error(`Failed to download video. Status: ${videoResponse.statusText}`);
        }
        
        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        return videoUrl;

    } catch (error) {
        console.error("Error calling Gemini Video API:", error);
        if (error instanceof Error) {
            if (error.message.includes('RESOURCE_EXHAUSTED')) {
                throw new Error('RESOURCE_EXHAUSTED');
            }
            throw new Error(`Failed to generate video: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the video.");
    }
};

export const generateVideoPrompt = async (base64Image: string, mimeType: string, imagePrompt: string, language: Language): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = {
        inlineData: { data: base64Image, mimeType: mimeType },
    };

    const textInstruction = language === 'ar'
    ? `بناءً على الصورة المقدمة لمشهد معماري والنص الوصفي الأصلي، قم بإنشاء تعليمة إبداعية وموجزة باللغة العربية الفصحى لتحريك فيديو قصير (3-5 ثوانٍ).
    سيتم إعطاء هذه التعليمة إلى ذكاء اصطناعي آخر لإنشاء الفيديو.
    
    يجب أن تصف التعليمة حركة كاميرا واحدة ومستمرة وسلسة (مثل المسح البانورامي، أو الزووم، أو الدوران) ويمكن أن تتضمن أيضًا تحريكات محيطية دقيقة لإضفاء الحيوية على المشهد.
    يجب أن يكون الأسلوب سينمائيًا واحترافيًا.
    
    **النص الأصلي للصورة للسياق:** "${imagePrompt}"

    **أمثلة على التعليمات:**
    - "مسح سينمائي بطيء من اليسار إلى اليمين، يكشف عن الامتداد الكامل للفيلا. مياه المسبح بها تموجات لطيفة."
    - "زووم بطيء فائق النعومة نحو المدخل الرئيسي، بينما تتأرجح أوراق الأشجار قليلاً في نسيم عليل."
    - "دوران أنيق حول البرج المركزي، مع سحب تنجرف ببطء في السماء."
    - "شخص يمشي ببطء من اليسار إلى اليمين في الخلفية، خارج نطاق التركيز."

    الآن، قم بإنشاء تعليمة جديدة للصورة المقدمة. كن مبدعًا. أخرج نص التعليمة فقط، دون أي مقدمات أو تسميات.`
    : `Based on the provided image of an architectural scene and its original descriptive prompt, generate a creative and concise instruction for a short video animation (3-5 seconds).
    This instruction will be given to another AI to generate the video.
    
    The instruction should describe a single, continuous, and smooth camera movement (like a pan, zoom, or orbit) and can also include subtle ambient animations to bring the scene to life.
    The tone should be cinematic and professional.
    
    **Original Image Prompt for context:** "${imagePrompt}"

    **Example Instructions:**
    - "A slow, cinematic pan from left to right, revealing the full expanse of the villa. The water in the pool has gentle ripples."
    - "An ultra-smooth, slow zoom into the main entrance, while leaves on the trees sway slightly in a soft breeze."
    - "A graceful orbit around the central tower, with clouds drifting slowly in the sky."
    - "A person walks slowly from left to right in the background, out of focus."

    Now, generate a new instruction for the provided image. Be creative. Output only the instruction text itself, without any preamble or labels.`;


    const textPart = { text: textInstruction };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const videoPromptText = response.text;
        if (!videoPromptText) {
            throw new Error("AI did not return a valid video prompt instruction.");
        }
        return videoPromptText.trim();
    } catch (error) {
        console.error("Error calling Gemini API for video prompt generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate video prompt: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the video prompt.");
    }
};

export const generateArchitecturalReport = async (sketchFile: File, generatedImageDataUrl: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const [header, base64Data] = generatedImageDataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!base64Data || !mimeType) {
        throw new Error("Invalid generated image data URL.");
    }

    const sketchPart = await fileToGenerativePart(sketchFile);
    const renderPart = {
        inlineData: { data: base64Data, mimeType: mimeType },
    };

    const textInstruction = `
    Analyze the provided architectural sketch (Image 1) and the final photorealistic render (Image 2). Your task is to generate a detailed, structured Architectural Documentation Report based on these images.

    **OUTPUT RULES:**
    1.  The entire report MUST be in Classical Arabic (العربية الفصحى).
    2.  The output must be formatted in Markdown.
    3.  The report MUST be divided into exactly two sections, using the specified Arabic headers.

    **SECTION 1: Material Specifications**
    - The header for this section must be: "### تصنيف الخامات (Material Specifications)"
    - Identify the primary finishing materials visible in the photorealistic render (Image 2).
    - Classify the material for each of the following surfaces: Façade (الواجهة), Roofing (الأسقف), Flooring (الأرضيات), Interior Walls (الجدران الداخلية), and Windows (النوافذ).
    - Suggest a specific type or finish for each material.
    - Format this section as a Markdown table with two columns: "السطح" (Surface) and "المادة المقترحة" (Suggested Material).

    **SECTION 2: Internal Dimensions**
    - The header for this section must be: "### الأبعاد الداخلية (Internal Dimensions)"
    - Estimate the internal dimensions (Width, Length, and Ceiling Height) of the main visible spaces.
    - All dimensions MUST be provided strictly in centimeters (سم), and must be numbers only.
    - Format this section as a Markdown table with four columns: "الفراغ" (Space), "العرض (سم)" (Width cm), "الطول (سم)" (Length cm), and "ارتفاع السقف (سم)" (Ceiling Height cm).

    Generate ONLY the Markdown report as specified. Do not include any introductory text, explanations, or concluding remarks outside of the specified format.
    `;

    const parts = [sketchPart, renderPart, { text: textInstruction }];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: parts },
        });

        const reportText = response.text;
        if (!reportText) {
            throw new Error("AI did not return a valid report.");
        }
        return reportText;
    } catch (error) {
        console.error("Error calling Gemini API for architectural report generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate report: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the report.");
    }
};

export const generateElevationSketch = async (generatedImageDataUrl: string): Promise<{ front: string; left: string; top: string; }> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const [header, base64Data] = generatedImageDataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!base64Data || !mimeType) {
        throw new Error("Invalid generated image data URL.");
    }

    const renderPart = {
        inlineData: { data: base64Data, mimeType: mimeType },
    };

    const createPrompt = (view: 'Front' | 'Left' | 'Top') => `
    Analyze the provided architectural render. Your task is to convert it into a clean, technical elevation sketch of the ${view} view.

    **OUTPUT RULES:**
    1.  The output MUST be a valid, self-contained SVG file's code.
    2.  Use only black strokes (#000000) with a stroke width of 1.
    3.  The SVG MUST have a transparent background. Do not include any <rect> or other shapes for the background.
    4.  Do NOT include any fills, colors, shading, textures, or gradients.
    5.  The linework must be precise, geometric, and follow architectural drafting standards. Simplify complex organic shapes (like trees) into representative outlines.
    6.  Ensure the proportions and key architectural features are accurately represented.
    7.  Output ONLY the SVG code, starting with "<svg" and ending with "</svg>".
    8.  Do not include any other text, explanations, or markdown formatting like \`\`\`svg.
    `;

    const views: ('Front' | 'Left' | 'Top')[] = ['Front', 'Left', 'Top'];

    const promises = views.map(view => {
        const textInstruction = createPrompt(view);
        const parts = [renderPart, { text: textInstruction }];
        return ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: parts },
        });
    });

    try {
        const responses = await Promise.all(promises);

        const sketches: { front: string; left: string; top: string; } = {
            front: '',
            left: '',
            top: '',
        };

        responses.forEach((response, index) => {
            const svgCode = response.text?.trim();
            // A simple validation to check if the response looks like an SVG.
            if (!svgCode || !svgCode.toLowerCase().startsWith('<svg') || !svgCode.toLowerCase().endsWith('</svg>')) {
                console.error(`Invalid SVG response for ${views[index]} view:`, svgCode);
                throw new Error(`AI did not return valid SVG code for the ${views[index]} view. The response might be a safety rejection or an unexpected format.`);
            }
            const viewKey = views[index].toLowerCase() as 'front' | 'left' | 'top';
            sketches[viewKey] = svgCode;
        });

        return sketches;
    } catch (error) {
        console.error("Error calling Gemini API for elevation sketch generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate elevation sketches: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the elevation sketches.");
    }
};

export const generateTechnicalDrawing = async (generatedImageDataUrl: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const [header, base64Data] = generatedImageDataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!base64Data || !mimeType) {
        throw new Error("Invalid generated image data URL.");
    }

    const renderPart = {
        inlineData: { data: base64Data, mimeType: mimeType },
    };

    const textInstruction = `
    Analyze the provided architectural render. Your task is to convert it into a professional, technical front elevation drawing.

    **OUTPUT RULES:**
    1.  The output MUST be a single, valid, self-contained SVG file's code.
    2.  Start the output with "<svg" and end it with "</svg>". Do not include any other text, explanations, or markdown formatting.
    3.  The SVG MUST have a transparent background.
    4.  All geometry MUST be vector paths. Use only black strokes (#000000). Do not use any fills, colors, or gradients.

    **SCALE & DIMENSIONS:**
    1.  Assume a standard exterior door height is 210cm. Use this as a reference to calibrate the scale of the entire drawing.
    2.  Add clear, accurate dimension lines for the overall width, overall height, and the positions and sizes of major openings (windows and doors).
    3.  Place dimension text (in cm, without units, e.g., "90") above the dimension lines.
    4.  All dimensions must be placed within a dedicated layer.

    **LAYERS & LINEWEIGHTS:**
    1.  Structure the SVG using <g> elements with specific 'id' attributes to act as layers. The required layers are: 'WALLS', 'WINDOWS', 'DOORS', 'DIMENSIONS'.
    2.  Place all primary structural outlines inside \`<g id="WALLS">\`. Use a stroke-width of "2".
    3.  Place all window elements inside \`<g id="WINDOWS">\`. Use a stroke-width of "1".
    4.  Place all door elements inside \`<g id="DOORS">\`. Use a stroke-width of "1".
    5.  Place all dimension lines and text inside \`<g id="DIMENSIONS">\`. Use a stroke-width of "0.5" and a font-size of "10px".

    **LEGEND:**
    1.  Do not include a legend or any extra text. Focus only on the drawing and dimensions as specified.

    The final output should be a clean, precise, and well-structured SVG that could be imported into CAD or vector illustration software.
    `;

    const parts = [renderPart, { text: textInstruction }];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: parts },
        });

        const svgCode = response.text?.trim();
        if (!svgCode || !svgCode.toLowerCase().startsWith('<svg') || !svgCode.toLowerCase().endsWith('</svg>')) {
            console.error("Invalid SVG response for technical drawing:", svgCode);
            throw new Error("AI did not return valid SVG code for the technical drawing. The response might be a safety rejection or an unexpected format.");
        }

        return svgCode;
    } catch (error) {
        console.error("Error calling Gemini API for technical drawing generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate technical drawing: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the technical drawing.");
    }
};

export const generate3DModelViews = async (objectFile: File): Promise<ModelViews> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const objectPart = await fileToGenerativePart(objectFile);

    const views = [
        { key: 'front', name: 'Front' },
        { key: 'leftSide', name: 'Left Side' },
        { key: 'rightSide', name: 'Right Side' },
        { key: 'back', name: 'Back' },
        { key: 'top', name: 'Top' },
        { key: 'isometric', name: 'Isometric' },
    ];

    const createPrompt = (view: string) => `Analyze the provided image of a single object. Your task is to generate a clean, photorealistic render of this object from a specific viewpoint.

**RULES:**
1.  The object MUST be perfectly centered in the image.
2.  The background MUST be a plain, neutral, light-grey color (#d3d3d3). Do not add any other background elements, shadows on the ground, or reflections.
3.  The lighting MUST be even, diffuse, and studio-like, illuminating the object clearly from all sides without creating harsh shadows on the object itself.
4.  Faithfully reconstruct the object's geometry and texture based on the single image provided. Invent details for sides that are not visible if necessary, keeping them consistent with the visible style.
5.  The output must ONLY be the image. Do not add any text.

Generate the **${view}** view of the object.`;

    try {
        const generationPromises = views.map(view => {
            const textInstruction = createPrompt(view.name);
            const parts = [objectPart, { text: textInstruction }];

            return ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: parts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
        });

        const responses = await Promise.all(generationPromises);

        const generatedViews: ModelViews = {};

        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            const viewKey = views[i].key;
            let imageFound = false;

            for (const part of response.candidates?.[0]?.content?.parts ?? []) {
                if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                    const base64ImageBytes = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    generatedViews[viewKey] = `data:${mimeType};base64,${base64ImageBytes}`;
                    imageFound = true;
                    break; 
                }
            }

            if (!imageFound) {
                 if (response.text) {
                    throw new Error(`AI did not return an image for the ${views[i].name} view. Response: ${response.text}`);
                }
                throw new Error(`No image data found in the AI response for the ${views[i].name} view.`);
            }
        }

        return generatedViews;
    } catch (error) {
        console.error("Error calling Gemini API for 3D model view generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate 3D views: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating 3D views.");
    }
};
