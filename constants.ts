import { ExamplePrompt, ScenePreset, StylePreset, VideoStylePreset } from './types';

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: 'A',
    title: 'Modern Exhibition Booth',
    prompt: `A modern exhibition booth for “Ebda3 Academy”. 
The booth features smooth curved walls, a central reception desk with the logo, digital side screens, pendant lights, 
and realistic textured materials (glossy finishes, matte walls, metallic details, wooden flooring). 
Inside, add small round tables with chairs for visitors, decorative plants, and accessories for realism. 
Use cinematic dramatic lighting with spotlights highlighting the booth. 
Show people walking around the booth to create a lively exhibition atmosphere. 
In the background, include other blurred exhibition stands to give depth and scale.`
  },
  {
    id: 'B',
    title: 'Modern Two-Story House',
    prompt: `A sleek, modern two-story house, finished in pristine white (Based on attached pic). 
It features a distinctive sharply angled, sloped roof and expansive terraces. 
The building is designed with a minimalist aesthetic, utilizing smooth white stucco for the walls.
The roof features warm terracotta tiles. 
All windows and doors are crafted from elegant UPVC, with large glass panels, 
some extending floor-to-ceiling on the ground level. 
Glass railings with subtle dark accents enclose both the spacious ground-floor terrace and the smaller upper-floor balcony. 
Luxurious outdoor furniture, including contemporary lounge sets, and plush sun loungers, 
are strategically placed around the building and beside a sparkling swimming pool. 
Lush trees, vibrant flowers, and diverse greenery are meticulously landscaped all around the property. 
In the background, several similar modern, elegant houses are visible, creating a harmonious neighborhood ambiance. 
The scene is set just before sunset, casting a warm, natural, and inviting glow over the entire environment.`
  },
  {
    id: 'C',
    title: 'Neo-Classical Reception Hall',
    prompt: `An interior render of a lavish apartment reception hall (based on attached pic), designed in a sophisticated Neo-Classical style. The spacious room features rich wooden herringbone flooring and elegant wall panels with prominent classical moldings. The elaborate ceiling boasts intricate classical carvings, recessed lighting, and ornate chandeliers.
The reception is divided into three distinct zones:
A seating area by the large, curved bay window with two grand sofas and two opulent armchairs.
A refined dining area with a sophisticated dining table and chairs in the foreground.
An additional smaller, luxurious seating arrangement in the middle right area.
All windows have delicate, flowing sheer curtains. The lighting is warm and natural, with soft sunlight streaming through the windows. The space is enhanced with classical accessories and lush indoor plants.`
  },
    {
    id: 'D',
    title: 'Mediterranean Villa',
    prompt: `A luxurious Mediterranean-style villa (Based on attached pic). The two-story house is pristine white, with classic Roman columns supporting a wraparound portico. The roof features warm terracotta tiles. The balconies are adorned with intricate black wrought iron railings. The ground is paved with elegant hexagonal stones. Lush trees, colorful flowers, and vibrant green plants are meticulously landscaped around the villa. Luxurious outdoor furniture, including stylish seating arrangements, is artfully placed around the building. Plush sun lounger and cabana is arranged next to the swimming pool. In the background, similar elegant Mediterranean-style buildings are visible, adding depth to the scene. The setting is just before sunset, casting a warm, natural glow over everything. The ground appears wet, reflecting the recent rain, creating a soft, glistening effect.`
  },
  {
    id: 'E',
    title: 'Opulent Classical Palace',
    prompt: `An opulent classical palace (Based on attached pic), majestic and grand, rendered in a pristine off-white/light beige hue, emphasizing a sense of timeless luxury. The building features large, elegant arched windows and classical doors, all meticulously detailed. Elaborate classical ornamentation, intricate moldings, and decorative cornices adorn the facades, encircling windows and doors, adding exquisite detail and grandeur. Professional and realistic textures are applied throughout, highlighting the luxurious materials used, such as polished marble for columns and high-quality stucco for walls. A grand, ornate dome crowns the palace, adding to its classic splendor. Luxurious classical outdoor furniture, including ornate lounge sets and elegant dining arrangements, is strategically placed on expansive terraces. Plush sun loungers are gracefully arranged beside a long, rectangular swimming pool. The surrounding landscape is meticulously manicured with lush trees, vibrant flowers, and diverse greenery, creating an exquisite garden environment. A sleek, high-end luxury car is elegantly parked at the entrance of the garage and ready to move. A low-height, luxurious black & gold classical wrought iron fence begins gracefully after the garage entrance, enclosing the exterior perimeter of the property. In the background, several similar classical, opulent estates are subtly visible, enhancing the exclusive ambiance of the neighborhood. The scene is bathed in the warm, natural light of just before sunset, creating a serene and inviting glow.`
  },
  {
    id: 'F',
    title: 'Majestic Modern House',
    prompt: `A majestic modern house (Based on attached pic), prominently white, featuring a complex multi-level design. The architecture blends classic arched windows with sleek, with classic Roman columns. The roof features warm terracotta tiles. The balconies are adorned with intricate black wrought iron railings. The primary material used is smooth, white stucco, complemented by dark-framed windows that add a striking contrast. Lush trees, vibrant flowers, and diverse greenery are meticulously landscaped all around the property. Luxurious outdoor furniture, including contemporary lounge sets, and sophisticated decorative elements, are strategically placed on terraces and around the building to enhance its grandeur. In the background, several similar modern, elegant houses are visible, creating a harmonious neighborhood ambiance. The scene is set just before sunset, casting a warm, natural, and inviting glow over the entire environment. The ground is visibly wet from recent rain, with subtle reflections creating a serene and evocative atmosphere.`
  },
  {
    id: 'G',
    title: 'Architectural Model on Blueprints',
    prompt: `Architectural model of a (modern), minimalist house, rendered in a crisp, clean white finish. The model features multiple levels, large glass windows, and subtle interior lighting that glows softly. The house is surrounded by a miniature landscape with sparse, sculptural trees and a small reflective water feature. The entire scene is set against a background of intricate architectural sketches, blueprints, and handwritten notes, appearing as if the model is emerging directly from the design process. The style should blend the realistic precision of a physical model with the artistic, expressive lines of hand-drawn technical drawings. Soft, diffused lighting highlights the model's forms and casts gentle shadows. The overall aesthetic should be sophisticated and evoke the essence of contemporary architectural design.`
  },
  {
    id: 'H',
    title: 'Classic Lakeside Villa',
    prompt: `A realistic, highly detailed lakeside scene. In the foreground, an elegant old villa in classical style with wide balconies, arched columns, and a small tower overlooking the lake. The villa is surrounded by lush greenery, palm trees, and colorful flowers. Stone stairways lead down from the villa to the water’s edge. In the middle ground, several old stone houses with tiled roofs are nestled among tall cypress and pine trees. In the background, majestic mountains covered with dense forests rise high, their shapes softly reflected on the calm, clear surface of the lake. The atmosphere is peaceful, with bright natural daylight and a clear sky, cinematic composition.`
  },
  {
    id: 'I',
    title: 'Contemporary Master Bedroom',
    prompt: `A 3D interior visualization of a contemporary luxury master bedroom based on an architectural sketch.
Key elements: king-size low platform bed with integrated nightstands, modern built-in wardrobe with seamless doors, cozy reading corner with an upholstered accent chair and a small side table with a decorative plant, and a sleek contemporary floor lamp.
Add layered area rugs to subtly divide the space.
Lighting: soft natural daylight streaming from a large window, complemented by warm ambient ceiling lights for a balanced, welcoming atmosphere.
Style: clean lines, neutral color palette with warm wood accents, high-end modern finishes, ultra-realistic textures and materials, rendered in 8K.`
  }
];

export const SCENE_PRESETS: ScenePreset[] = [
  {
    name: 'scene_preset_cozy_cabin',
    prompt: 'A cozy, rustic log cabin nestled deep in a pine forest during autumn. Smoke curls gently from a stone chimney. The cabin has warm, glowing windows, a small porch with a wooden chair, and is surrounded by trees with vibrant orange and yellow leaves. A narrow dirt path leads to the front door. The scene is set during a misty morning, with soft, diffused sunlight filtering through the trees, creating a peaceful and serene atmosphere. Photorealistic, detailed, high resolution.'
  },
  {
    name: 'scene_preset_futuristic_city',
    prompt: 'A sprawling, high-tech futuristic cityscape at night. Soaring skyscrapers with holographic advertisements and neon lights illuminate the scene. Flying vehicles streak across the sky between the buildings. The city is built on multiple levels with sky-bridges connecting towers. Below, bustling streets are filled with people and robotic assistants. The color palette is dominated by deep blues, purples, and vibrant neon pinks and cyans. Cinematic, dynamic, highly detailed, Blade Runner aesthetic.'
  },
  {
    name: 'scene_preset_tropical_beach',
    prompt: 'A luxurious, modern villa on a serene tropical beach. The villa is made of white concrete, glass, and dark wood, featuring an infinity pool that blends seamlessly with the turquoise ocean. White sand beach with lush palm trees and tropical plants surrounds the property. The sky is clear blue with a few wispy clouds, and the sun is bright, casting sharp, clear shadows. The atmosphere is tranquil, luxurious, and idyllic. Photorealistic, 8k, ultra-detailed.'
  },
  {
    name: 'scene_preset_victorian_mansion',
    prompt: 'A grand, slightly mysterious Victorian mansion at dusk. The mansion is ornate, with a mansard roof, intricate woodwork, large bay windows, and a wraparound porch. It is surrounded by an old, wrought-iron fence and a slightly overgrown garden with large, ancient oak trees. The sky is a deep twilight purple, and a full moon is beginning to rise. A few windows are lit from within, casting a warm but lonely glow. The mood is atmospheric, gothic, and slightly eerie. Highly detailed, realistic textures.'
  }
];


export const STYLE_PRESETS: StylePreset[] = [
  {
    name: 'Minimalist Modern',
    keywords: 'clean lines, neutral color palette (whites, greys, blacks), simple geometric forms, large glass windows, uncluttered spaces, natural light, minimalist furniture, raw materials like concrete and steel'
  },
  {
    name: 'Rustic Charm',
    keywords: 'natural wood beams, stone walls, warm and earthy tones, cozy fireplace, handcrafted furniture, vintage decor, exposed brick, comfortable textiles like wool and linen'
  },
  {
    name: 'Art Deco Luxury',
    keywords: 'bold geometric patterns, rich colors (deep blues, greens, gold), metallic accents (brass, chrome), luxurious materials like marble and velvet, symmetrical designs, glamorous lighting fixtures, polished wood'
  },
  {
    name: 'Coastal Beach House',
    keywords: 'light and airy, white and blue color scheme, natural materials like rattan and light wood, large windows with ocean views, comfortable and casual furniture, nautical decor, sheer curtains'
  },
  {
    name: 'Futuristic High-Tech',
    keywords: 'sleek metallic surfaces, integrated smart technology, holographic displays, minimalist design with glowing LED light strips, fluid and organic shapes, automated features, chrome and glass materials'
  }
];

export const RENDER_STYLE_KEYS = ['photorealistic', 'concept_art', 'blueprint'];

export const STYLE_PROMPT_PREFIXES: { [key: string]: { [lang: string]: string } } = {
  photorealistic: {
    en: 'A highly photorealistic image of',
    ar: 'صورة واقعية للغاية لـ'
  },
  concept_art: {
    en: 'A piece of digital concept art, with a painterly and artistic style, depicting',
    ar: 'قطعة فنية رقمية بأسلوب رسم فني، تصور'
  },
  blueprint: {
    en: 'A detailed blueprint-style schematic drawing of',
    ar: 'رسم تخطيطي مفصل بأسلوب المخططات الهندسية لـ'
  },
};

export const ANIMATION_CAMERA_SPEEDS: ('slow' | 'medium' | 'fast')[] = ['slow', 'medium', 'fast'];
export const ANIMATION_CAMERA_TILTS: ('none' | 'upward' | 'downward')[] = ['none', 'upward', 'downward'];

export const VIDEO_STYLE_PRESETS: VideoStylePreset[] = [
  {
    name: 'Cinematic',
    keywords: 'cinematic style, dramatic lighting, high contrast, film grain, professional color grading'
  },
  {
    name: 'Documentary',
    keywords: 'stable camera, realistic and natural lighting, steady shot, documentary feel'
  },
  {
    name: 'Abstract',
    keywords: 'artistic, abstract, experimental camera work, unusual angles, creative transitions'
  },
  {
    name: 'Slow Motion',
    keywords: 'ultra slow motion, capturing subtle details, graceful and fluid movement'
  }
];